from pydantic import BaseModel
from typing import Optional, List

class OAuthLoginResponse(BaseModel):
    url: str

class ManagedPageItem(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    picture_url: Optional[str] = None

class ConnectPagesRequest(BaseModel):
    page_ids: List[str]

class FacebookStatusResponse(BaseModel):
    is_connected: bool
    fb_user_id: Optional[str] = None
    name: Optional[str] = None

class DisconnectPageResponse(BaseModel):
    message: str