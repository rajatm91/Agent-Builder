from agent_builder.utils.utils import list_entity, create_entity, DBManager, delete_entity
from agent_builder.datamodel import Skill
from fastapi import APIRouter



def setup_router(router: APIRouter, dbmanager: DBManager):
    @router.get("/skills", tags=["Skill"])
    async def list_skills(user_id: str):
        """List all skills for a user"""
        filters = {"user_id": user_id}
        return list_entity(dbmanager, Skill, filters=filters)

    @router.post("/skills", tags=["Skill"])
    async def create_skill(skill: Skill):
        """Create a new skill"""
        filters = {"user_id": skill.user_id}
        return create_entity(dbmanager,skill, Skill, filters=filters)

    @router.delete("/skills/delete", tags=["Skill"])
    async def delete_skill(skill_id: int, user_id: str):
        """Delete a skill"""
        filters = {"id": skill_id, "user_id": user_id}
        return delete_entity(dbmanager, Skill, filters=filters)


    return router