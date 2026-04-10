import logging
import mimetypes
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError
from core.config import settings
from schemas.storage import (
    BucketInfo,
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

logger = logging.getLogger(__name__)

# 동기 boto3 호출을 비동기 환경에서 처리하기 위한 스레드풀
_executor = ThreadPoolExecutor(max_workers=4)


def _get_s3_client():
    """Cloudflare R2용 boto3 S3 클라이언트를 생성한다."""
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        config=Config(
            signature_version="s3v4",
            retries={"max_attempts": 3, "mode": "standard"},
        ),
    )


class StorageService:
    """Cloudflare R2와 boto3를 통해 파일 업로드/다운로드를 처리하는 서비스."""

    def __init__(self):
        if not settings.r2_endpoint_url or not settings.r2_access_key_id or not settings.r2_secret_access_key:
            raise ValueError(
                "R2 설정이 누락되었습니다. R2_ENDPOINT_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY를 확인하세요."
            )
        self.bucket_name = settings.r2_bucket_name
        self.s3 = _get_s3_client()

    async def create_bucket(self, request: BucketRequest) -> BucketResponse:
        """버킷을 생성한다."""
        try:
            self.s3.create_bucket(Bucket=request.bucket_name)
            logger.info(f"Bucket created: {request.bucket_name}")
            return BucketResponse(bucket_name=request.bucket_name, created_at=None)
        except ClientError as e:
            logger.error(f"Failed to create bucket {request.bucket_name}: {e}")
            raise ValueError(str(e))
        except (BotoCoreError, Exception) as e:
            logger.error(f"Unexpected error creating bucket: {e}")
            raise

    async def list_buckets(self) -> BucketListResponse:
        """전체 버킷 목록을 반환한다."""
        try:
            response = self.s3.list_buckets()
            result = BucketListResponse()
            for b in response.get("Buckets", []):
                result.buckets.append(BucketInfo(bucket_name=b["Name"], visibility="private"))
            return result
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Failed to list buckets: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error listing buckets: {e}")
            raise

    async def list_objects(self, request: OSSBaseModel) -> ObjectListResponse:
        """버킷 내 객체 목록을 반환한다."""
        try:
            response = self.s3.list_objects_v2(Bucket=request.bucket_name)
            result = ObjectListResponse()
            for obj in response.get("Contents", []):
                result.objects.append(
                    ObjectInfo(
                        bucket_name=request.bucket_name,
                        object_key=obj["Key"],
                        size=obj["Size"],
                        last_modified=str(obj["LastModified"]),
                        etag=obj.get("ETag", "").strip('"'),
                    )
                )
            return result
        except ClientError as e:
            logger.error(f"Failed to list objects in {request.bucket_name}: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error listing objects: {e}")
            raise

    async def get_object_info(self, request: ObjectRequest) -> ObjectInfo:
        """객체 메타데이터를 반환한다."""
        try:
            response = self.s3.head_object(Bucket=request.bucket_name, Key=request.object_key)
            return ObjectInfo(
                bucket_name=request.bucket_name,
                object_key=request.object_key,
                size=response["ContentLength"],
                last_modified=str(response["LastModified"]),
                etag=response.get("ETag", "").strip('"'),
            )
        except ClientError as e:
            logger.error(f"Failed to get object info {request.object_key}: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error getting object info: {e}")
            raise

    async def rename_object(self, request: RenameRequest) -> RenameResponse:
        """객체를 복사 후 원본 삭제하여 이름을 변경한다."""
        try:
            copy_source = {"Bucket": request.bucket_name, "Key": request.source_key}
            self.s3.copy_object(
                CopySource=copy_source,
                Bucket=request.bucket_name,
                Key=request.target_key,
                MetadataDirective="COPY",
            )
            self.s3.delete_object(Bucket=request.bucket_name, Key=request.source_key)
            logger.info(f"Renamed {request.source_key} -> {request.target_key}")
            return RenameResponse(success=True)
        except ClientError as e:
            logger.error(f"Failed to rename object: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error renaming object: {e}")
            raise

    async def delete_object(self, request: ObjectRequest) -> DeleteResponse:
        """객체를 삭제한다."""
        try:
            self.s3.delete_object(Bucket=request.bucket_name, Key=request.object_key)
            logger.info(f"Deleted object: {request.object_key} from {request.bucket_name}")
            return DeleteResponse(success=True)
        except ClientError as e:
            logger.error(f"Failed to delete object {request.object_key}: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error deleting object: {e}")
            raise

    async def create_upload_url(self, request: FileUpDownRequest) -> FileUpDownResponse:
        """파일 업로드용 presigned URL을 생성한다."""
        try:
            content_type, _ = mimetypes.guess_type(str(request.object_key))
            if not content_type:
                content_type = "application/octet-stream"

            upload_url = self.s3.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": request.bucket_name,
                    "Key": request.object_key,
                    "ContentType": content_type,
                },
                ExpiresIn=3600,
            )
            logger.info(f"Generated upload URL for {request.object_key}")
            return FileUpDownResponse(upload_url=upload_url, expires_at=None)
        except ClientError as e:
            logger.error(f"Failed to generate upload URL: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error generating upload URL: {e}")
            raise

    async def create_download_url(self, request: FileUpDownRequest) -> FileUpDownResponse:
        """파일 다운로드용 presigned URL을 생성한다."""
        try:
            content_type, _ = mimetypes.guess_type(str(request.object_key))
            if not content_type:
                content_type = "application/octet-stream"

            download_url = self.s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": request.bucket_name,
                    "Key": request.object_key,
                    "ResponseContentType": content_type,
                },
                ExpiresIn=3600,
            )
            logger.info(f"Generated download URL for {request.object_key}")
            return FileUpDownResponse(download_url=download_url, expires_at=None)
        except ClientError as e:
            logger.error(f"Failed to generate download URL: {e}")
            raise ValueError(str(e))
        except Exception as e:
            logger.error(f"Unexpected error generating download URL: {e}")
            raise
