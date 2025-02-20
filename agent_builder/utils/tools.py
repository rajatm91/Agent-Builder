import json
import os
from pathlib import Path
import re
from pydantic import BaseModel, Field, model_validator, field_validator
import openai
from typing import Union, List, Literal, Optional, Self
from sqlmodel import Session
from agent_builder.database.database_manager import DBManager
from agent_builder.datamodel import RetrieverConfig, AgentConfig, CodeExecutionConfigTypes, Agent, AgentType, Workflow, \
    Model, AgentClassification, KnowledgeHubType, KnowledgeHub
from dotenv import load_dotenv


load_dotenv()

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class FurtherQuestion(BaseModel):
    missing_details : list[str]
    agent_name: Optional[str]
    knowledge_hub: Optional[str]
    next_question: str

class SuccessfulResponse(BaseModel):
    agent_name: str
    knowledge_hub:str
    llm_model: str

class ResponseFormat(BaseModel):
    status: Literal["final_confirmation","further_question"]
    content: Optional[SuccessfulResponse]
    further_question : Optional[FurtherQuestion]

    @model_validator(mode='after')
    def check_conditional_field(self) -> Self:
        if self.further_question == 'final_confirmation' and not self.content:
            raise ValueError("For status final_confirmation, content is mandatory")
        elif self.further_question == 'further_question' and not self.further_question:
            raise ValueError("For status further_question, further_question is mandatory")

        return self



def initialize_conversation_state():
    """Initialize/reset the conversation state for a new agent."""
    return {
        "agent_name": None,
        "knowledge_hub": None,
        "llm_model": "gpt-4o",  # Default value
    }


def generate_prompt(conversation_state):
    """Generate a structured prompt based on missing details."""
    missing_details = [key for key, value in conversation_state.items() if value is None]

    if not missing_details:
        return {
            "status": "final_confirmation",
            **conversation_state
        }

    next_question = ""

    if "agent_name" in missing_details:
        next_question = "What would you like to name your agent?"
    elif "knowledge_hub" in missing_details:
        next_question = "Where should the agent get its knowledge from? Provide a file storage location or a website URL."

    return {
        "status": "further_question",
        "missing_details": missing_details,
        "next_question": next_question
    }


def extract_agent_parameters(user_input, conversation_state):
    """Send user input to OpenAI and get structured output."""
    prompt = f"""
    You are an AI assistant helping users configure an AI agent. Users may provide information in different ways – a single word or a detailed sentence.

    ### **Agent Setup Requirements**
    1. **Agent Name** (Mandatory) - A meaningful, unique name (e.g., "InfoBot", "FinanceAssistant"). 
       - ⚠️ **Reject generic terms** like "search agent", "website bot", or "data processor". If no valid name is provided, ask for one.
    2. **Knowledge Hub** (Mandatory) - A **file storage path** or a **website URL**.
    3. **LLM Model** (Optional) - Default is `"gpt-4o"`.
    
    ---
    
    ### **Your Task**
    - Extract **only** the valid details from the user's input.
    - **Do NOT assume a name if only a purpose is given**.
    - **If a website provide as knowledge hub , ensure to prepend the url with https://
    - **If all required details (agent_name & knowledge_hub) are present, return `"status": "final_confirmation"`**.
    - If any required detail is missing, return `"status": "further_question"` and **ask only for the missing detail**.
    - Always return a **structured JSON** response.
    
    ---

    Users might provide partial details or no details in free text. Your task is to:
    - Extract **only** the information provided in the user's input.
    - Identify missing details and ask the next relevant question.

    **Example Responses:**
    
    **If user provides partial details:**
    - knowledge hub provided but agent name is not there
    ```json
    {{
      "status": "further_question",
      "model_name": "gpt-4o",
      "missing_details": ["agent_name", knowledge_hub],
      "next_question": "what would be the agent name ?"
    }}
    ```
    - knowledge hub provided but agent name is not there
    ```json
    {{
      "status": "further_question",
      "model_name": "gpt-4o",
      "knowledge_hub": "/mnt/dir1/dir2",
      "missing_details": ["agent_name"],
      "next_question": "what would be the agent name ?"
    }}
    ```
    - agent name is provided but knowledge hub is missing
    ```json
    {{
      "status": "further_question",
      "model_name": "gpt-4o",
      "agent_name": "ChatMaster",
      "missing_details": ["knowledge_hub"],
      "next_question": "Where should the agent get its knowledge from? Provide a file storage location or a website URL."
    }}
    ```
    
    **If user provides all details:**
    ```json
    {{
      "status": "final_confirmation",
      "agent_name": "InfoBot",
      "knowledge_hub": "https://example.com",
      "llm_model": "gpt-4o"
    }}
    ```
    or 
    ```json
    {{
      "status": "final_confirmation",
      "agent_name": "chatbot",
      "knowledge_hub": "/mnt1/dir1/dir2",
      "llm_model": "gpt-4o"
    }}
    ```
    **Conversation State So Far:**
    {json.dumps(conversation_state, indent=2)}

    **User Input:**
    "{user_input}"

    Now, extract the provided information, determine what is still missing, and return a structured response.
    
    """

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[{"role": "system", "content": "You are an assistant that collects agent setup details."},
                  {"role": "user", "content": prompt}],
        response_format = ResponseFormat
    )

    return response.choices[0].message.content


