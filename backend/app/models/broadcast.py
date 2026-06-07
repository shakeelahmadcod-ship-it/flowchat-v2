from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.database import Base

class Broadcast(Base):
    __tablename__ = "broadcasts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey("pages.id"), nullable=False)
    message_text = Column(Text, nullable=False)
    status = Column(String, default="draft")
    sent_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())