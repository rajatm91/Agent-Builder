from agent_builder.database import DBManager
from agent_builder.datamodel import Workflow
from agent_builder.utils import create_entity, list_entity, delete_entity
from fastapi import APIRouter

def setup_router(router: APIRouter, dbmanager: DBManager):

    @router.get("/workflows/{workflow_id}")
    async def get_workflow(workflow_id: int, user_id: str):
        """Get a workflow"""
        filters = {"id": workflow_id, "user_id": user_id}
        return list_entity(dbmanager,Workflow, filters=filters)

    @router.post("/workflows")
    async def create_workflow(workflow: Workflow):
        """Create a new workflow"""
        return create_entity(dbmanager, workflow, Workflow)

    @router.delete("/workflows/delete")
    async def delete_workflow(workflow_id: int, user_id: str):
        """Delete a workflow"""
        filters = {"id": workflow_id, "user_id": user_id}
        return delete_entity(dbmanager,Workflow, filters=filters)

    @router.get("/workflows")
    async def list_workflows(user_id: str):
        """List all workflows for a user"""

        filters = {"user_id": user_id}
        return list_entity(dbmanager, Workflow, filters=filters)

    return router