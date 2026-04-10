import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.agency_profiles import Agency_profiles

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Agency_profilesService:
    """Service layer for Agency_profiles operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Agency_profiles]:
        """Create a new agency_profiles"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Agency_profiles(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created agency_profiles with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating agency_profiles: {str(e)}")
            raise


    async def batch_create(self, items, user_id=None):
        """치명-2: 단일 트랜잭션으로 생성 — 하나라도 실패하면 전체 rollback."""
        try:
            objs = []
            for data in items:
                if user_id:
                    data = dict(data)
                    data['user_id'] = user_id
                obj = Agency_profiles(**data)
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
            logger.error(f"Error checking ownership for agency_profiles {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Agency_profiles]:
        """Get agency_profiles by ID (user can only see their own records)"""
        try:
            query = select(Agency_profiles).where(Agency_profiles.id == obj_id)
            if user_id:
                query = query.where(Agency_profiles.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching agency_profiles {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of agency_profiless (user can only see their own records)"""
        try:
            query = select(Agency_profiles)
            count_query = select(func.count(Agency_profiles.id))
            
            if user_id:
                query = query.where(Agency_profiles.user_id == user_id)
                count_query = count_query.where(Agency_profiles.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    # 치명-4: 내부 필드 주입 차단
                    if field in ("id", "user_id"):
                        continue
                    if hasattr(Agency_profiles, field):
                        query = query.where(getattr(Agency_profiles, field) == value)
                        count_query = count_query.where(getattr(Agency_profiles, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Agency_profiles, field_name):
                        query = query.order_by(getattr(Agency_profiles, field_name).desc())
                else:
                    if hasattr(Agency_profiles, sort):
                        query = query.order_by(getattr(Agency_profiles, sort))
            else:
                query = query.order_by(Agency_profiles.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching agency_profiles list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Agency_profiles]:
        """Update agency_profiles (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Agency_profiles {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated agency_profiles {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating agency_profiles {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete agency_profiles (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Agency_profiles {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted agency_profiles {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting agency_profiles {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Agency_profiles]:
        """Get agency_profiles by any field"""
        try:
            if not hasattr(Agency_profiles, field_name):
                raise ValueError(f"Field {field_name} does not exist on Agency_profiles")
            result = await self.db.execute(
                select(Agency_profiles).where(getattr(Agency_profiles, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching agency_profiles by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Agency_profiles]:
        """Get list of agency_profiless filtered by field"""
        try:
            if not hasattr(Agency_profiles, field_name):
                raise ValueError(f"Field {field_name} does not exist on Agency_profiles")
            result = await self.db.execute(
                select(Agency_profiles)
                .where(getattr(Agency_profiles, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Agency_profiles.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching agency_profiless by {field_name}: {str(e)}")
            raise