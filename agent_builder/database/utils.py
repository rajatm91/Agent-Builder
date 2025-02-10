# Copyright (c) 2023 - 2024, Owners of https://github.com/ag2ai
#
# SPDX-License-Identifier: Apache-2.0
#
# Portions derived from  https://github.com/microsoft/autogen are under the MIT License.
# SPDX-License-Identifier: MIT
# from .util import get_app_root
import time
from datetime import datetime
from pathlib import Path
from typing import Any

from alembic import command, util
from alembic.config import Config
from loguru import logger
from .system_prompt import AGENT_CREATOR_SYSTEM_MESSAGE

# from ..utils.db_utils import get_db_uri
from sqlmodel import Session, create_engine, text

from autogen.agentchat import AssistantAgent

from ..datamodel import (
    Agent,
    AgentConfig,
    AgentType,
    CodeExecutionConfigTypes,
    Model,
    Skill,
    Workflow,
    WorkflowAgentLink,
)



def workflow_from_id(workflow_id: int, dbmanager: Any):
    workflow = dbmanager.get(Workflow, filters={"id": workflow_id}).data
    if not workflow or len(workflow) == 0:
        raise ValueError("The specified workflow does not exist.")
    workflow = workflow[0].model_dump(mode="json")
    workflow_agent_links = dbmanager.get(
        WorkflowAgentLink, filters={"workflow_id": workflow_id}
    ).data

    def dump_agent(agent: Agent):
        exclude = []
        if agent.type != AgentType.groupchat:
            exclude = [
                "admin_name",
                "messages",
                "max_round",
                "admin_name",
                "speaker_selection_method",
                "allow_repeat_speaker",
            ]
        return agent.model_dump(warnings=False, mode="json", exclude=exclude)

    def get_agent(agent_id):
        with Session(dbmanager.engine) as session:
            agent: Agent = dbmanager.get_items(
                Agent, filters={"id": agent_id}, session=session
            ).data[0]
            agent_dict = dump_agent(agent)
            agent_dict["skills"] = [
                Skill.model_validate(skill.model_dump(mode="json"))
                for skill in agent.skills
            ]
            model_exclude = [
                "id",
                "agent_id",
                "created_at",
                "updated_at",
                "user_id",
                "description",
            ]
            models = [
                model.model_dump(mode="json", exclude=model_exclude)
                for model in agent.models
            ]
            agent_dict["models"] = [
                model.model_dump(mode="json") for model in agent.models
            ]

            if len(models) > 0:
                agent_dict["config"]["llm_config"] = agent_dict.get("config", {}).get(
                    "llm_config", {}
                )
                llm_config = agent_dict["config"]["llm_config"]
                if llm_config:
                    llm_config["config_list"] = models
                agent_dict["config"]["llm_config"] = llm_config
            agent_dict["agents"] = [get_agent(agent.id) for agent in agent.agents]
            return agent_dict

    for link in workflow_agent_links:
        agent_dict = get_agent(link.agent_id)
        workflow[str(link.agent_type.value)] = agent_dict
    return workflow


def run_migration(engine_uri: str):
    database_dir = Path(__file__).parent
    script_location = database_dir / "migrations"

    engine = create_engine(engine_uri)
    buffer = open(script_location / "alembic.log", "w")
    alembic_cfg = Config(stdout=buffer)
    alembic_cfg.set_main_option("script_location", str(script_location))
    alembic_cfg.set_main_option("sqlalchemy.url", engine_uri)

    print(f"Running migrations with engine_uri: {engine_uri}")

    should_initialize_alembic = False
    with Session(engine) as session:
        try:
            session.exec(text("SELECT * FROM alembic_version"))
        except Exception:
            logger.info("Alembic not initialized")
            should_initialize_alembic = True
        else:
            logger.info("Alembic already initialized")

    if should_initialize_alembic:
        try:
            logger.info("Initializing alembic")
            command.ensure_version(alembic_cfg)
            command.upgrade(alembic_cfg, "head")
            logger.info("Alembic initialized")
        except Exception as exc:
            logger.error(f"Error initializing alembic: {exc}")
            raise RuntimeError("Error initializing alembic") from exc

    logger.info(f"Running DB migrations in {script_location}")

    try:
        buffer.write(f"{datetime.now().isoformat()}: Checking migrations\n")
        command.check(alembic_cfg)
    except Exception as exc:
        if isinstance(exc, (util.exc.CommandError, util.exc.AutogenerateDiffsDetected)):
            try:
                command.upgrade(alembic_cfg, "head")
                time.sleep(3)
            except Exception as exc:
                logger.error(f"Error running migrations: {exc}")

    try:
        buffer.write(f"{datetime.now().isoformat()}: Checking migrations\n")
        command.check(alembic_cfg)
    except util.exc.AutogenerateDiffsDetected as exc:
        logger.info(f"AutogenerateDiffsDetected: {exc}")
        # raise RuntimeError(
        #     f"There's a mismatch between the models and the database.\n{exc}")
    except util.exc.CommandError as exc:
        logger.error(f"CommandError: {exc}")
        # raise RuntimeError(f"Error running migrations: {exc}")


