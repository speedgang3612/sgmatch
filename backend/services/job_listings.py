import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.job_listings import Job_listings

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Job_listingsService:
    """Service layer for Job_listings operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Job_listings]:
        """Create a new job_listings"""
        try:
            if user_id:
                data['user_id'] = user_id
            # created_at 자동 설정 (프론트에서 미전달 시)
            if not data.get('created_at'):
                from datetime import datetime
                data['created_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            # None 값 필터링 — 존재하지 않는 컬럼에 None 전달 시 asyncpg 오류 방지
            data = {k: v for k, v in data.items() if v is not None}
            obj = Job_listings(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created job_listings with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating job_listings: {str(e)}")
            raise



    async def batch_create(self, items, user_id=None):
        """치명-2: 단일 트랜잭션으로 생성 — 하나라도 실패하면 전체 rollback."""
        try:
            objs = []
            for data in items:
                if user_id:
                    data = dict(data)
                    data['user_id'] = user_id
                obj = Job_listings(**data)
                self.db.add(obj)
                objs.append(obj)
            await self.db.commit()
            for obj in objs:
                await self.db.refresh(obj)
            return objs
        except Exception as e:
            await self.db.rollback()
            raise
    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for job_listings {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Job_listings]:
        """Get job_listings by ID (user can only see their own records)"""
        try:
            query = select(Job_listings).where(Job_listings.id == obj_id)
            if user_id:
                query = query.where(Job_listings.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching job_listings {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of job_listingss (user can only see their own records)"""
        try:
            query = select(Job_listings)
            count_query = select(func.count(Job_listings.id))
            
            if user_id:
                query = query.where(Job_listings.user_id == user_id)
                count_query = count_query.where(Job_listings.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    # 치명-4: 내부 필드 주입 차단
                    if field in ("id", "user_id"):
                        continue
                    if hasattr(Job_listings, field):
                        query = query.where(getattr(Job_listings, field) == value)
                        count_query = count_query.where(getattr(Job_listings, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Job_listings, field_name):
                        query = query.order_by(getattr(Job_listings, field_name).desc())
                else:
                    if hasattr(Job_listings, sort):
                        query = query.order_by(getattr(Job_listings, sort))
            else:
                query = query.order_by(Job_listings.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching job_listings list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Job_listings]:
        """Update job_listings (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Job_listings {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated job_listings {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating job_listings {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete job_listings (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Job_listings {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted job_listings {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting job_listings {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Job_listings]:
        """Get job_listings by any field"""
        try:
            if not hasattr(Job_listings, field_name):
                raise ValueError(f"Field {field_name} does not exist on Job_listings")
            result = await self.db.execute(
                select(Job_listings).where(getattr(Job_listings, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching job_listings by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Job_listings]:
        """Get list of job_listingss filtered by field"""
        try:
            if not hasattr(Job_listings, field_name):
                raise ValueError(f"Field {field_name} does not exist on Job_listings")
            result = await self.db.execute(
                select(Job_listings)
                .where(getattr(Job_listings, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Job_listings.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching job_listingss by {field_name}: {str(e)}")
            raise