import logging
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from models.rider_profiles import Rider_profiles
from models.agency_profiles import Agency_profiles

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


# ---------- Pydantic Schemas ----------
class RiderStatusUpdate(BaseModel):
    status: Literal["pending", "active", "inactive", "rejected"]  # 주의-1/6: 유효 값 제약


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
    try:
        result = await db.execute(select(func.count(Rider_profiles.id)))
        total_riders = result.scalar() or 0

        result = await db.execute(select(func.count(Agency_profiles.id)))
        total_agencies = result.scalar() or 0

        result = await db.execute(
            select(func.count(Rider_profiles.id)).where(
                (Rider_profiles.status == "대기중") | (Rider_profiles.status.is_(None))
            )
        )
        pending_riders = result.scalar() or 0

        result = await db.execute(
            select(func.count(Agency_profiles.id)).where(
                (Agency_profiles.verified == False) | (Agency_profiles.verified.is_(None))
            )
        )
        pending_agencies = result.scalar() or 0

        return PlatformStats(
            total_riders=total_riders,
            total_agencies=total_agencies,
            pending_riders=pending_riders,
            pending_agencies=pending_agencies,
        )
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