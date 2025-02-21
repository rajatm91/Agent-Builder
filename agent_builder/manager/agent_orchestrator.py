import os
from typing import Dict, Optional, List, Any
import openai
from datetime import datetime

from agent_builder.manager.agents import ExtendedRetrieverAgent, ExtendedConversableAgent
from agent_builder.datamodel import Message, Agent, AgentType, SocketMessage
from agent_builder.utils import clear_folder, sanitize_model, load_code_execution_config, get_skills_from_prompt
import autogen

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class AgentOrchestrator:

    def __init__(self,
                 workflow: Dict,
                 history: Optional[List[Message]],
                 work_dir: str = None,
                 clear_work_dir: bool = True,
                 send_message_function: Optional[callable] = None,
                 connection_id: Optional[str] = None
                 ) -> None:
        """
        Initializes a AutogenFlow with agents specified in the config
        :param workflow:
        :param history:
        :param workdir:
        :param clear_work_dir:
        :param send_message_function:
        :param connection_id:
        """

        self.send_message_function = send_message_function
        self.connection_id = connection_id
        self.work_dir = work_dir or "work_dir"
        if clear_work_dir:
            clear_folder(self.work_dir)

        self.workflow = workflow
        self.sender = self.load(workflow.get("sender"))
        self.receiver = self.load(workflow.get("receiver"))
        self.agent_history = []

        if history:
            self._populate_history(history)


    def _serialize_agent(self,
                         agent: Agent,
                         mode: str = "python",
                         include: Optional[Dict] = {"config"},
                         exclude: Optional[Dict] = None
                         ) -> Dict:

        exclude = exclude or {}
        include = include or {}
        if agent.type != AgentType.groupchat:
            if agent.type != AgentType.retrieverproxy:
                exclude.update(
                    {
                        "config": {
                            "admin_name",
                            "messages",
                            "max_round",
                            "admin_name",
                            "speaker_selection_method",
                            "allow_repeat_speaker",
                            "retrieve_config"
                        }
                    }
                )
            else:
                exclude.update(
                    {
                        "config": {
                            "admin_name",
                            "messages",
                            "max_round",
                            "admin_name",
                            "speaker_selection_method",
                            "allow_repeat_speaker"
                        }
                    }
                )
        else:
            include = {
                "config": {
                    "admin_name",
                    "messages",
                    "max_round",
                    "admin_name",
                    "speaker_selection_method",
                    "allow_repeat_speaker"
                }
            }
        result = agent.model_dump(
            warnings=False, exclude=exclude, include=include, mode=mode
        )
        return result["config"]

    def process_message(self,
                        sender: autogen.Agent,
                        receiver: autogen.Agent,
                        message: Dict,
                        request_reply: bool = False,
                        silent: bool = False,
                        sender_type: str = "agent",
                        ) -> None:

        message = (
            message
            if isinstance(message, dict)
            else {"content": message, "role": "user"}
        )

        message_payload = {
            "recipient": receiver.name,
            "sender": sender.name,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "sender_type": sender_type,
            "connection_id": self.connection_id,
            "message_type": "agent_message"
        }

        if request_reply is not False or sender_type == "groupchat":
            self.agent_history.append(message_payload)
            if self.send_message_function:
                socket_msg = SocketMessage(
                    type="agent_message",
                    data=message_payload,
                    connection_id=self.connection_id
                )
                self.send_message_function(socket_msg)

    def _populate_history(self, history: List[Message]) -> None:

        for msg in history:
            if isinstance(msg, dict):
                msg = Message(**msg)
            if msg.role == "user":
                self.sender.send(
                    msg.content,
                    self.receiver,
                    request_reply = False,
                    silent= True
                )
            elif msg.role == "assistant":
                self.receiver.send(
                    msg.content,
                    self.sender,
                    request_reply=False,
                    silent=True
                )

    def sanitize_agent(self, agent: Dict) -> Agent:

        skills = agent.get("skills", [])
        agent = Agent.model_validate(agent)
        agent.config.is_termination_msg = agent.config.is_termination_msg or (
            lambda x: "TERMINATE" in x.get("content", "").rstrip()[-20:]
        )

        def get_default_system_message(agent_type: str) -> str:
            if agent_type in ("assistant", "retrieve") :
                return autogen.AssistantAgent.DEFAULT_SYSTEM_MESSAGE
            else:
                return "You are a helpful AI Assistant."

        if agent.config.llm_config is not False:
            config_list = []
            for llm in agent.config.llm_config.config_list:
                if "api_key" not in llm and "OPENAI_API_KEY" not in os.environ:
                    error_message = f"api_key is not present in llm_config or OPENAI_API_KEY env variable for agent ** {agent.config.name}**. Update your workflow to provide an api_key to use the LLM."
                    raise ValueError(error_message)
                sanitized_llm = sanitize_model(llm)
                config_list.append(sanitized_llm)
            agent.config.llm_config.config_list = config_list

        agent.config.code_execution_config = load_code_execution_config(
            agent.config.code_execution_config, work_dir = self.work_dir
        )

        if skills:
            skills_prompt = get_skills_from_prompt(skills, self.work_dir)
            if agent.config.system_message:
                agent.config.system_message = (
                    agent.config.system_message + "\n\n" + skills_prompt
                )
            else:
                agent.config.system_message = (
                    get_default_system_message(agent.type) + "\n\n" + skills_prompt
                )
        return agent

    def load(self, agent: Any) -> autogen.Agent:

        if not agent:
            raise ValueError(
                "An agent configuration in this workflow is empty. Please provide a valid agent configuration"
            )

        linked_agents = agent.get("agents", [])
        agent = self.sanitize_agent(agent)
        if agent.type == "groupchat":
            groupchat_agents = [self.load(agent) for agent in linked_agents]
            group_chat_config = self._serialize_agent(agent)
            group_chat_config["agents"] = groupchat_agents
            groupchat = autogen.GroupChat(**group_chat_config)
            agent = ExtendedGroupChatManager(
                groupchat =groupchat,
                message_processor = self.process_message,
                llm_config = agent.config.llm_config.model_dump()
            )
            return agent
        else:
            if agent.type == "assistant":
                agent = ExtendedConversableAgent(
                    **self._serialize_agent(agent),
                    message_processor=self.process_message,
                )
            elif agent.type == "userproxy":
                agent = ExtendedConversableAgent(
                    **self._serialize_agent(agent),
                    message_processor=self.process_message,
                )
            elif agent.type == "retrieverproxy":
                agent = ExtendedRetrieverAgent(
                    **self._serialize_agent(agent),
                    message_processor=self.process_message,
                )
            else:
                raise ValueError(f"Unknown agent type: {agent.type}")
            return agent


    def run(self, message: str, clear_history: bool = False) -> None:

        #with autogen.Cache.redis() as cache:
        if isinstance(self.sender, ExtendedRetrieverAgent):

            self.sender.initiate_chat(
                self.receiver,
                message=self.sender.message_generator,
                problem=message,
                clear_history=clear_history,

                #cache=cache
            )
        else:
            self.sender.initiate_chat(
                self.receiver,
                message=message,
                clear_history=clear_history,
            )


