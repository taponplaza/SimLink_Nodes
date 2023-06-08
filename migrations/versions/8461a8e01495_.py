"""empty message

Revision ID: 8461a8e01495
Revises: 
Create Date: 2023-06-07 19:03:46.391689

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8461a8e01495'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('nodes',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('created_on', sa.DateTime(), nullable=False),
    sa.Column('status', sa.Boolean(), nullable=False),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.Column('latitude', sa.Float(), nullable=True),
    sa.Column('longitude', sa.Float(), nullable=True),
    sa.Column('ip_address', sa.String(), nullable=True),
    sa.Column('temperature', sa.Float(), nullable=True),
    sa.Column('device_type', sa.String(), nullable=True),
    sa.Column('battery_level', sa.Float(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('password', sa.String(), nullable=False),
    sa.Column('created_on', sa.DateTime(), nullable=False),
    sa.Column('is_admin', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    op.create_table('links',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('source', sa.Integer(), nullable=False),
    sa.Column('target', sa.Integer(), nullable=False),
    sa.Column('link_type', sa.String(), nullable=True),
    sa.Column('distance', sa.Float(), nullable=True),
    sa.Column('bandwidth', sa.Float(), nullable=True),
    sa.Column('latency', sa.Float(), nullable=True),
    sa.Column('created_on', sa.DateTime(), nullable=False),
    sa.Column('last_updated', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['source'], ['nodes.id'], ),
    sa.ForeignKeyConstraint(['target'], ['nodes.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('links')
    op.drop_table('users')
    op.drop_table('nodes')
    # ### end Alembic commands ###