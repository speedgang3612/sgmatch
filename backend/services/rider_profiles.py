import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.rider_profiles import Rider_profiles

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Rider_profilesService:
    """Service layer for Rider_profiles operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Rider_profiles]:
        """Create a new rider_profiles"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Rider_profiles(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created rider_profiles with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating rider_profiles: {str(e)}")
            raise

    async def check_ownership(self, obj_id: int, user_id: str) -> bool:
        """Check if user owns this record"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            return obj is not None
        except Exception as e:
            logger.error(f"Error checking ownership for rider_profiles {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Rider_profiles]:
        """Get rider_profiles by ID (user can only see their own records)"""
        try:
            query = select(Rider_profiles).where(Rider_profiles.id == obj_id)
            if user_id:
                query = query.where(Rider_profiles.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching rider_profiles {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of rider_profiless (user can only see their own records)"""
        try:
            query = select(Rider_profiles)
            count_query = select(func.count(Rider_profiles.id))
            
            if user_id:
                query = query.where(Rider_profiles.user_id == user_id)
                count_query = count_query.where(Rider_profiles.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Rider_profiles, field):
                        query = query.where(getattr(Rider_profiles, field) == value)
                        count_query = count_query.where(getattr(Rider_profiles, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Rider_profiles, field_name):
                        query = query.order_by(getattr(Rider_profiles, field_name).desc())
                else:
                    if hasattr(Rider_profiles, sort):
                        query = query.order_by(getattr(Rider_profiles, sort))
            else:
                query = query.order_by(Rider_profiles.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching rider_profiles list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Rider_profiles]:
        """Update rider_profiles (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Rider_profiles {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated rider_profiles {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating rider_profiles {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete rider_profiles (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Rider_profiles {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted rider_profiles {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting rider_profiles {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Rider_profiles]:
        """Get rider_profiles by any field"""
        try:
            if not hasattr(Rider_profiles, field_name):
                raise ValueError(f"Field {field_name} does not exist on Rider_profiles")
            result = await self.db.execute(
                select(Rider_profiles).where(getattr(Rider_profiles, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching rider_profiles by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Rider_profiles]:
        """Get list of rider_profiless filtered by field"""
        try:
            if not hasattr(Rider_profiles, field_name):
                raise ValueError(f"Field {field_name} does not exist on Rider_profiles")
            result = await self.db.execute(
                select(Rider_profiles)
                .where(getattr(Rider_profiles, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Rider_profiles.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching rider_profiless by {field_name}: {str(e)}")
            raise