import json
import logging
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.agency_profiles import Agency_profilesService
from dependencies.auth import get_current_user_supabase as get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/agency_profiles", tags=["agency_profiles"])


# ---------- Pydantic Schemas ----------
class Agency_profilesData(BaseModel):
    """지사 프로필 생성 스키마.
    security: verified, created_at은 클라이언트에서 설정 불가 — 서버에서 강제 주입.
    """
    name: str
    manager_name: str = None
    phone: str = None
    city: str = None
    district: str = None
    platform: str = None
    pay_per_delivery: str = None
    promotion: str = None
    settlement_type: str = None
    motorcycle_option: str = None
    work_type: str = None
    logo_url: Optional[str] = None  # 지사 로고 이미지 URL (Cloudflare R2)
    # verified, created_at 필드 없음 → 클라이언트 조작 원천 차단


class Agency_profilesUpdateData(BaseModel):
    """지사 프로필 수정 스키마 (부분 업데이트 허용).
    security: verified(인증 상태)와 created_at은 일반 사용자 변경 불가.
              verified 변경은 관리자 전용 (admin.py의 update_agency_status 경유).
    """
    name: Optional[str] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    platform: Optional[str] = None
    pay_per_delivery: Optional[str] = None
    promotion: Optional[str] = None
    settlement_type: Optional[str] = None
    motorcycle_option: Optional[str] = None
    work_type: Optional[str] = None
    logo_url: Optional[str] = None  # 지사 로고 이미지 URL (Cloudflare R2)
    # verified, created_at 필드 없음 → 일반 사용자 변경 불가



class Agency_profilesResponse(BaseModel):
    """지사 프로필 응답 스키마"""
    id: int
    user_id: str
    name: str
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    platform: Optional[str] = None
    pay_per_delivery: Optional[str] = None
    promotion: Optional[str] = None
    settlement_type: Optional[str] = None
    motorcycle_option: Optional[str] = None
    work_type: Optional[str] = None
    logo_url: Optional[str] = None
    verified: Optional[bool] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class Agency_profilesListResponse(BaseModel):
    """List response schema"""
    items: List[Agency_profilesResponse]
    total: int
    skip: int
    limit: int


class Agency_profilesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Agency_profilesData]


class Agency_profilesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Agency_profilesUpdateData


class Agency_profilesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Agency_profilesBatchUpdateItem]


class Agency_profilesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Agency_profilesListResponse)
async def query_agency_profiless(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query agency_profiless with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying agency_profiless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Agency_profilesService(db)
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
        logger.debug(f"Found {result['total']} agency_profiless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying agency_profiless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/all", response_model=Agency_profilesListResponse)
async def query_agency_profiless_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    _current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Query agency_profiless with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying agency_profiless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Agency_profilesService(db)
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
        logger.debug(f"Found {result['total']} agency_profiless")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying agency_profiless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=Agency_profilesResponse)
async def get_agency_profiles(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single agency_profiles by ID (user can only see their own records)"""
    logger.debug(f"Fetching agency_profiles with id: {id}, fields={fields}")
    
    service = Agency_profilesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Agency_profiles with id {id} not found")
            raise HTTPException(status_code=404, detail="Agency_profiles not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching agency_profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("", response_model=Agency_profilesResponse, status_code=201)
async def create_agency_profiles(
    data: Agency_profilesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """신규 지사 프로필 생성.
    MVP: 가입 즉시 공고 등록 가능 — verified=True를 서버에서 강제 설정.
    클라이언트가 verified를 임의로 설정하는 것을 원천 차단.
    """
    logger.debug(f"Creating new agency_profiles with data: {data}")

    service = Agency_profilesService(db)
    try:
        payload = data.model_dump()
        # MVP: 서버에서 인증 상태 강제 주입 — 클라이언트 조작 불가
        payload["verified"] = True
        # created_at은 DB server_default(func.now())로 자동 설정되므로 전달하지 않음
        payload.pop("created_at", None)

        result = await service.create(payload, user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create agency_profiles")

        logger.info(f"Agency_profiles created with id={result.id}, verified=True (서버 강제)")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating agency_profiles: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating agency_profiles: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/batch", response_model=List[Agency_profilesResponse], status_code=201)
async def create_agency_profiless_batch(
    request: Agency_profilesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple agency_profiless in a single request"""
    logger.debug(f"Batch creating {len(request.items)} agency_profiless")
    
    service = Agency_profilesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} agency_profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.put("/batch", response_model=List[Agency_profilesResponse])
async def update_agency_profiless_batch(
    request: Agency_profilesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple agency_profiless in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} agency_profiless")
    
    service = Agency_profilesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} agency_profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.put("/{id}", response_model=Agency_profilesResponse)
async def update_agency_profiles(
    id: int,
    data: Agency_profilesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """지사 프로필 수정 (본인 소유 레코드만 가능).
    security: verified, created_at은 이 엔드포인트로 변경 불가.
    """
    logger.debug(f"Updating agency_profiles {id} with data: {data}")

    service = Agency_profilesService(db)
    try:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        # 방어 코드: 혹시라도 verified/created_at이 포함됐을 경우 제거
        update_dict.pop("verified", None)
        update_dict.pop("created_at", None)

        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Agency_profiles with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Agency_profiles not found")

        logger.info(f"Agency_profiles {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating agency_profiles {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating agency_profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/batch")
async def delete_agency_profiless_batch(
    request: Agency_profilesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple agency_profiless by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} agency_profiless")
    
    service = Agency_profilesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} agency_profiless successfully")
        return {"message": f"Successfully deleted {deleted_count} agency_profiless", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.delete("/{id}")
async def delete_agency_profiles(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single agency_profiles by ID (requires ownership)"""
    logger.debug(f"Deleting agency_profiles with id: {id}")
    
    service = Agency_profilesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Agency_profiles with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Agency_profiles not found")
        
        logger.info(f"Agency_profiles {id} deleted successfully")
        return {"message": "Agency_profiles deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting agency_profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")