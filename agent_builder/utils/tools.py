import json
import os
from fastapi import HTTPException
from pydantic import BaseModel, Field
import openai
from typing import Union, List
from sqlmodel import Session
from agent_builder.database.database_manager import DBManager
from agent_builder.datamodel import RetrieverConfig, AgentConfig, CodeExecutionConfigTypes, Agent, AgentType, Workflow, \
    Model
from dotenv import load_dotenv


load_dotenv()

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class StructureOutput(BaseModel):
    agent_name: str
    docs_path: str
    model_name: str




def extract_parameters(content: str):
    """Calls OpenAI to extract agent_name, docs_path, and model_name from the input content."""
    try:
        prompt = ("""
            You are an AI assistant that extracts structured information from user-provided text.
            Your task is to identify and return a JSON object with the following keys:
            - `agent_name`: The name of the agent mentioned in the text (if present).
            - `docs_path`: The file path(s) where documents are stored **or** a website URL (if present). If a website URL is provided **without 'https://', ensure it is appended automatically**.
            - `model_name`: The AI model mentioned in the text (default to 'gpt-4o' if none is explicitly stated).
            If `docs_path` contains a **directory path**, return it as is.
            If a **website URL** is provided instead, return the URL in `docs_path`, ensuring that it starts with 'https://'.
            ### **Examples:**
            #### Example 1: Directory Path
            **Input:**
            I want to create agent BOTCSearch. Files are stored at /Users/rajatmishra/development/test_documents and want to use gpt-4o model for RAG.
            **Output:**
            {
                "agent_name: "BOTCSearch",
                "docs_path: "/Users/rajatmishra/development/test_documents",
                "model_name: "gpt-4o"
            }
            #### Example 2: Directory Path with a Different Model
            **Input:**
            "Create an agent named SearchBot using the files at /mnt/data/documents and run it with gpt-3.5-turbo."
            **Output:**
            {
              "agent_name": SearchBot",
              "docs_path": "/mnt/data/documents",
              "model_name": "gpt-3.5-turbo"
            }
            #### Example 3: Website URL Instead of Directory Path
            **Input:**
            "Build an agent called WebCrawler that processes documents from example.com/articles."
            **Output:**
            {
              "agent_name": "WebCrawler",
              "docs_path": "https://example.com/articles",
              "model_name": "gpt-4o"
            }
            #### Example 4: Another Directory Path with Default Model
            **Input:**
            Make a new agent IndexMaster. It should scan /var/lib/files for processing."
            **Output:**
            {
              "agent_name": "IndexMaster",
              "docs_path": "/var/lib/files",
              "model_name": "gpt-4o"
            }
            "#### Example 5: Website URL with Missing 'https://'
            "**Input:**
            ""Create an agent named NewsScraper to gather articles from newswebsite.com/latest."
            "**Output:**
            "{
            "  "agent_name": "NewsScraper",
            "  "docs_path": "https://newswebsite.com/latest",
            "  "model_name": "gpt-4o"
            }
            **Now, extract the correct information from the following input:**
            **Input:** '{content}'
            **Output (in JSON format):**
            """
        )

        response = client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system","content": prompt},
                {"role": "user", "content": content}
            ],
            temperature=0,
            response_format=StructureOutput,

        )

        extracted_text = response.choices[0].message.content
        extracted_data = json.loads(extracted_text)  # Ensure the response is valid JSON

        return {
            "agent_name": extracted_data.get("agent_name", "Unknown"),
            "docs_path": extracted_data.get("docs_path", []),
            "model_name": extracted_data.get("model_name", "gpt-4o"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def create_retriever_agent(agent_name: str,
                           docs_path: Union[str, List[str]],
                           model_name: str = "gpt-4o",
                           ) -> dict:
    dbmanager = DBManager(engine_uri=os.environ["AGENT_BUILDER_DB_URI"])
    embedding_model = "BAAI/bge-large-en-v1.5"

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

    retriever_config = RetrieverConfig(
        task = "qa",
        docs_path = docs_path,
        collection_name = f"{agent_name}_collection",
        db_config = {
            "connection_string": os.environ["AGENT_BUILDER_DB_URI"]
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
    )

    workflow = Workflow(
        name=f"{agent_name}",
        description=f"{agent_name} workflow",
        user_id="guestuser@gmail.com"
    )

    with Session(dbmanager.engine) as session:
        session.add(retriever_proxy_agent)
        session.add(workflow)

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