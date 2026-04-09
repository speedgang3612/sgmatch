from core.database import Base
from sqlalchemy import Column, Integer, String


class Companies(Base):
    __tablename__ = "companies"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    business_number = Column(String, nullable=True)
    representative = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(String, nullable=True)