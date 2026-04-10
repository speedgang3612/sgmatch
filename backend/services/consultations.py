import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.consultations import Consultations

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class ConsultationsService:
    """Service layer for Consultations operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Consultations]:
        """Create a new consultations"""
        try:
            if user_id:
                data['user_id'] = user_id
            obj = Consultations(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created consultations with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating consultations: {str(e)}")
            raise


    async def batch_create(self, items, user_id=None):
        """치명-2: 단일 트랜잭션으로 생성 — 하나라도 실패하면 전체 rollback."""
        try:
            objs = []
            for data in items:
                if user_id:
                    data = dict(data)
                    data['user_id'] = user_id
                obj = Consultations(**data)
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
            logger.error(f"Error checking ownership for consultations {obj_id}: {str(e)}")
            return False

    async def get_by_id(self, obj_id: int, user_id: Optional[str] = None) -> Optional[Consultations]:
        """Get consultations by ID (user can only see their own records)"""
        try:
            query = select(Consultations).where(Consultations.id == obj_id)
            if user_id:
                query = query.where(Consultations.user_id == user_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching consultations {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        user_id: Optional[str] = None,
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of consultationss (user can only see their own records)"""
        try:
            query = select(Consultations)
            count_query = select(func.count(Consultations.id))
            
            if user_id:
                query = query.where(Consultations.user_id == user_id)
                count_query = count_query.where(Consultations.user_id == user_id)
            
            if query_dict:
                for field, value in query_dict.items():
                    # 치명-4: 내부 필드 주입 차단
                    if field in ("id", "user_id"):
                        continue
                    if hasattr(Consultations, field):
                        query = query.where(getattr(Consultations, field) == value)
                        count_query = count_query.where(getattr(Consultations, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Consultations, field_name):
                        query = query.order_by(getattr(Consultations, field_name).desc())
                else:
                    if hasattr(Consultations, sort):
                        query = query.order_by(getattr(Consultations, sort))
            else:
                query = query.order_by(Consultations.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching consultations list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Consultations]:
        """Update consultations (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Consultations {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key) and key != 'user_id':
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated consultations {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating consultations {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int, user_id: Optional[str] = None) -> bool:
        """Delete consultations (requires ownership)"""
        try:
            obj = await self.get_by_id(obj_id, user_id=user_id)
            if not obj:
                logger.warning(f"Consultations {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted consultations {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting consultations {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Consultations]:
        """Get consultations by any field"""
        try:
            if not hasattr(Consultations, field_name):
                raise ValueError(f"Field {field_name} does not exist on Consultations")
            result = await self.db.execute(
                select(Consultations).where(getattr(Consultations, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching consultations by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Consultations]:
        """Get list of consultationss filtered by field"""
        try:
            if not hasattr(Consultations, field_name):
                raise ValueError(f"Field {field_name} does not exist on Consultations")
            result = await self.db.execute(
                select(Consultations)
                .where(getattr(Consultations, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Consultations.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching consultationss by {field_name}: {str(e)}")
            raise