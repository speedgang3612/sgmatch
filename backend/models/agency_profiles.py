from core.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import expression, func


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

    # 지사 로고/이미지 URL — AddBranchModal에서 업로드 후 전달됨
    logo_url = Column(String, nullable=True)

    # MVP: 가입 즉시 공고 등록 가능 — 신규 INSERT 시 서버에서 True로 자동 설정
    # 관리자는 admin.py를 통해 False로 변경하여 사후 차단 가능
    verified = Column(Boolean, nullable=False, server_default=expression.true())

    # 생성 시각은 서버에서 자동 기록
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())