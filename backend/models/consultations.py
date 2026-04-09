from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Consultations(Base):
    __tablename__ = "consultations"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    agency = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    message = Column(String, nullable=True)
    status = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)