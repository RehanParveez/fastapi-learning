"""add username gender and password reset to users

Revision ID: bd57cda86632
Revises: da0e5d660ffb
Create Date: 2026-08-06 11:05:05.190884

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bd57cda86632'
down_revision: Union[str, Sequence[str], None] = 'ea917cfa2b8f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create the enum type first (Postgres requires this before using it)
    op.execute("CREATE TYPE gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say')")
    op.add_column('users', sa.Column('username', sa.String(), nullable=True))
    op.add_column('users', sa.Column('gender', sa.Enum('male', 'female', 'other', 'prefer_not_to_say', name='gender'), nullable=True))
    op.add_column('users', sa.Column('reset_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_users_reset_token'), 'users', ['reset_token'], unique=True)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_username'), table_name = 'users')
    op.drop_index(op.f('ix_users_reset_token'), table_name = 'users')
    op.drop_column('users', 'reset_token_expires')
    op.drop_column('users', 'reset_token')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'username')
    op.execute("DROP TYPE IF EXISTS gender")
