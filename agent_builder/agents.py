
from dotenv import load_dotenv
import os
from autogen.io import IOWebsockets
from autogen import AssistantAgent, UserProxyAgent, register_function
from agent_builder.tools.create_retriever_agent import create_retriever_agent

load_dotenv()

model = "gpt-4o"
llm_config = {
    "model": model,
    "api_key": os.environ.get("OPENAI_API_KEY"),
    # "response_format": Reasoning

}

def on_connect(iostream: IOWebsockets) -> None:
    print(f"- on_connect(): Connected to client using IOWebsockers {iostream}", flush=True)
    print(" - on_connect(): Receiving messages from client.", flush=True)

    initial_msg = iostream.input()

    agent_creator = AssistantAgent(
        name="agent_creator_agent",
        llm_config=llm_config,
        system_message="""
            You are an AI specialized in creating Retriever Agents using the create_retriever_agent tool. Your task is to guide the user in providing the necessary arguments to call this tool with the following signature:

            ```
            def create_retriever_agent(
                agent_name: str,
                docs_path: Union[str, List[str]],
                model_name: str = "gpt-4o",
            )
            ```
            A Retriever Agent indexes a file or directory and then uses that index for question answering. The user must supply:
            
            agent_name (required): A short string identifying the agent.
            docs_path (required): A file path or a list of file paths where the agent can locate documents for indexing.
            model_name (optional): Defaults to "gpt-4o" if not specified.
            
            If the user’s instructions to create a retriever agent are unclear, politely ask follow-up questions to clarify the missing or ambiguous details (e.g., “Could you please specify the name of your agent?” or “What file or directory should I index?”).
            
            Stay on topic: Only respond with the creation of a Retriever Agent or with requests for clarifications about the required arguments. If the user requests anything beyond creating and configuring a retriever agent:
            
            Politely refuse and briefly indicate that you can only create retriever agents and handle clarifications for them.
            Do not provide any other kind of support or content outside this specific task.
            Handle inappropriate or disallowed content: If the user prompt includes abusive, profane, or off-topic language, respond with a brief, polite refusal and do not produce further content.
            
            Summary of Allowed Actions:
            
            Ask for clarification if the user’s request is ambiguous or missing required arguments.
            Provide a direct call to the create_retriever_agent function when you have sufficient information (e.g., agent_name, docs_path, and optional model_name).
            Refuse or politely decline to respond if the user’s request is off-topic, is inappropriate, or violates any policy regarding abusive or profane language.
            Following these rules ensures that you only create Retriever Agents and handle clarifications, and do not address any other kind of query.
            Reply with TERMINATE once the task is done.
            """

    )


    user_proxy = UserProxyAgent(
        name="user_proxy",
        llm_config=False,
        max_consecutive_auto_reply=1,
        human_input_mode="NEVER",
        code_execution_config={
            "last_n_messages": 3,
            "work_dir": "tasks",
            "use_docker": False
        },
        default_auto_reply="",
        is_termination_msg=lambda msg: msg.get("content") is not None and "TERMINATE" in msg["content"],
    )


    register_function(
        create_retriever_agent,
        caller=agent_creator,
        executor=user_proxy,
        name=create_retriever_agent.__name__,
        description="An utility function to build more retriever agents based on the user's input"

    )

    print(
        f" - on_connect(): Initiating chat with agent {agent_creator} using message '{initial_msg}"
    )


    initial_msg = initial_msg

    user_proxy.initiate_chat(agent_creator,
                             message=initial_msg, summary_method="last_msg")

