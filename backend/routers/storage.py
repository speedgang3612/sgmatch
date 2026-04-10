import logging

from dependencies.auth import get_admin_user, get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from schemas.auth import UserResponse
from schemas.storage import (
    BucketListResponse,
    BucketRequest,
    BucketResponse,
    DeleteResponse,
    FileUpDownRequest,
    FileUpDownResponse,
    ObjectInfo,
    ObjectListResponse,
    ObjectRequest,
    OSSBaseModel,
    RenameRequest,
    RenameResponse,
)
from services.storage import StorageService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/storage", tags=["storage"])


def _assert_owns_bucket(bucket_name: str, current_user: UserResponse) -> None:
    """bucket_name이 현재 유저 소유인지 확인한다.

    규칙: bucket_name은 반드시 '{user_id}-' 로 시작해야 한다.
    이를 통해 다른 유저의 버킷에 접근하는 것을 방지한다.
    """
    expected_prefix = f"{current_user.id}-"
    if not bucket_name.startswith(expected_prefix):
        logger.warning(
            "Storage ownership violation: user=%s tried to access bucket=%s",
            current_user.id, bucket_name,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 버킷에 대한 접근 권한이 없습니다.",
        )


@router.post("/create-bucket", response_model=BucketResponse)
async def create_bucket(request: BucketRequest, _current_user: UserResponse = Depends(get_admin_user)):
    """
    Create a new bucket
    """
    try:
        service = StorageService()
        return await service.create_bucket(request)
    except ValueError as e:
        logger.error(f"Invalid create bucket request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to create bucket: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.get("/list-buckets", response_model=BucketListResponse)
async def list_buckets(_current_user: UserResponse = Depends(get_current_user)):
    """
    List buckets of the user
    """
    try:
        service = StorageService()
        return await service.list_buckets()
    except ValueError as e:
        logger.error(f"Invalid list buckets request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to list buckets: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.get("/list-objects", response_model=ObjectListResponse)
async def list_objects(request: OSSBaseModel = Depends(), current_user: UserResponse = Depends(get_current_user)):
    """
    List objects under the bucket
    """
    _assert_owns_bucket(request.bucket_name, current_user)
    try:
        service = StorageService()
        return await service.list_objects(request)
    except ValueError as e:
        logger.error(f"Invalid list objects request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to list objects: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.get("/get-object-info", response_model=ObjectInfo)
async def get_object_info(request: ObjectRequest = Depends(), current_user: UserResponse = Depends(get_current_user)):
    """
    Get object metadata from the bucket
    """
    _assert_owns_bucket(request.bucket_name, current_user)
    try:
        service = StorageService()
        return await service.get_object_info(request)
    except ValueError as e:
        logger.error(f"Invalid get object metadata request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to get object metadata: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.post("/rename-object", response_model=RenameResponse)
async def rename_object(request: RenameRequest, current_user: UserResponse = Depends(get_current_user)):
    """
    Rename object inside the bucket
    """
    _assert_owns_bucket(request.bucket_name, current_user)
    try:
        service = StorageService()
        return await service.rename_object(request)
    except ValueError as e:
        logger.error(f"Invalid rename object: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to rename object: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.delete("/delete-object", response_model=DeleteResponse)
async def delete_object(request: ObjectRequest, current_user: UserResponse = Depends(get_current_user)):
    """
    Delete object inside the bucket
    """
    _assert_owns_bucket(request.bucket_name, current_user)
    try:
        service = StorageService()
        return await service.delete_object(request)
    except ValueError as e:
        logger.error(f"Invalid delete object: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to delete object: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.post("/upload-url", response_model=FileUpDownResponse)
async def upload_file(request: FileUpDownRequest, current_user: UserResponse = Depends(get_current_user)):
    """
    Get a presigned URL for uploading a file to StorageService.

    Steps:
    1. Client calls this endpoint with file details
    2. Server validates and calls OSS service
    3. Returns presigned URL and access_url from OSS service
    4. Client uploads file directly to ObjectStorage using the presigned URL
    5. File is accessible at the returned access_url
    """
    _assert_owns_bucket(request.bucket_name, current_user)
    try:
        service = StorageService()
        return await service.create_upload_url(request)
    except ValueError as e:
        logger.error(f"Invalid upload request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate upload URL: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@router.post("/download-url", response_model=FileUpDownResponse)
async def download_file(request: FileUpDownRequest, current_user: UserResponse = Depends(get_current_user)):
    """
    Get a presigned URL for downloading a file to StorageService.
    """
    _assert_owns_bucket(request.bucket_name, current_user)
    try:
        service = StorageService()
        return await service.create_download_url(request)
    except ValueError as e:
        logger.error(f"Invalid download request: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate download URL: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")

