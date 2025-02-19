from agent_builder.database import DBManager
from agent_builder.datamodel import KnowledgeHub
from agent_builder.utils import list_entity, create_entity, delete_entity
from fastapi import APIRouter


def setup_router(router: APIRouter,dbmanager: DBManager):

    @router.get("/knowledgehub", tags=["Knowledge Hub"])
    async def list_knowledge_hub(user_id: str):
        """List all agents for a user"""
        filters = {"user_id": user_id}
        return list_entity(dbmanager, KnowledgeHub, filters=filters)

    @router.post("/knowledgehub",tags=["Knowledge Hub"])
    async def create_agent(knowledgehub: KnowledgeHub):
        """Create a new agent"""
        return create_entity(dbmanager, knowledgehub, KnowledgeHub)

    @router.delete("/knowledgehub/delete",tags=["Knowledge Hub"])
    async def delete_agent(knowledgehub_id: int, user_id: str):
        """Delete an agent"""
        filters = {"id": knowledgehub_id, "user_id": user_id}
        return delete_entity(dbmanager, KnowledgeHub, filters=filters)

    return router