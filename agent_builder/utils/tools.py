import json
import os
from typing import Union, List
from sqlmodel import Session
from agent_builder.database.database_manager import DBManager
from agent_builder.datamodel import RetrieverConfig, AgentConfig, CodeExecutionConfigTypes, Agent, AgentType, Workflow, \
    Model


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
            Agent, filters={"type": "userproxy"}, session=session
        ).data

    default_agent = ([
        agent for agent in agent_ids
            if json.loads(agent["config"]).get("name") == "default_assistant"
    ][0])

    retriever_config = RetrieverConfig(
        task = "qa",
        docs_path = docs_path,
        collection_name = f"{agent_name}_collection",
        db_config = {
            "connection_string": os.environ["AGENT_BUILDER_DB_URI"]
        },
        model = "gtp-4o",
        get_or_create=True
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
        name=f"{agent_name} workflow",
        description="{agent_name} workflow",
        user_id="guestuser@gmail.com"
    )

    with Session(dbmanager.engine) as session:
        session.add(retriever_proxy_agent)
        session.add(workflow)

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