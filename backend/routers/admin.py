import json
import logging
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.redis import get_redis
from dependencies.auth import get_admin_user_supabase as get_admin_user
from schemas.auth import UserResponse
from models.rider_profiles import Rider_profiles
from models.agency_profiles import Agency_profiles

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# ---------- Pydantic Schemas ----------
class RiderStatusUpdate(BaseModel):
    # MVP 즉시 가입 시스템 — 관리자는 사후 차단/활성화만 가능
    # active: 정상 이용 / inactive: 차단 / rejected: 영구 거절
    status: Literal["active", "inactive", "rejected"]


class AgencyStatusUpdate(BaseModel):
    verified: Optional[bool] = None


class PlatformStats(BaseModel):
    total_riders: int
    total_agencies: int
    pending_riders: int
    pending_agencies: int


# ---------- Routes ----------
@router.get("/stats", response_model=PlatformStats)
async def get_platform_stats(
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Get platform statistics for admin dashboard."""
    _CACHE_KEY = "admin:stats"
    _CACHE_TTL = 30  # 30초 TTL

    # 1. Redis 쳨시 우선 조회
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(_CACHE_KEY)
        if cached:
            logger.debug("admin/stats: cache hit")
            return PlatformStats(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis cache read failed, falling back to DB: {e}")

    # 2. 단일 쿼리로 4개 COUNT 통합 (스칼라 서브쿼리)
    try:
        total_riders_sq = select(func.count(Rider_profiles.id)).scalar_subquery()
        total_agencies_sq = select(func.count(Agency_profiles.id)).scalar_subquery()
        # MVP 즉시 가입: 신규 가입자는 active로 시작
        # pending_riders = inactive 또는 status 미설정(null) 라이더 수
        pending_riders_sq = select(func.count(Rider_profiles.id)).where(
            (Rider_profiles.status == "inactive") | (Rider_profiles.status.is_(None))
        ).scalar_subquery()
        # pending_agencies = verified=False인 지사 수 (관리자가 차단한 경우)
        pending_agencies_sq = select(func.count(Agency_profiles.id)).where(
            (Agency_profiles.verified == False) | (Agency_profiles.verified.is_(None))
        ).scalar_subquery()

        result = await db.execute(
            select(
                total_riders_sq.label("total_riders"),
                total_agencies_sq.label("total_agencies"),
                pending_riders_sq.label("pending_riders"),
                pending_agencies_sq.label("pending_agencies"),
            )
        )
        row = result.one()
        stats = PlatformStats(
            total_riders=row[0] or 0,
            total_agencies=row[1] or 0,
            pending_riders=row[2] or 0,
            pending_agencies=row[3] or 0,
        )

        # 3. Redis에 결과 쳨싱 (Redis 장애 시 무시하고 정상 응답)
        if redis is not None:
            try:
                await redis.setex(_CACHE_KEY, _CACHE_TTL, json.dumps(stats.model_dump()))
                logger.debug("admin/stats: cache stored")
            except Exception as e:
                logger.warning(f"Redis cache write failed: {e}")

        return stats
    except Exception as e:
        logger.error(f"Error fetching platform stats: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/riders")
async def get_all_riders(
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
):
    """Admin: Get all rider profiles."""
    try:
        result = await db.execute(
            select(Rider_profiles).order_by(desc(Rider_profiles.id)).offset(skip).limit(limit)
        )
        riders = result.scalars().all()

        count_result = await db.execute(select(func.count(Rider_profiles.id)))
        total = count_result.scalar() or 0

        items = []
        for r in riders:
            items.append({
                "id": r.id,
                "user_id": r.user_id,
                "name": r.name,
                "phone": r.phone,
                "city": r.city,
                "district": r.district,
                "experience": r.experience,
                "has_motorcycle": r.has_motorcycle,
                "rider_type": r.rider_type,
                "birth_year": r.birth_year,
                "status": r.status,
                "created_at": str(r.created_at) if r.created_at else None,
            })

        return {"items": items, "total": total}
    except Exception as e:
        logger.error(f"Error fetching riders: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/agencies")
async def get_all_agencies(
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
):
    """Admin: Get all agency profiles."""
    try:
        result = await db.execute(
            select(Agency_profiles).order_by(desc(Agency_profiles.id)).offset(skip).limit(limit)
        )
        agencies = result.scalars().all()

        count_result = await db.execute(select(func.count(Agency_profiles.id)))
        total = count_result.scalar() or 0

        items = []
        for a in agencies:
            items.append({
                "id": a.id,
                "user_id": a.user_id,
                "name": a.name,
                "manager_name": a.manager_name,
                "phone": a.phone,
                "city": a.city,
                "district": a.district,
                "platform": a.platform,
                "pay_per_delivery": a.pay_per_delivery,
                "promotion": a.promotion,
                "settlement_type": a.settlement_type,
                "motorcycle_option": a.motorcycle_option,
                "work_type": a.work_type,
                "verified": a.verified,
                "created_at": a.created_at,
            })

        return {"items": items, "total": total}
    except Exception as e:
        logger.error(f"Error fetching agencies: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/riders/{rider_id}/status")
async def update_rider_status(
    rider_id: int,
    data: RiderStatusUpdate,
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Update rider approval status."""
    try:
        result = await db.execute(
            select(Rider_profiles).where(Rider_profiles.id == rider_id)
        )
        rider = result.scalar_one_or_none()
        if not rider:
            raise HTTPException(status_code=404, detail="Rider not found")

        rider.status = data.status
        await db.commit()
        await db.refresh(rider)

        logger.info(f"Admin updated rider {rider_id} status to {data.status}")
        return {
            "message": f"Rider status updated to {data.status}",
            "id": rider_id,
            "status": data.status,
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating rider status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/agencies/{agency_id}/status")
async def update_agency_status(
    agency_id: int,
    data: AgencyStatusUpdate,
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Update agency verification status."""
    try:
        result = await db.execute(
            select(Agency_profiles).where(Agency_profiles.id == agency_id)
        )
        agency = result.scalar_one_or_none()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency not found")

        if data.verified is not None:
            agency.verified = data.verified

        await db.commit()
        await db.refresh(agency)

        logger.info(f"Admin updated agency {agency_id} verified={data.verified}")
        return {
            "message": "Agency status updated",
            "id": agency_id,
            "verified": agency.verified,
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating agency status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")