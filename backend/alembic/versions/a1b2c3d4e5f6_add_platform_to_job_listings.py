"""add platform column to job_listings

Revision ID: a1b2c3d4e5f6
Revises: 75452a3c1d99
Create Date: 2026-04-11 10:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '75452a3c1d99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """job_listings 테이블에 platform 컬럼 추가."""
    op.add_column('job_listings', sa.Column('platform', sa.String(), nullable=True))


def downgrade() -> None:
    """platform 컬럼 롤백."""
    op.drop_column('job_listings', 'platform')
