from pydantic import BaseModel
from typing import List, Optional

class OAuthLoginResponse(BaseModel):
    url: str

class ManagedPageItem(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    picture_url: Optional[str] = None

class ConnectPagesRequest(BaseModel):
    page_ids: List[str]

class ConnectedPageResponse(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    picture_url: Optional[str] = None

class DisconnectPageResponse(BaseModel):
    message: str
