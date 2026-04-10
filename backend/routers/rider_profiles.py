import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
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
    """Entity data schema (for create/update)"""
    name: str
    phone: str
    city: str = None
    district: str = None
    experience: str = None
    has_motorcycle: bool = None
    rider_type: str = None
    birth_year: str = None
    status: str = None
    created_at: Optional[datetime] = None


class Rider_profilesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    experience: Optional[str] = None
    has_motorcycle: Optional[bool] = None
    rider_type: Optional[str] = None
    birth_year: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


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
    """Create a new rider_profiles"""
    logger.debug(f"Creating new rider_profiles with data: {data}")
    
    service = Rider_profilesService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create rider_profiles")
        
        logger.info(f"Rider_profiles created successfully with id: {result.id}")
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
    """Create multiple rider_profiless in a single request"""
    logger.debug(f"Batch creating {len(request.items)} rider_profiless")
    
    service = Rider_profilesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} rider_profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


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
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} rider_profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Rider_profilesResponse)
async def update_rider_profiles(
    id: int,
    data: Rider_profilesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing rider_profiles (requires ownership)"""
    logger.debug(f"Updating rider_profiles {id} with data: {data}")

    service = Rider_profilesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
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
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


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