from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    sender_type: str
    message_text: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: UUID
    fb_sender_id: str
    sender_name: str
    sender_pic: Optional[str]
    last_message: Optional[str]
    unread_count: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ManualReplyRequest(BaseModel):
    conversation_id: UUID
    message_text: str