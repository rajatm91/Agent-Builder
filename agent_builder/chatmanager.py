import asyncio
import json
import os
from pathlib import Path
from queue import Queue
from typing import Any, Dict, List, Optional, Tuple, Union
from datetime import datetime
import time

from agent_builder.utils import get_modified_files, extract_successful_code_blocks, summarize_chat_history

import websockets
from fastapi import WebSocket, WebSocketDisconnect
from agent_builder.agent_orchestrator import AgentOrchestrator
from agent_builder.datamodel import Message, Workflow, SocketMessage


class ChatManager:

    def __init__(self, message_queue: Queue) -> None:

        self.message_queue = message_queue

    def send(self, message: str) -> None:

        if self.message_queue is not None:
            self.message_queue.put_nowait(message)


    def chat(self,
             message: Message,
             history: List[Dict[str,Any]],
             workflow: Any = None,
             connection_id: Optional[str] = None,
             user_dir: Optional[str] = None,
             **kwargs
             ) -> Message:

        work_dir = Path(user_dir) / str(message.session_id) / datetime.now().strftime("%Y%m%d")

        os.makedirs(work_dir, exist_ok=True)

        if workflow is None:
            raise ValueError("Workflow must be specified")

        agent_orchestrator = AgentOrchestrator(
            workflow=workflow,
            history = history,
            work_dir=work_dir,
            send_message_function=self.send,
            connection_id=connection_id
        )

        workflow = Workflow.model_validate(workflow)

        message_text = message.content.strip()

        start_time = time.time()
        agent_orchestrator.run(
            message=f"{message}", clear_history=False
        )
        end_time = time.time()

        metadata = {
            "messages": agent_orchestrator.agent_history,
            "summary_method": workflow.summary_method,
            "time": end_time - start_time,
            "file": get_modified_files(start_time, end_time, source_dir = work_dir)
        }

        output = self._generate_output(message_text, agent_orchestrator, workflow)

        output_message = Message(
            user_id=message.user_id,
            role="assistant",
            content=output,
            meta=json.dumps(metadata),
            session_id=message.session_id
        )

        return output_message

    def _generate_output(self,
                         message_text:str,
                         agent_orchestrator: AgentOrchestrator,
                         workflow: Workflow
                         ) -> str:

        output = ""
        if workflow.summary_method == "last":
            successful_code_blocks = extract_successful_code_blocks(
                agent_orchestrator.agent_history
            )

            last_message = (
                agent_orchestrator.agent_history[-1]["message"]["content"]
                if agent_orchestrator.agent_history
                else ""
            )

            successful_code_blocks ="\n\n".join(successful_code_blocks)
            output = (
                (last_message + "\n" + successful_code_blocks)
                if successful_code_blocks else last_message
            )

        elif workflow.summary_method == "llm":
            client = agent_orchestrator.receiver.client
            status_message = SocketMessage(
                type="agent_status",
                data={
                    "status": "summarizing",
                    "message": "Summarizing agent dialogue",
                },
                connection_id=agent_orchestrator.connection_id,
            )
            self.send(status_message.model_dump(exclude_none=True))
            output = summarize_chat_history(
                task=message_text,
                messages=agent_orchestrator.agent_history,
                client=client,
            )
        elif workflow.summary_method == "none":
            output = ""

        return output


class WebSocketConnectionManager:

    def __init__(self,
                 active_connections: List[Tuple[WebSocket, str]] = None,
                active_connections_lock: asyncio.Lock = None,
    ) -> None:
        if active_connections is None:
            active_connections = []

        self.active_connections_lock = active_connections_lock
        self.active_connections: List[Tuple[WebSocket, str]] = active_connections


    async def connect(self, websocket: WebSocket, client_id: str) -> None:

        await websocket.accept()
        async with self.active_connections_lock:
            self.active_connections.append((websocket, client_id))
            print(f"New Connection: {client_id}, Total: {len(self.active_connections)}")


    async def disconnect(self, websocket: WebSocket) -> None:

        async with self.active_connections_lock:
            try:
                self.active_connections = [
                    conn for conn in self.active_connections if conn[0] != websocket
                ]
                print(f"Connection Closed. Total: {len(self.active_connections)}")
            except ValueError:
                print("Error: WebSocket connection not found")

    async def disconnect_all(self) -> None:
        """
        Disconnects all active WebSocket connections.
        """
        for connection, _ in self.active_connections[:]:
            await self.disconnect(connection)

    async def send_message(
        self, message: Union[Dict, str], websocket: WebSocket
    ) -> None:
        """
        Sends a JSON message to a single WebSocket connection.

        :param message: A JSON serializable dictionary containing the message to send.
        :param websocket: The WebSocket instance through which to send the message.
        """
        try:
            async with self.active_connections_lock:
                await websocket.send_json(message)
        except WebSocketDisconnect:
            print("Error: Tried to send a message to a closed WebSocket")
            await self.disconnect(websocket)
        except websockets.exceptions.ConnectionClosedOK:
            print("Error: WebSocket connection closed normally")
            await self.disconnect(websocket)
        except Exception as e:
            print(f"Error in sending message: {str(e)}", message)
            await self.disconnect(websocket)

    async def broadcast(self, message: Dict) -> None:
        """
        Broadcasts a JSON message to all active WebSocket connections.

        :param message: A JSON serializable dictionary containing the message to broadcast.
        """
        # Create a message dictionary with the desired format
        message_dict = {"message": message}

        for connection, _ in self.active_connections[:]:
            try:
                if connection.client_state == websockets.protocol.State.OPEN:
                    # Call send_message method with the message dictionary and current WebSocket connection
                    await self.send_message(message_dict, connection)
                else:
                    print("Error: WebSocket connection is closed")
                    await self.disconnect(connection)
            except (WebSocketDisconnect, websockets.exceptions.ConnectionClosedOK) as e:
                print(f"Error: WebSocket disconnected or closed({str(e)})")
                await self.disconnect(connection)





