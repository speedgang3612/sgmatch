import json
import logging
from datetime import datetime
from typing import List, Optional


from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.job_listings import Job_listingsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/job_listings", tags=["job_listings"])


# ---------- Pydantic Schemas ----------
class Job_listingsData(BaseModel):
    """Entity data schema (for create/update)"""
    company_id: int = None
    agency_id: int = None
    agency_name: str = None
    company_name: str = None
    region: str = None
    sub_region: str = None
    title: str = None
    conditions: str = None
    promotion: str = None
    motorcycle: str = None
    settlement: str = None
    work_time: str = None
    pay_per_delivery: str = None
    status: str = None
    created_at: Optional[datetime] = None  # 심각-9: str → datetime


class Job_listingsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    company_id: Optional[int] = None
    agency_id: Optional[int] = None
    agency_name: Optional[str] = None
    company_name: Optional[str] = None
    region: Optional[str] = None
    sub_region: Optional[str] = None
    title: Optional[str] = None
    conditions: Optional[str] = None
    promotion: Optional[str] = None
    motorcycle: Optional[str] = None
    settlement: Optional[str] = None
    work_time: Optional[str] = None
    pay_per_delivery: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None  # 심각-9


class Job_listingsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    company_id: Optional[int] = None
    agency_id: Optional[int] = None
    agency_name: Optional[str] = None
    company_name: Optional[str] = None
    region: Optional[str] = None
    sub_region: Optional[str] = None
    title: Optional[str] = None
    conditions: Optional[str] = None
    promotion: Optional[str] = None
    motorcycle: Optional[str] = None
    settlement: Optional[str] = None
    work_time: Optional[str] = None
    pay_per_delivery: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class Job_listingsListResponse(BaseModel):
    """List response schema"""
    items: List[Job_listingsResponse]
    total: int
    skip: int
    limit: int


class Job_listingsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Job_listingsData]


class Job_listingsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Job_listingsUpdateData


class Job_listingsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Job_listingsBatchUpdateItem]


class Job_listingsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Job_listingsListResponse)
async def query_job_listingss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query job_listingss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying job_listingss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Job_listingsService(db)
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
        logger.debug(f"Found {result['total']} job_listingss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying job_listingss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/all", response_model=Job_listingsListResponse)
async def query_job_listingss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # 공개 엔드포인트: 로그인 없이 전체 채용 공고 조회 가능
    logger.debug(f"Querying job_listingss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Job_listingsService(db)
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
        logger.debug(f"Found {result['total']} job_listingss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying job_listingss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=Job_listingsResponse)
async def get_job_listings(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single job_listings by ID - 공개 엔드포인트 (로그인 불필요)"""
    logger.debug(f"Fetching job_listings with id: {id}, fields={fields}")
    
    service = Job_listingsService(db)
    try:
        # user_id 필터 없이 누구나 조회 가능
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Job_listings with id {id} not found")
            raise HTTPException(status_code=404, detail="Job_listings not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job_listings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("", response_model=Job_listingsResponse, status_code=201)
async def create_job_listings(
    data: Job_listingsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new job_listings"""
    logger.debug(f"Creating new job_listings with data: {data}")
    
    service = Job_listingsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create job_listings")
        
        logger.info(f"Job_listings created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating job_listings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating job_listings: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/batch", response_model=List[Job_listingsResponse], status_code=201)
async def create_job_listingss_batch(
    request: Job_listingsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple job_listingss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} job_listingss")
    
    service = Job_listingsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} job_listingss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.put("/batch", response_model=List[Job_listingsResponse])
async def update_job_listingss_batch(
    request: Job_listingsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple job_listingss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} job_listingss")
    
    service = Job_listingsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} job_listingss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.put("/{id}", response_model=Job_listingsResponse)
async def update_job_listings(
    id: int,
    data: Job_listingsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing job_listings (requires ownership)"""
    logger.debug(f"Updating job_listings {id} with data: {data}")

    service = Job_listingsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Job_listings with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Job_listings not found")
        
        logger.info(f"Job_listings {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating job_listings {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating job_listings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/batch")
async def delete_job_listingss_batch(
    request: Job_listingsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple job_listingss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} job_listingss")
    
    service = Job_listingsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} job_listingss successfully")
        return {"message": f"Successfully deleted {deleted_count} job_listingss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.delete("/{id}")
async def delete_job_listings(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single job_listings by ID (requires ownership)"""
    logger.debug(f"Deleting job_listings with id: {id}")
    
    service = Job_listingsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Job_listings with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Job_listings not found")
        
        logger.info(f"Job_listings {id} deleted successfully")
        return {"message": "Job_listings deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting job_listings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")