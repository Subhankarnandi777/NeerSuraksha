from fastapi import APIRouter
from app.api.v1 import sources, health, sync, groundwater

api_router = APIRouter()
api_router.include_router(sources.router, prefix="/sources", tags=["sources"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
api_router.include_router(groundwater.router, prefix="/groundwater", tags=["groundwater"])  
