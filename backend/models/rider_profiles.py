from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func


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

    # MVP: 가입 즉시 활성화 — 신규 INSERT 시 서버에서 'active'로 자동 설정
    # 관리자는 admin.py를 통해 'inactive'로 변경하여 사후 차단 가능
    status = Column(String, nullable=False, server_default="active")

    # 생성 시각은 서버에서 자동 기록
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())