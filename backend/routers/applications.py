import json
import logging
from typing import List, Literal, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.applications import ApplicationsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/applications", tags=["applications"])


# ---------- Pydantic Schemas ----------
class ApplicationsData(BaseModel):
    """Entity data schema (for create/update)"""
    job_listing_id: int = None
    agency_name: str = Field(None, max_length=100)   # 치명-7
    rider_name: str = Field(None, max_length=100)    # 치명-7
    status: Optional[Literal["pending", "reviewed", "accepted", "rejected"]] = None  # 심각-3
    applied_at: Optional[datetime] = None            # 주의-4: 프론트가 전송하는 실제 신청 시각
    created_at: Optional[datetime] = None


class ApplicationsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    job_listing_id: Optional[int] = None
    agency_name: Optional[str] = Field(None, max_length=100)  # 치명-7
    rider_name: Optional[str] = Field(None, max_length=100)   # 치명-7
    status: Optional[Literal["pending", "reviewed", "accepted", "rejected"]] = None  # 심각-3
    applied_at: Optional[datetime] = None  # 주의-4
    created_at: Optional[datetime] = None


class ApplicationsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    job_listing_id: Optional[int] = None
    agency_name: Optional[str] = None
    rider_name: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApplicationsListResponse(BaseModel):
    """List response schema"""
    items: List[ApplicationsResponse]
    total: int
    skip: int
    limit: int


class ApplicationsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[ApplicationsData]


class ApplicationsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: ApplicationsUpdateData


class ApplicationsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[ApplicationsBatchUpdateItem]


class ApplicationsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=ApplicationsListResponse)
async def query_applicationss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query applicationss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying applicationss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = ApplicationsService(db)
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
        logger.debug(f"Found {result['total']} applicationss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying applicationss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/all", response_model=ApplicationsListResponse)
async def query_applicationss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    _current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Query applicationss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying applicationss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = ApplicationsService(db)
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
        logger.debug(f"Found {result['total']} applicationss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying applicationss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=ApplicationsResponse)
async def get_applications(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single applications by ID (user can only see their own records)"""
    logger.debug(f"Fetching applications with id: {id}, fields={fields}")
    
    service = ApplicationsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Applications with id {id} not found")
            raise HTTPException(status_code=404, detail="Applications not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching applications {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("", response_model=ApplicationsResponse, status_code=201)
async def create_applications(
    data: ApplicationsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new applications"""
    logger.debug(f"Creating new applications with data: {data}")
    
    service = ApplicationsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create applications")
        
        logger.info(f"Applications created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating applications: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating applications: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/batch", response_model=List[ApplicationsResponse], status_code=201)
async def create_applicationss_batch(
    request: ApplicationsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple applicationss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} applicationss")
    
    service = ApplicationsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} applicationss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.put("/batch", response_model=List[ApplicationsResponse])
async def update_applicationss_batch(
    request: ApplicationsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple applicationss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} applicationss")
    
    service = ApplicationsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} applicationss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.put("/{id}", response_model=ApplicationsResponse)
async def update_applications(
    id: int,
    data: ApplicationsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing applications (requires ownership)"""
    logger.debug(f"Updating applications {id} with data: {data}")

    service = ApplicationsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Applications with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Applications not found")
        
        logger.info(f"Applications {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating applications {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating applications {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/batch")
async def delete_applicationss_batch(
    request: ApplicationsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple applicationss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} applicationss")
    
    service = ApplicationsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} applicationss successfully")
        return {"message": f"Successfully deleted {deleted_count} applicationss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Batch operation failed")


@router.delete("/{id}")
async def delete_applications(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single applications by ID (requires ownership)"""
    logger.debug(f"Deleting applications with id: {id}")
    
    service = ApplicationsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Applications with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Applications not found")
        
        logger.info(f"Applications {id} deleted successfully")
        return {"message": "Applications deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting applications {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")