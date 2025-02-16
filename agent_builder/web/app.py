import asyncio
import json
import os
import queue
import threading
from fastapi import APIRouter

import redis.asyncio as redis_conn
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from agent_builder.utils.models import UserInput, CreateAgentResponse, BuildingBlocks
from agent_builder.utils.tools import extract_agent_parameters, create_retrieval_agent, initialize_conversation_state, \
    generate_prompt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from openai import OpenAIError

from agent_builder.chatmanager import WebSocketConnectionManager
from agent_builder.database import DBManager, workflow_from_id
from agent_builder.utils import init_app_folders, md5_hash, test_model, cache_response, \
    get_cached_response, list_entity, create_entity, delete_entity
from loguru import logger


from agent_builder.chatmanager import ChatManager
from agent_builder.datamodel import Response, Skill, Model, Message, Session, Workflow, Agent, ContentRequest

managers = {"chat": None, "user_prompt": ""}
session = {}


message_queue = queue.Queue()
active_connections = []
active_connections_lock = asyncio.Lock()

websocket_manager = WebSocketConnectionManager(
    active_connections=active_connections,
    active_connections_lock=active_connections_lock
)

def message_handler():
    while True:
        message = message_queue.get()
        logger.info(
            " ** Processing Agent Message on Queue: Active Connections: "
            + str([client_id for _, client_id in websocket_manager.active_connections])
            + " **"
        )

        for connection, socket_client_id in websocket_manager.active_connections:
            if message.connection_id == socket_client_id:
                logger.info(
                    f"Sending message to connection_id: {message.connection_id}. Connection ID: {socket_client_id}"
                )
                asyncio.run(websocket_manager.send_message(message, connection))
            else:
                logger.info(
                    f"Skipping message for connection_id: {message['connection_id']}. Connection ID: {socket_client_id}"
                )

        message_queue.task_done()

message_handler_thread = threading.Thread(target=message_handler, daemon=True)
message_handler_thread.start()

app_file_path = current_directory = Path(__file__).resolve().parent
folders = init_app_folders(app_file_path)
ui_folder_path = Path(__file__).resolve().parent / "ui"

database_engine_uri = folders["database_engine_uri"]
dbmanager = DBManager(engine_uri=database_engine_uri)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("***** App started *****")
    global redis
    redis = await redis_conn.Redis(host=REDIS_HOST, port=6379, decode_responses=True)
    print("✅ Redis connected!")
    managers["chat"] = ChatManager(message_queue=message_queue)
    dbmanager.create_db_and_tables()


    yield
    # Close all active connections
    await websocket_manager.disconnect_all()
    await redis.close()
    print("***** App stopped *****")


app = FastAPI(lifespan=lifespan)
# app = FastAPI(lifespan=run_websocket_server)


# allow cross origin requests for testing on localhost:800* ports only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


api = APIRouter(prefix="/api")
# mount an api route such that the main route serves the ui and the /api
#app.mount("/api", api)

# app.mount("/", StaticFiles(directory=ui_folder_path, html=True), name="ui")
# api.mount(
#     "/files",
#     StaticFiles(directory=folders["files_static_root"], html=True),
#     name="files",
# )


# manage websocket connections

#
# def create_entity(model: Any, model_class: Any, filters: dict = None):
#     """Create a new entity"""
#     model = check_and_cast_datetime_fields(model)
#     try:
#         response: Response = dbmanager.upsert(model)
#         return response.model_dump(mode="json")
#
#     except Exception as ex_error:
#         print(ex_error)
#         return {
#             "status": False,
#             "message": f"Error occurred while creating {model_class.__name__}: "
#             + str(ex_error),
#         }
#
#
# def list_entity(
#     model_class: Any,
#     filters: dict = None,
#     return_json: bool = True,
#     order: str = "desc",
# ):
#     """List all entities for a user"""
#     return dbmanager.get(
#         model_class, filters=filters, return_json=return_json, order=order
#     )
#
#
# def delete_entity(model_class: Any, filters: dict = None):
#     """Delete an entity"""
#     return dbmanager.delete(filters=filters, model_class=model_class)


