from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.page import Page
from app.models.page_connection import PageConnection
from app.schemas.page import PageResponse
from app.models.user import User
from typing import List

router = APIRouter(prefix="/pages", tags=["Pages"])

@router.get("/", response_model=List[PageResponse])
def get_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = (
        db.query(Page)
        .join(PageConnection, PageConnection.page_id == Page.id)
        .filter(
            PageConnection.user_id == current_user.id,
            PageConnection.is_active == True
        )
    )
    return query.all()
