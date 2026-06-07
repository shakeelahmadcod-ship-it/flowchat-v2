from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.page import Page
from app.schemas.page import PageCreate, PageResponse
from typing import List

router = APIRouter(prefix="/pages", tags=["Pages"])

@router.get("/", response_model=List[PageResponse])
def get_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Page).filter(Page.user_id == current_user.id).all()

@router.post("/", response_model=PageResponse)
def add_page(
    data: PageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Page).filter(Page.fb_page_id == data.fb_page_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page already connected"
        )
    page = Page(
        user_id=current_user.id,
        fb_page_id=data.fb_page_id,
        page_name=data.page_name,
        access_token=data.access_token,
        profile_pic=data.profile_pic
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page

@router.delete("/{page_id}")
def delete_page(
    page_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(Page).filter(
        Page.id == page_id,
        Page.user_id == current_user.id
    ).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    db.delete(page)
    db.commit()
    return {"message": "Page disconnected"}