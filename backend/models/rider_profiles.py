from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Rider_profiles(Base):
    __tablename__ = "rider_profiles"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    experience = Column(String, nullable=True)
    has_motorcycle = Column(Boolean, nullable=True)
    rider_type = Column(String, nullable=True)
    birth_year = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)