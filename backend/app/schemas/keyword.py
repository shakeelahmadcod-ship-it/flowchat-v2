from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class KeywordCreate(BaseModel):
    page_id: UUID
    keyword: str
    reply_text: str

class KeywordUpdate(BaseModel):
    keyword: str
    reply_text: str
    is_active: bool

class KeywordResponse(BaseModel):
    id: UUID
    page_id: UUID
    keyword: str
    reply_text: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True