@api.get("/skills")
async def list_skills(user_id: str):
    """List all skills for a user"""
    filters = {"user_id": user_id}
    return list_entity(dbmanager, Skill, filters=filters)


@api.post("/skills")
async def create_skill(skill: Skill):
    """Create a new skill"""
    filters = {"user_id": skill.user_id}
    return create_entity(dbmanager,skill, Skill, filters=filters)


@api.delete("/skills/delete")
async def delete_skill(skill_id: int, user_id: str):
    """Delete a skill"""
    filters = {"id": skill_id, "user_id": user_id}
    return delete_entity( dbmanager,Skill, filters=filters)


@api.get("/models")
async def list_models(user_id: str):
    """List all models for a user"""
    filters = {"user_id": user_id}
    return list_entity(Model, filters=filters)


# display models

@api.post("/models")
async def create_model(model: Model):
    """Create a new model"""
    return create_entity(model, Model)


@api.post("/models/test")
async def test_model_endpoint(model: Model):
    """Test a model"""
    try:
        response = test_model(model)
        return {
            "status": True,
            "message": "Model tested successfully",
            "data": response,
        }
    except (OpenAIError, Exception) as ex_error:
        return {
            "status": False,
            "message": "Error occurred while testing model: " + str(ex_error),
        }


@api.delete("/models/delete")
async def delete_model(model_id: int, user_id: str):
    """Delete a model"""
    filters = {"id": model_id, "user_id": user_id}
    return delete_entity(Model, filters=filters)

# display agents

@api.get("/agents")
async def list_agents(user_id: str):
    """List all agents for a user"""
    filters = {"user_id": user_id}
    return list_entity(Agent, filters=filters)


@api.post("/agents")
async def create_agent(agent: Agent):
    """Create a new agent"""
    return create_entity(agent, Agent)


@api.delete("/agents/delete")
async def delete_agent(agent_id: int, user_id: str):
    """Delete an agent"""
    filters = {"id": agent_id, "user_id": user_id}
    return delete_entity(Agent, filters=filters)


@api.post("/agents/link/model/{agent_id}/{model_id}")
async def link_agent_model(agent_id: int, model_id: int):
    """Link a model to an agent"""
    return dbmanager.link(
        link_type="agent_model", primary_id=agent_id, secondary_id=model_id
    )


@api.delete("/agents/link/model/{agent_id}/{model_id}")
async def unlink_agent_model(agent_id: int, model_id: int):
    """Unlink a model from an agent"""
    return dbmanager.unlink(
        link_type="agent_model", primary_id=agent_id, secondary_id=model_id
    )


@api.get("/agents/link/model/{agent_id}")
async def get_agent_models(agent_id: int):
    """Get all models linked to an agent"""
    return dbmanager.get_linked_entities("agent_model", agent_id, return_json=True)


@api.post("/agents/link/skill/{agent_id}/{skill_id}")
async def link_agent_skill(agent_id: int, skill_id: int):
    """Link an a skill to an agent"""
    return dbmanager.link(
        link_type="agent_skill", primary_id=agent_id, secondary_id=skill_id
    )


@api.delete("/agents/link/skill/{agent_id}/{skill_id}")
async def unlink_agent_skill(agent_id: int, skill_id: int):
    """Unlink an a skill from an agent"""
    return dbmanager.unlink(
        link_type="agent_skill", primary_id=agent_id, secondary_id=skill_id
    )


@api.get("/agents/link/skill/{agent_id}")
async def get_agent_skills(agent_id: int):
    """Get all skills linked to an agent"""
    return dbmanager.get_linked_entities("agent_skill", agent_id, return_json=True)


@api.post("/agents/link/agent/{primary_agent_id}/{secondary_agent_id}")
async def link_agent_agent(primary_agent_id: int, secondary_agent_id: int):
    """Link an agent to another agent"""
    return dbmanager.link(
        link_type="agent_agent",
        primary_id=primary_agent_id,
        secondary_id=secondary_agent_id,
    )


