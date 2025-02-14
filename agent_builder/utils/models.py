from typing import Literal, Union, List, Optional

from agent_builder.datamodel import Skill, Model, Agent, Workflow
from pydantic import BaseModel
from pydantic import Field
import uuid

# Define request model
class UserInput(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_input: str

# Define agent details
class AgentDetails(BaseModel):
    agent_name: str
    knowledge_hub: str
    llm_model: str = "gpt-4o"

class CreateAgentResponse(BaseModel):
    status: Literal["complete", "further_question"]
    content: Union[str | dict]

class BuildingBlocks(BaseModel):
    skills: Optional[List[Skill]] = Field(default=None)
    models: Optional[List[Model]] = Field(default=None)
    agents: Optional[List[Agent]] = Field(default=None)
    workflows: Optional[List[Workflow]] = Field(default=None)