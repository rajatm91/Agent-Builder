from datetime import datetime
from enum  import Enum
from typing import Any, Callable, Dict, List, Optional, Union

from sqlalchemy import ForeignKey, Integer
from sqlmodel import (
    JSON,
    Column, DateTime, Field, Relationship, SQLModel, func
)

from sqlmodel import Enum as SqlEnum

SQLModel.model_config["protected_namespaces"] = ()

class Message(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    user_id: Optional[str] = None
    role: str
    content: str
    session_id: Optional[int] = Field(
        default=None,
        sa_column=Column(Integer, ForeignKey("session.id", ondelete="CASCADE"))
    )
    connection_id: Optional[str] = None
    meta: Optional[Dict] = Field(default={}, sa_column=Column(JSON))


class Session(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    user_id: Optional[str] = None
    workflow_id: Optional[int] = Field(default=None, foreign_key="workflow.id")
    name: Optional[str] = None
    description: Optional[str] = None


class AgentSkillLink(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    agent_id: int = Field(default=None, primary_key=True, foreign_key="agent.id")
    skill_id: int = Field(default=None, primary_key=True, foreign_key="skill.id")

class AgentModelLink(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    agent_id: int = Field(default=None, primary_key=True, foreign_key="agent.id")
    model_id: int = Field(default=None, primary_key=True, foreign_key="model.id")

class Skill(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    user_id: Optional[str] = None
    content: str
    description: Optional[str] = None
    secrets: Optional[str] = Field(default={}, sa_column=Column(JSON))
    libraries: Optional[Dict] = Field(default={}, sa_column=Column(JSON))
    agents: List["Agent"] = Relationship(
        back_populates="skills", link_model=AgentSkillLink
    )


class LLMConfig(SQLModel, table=False):

    config_list: List[Any] = Field(default_factory=list)
    temperature: float = 0
    cache_seed: Optional[Union[int, None]] = None
    timeout: Optional[int] = 1000
    max_tokens: Optional[int] = 1000
    extra_body: Optional[dict] = None


class ModelTypes(str, Enum):
    openai = "open_ai"
    google = "google"
    azure = "azure"

class Model(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )  # pylint: disable=not-callable
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )  # pylint: disable=not-callable
    user_id: Optional[str] = None
    model: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    api_type: ModelTypes = Field(
        default=ModelTypes.openai, sa_column=Column(SqlEnum(ModelTypes))
    )
    api_version: Optional[str] = None
    description: Optional[str] = None
    agents: List["Agent"] = Relationship(
        back_populates="models", link_model=AgentModelLink
    )

class CodeExecutionConfigTypes(str,Enum):
    local = "local"
    docker = "docker"
    none = "none"

class VectorDBType(str, Enum):
    pgvector = "pgvector"
    qdrant = "qdrant"

class RetrieverConfig(SQLModel, table=False):
    task: str = "qa"
    docs_path: Union[List[str], str]
    vector_db: VectorDBType = Field(
        default=VectorDBType.pgvector,
        sa_column=Column(SqlEnum(VectorDBType))
    )
    collection_name: str
    db_config: dict = Field(default_factory={}, sa_column=Column(JSON))
    embedding_model: str = "BAAI/bge-large-en-v1.5"
    chunk_token_size: int = 512
    model: str
    get_or_create: bool


class AgentConfig(SQLModel, table=False):
    name: Optional[str] = None
    human_input_mode: str = "NEVER"
    max_consecutive_reply: int = 10
    system_message: Optional[str] = None
    is_termination_msg: Optional[Union[bool, str, Callable]] = None
    code_execution_config: CodeExecutionConfigTypes = Field(
        default=CodeExecutionConfigTypes.local,
        sa_column=Column(SqlEnum(CodeExecutionConfigTypes))
    )
    default_auto_reply: Optional[str] = ""
    retrieve_config: Optional[RetrieverConfig] = None





class AgentType(str, Enum):
    assistant = "assistant"
    userproxy = "userproxy"
    groupchat = "groupchat"
    retrieverproxy = "retrieverproxy"


class WorkflowAgentType(str, Enum):
    sender = "sender"
    receiver = "receiver"
    planner = "planner"


class WorkflowAgentLink(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    workflow_id: int = Field(default=None, primary_key=True, foreign_key="workflow.id")
    agent_id: int = Field(default=None, primary_key=True, foreign_key="agent.id")
    agent_type: WorkflowAgentType = Field(
        default=WorkflowAgentType.sender,
        sa_column=Column(SqlEnum(WorkflowAgentType), primary_key=True),
    )

class AgentLink(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    parent_id: Optional[int] = Field(
        default=None, foreign_key="agent.id", primary_key=True
    )
    agent_id: Optional[int] = Field(
        default=None, foreign_key="agent.id", primary_key=True
    )

class Agent(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )  # pylint: disable=not-callable
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )  # pylint: disable=not-callable
    user_id: Optional[str] = None
    type: AgentType = Field(
        default=AgentType.assistant, sa_column=Column(SqlEnum(AgentType))
    )
    config: AgentConfig = Field(default_factory=AgentConfig, sa_column=Column(JSON))
    skills: List[Skill] = Relationship(
        back_populates="agents", link_model=AgentSkillLink
    )
    models: List[Model] = Relationship(
        back_populates="agents", link_model=AgentModelLink
    )
    workflows: List["Workflow"] = Relationship(
        link_model=WorkflowAgentLink, back_populates="agents"
    )
    parents: List["Agent"] = Relationship(
        back_populates="agents",
        link_model=AgentLink,
        sa_relationship_kwargs=dict(
            primaryjoin="Agent.id==AgentLink.agent_id",
            secondaryjoin="Agent.id==AgentLink.parent_id",
        ),
    )
    agents: List["Agent"] = Relationship(
        back_populates="parents",
        link_model=AgentLink,
        sa_relationship_kwargs=dict(
            primaryjoin="Agent.id==AgentLink.parent_id",
            secondaryjoin="Agent.id==AgentLink.agent_id",
        ),
    )

class WorkFlowType(str, Enum):
    twoagents = "twoagents"
    groupchat = "groupchat"


class WorkFlowSummaryMethod(str, Enum):
    last = "last"
    none = "none"
    llm = "llm"

class Workflow(SQLModel, table=True):
    __table_args__ = {"sqlite_autoincrement": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), server_default=func.now()),
    )  # pylint: disable=not-callable
    updated_at: datetime = Field(
        default_factory=datetime.now,
        sa_column=Column(DateTime(timezone=True), onupdate=func.now()),
    )  # pylint: disable=not-callable
    user_id: Optional[str] = None
    name: str
    description: str
    agents: List[Agent] = Relationship(
        back_populates="workflows", link_model=WorkflowAgentLink
    )
    type: WorkFlowType = Field(
        default=WorkFlowType.twoagents, sa_column=Column(SqlEnum(WorkFlowType))
    )
    summary_method: Optional[WorkFlowSummaryMethod] = Field(
        default=WorkFlowSummaryMethod.last,
        sa_column=Column(SqlEnum(WorkFlowSummaryMethod)),
    )


class Response(SQLModel):
    message: str
    status: bool
    data: Optional[Any] = None


class SocketMessage(SQLModel, table=False):
    connection_id: str
    data: Dict[str, Any]
    type: str


