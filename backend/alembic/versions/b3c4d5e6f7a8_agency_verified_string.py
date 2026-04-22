"""agency_profiles: verified Boolean→String, biz_license_url 추가

Revision ID: b3c4d5e6f7a8
Revises: a1b2c3d4e5f6
Create Date: 2026-04-20 20:11:00.000000

변경 내용:
  - verified: Boolean(true/false) → VARCHAR("pending"/"approved"/"rejected")
    - 기존 true  → "approved"
    - 기존 false → "pending"
  - biz_license_url: 신규 컬럼 추가 (VARCHAR, nullable)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    1. verified 컬럼: Boolean → VARCHAR
       CASE WHEN verified THEN 'approved' ELSE 'pending' END 로 데이터 변환
    2. biz_license_url 컬럼 추가
    """
    # Step 1: 임시 컬럼 verified_str 추가
    _cols_ap = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('agency_profiles')]
    if 'verified_str' not in _cols_ap:
        op.add_column(
            'agency_profiles',
            sa.Column('verified_str', sa.String(), nullable=True)
        )

    # Step 2: 기존 Boolean 값을 String으로 복사
    op.execute(
        """
        UPDATE agency_profiles
        SET verified_str = CASE
            WHEN verified = TRUE  THEN 'approved'
            WHEN verified = FALSE THEN 'pending'
            ELSE 'pending'
        END
        """
    )

    # Step 3: 원래 verified 컬럼 제거
    op.drop_column('agency_profiles', 'verified')

    # Step 4: 임시 컬럼을 verified로 이름 변경
    op.alter_column('agency_profiles', 'verified_str', new_column_name='verified')

    # Step 5: NOT NULL 제약 및 기본값 적용
    op.alter_column(
        'agency_profiles',
        'verified',
        nullable=False,
        server_default='pending',
    )

    # Step 6: biz_license_url 컬럼 추가
    _cols_ap2 = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('agency_profiles')]
    if 'biz_license_url' not in _cols_ap2:
        op.add_column(
            'agency_profiles',
            sa.Column('biz_license_url', sa.String(), nullable=True)
        )


def downgrade() -> None:
    """
    1. biz_license_url 컬럼 제거
    2. verified 컬럼: VARCHAR → Boolean
       'approved' → true, 그 외('pending', 'rejected') → false
    """
    # Step 1: biz_license_url 제거
    op.drop_column('agency_profiles', 'biz_license_url')

    # Step 2: 임시 Boolean 컬럼 추가
    _cols_ap_dn = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('agency_profiles')]
    if 'verified_bool' not in _cols_ap_dn:
        op.add_column(
            'agency_profiles',
            sa.Column('verified_bool', sa.Boolean(), nullable=True)
        )

    # Step 3: String → Boolean 변환
    op.execute(
        """
        UPDATE agency_profiles
        SET verified_bool = CASE
            WHEN verified = 'approved' THEN TRUE
            ELSE FALSE
        END
        """
    )

    # Step 4: 원래 verified(String) 제거
    op.drop_column('agency_profiles', 'verified')

    # Step 5: 임시 컬럼을 verified로 이름 변경
    op.alter_column('agency_profiles', 'verified_bool', new_column_name='verified')

    # Step 6: NOT NULL 및 기본값 적용
    op.alter_column(
        'agency_profiles',
        'verified',
        nullable=False,
        server_default=sa.true(),
    )
