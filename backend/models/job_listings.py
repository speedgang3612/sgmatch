from core.database import Base
from sqlalchemy import Column, Integer, String


class Job_listings(Base):
    __tablename__ = "job_listings"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    company_id = Column(Integer, nullable=True)
    agency_id = Column(Integer, nullable=True)
    agency_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    region = Column(String, nullable=True)
    sub_region = Column(String, nullable=True)
    title = Column(String, nullable=True)
    conditions = Column(String, nullable=True)
    promotion = Column(String, nullable=True)
    motorcycle = Column(String, nullable=True)
    settlement = Column(String, nullable=True)
    work_time = Column(String, nullable=True)
    pay_per_delivery = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(String, nullable=True)