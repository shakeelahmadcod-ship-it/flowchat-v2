from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class Page(Base):
    __tablename__ = "pages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    fb_page_id = Column(String, unique=True, index=True)
    page_name = Column(String)
    access_token = Column(Text)
    profile_pic = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())