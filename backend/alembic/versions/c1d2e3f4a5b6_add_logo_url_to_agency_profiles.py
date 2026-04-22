"""add logo_url to agency_profiles

Revision ID: c1d2e3f4a5b6
Revises: b3c4d5e6f7a8
Create Date: 2026-04-23 01:29:00.000000

변경 내용:
  - agency_profiles.logo_url: 신규 컬럼 추가 (VARCHAR, nullable)
    지사 로고 이미지 URL (Cloudflare R2 저장 경로)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """agency_profiles 테이블에 logo_url 컬럼 추가."""
    _cols = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('agency_profiles')]
    if 'logo_url' not in _cols:
        op.add_column(
            'agency_profiles',
            sa.Column('logo_url', sa.String(), nullable=True)
        )


def downgrade() -> None:
    """logo_url 컬럼 롤백."""
    _cols = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('agency_profiles')]
    if 'logo_url' in _cols:
        op.drop_column('agency_profiles', 'logo_url')
