from agent_builder.database import DBManager
from agent_builder.datamodel import Model
from agent_builder.utils import list_entity, create_entity, test_model, delete_entity
from fastapi import APIRouter
from openai import OpenAIError

def setup_router(router: APIRouter, dbmanager: DBManager):
    @router.get("/models", tags=["Model"])
    async def list_models(user_id: str):
        """List all models for a user"""
        filters = {"user_id": user_id}
        return list_entity(dbmanager, Model, filters=filters)

    # display models

    @router.post("/models", tags=["Model"])
    async def create_model(model: Model):
        """Create a new model"""
        return create_entity(dbmanager,model, Model)

    @router.post("/models/test", tags=["Model"])
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

    @router.delete("/models/delete", tags=["Model"])
    async def delete_model(model_id: int, user_id: str):
        """Delete a model"""
        filters = {"id": model_id, "user_id": user_id}
        return delete_entity(dbmanager,Model, filters=filters)

    return router