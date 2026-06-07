from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    PAGE_ACCESS_TOKEN: Optional[str] = None
    VERIFY_TOKEN: str = "flowchat_verify_token_2024"

    class Config:
        env_file = ".env"

settings = Settings()