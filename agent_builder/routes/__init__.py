from .workflow_endpoints import setup_router as wf_router
from .agents_endpoint import setup_router as ag_router
from .link_entities_endpoints import setup_router as le_router
from .models_endpoint import setup_router as md_router
from .session_endpoints import setup_router as ss_router
from .skill_endpoints import setup_router as sk_router
from .knowledge_hub_endpoints import setup_router as kh_router


__all__ = [
    wf_router,
    ag_router,
    le_router,
    md_router,
    ss_router,
    sk_router,
    kh_router
]
