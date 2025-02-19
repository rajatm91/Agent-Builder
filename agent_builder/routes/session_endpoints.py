from agent_builder.database import DBManager
from agent_builder.datamodel import Session, Message
from agent_builder.utils import list_entity, create_entity, delete_entity
from fastapi import APIRouter

def setup_router(router: APIRouter, dbmanager: DBManager):

    @router.get("/sessions", tags=["Session"])
    async def list_sessions(user_id: str):
        """List all sessions for a user"""
        filters = {"user_id": user_id}
        return list_entity(dbmanager,Session, filters=filters)

    @router.post("/sessions", tags=["Session"])
    async def create_session(session: Session):
        """Create a new session"""
        return create_entity(dbmanager,session, Session)

    @router.delete("/sessions/delete", tags=["Session"])
    async def delete_session(session_id: int, user_id: str):
        """Delete a session"""
        filters = {"id": session_id, "user_id": user_id}
        return delete_entity(dbmanager, Session, filters=filters)

    @router.get("/sessions/{session_id}/messages", tags=["Session"])
    async def list_messages(user_id: str, session_id: int):
        """List all messages for a use session"""
        filters = {"user_id": user_id, "session_id": session_id}
        return list_entity(dbmanager,Message, filters=filters, order="asc", return_json=True)

    return router