from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Agency_profiles(Base):
    __tablename__ = "agency_profiles"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    manager_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    city = Column(String, nullable=True)
    district = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    pay_per_delivery = Column(String, nullable=True)
    promotion = Column(String, nullable=True)
    settlement_type = Column(String, nullable=True)
    motorcycle_option = Column(String, nullable=True)
    work_type = Column(String, nullable=True)
    verified = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)