def identify_input_type(input_str: str):
    """
    Identifies if the input is a website (URL), directory, or file using pathlib.

    Args:
        input_str (str): The input string to classify.

    Returns:
        str: One of 'website', 'directory', 'file', or 'unknown'.
    """

    # Check if it's a website (URL)
    url_pattern = re.compile(
        r'^(https?://)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(/.*)?$'
    )
    if url_pattern.match(input_str):
        return "website"

    # Use Pathlib to check for file/directory
    path = Path(input_str)

    if path.is_dir():
        return "directory"

    if path.is_file():
        return "file"

    # If the path doesn't exist, infer type based on format
    if input_str.endswith(("/", "\\")):
        return "directory"

    if "." in path.name:  # Check if there's a file extension
        return "file"

    return "unknown"



def create_retrieval_agent(agent_name: str,
                           docs_path: Union[str, List[str]],
                           model_name: str = "gpt-4o",
                           ) -> dict:
    dbmanager = DBManager(engine_uri=os.environ["AGENT_BUILDER_DB_URI"])
    embedding_model = "BAAI/bge-large-en-v1.5"
   # client = QdrantClient(url=os.environ["AGENT_BUILDER_QDRANT_URI"])

    with Session(dbmanager.engine) as session:
        model = dbmanager.get_items(
            Model, filters={"model": "gpt-4o"}, session=session
        ).data[0]
        agent_ids = dbmanager.get_items(
            Agent, filters={"type": "assistant"}, session=session
        ).data

    default_agent = [
        agent for agent in agent_ids
            if agent.config.get("name") == "default_assistant"
    ][0]

    hub_type = identify_input_type(docs_path)

    knowledge_hub =  KnowledgeHub(
        name=f"{agent_name} knowledge hub",
        description= f"Knowledge hub for the {agent_name}",
        details=docs_path,
        user_id="guestuser@gmail.com",
        type=hub_type,
    )

    retriever_config = RetrieverConfig(
        task = "qa",
        docs_path = docs_path,
        collection_name = f"{agent_name}_collection",
        db_config = {
            "client": os.environ["AGENT_BUILDER_QDRANT_URI"]
        },
        model = "gpt-4o",
        get_or_create=True,
    )

    agent_config = AgentConfig(
        name = agent_name,
        human_input_mode = "NEVER",
        max_consecutive_reply = 1,
        code_execution_config = CodeExecutionConfigTypes.none,
        retrieve_config = retriever_config
    )

    retriever_proxy_agent = Agent(
        user_id="guestuser@gmail.com",
        type=AgentType.retrieverproxy,
        config=agent_config.model_dump(mode="json"),
        classification=AgentClassification.advance
    )

    workflow = Workflow(
        name=f"{agent_name}",
        description=f"{agent_name} workflow",
        user_id="guestuser@gmail.com"
    )

    with Session(dbmanager.engine) as session:
        session.add(retriever_proxy_agent)
        session.add(workflow)
        session.add(knowledge_hub)

        session.commit()

        dbmanager.link(
            link_type = "agent_model",
            primary_id=retriever_proxy_agent.id,
            secondary_id=model.id
        )
        dbmanager.link(
            link_type="workflow_agent",
            primary_id=workflow.id,
            secondary_id=retriever_proxy_agent.id,
            agent_type="sender",
        )

        dbmanager.link(
            link_type="workflow_agent",
            primary_id=workflow.id,
            secondary_id=default_agent.id,
            agent_type="receiver",
        )


    return {"name": agent_name,
            "max_consecutive_auto_reply": 1,
            "documentPath": docs_path,
            "collection_name": f"{agent_name}_collection",
            "model": model_name,
            "embedding_model": embedding_model,
            "availability": "Available"
            }