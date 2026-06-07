from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class BroadcastCreate(BaseModel):
    page_id: UUID
    message_text: str

class BroadcastResponse(BaseModel):
    id: UUID
    page_id: UUID
    message_text: str
    status: str
    sent_count: int
    created_at: datetime

    class Config:
        from_attributes = True