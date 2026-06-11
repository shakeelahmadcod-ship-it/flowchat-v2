from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.keyword import KeywordRule
from app.models.page_connection import PageConnection
from app.schemas.keyword import KeywordCreate, KeywordUpdate, KeywordResponse
from typing import List

router = APIRouter(prefix="/keywords", tags=["Keywords"])

@router.get("/", response_model=List[KeywordResponse])
def get_keywords(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    connections = db.query(PageConnection).filter(
        PageConnection.user_id == current_user.id,
        PageConnection.is_active == True
    ).all()
    page_ids = [c.page_id for c in connections]

    if not page_ids:
        return []

    return db.query(KeywordRule).filter(
        KeywordRule.page_id.in_(page_ids)
    ).order_by(KeywordRule.created_at.desc()).all()

@router.post("/", response_model=KeywordResponse)
def create_keyword(
    data: KeywordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    connection = db.query(PageConnection).filter(
        PageConnection.page_id == data.page_id,
        PageConnection.user_id == current_user.id,
        PageConnection.is_active == True
    ).first()
    if not connection:
        raise HTTPException(status_code=404, detail="Page not found")

    rule = KeywordRule(
        page_id=data.page_id,
        keyword=data.keyword.lower().strip(),
        reply_text=data.reply_text,
        is_active=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.patch("/{rule_id}", response_model=KeywordResponse)
def update_keyword(
    rule_id: str,
    data: KeywordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(KeywordRule).filter(KeywordRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")

    rule.keyword = data.keyword.lower().strip()
    rule.reply_text = data.reply_text
    rule.is_active = data.is_active
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{rule_id}")
def delete_keyword(
    rule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rule = db.query(KeywordRule).filter(KeywordRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return {"message": "Rule deleted"}