def init_db_samples(dbmanager: Any):
    workflows = dbmanager.get(Workflow).data
    workflow_names = [w.name for w in workflows]
    print(f"### worflow : {workflow_names}")
    if (
        "Default Workflow" in workflow_names
        and "Agent Creation Workflow" in workflow_names
    ):
        logger.info(
            "Database already initialized with Default and Travel Planning Workflows"
        )
        return
    logger.info("Initializing database with Default and Agent creator Workflows")
    # models
    gpt_4_model = Model(
        model="gpt-4o",
        description="OpenAI GPT-4o model",
        user_id="guestuser@gmail.com",
        api_type="open_ai",
    )
    # azure_model = Model(
    #     model="gpt4-turbo",
    #     description="Azure OpenAI  model",
    #     user_id="guestuser@gmail.com",
    #     api_type="azure",
    #     base_url="https://api.your azureendpoint.com/v1",
    # )
    zephyr_model = Model(
        model="llama-3b",
        description="Local Llama model via  Ollama",
        base_url="http://localhost:1234/v1",
        user_id="guestuser@gmail.com",
        api_type="open_ai",
    )

    google_gemini_model = Model(
        model="gemini-1.5-pro-latest",
        description="Google's Gemini model",
        user_id="guestuser@gmail.com",
        api_type="google",
    )

    # skills

    # generate_image_skill = Skill(
    #     name="generate_images",
    #     description="Generate and save images based on a user's query.",
    #     content='\nfrom typing import List\nimport uuid\nimport requests  # to perform HTTP requests\nfrom pathlib import Path\n\nfrom openai import OpenAI\n\n\ndef generate_and_save_images(query: str, image_size: str = "1024x1024") -> List[str]:\n    """\n    Function to paint, draw or illustrate images based on the users query or request. Generates images from a given query using OpenAI\'s DALL-E model and saves them to disk.  Use the code below anytime there is a request to create an image.\n\n    :param query: A natural language description of the image to be generated.\n    :param image_size: The size of the image to be generated. (default is "1024x1024")\n    :return: A list of filenames for the saved images.\n    """\n\n    client = OpenAI()  # Initialize the OpenAI client\n    response = client.images.generate(model="dall-e-3", prompt=query, n=1, size=image_size)  # Generate images\n\n    # List to store the file names of saved images\n    saved_files = []\n\n    # Check if the response is successful\n    if response.data:\n        for image_data in response.data:\n            # Generate a random UUID as the file name\n            file_name = str(uuid.uuid4()) + ".png"  # Assuming the image is a PNG\n            file_path = Path(file_name)\n\n            img_url = image_data.url\n            img_response = requests.get(img_url)\n            if img_response.status_code == 200:\n                # Write the binary content to a file\n                with open(file_path, "wb") as img_file:\n                    img_file.write(img_response.content)\n                    print(f"Image saved to {file_path}")\n                    saved_files.append(str(file_path))\n            else:\n                print(f"Failed to download the image from {img_url}")\n    else:\n        print("No image data found in the response!")\n\n    # Return the list of saved files\n    return saved_files\n\n\n# Example usage of the function:\n# generate_and_save_images("A cute baby sea otter")\n',
    #     user_id="guestuser@gmail.com",
    # )

    register_skill = Skill(
        name = "create_retriever_agent",
        description = "create retriever agent based on a user's query.",
        content="\nimport json;\nimport os;\nfrom typing import Union, List;\nfrom sqlmodel import Session, create_engine, text;\nfrom agent_builder.database.database_manager import DBManager;\nfrom agent_builder.datamodel import RetrieverConfig, AgentConfig, CodeExecutionConfigTypes, Agent, AgentType, Workflow, Model;\n\ndef create_retriever_agent(agent_name: str, docs_path: Union[str, List[str]], model_name: str = 'gpt-4o') -> dict:\n    dbmanager = DBManager(engine_uri=os.environ['AGENT_BUILDER_DB_URI']);\n    embedding_model = 'BAAI/bge-large-en-v1.5';\n\n    with Session(dbmanager.engine) as session:\n        model = dbmanager.get_items(Model, filters={'model': 'gpt-4o'}, session=session).data[0];\n        agent_ids = dbmanager.get_items(Agent, filters={'type': 'userproxy'}, session=session).data;\n\n    default_agent = ([agent for agent in agent_ids if json.loads(agent['config']).get('name') == 'default_assistant'][0]).id;\n\n    retriever_config = RetrieverConfig(\n        task='qa',\n        docs_path=docs_path,\n        collection_name=f'{agent_name}_collection',\n        db_config={'connection_string': os.environ['AGENT_BUILDER_DB_URI']},\n        model='gtp-4o',\n        get_or_create=True\n    );\n\n    agent_config = AgentConfig(\n        name=agent_name,\n        human_input_mode='NEVER',\n        max_consecutive_reply=1,\n        code_execution_config=CodeExecutionConfigTypes.none,\n        retrieve_config=retriever_config\n    );\n\n    retriever_proxy_agent = Agent(\n        user_id='guestuser@gmail.com',\n        type=AgentType.retrieverproxy,\n        config=agent_config.model_dump(mode='json'),\n    );\n\n    workflow = Workflow(\n        name=f'{agent_name} workflow',\n        description=f'{agent_name} workflow',\n        user_id='guestuser@gmail.com'\n    );\n\n    with Session(dbmanager.engine) as session:\n        session.add(retriever_proxy_agent);\n        session.add(workflow);\n\n        dbmanager.link(link_type='agent_model', primary_id=retriever_proxy_agent.id, secondary_id=model.id);\n        dbmanager.link(link_type='workflow_agent', primary_id=default_agent.id, secondary_id=retriever_proxy_agent.id, agent_type='sender');\n\n    return {\n        'name': agent_name,\n        'max_consecutive_auto_reply': 1,\n        'documentPath': docs_path,\n        'collection_name': f'{agent_name}_collection',\n        'model': model_name,\n        'embedding_model': embedding_model,\n        'availability': 'Available'\n    }",
        user_id = "guestuser@gmail.com"
    )


    # agents
    user_proxy_config = AgentConfig(
        name="user_proxy",
        description="User Proxy Agent Configuration",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=25,
        system_message="You are a helpful assistant",
        code_execution_config=CodeExecutionConfigTypes.local,
        default_auto_reply="TERMINATE",
        llm_config=False,
    )
    user_proxy = Agent(
        user_id="guestuser@gmail.com",
        type=AgentType.userproxy,
        config=user_proxy_config.model_dump(mode="json"),
    )

    agent_create_config = AgentConfig(
        name = "agent_create",
        description="Agent Creator Agent",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=25,
        system_message=AGENT_CREATOR_SYSTEM_MESSAGE,
        code_execution_config=CodeExecutionConfigTypes.none,
        llm_config={},
    )

    agent_creator = Agent(
        user_id="guestuser@gmail.com",
        type=AgentType.assistant,
        config=agent_create_config.model_dump(mode="json")
    )

    default_assistant_config = AgentConfig(
        name="default_assistant",
        description="Assistant Agent",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=25,
        system_message=AssistantAgent.DEFAULT_SYSTEM_MESSAGE,
        code_execution_config=CodeExecutionConfigTypes.none,
        llm_config={},
    )

    default_assistant = Agent(
        user_id="guestuser@gmail.com",
        type=AgentType.assistant,
        config=default_assistant_config.model_dump(mode="json"),
    )

    # workflows
    # default_workflow = Workflow(
    #     name="Default Workflow",
    #     description="Default workflow",
    #     user_id="guestuser@gmail.com",
    # )

    agent_creation_workflow = Workflow(
        name="Agent Creation Workflow",
        description="Workflow to create agents via chat",
        user_id="guestuser@gmail.com"
    )


    with Session(dbmanager.engine) as session:
        session.add(zephyr_model)
        session.add(google_gemini_model)
        #session.add(azure_model)
        session.add(gpt_4_model)
        session.add(register_skill)
        session.add(user_proxy)
        session.add(agent_creator)
        session.add(default_assistant)

        #session.add(default_workflow)
        session.add(agent_creation_workflow)

        session.commit()

        dbmanager.link(
            link_type="agent_model",
            primary_id=agent_creator.id,
            secondary_id=gpt_4_model.id
        )

        dbmanager.link(
            link_type="agent_model",
            primary_id=default_assistant.id,
            secondary_id=gpt_4_model.id
        )

        dbmanager.link(
            link_type="agent_skill",
            primary_id=agent_creator.id,
            secondary_id=register_skill.id
        )


        dbmanager.link(
            link_type="workflow_agent",
            primary_id=agent_creation_workflow.id,
            secondary_id=user_proxy.id,
            agent_type="sender",
        )

        dbmanager.link(
            link_type="workflow_agent",
            primary_id=agent_creation_workflow.id,
            secondary_id=agent_creator.id,
            agent_type="receiver",
        )

        logger.info(
            "Successfully initialized database with Agent creator Workflows"
        )
