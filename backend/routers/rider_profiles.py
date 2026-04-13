import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.rider_profiles import Rider_profilesService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/rider_profiles", tags=["rider_profiles"])


# ---------- Pydantic Schemas ----------
class Rider_profilesData(BaseModel):
    """라이더 프로필 생성 스키마.
    security: status, created_at은 클라이언트에서 설정 불가 — 서버에서 강제 주입.
    """
    name: str = Field(..., max_length=100)  # 치명-7
    phone: str = Field(..., max_length=20)  # 치명-7
    city: str = None
    district: str = None
    experience: str = None
    has_motorcycle: bool = None
    rider_type: str = None
    birth_year: str = None
    # status, created_at 필드 없음 → 클라이언트 조작 원천 차단


class Rider_profilesUpdateData(BaseModel):
    """라이더 프로필 수정 스키마 (부분 업데이트 허용).
    security: status(활성화 상태)와 created_at은 일반 사용자 변경 불가.
              status 변경은 관리자 전용 (admin.py 경유).
    """
    name: Optional[str] = Field(None, max_length=100)  # 치명-7
    phone: Optional[str] = Field(None, max_length=20)  # 치명-7
    city: Optional[str] = None
    district: Optional[str] = None
    experience: Optional[str] = None
    has_motorcycle: Optional[bool] = None
    rider_type: Optional[str] = None
    birth_year: Optional[str] = None
    # status, created_at 필드 없음 → 일반 사용자 변경 불가


class Rider_profilesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    name: str
    phone: str
    city: Optional[str] = None
    district: Optional[str] = None
    experience: Optional[str] = None
    has_motorcycle: Optional[bool] = None
    rider_type: Optional[str] = None
    birth_year: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Rider_profilesListResponse(BaseModel):
    """List response schema"""
    items: List[Rider_profilesResponse]
    total: int
    skip: int
    limit: int


class Rider_profilesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Rider_profilesData]


class Rider_profilesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Rider_profilesUpdateData


class Rider_profilesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Rider_profilesBatchUpdateItem]


class Rider_profilesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Rider_profilesListResponse)
async def query_rider_profiless(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query rider_profiless with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying rider_profiless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Rider_profilesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} rider_profiless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying rider_profiless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/all", response_model=Rider_profilesListResponse)
async def query_rider_profiless_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    _current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Query rider_profiless with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying rider_profiless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Rider_profilesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} rider_profiless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying rider_profiless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=Rider_profilesResponse)
async def get_rider_profiles(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single rider_profiles by ID (user can only see their own records)"""
    logger.debug(f"Fetching rider_profiles with id: {id}, fields={fields}")
    
    service = Rider_profilesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Rider_profiles with id {id} not found")
            raise HTTPException(status_code=404, detail="Rider_profiles not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching rider_profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("", response_model=Rider_profilesResponse, status_code=201)
async def create_rider_profiles(
    data: Rider_profilesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """신규 라이더 프로필 생성.
    MVP: 가입 즉시 이용 가능 — status='active'를 서버에서 강제 설정.
    클라이언트가 status를 임의로 설정하는 것을 원천 차단.
    """
    logger.debug(f"Creating new rider_profiles with data: {data}")

    service = Rider_profilesService(db)
    try:
        payload = data.model_dump()
        # MVP: 서버에서 초기 상태 강제 주입 — 클라이언트 조작 불가
        payload["status"] = "active"
        # created_at은 DB server_default(func.now())로 자동 설정되므로 전달하지 않음
        payload.pop("created_at", None)

        result = await service.create(payload, user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create rider_profiles")

        logger.info(f"Rider_profiles created with id={result.id}, status=active (서버 강제)")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating rider_profiles: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating rider_profiles: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/batch", response_model=List[Rider_profilesResponse], status_code=201)
async def create_rider_profiless_batch(
    request: Rider_profilesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple rider_profiless in a single atomic transaction"""
    logger.debug(f"Batch creating {len(request.items)} rider_profiless")

    service = Rider_profilesService(db)
    try:
        # 치명-2: batch_create로 단일 트랜잭션 보장
        results = await service.batch_create(
            [item.model_dump() for item in request.items],
            user_id=str(current_user.id),
        )
        logger.info(f"Batch created {len(results)} rider_profiless successfully")
        return results
    except Exception as e:
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")  # 심각-1


@router.put("/batch", response_model=List[Rider_profilesResponse])
async def update_rider_profiless_batch(
    request: Rider_profilesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple rider_profiless in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} rider_profiless")

    service = Rider_profilesService(db)
    results = []

    try:
        for item in request.items:
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        await db.commit()
        logger.info(f"Batch updated {len(results)} rider_profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")  # 심각-1


@router.put("/{id}", response_model=Rider_profilesResponse)
async def update_rider_profiles(
    id: int,
    data: Rider_profilesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """라이더 프로필 수정 (본인 소유 레코드만 가능).
    security: status, created_at은 이 엔드포인트로 변경 불가.
    """
    logger.debug(f"Updating rider_profiles {id} with data: {data}")

    service = Rider_profilesService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        # 방어 코드: 혹시라도 status/created_at이 포함됐을 경우 제거
        update_dict.pop("status", None)
        update_dict.pop("created_at", None)

        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Rider_profiles with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Rider_profiles not found")

        logger.info(f"Rider_profiles {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating rider_profiles {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating rider_profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/batch")
async def delete_rider_profiless_batch(
    request: Rider_profilesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple rider_profiless by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} rider_profiless")

    service = Rider_profilesService(db)
    deleted_count = 0

    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        logger.info(f"Batch deleted {deleted_count} rider_profiless successfully")
        return {"message": f"Successfully deleted {deleted_count} rider_profiless", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")  # 심각-1


@router.delete("/{id}")
async def delete_rider_profiles(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single rider_profiles by ID (requires ownership)"""
    logger.debug(f"Deleting rider_profiles with id: {id}")
    
    service = Rider_profilesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Rider_profiles with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Rider_profiles not found")
        
        logger.info(f"Rider_profiles {id} deleted successfully")
        return {"message": "Rider_profiles deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting rider_profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")