@api.delete("/agents/link/agent/{primary_agent_id}/{secondary_agent_id}")
async def unlink_agent_agent(primary_agent_id: int, secondary_agent_id: int):
    """Unlink an agent from another agent"""
    return dbmanager.unlink(
        link_type="agent_agent",
        primary_id=primary_agent_id,
        secondary_id=secondary_agent_id,
    )


@api.get("/agents/link/agent/{agent_id}")
async def get_linked_agents(agent_id: int):
    """Get all agents linked to an agent"""
    return dbmanager.get_linked_entities("agent_agent", agent_id, return_json=True)


# display workflow

@api.get("/workflows")
async def list_workflows():
    """List all workflows for a user"""    
    return list_entity(Workflow)
    # filters = {"user_id": user_id}
    # return list_entity(Workflow, filters=filters)


@api.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: int, user_id: str):
    """Get a workflow"""
    filters = {"id": workflow_id, "user_id": user_id}
    return list_entity(Workflow, filters=filters)


@api.post("/workflows")
async def create_workflow(workflow: Workflow):
    """Create a new workflow"""
    return create_entity(workflow, Workflow)


@api.delete("/workflows/delete")
async def delete_workflow(workflow_id: int, user_id: str):
    """Delete a workflow"""
    filters = {"id": workflow_id, "user_id": user_id}
    return delete_entity(Workflow, filters=filters)


@api.post("/workflows/link/agent/{workflow_id}/{agent_id}/{agent_type}")
async def link_workflow_agent(workflow_id: int, agent_id: int, agent_type: str):
    """Link an agent to a workflow"""
    return dbmanager.link(
        link_type="workflow_agent",
        primary_id=workflow_id,
        secondary_id=agent_id,
        agent_type=agent_type,
    )


@api.delete("/workflows/link/agent/{workflow_id}/{agent_id}/{agent_type}")
async def unlink_workflow_agent(workflow_id: int, agent_id: int, agent_type: str):
    """Unlink an agent from a workflow"""
    return dbmanager.unlink(
        link_type="workflow_agent",
        primary_id=workflow_id,
        secondary_id=agent_id,
        agent_type=agent_type,
    )


@api.get("/workflows/link/agent/{workflow_id}/{agent_type}")
async def get_linked_workflow_agents(workflow_id: int, agent_type: str):
    """Get all agents linked to a workflow"""
    return dbmanager.get_linked_entities(
        link_type="workflow_agent",
        primary_id=workflow_id,
        agent_type=agent_type,
        return_json=True,
    )


@api.get("/sessions")
async def list_sessions(user_id: str):
    """List all sessions for a user"""
    filters = {"user_id": user_id}
    return list_entity(Session, filters=filters)


@api.post("/sessions")
async def create_session(session: Session):
    """Create a new session"""
    return create_entity(session, Session)


@api.delete("/sessions/delete")
async def delete_session(session_id: int, user_id: str):
    """Delete a session"""
    filters = {"id": session_id, "user_id": user_id}
    return delete_entity(Session, filters=filters)


@api.get("/sessions/{session_id}/messages")
async def list_messages(user_id: str, session_id: int):
    """List all messages for a use session"""
    filters = {"user_id": user_id, "session_id": session_id}
    return list_entity(Message, filters=filters, order="asc", return_json=True)


@api.post("/sessions/{session_id}/workflow/{workflow_id}/run")
async def run_session_workflow(message: Message, session_id: int, workflow_id: int):
    """Runs a workflow on provided message"""
    try:
        user_message_history = (
            dbmanager.get(
                Message,
                filters={"user_id": message.user_id, "session_id": message.session_id},
                return_json=True,
            ).data
            if session_id is not None
            else []
        )
        # save incoming message
        dbmanager.upsert(message)
        user_dir = os.path.join(
            folders["files_static_root"], "user", md5_hash(message.user_id)
        )

        os.makedirs(user_dir, exist_ok=True)
        workflow = workflow_from_id(workflow_id, dbmanager=dbmanager)
        agent_response: Message = managers["chat"].chat(
            message=message,
            history=user_message_history,
            user_dir=user_dir,
            workflow=workflow,
            connection_id=message.connection_id,
        )

        response: Response = dbmanager.upsert(agent_response)
        return response.model_dump(mode="json")
    except Exception as ex_error:
        print(traceback.format_exc())
        return {
            "status": False,
            "message": "Error occurred while processing message: " + str(ex_error),
        }


