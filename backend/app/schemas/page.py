from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class PageCreate(BaseModel):
    fb_page_id: str
    page_name: str
    access_token: str
    profile_pic: Optional[str] = None

class PageResponse(BaseModel):
    id: UUID
    fb_page_id: str
    page_name: str
    profile_pic: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True