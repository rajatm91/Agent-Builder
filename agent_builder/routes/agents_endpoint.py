from agent_builder.database import DBManager
from agent_builder.datamodel import Agent
from agent_builder.utils import list_entity, create_entity, delete_entity
from fastapi import APIRouter


def setup_router(router: APIRouter,dbmanager: DBManager):

    @router.get("/agents", tags=["Agent"])
    async def list_agents(user_id: str):
        """List all agents for a user"""
        filters = {"user_id": user_id}
        return list_entity(dbmanager, Agent, filters=filters)

    @router.post("/agents",tags=["Agent"])
    async def create_agent(agent: Agent):
        """Create a new agent"""
        return create_entity(dbmanager, agent, Agent)

    @router.delete("/agents/delete",tags=["Agent"])
    async def delete_agent(agent_id: int, user_id: str):
        """Delete an agent"""
        filters = {"id": agent_id, "user_id": user_id}
        return delete_entity(dbmanager, Agent, filters=filters)

    return router