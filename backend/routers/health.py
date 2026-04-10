from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends
from schemas.auth import UserResponse
from services.database import check_database_health

router = APIRouter(prefix="/database", tags=["database"])


@router.get("/health")
async def database_health_check(_current_user: UserResponse = Depends(get_current_user)):
    """Check database connection health (로그인 필요)"""
    is_healthy = await check_database_health()
    return {"status": "healthy" if is_healthy else "unhealthy", "service": "database"}
