from agent_builder.database import DBManager
from fastapi import APIRouter



def setup_router(router: APIRouter, dbmanager: DBManager):

    @router.post("/agents/link/model/{agent_id}/{model_id}", tags=["Link Entities"])
    async def link_agent_model(agent_id: int, model_id: int):
        """Link a model to an agent"""
        return dbmanager.link(
            link_type="agent_model", primary_id=agent_id, secondary_id=model_id
        )

    @router.delete("/agents/link/model/{agent_id}/{model_id}",tags=["Link Entities"])
    async def unlink_agent_model(agent_id: int, model_id: int):
        """Unlink a model from an agent"""
        return dbmanager.unlink(
            link_type="agent_model", primary_id=agent_id, secondary_id=model_id
        )

    @router.get("/agents/link/model/{agent_id}",tags=["Link Entities"])
    async def get_agent_models(agent_id: int):
        """Get all models linked to an agent"""
        return dbmanager.get_linked_entities("agent_model", agent_id, return_json=True)

    @router.post("/agents/link/skill/{agent_id}/{skill_id}",tags=["Link Entities"])
    async def link_agent_skill(agent_id: int, skill_id: int):
        """Link an a skill to an agent"""
        return dbmanager.link(
            link_type="agent_skill", primary_id=agent_id, secondary_id=skill_id
        )

    @router.delete("/agents/link/skill/{agent_id}/{skill_id}", tags=["Link Entities"])
    async def unlink_agent_skill(agent_id: int, skill_id: int):
        """Unlink an a skill from an agent"""
        return dbmanager.unlink(
            link_type="agent_skill", primary_id=agent_id, secondary_id=skill_id
        )

    @router.get("/agents/link/skill/{agent_id}", tags=["Link Entities"])
    async def get_agent_skills(agent_id: int):
        """Get all skills linked to an agent"""
        return dbmanager.get_linked_entities("agent_skill", agent_id, return_json=True)

    @router.post("/agents/link/agent/{primary_agent_id}/{secondary_agent_id}", tags=["Link Entities"])
    async def link_agent_agent(primary_agent_id: int, secondary_agent_id: int):
        """Link an agent to another agent"""
        return dbmanager.link(
            link_type="agent_agent",
            primary_id=primary_agent_id,
            secondary_id=secondary_agent_id,
        )

    @router.delete("/agents/link/agent/{primary_agent_id}/{secondary_agent_id}", tags=["Link Entities"])
    async def unlink_agent_agent(primary_agent_id: int, secondary_agent_id: int):
        """Unlink an agent from another agent"""
        return dbmanager.unlink(
            link_type="agent_agent",
            primary_id=primary_agent_id,
            secondary_id=secondary_agent_id,
        )

    @router.get("/agents/link/agent/{agent_id}", tags=["Link Entities"])
    async def get_linked_agents(agent_id: int):
        """Get all agents linked to an agent"""
        return dbmanager.get_linked_entities("agent_agent", agent_id, return_json=True)

    # display workflow

    @router.post("/workflows/link/agent/{workflow_id}/{agent_id}/{agent_type}", tags=["Link Entities"])
    async def link_workflow_agent(workflow_id: int, agent_id: int, agent_type: str):
        """Link an agent to a workflow"""
        return dbmanager.link(
            link_type="workflow_agent",
            primary_id=workflow_id,
            secondary_id=agent_id,
            agent_type=agent_type,
        )

    @router.delete("/workflows/link/agent/{workflow_id}/{agent_id}/{agent_type}", tags=["Link Entities"])
    async def unlink_workflow_agent(workflow_id: int, agent_id: int, agent_type: str):
        """Unlink an agent from a workflow"""
        return dbmanager.unlink(
            link_type="workflow_agent",
            primary_id=workflow_id,
            secondary_id=agent_id,
            agent_type=agent_type,
        )

    @router.get("/workflows/link/agent/{workflow_id}/{agent_type}", tags=["Link Entities"])
    async def get_linked_workflow_agents(workflow_id: int, agent_type: str):
        """Get all agents linked to a workflow"""
        return dbmanager.get_linked_entities(
            link_type="workflow_agent",
            primary_id=workflow_id,
            agent_type=agent_type,
            return_json=True,
        )

    return router