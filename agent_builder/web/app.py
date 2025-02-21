import asyncio
import json
import os
import queue
import threading
import time

import httpx
from agent_builder.routes import wf_router, sk_router, ss_router, md_router, le_router, ag_router, kh_router
from fastapi import APIRouter

import redis.asyncio as redis_conn
import traceback
from contextlib import asynccontextmanager
from pathlib import Path


from agent_builder.utils.models import UserInput, CreateAgentResponse, BuildingBlocks
from agent_builder.utils.tools import extract_agent_parameters, create_retrieval_agent, initialize_conversation_state, \
    generate_prompt
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agent_builder.manager.chatmanager import WebSocketConnectionManager
from agent_builder.database import DBManager, workflow_from_id
from agent_builder.utils import init_app_folders, md5_hash, cache_response, \
    get_cached_response
from loguru import logger


from agent_builder.manager.chatmanager import ChatManager
from agent_builder.datamodel import Response, Message

managers = {"chat": None, "user_prompt": ""}
session = {}
client = httpx.AsyncClient()

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

                # if message.data["content"] == "UPDATE_CONTEXT" or message.data["content"] == "":
                #     message.data["content"] = "Sorry !, I could not find the answer in my knowledge hub."
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


app = FastAPI(
        title="Agent of Agents",
        description="Agent of Agents - Platform to Build Agents",
        version="0.1.0",
        swagger_ui_parameters={"defaultModelsExpandDepth": -1},
        lifespan=lifespan)
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


routers = [md_router,ag_router,sk_router,ss_router,le_router, wf_router, kh_router]
for router in routers:
    api = router(api, dbmanager)


@api.post("/sessions/{session_id}/workflow/{workflow_id}/run", tags=["Workflow"])
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


@api.get("/version", tags=["Admin"])
async def get_version():
    return {
        "status": True,
        "message": "Version retrieved successfully",
        "data": {"version": "0.0.1"},

    }


@api.post("/create_agent", tags=["Custom Agents"])
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




@api.get("/building_blocks", tags=["Admin"])
async def get_building_blocks() -> BuildingBlocks:

    skills =  await client.get("http://localhost:8081/api/skills?user_id=guestuser@hdfcbank.com")
    models = await client.get("http://localhost:8081/api/models?user_id=guestuser@hdfcbank.com")

    agents =await client.get("http://localhost:8081/api/agents?user_id=guestuser@hdfcbank.com")
    workflows = await client.get("http://localhost:8081/api/workflows?user_id=guestuser@hdfcbank.com")
    knowledge_hub = await client.get("http://localhost:8081/api/knowledgehub?user_id=guestuser@hdfcbank.com")

    response = BuildingBlocks(skills=skills.json()["data"], models=models.json()["data"],
                              agents=agents.json()["data"], knowledgehub=knowledge_hub.json()["data"] ,
                              workflows=workflows.json()["data"])
    return response




# manage websocket connections

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
            time.sleep(5)
            response = cached_response
        else:
            response = await run_session_workflow(
                        message=user_message, session_id=session_id, workflow_id=workflow_id
            )
            user_prompt = managers.get("user_prompt", None)
            if response["status"] and response["data"]["content"]:
                print(f"Response : {response['data']['content']}")
                if response["data"]["content"] != "UPDATE CONTEXT" or response["data"]["content"] != "TERMINATE" or response["data"]["content"] != "":
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


app.include_router(api)