@api.get("/version")
async def get_version():
    return {
        "status": True,
        "message": "Version retrieved successfully",
        "data": {"version": "0.0.1"},

    }


@api.post("/create_agent")
async def create_retriever_agent(user_input: UserInput):
    """Extracts agent parameters from user input and returns structured JSON response."""
    session_id = user_input.session_id

    if session_id not in session:
        session[session_id] = {
            "conversation_state": initialize_conversation_state(),
            "agents_created": []
        }

    conversation_state = session[session_id]["conversation_state"]

    structured_prompt = generate_prompt(conversation_state)

    if structured_prompt["status"] == "final_confirmation":
        session[session_id]["agents_created"].append(structured_prompt)

        session[session_id]["conversation_state"] = initialize_conversation_state()
        agent = create_retrieval_agent(agent_name=structured_prompt["agent_name"],
                                       docs_path=structured_prompt["knowledge_hub"],
                                       model_name=structured_prompt["llm_model"]
                                       )
        return CreateAgentResponse(status="complete", content=agent)

    response_json = extract_agent_parameters(user_input.user_input, conversation_state)

    try:
        response_data = json.loads(response_json)
        if response_data["status"] == "final_confirmation":
            content = response_data["content"]

            session[session_id]["agents_created"].append(response_data)
            session[session_id]["conversation_state"] = initialize_conversation_state()
            agent = create_retrieval_agent(agent_name=content["agent_name"],
                                           docs_path=content["knowledge_hub"],
                                           model_name=content["llm_model"]
                                           )
            return CreateAgentResponse(status="complete", content=agent)
        else:
            content = response_data["further_question"]
            if "agent_name" in content and content["agent_name"]:
                conversation_state["agent_name"] = content["agent_name"]

            if "knowledge_hub" in content and content["knowledge_hub"]:
                conversation_state["knowledge_hub"] = content["knowledge_hub"]

            if "llm_model" in content and content["llm_model"]:
                conversation_state["llm_model"] = content["llm_model"]

            for detail in content.get("missing_details", []):
                if detail in content:
                    conversation_state[detail] = content[detail]

            return CreateAgentResponse(
                status="further_question",
                content=content["next_question"]
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing response: {e}")




@api.get("/building_blocks")
async def get_building_blocks() -> BuildingBlocks:
    skills = await list_skills("guestuser@gmail.com")
    print(skills)
    models = await list_models("guestuser@gmail.com")
    agents = await list_agents("guestuser@gmail.com")
    workflows = await list_workflows()

    response = BuildingBlocks(skills=skills.data, models=models.data, agents=agents.data, workflows=workflows.data)
    return response



async def process_socket_message(data: dict, websocket: WebSocket, client_id: str):
    # print(f"Client says: {data['type']}")
    print(f"Client says->: {data}")
    if data["type"] == "user_message":
        user_message = Message(**data["data"])
        session_id = data["data"].get("session_id", None)
        workflow_id = data["data"].get("workflow_id", None)
        managers["user_prompt"] = data['data'].get("content", None)
        cached_response = await get_cached_response(redis, data['data'].get("content", None))
        print(f"#### cache response : {cached_response}")
        if cached_response:
           response = cached_response
        else:
          response = await run_session_workflow(
            message=user_message, session_id=session_id, workflow_id=workflow_id
        )
          user_prompt = managers.get("user_prompt", None)
          if response["data"]["content"]:
            await cache_response(redis, user_prompt, response)
        response_socket_message = {
            "type": "agent_response",
            "data": response,
            "connection_id": client_id,
        }
        await websocket_manager.send_message(response_socket_message, websocket)


@api.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):

    await websocket_manager.connect(websocket, "2")
    try:
        while True:
            data = await websocket.receive_json()
            await process_socket_message(data, websocket, 2)
    except WebSocketDisconnect:
        print(f"Client #{2} is disconnected")
        await websocket_manager.disconnect(websocket)
