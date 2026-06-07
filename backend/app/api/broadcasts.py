from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.page import Page
from app.models.message import Conversation
from app.models.broadcast import Broadcast
from app.schemas.broadcast import BroadcastCreate, BroadcastResponse
from app.services.facebook import send_facebook_message
from typing import List

router = APIRouter(prefix="/broadcasts", tags=["Broadcasts"])

@router.get("/", response_model=List[BroadcastResponse])
def get_broadcasts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pages = db.query(Page).filter(Page.user_id == current_user.id).all()
    page_ids = [p.id for p in pages]
    return db.query(Broadcast).filter(
        Broadcast.page_id.in_(page_ids)
    ).order_by(Broadcast.created_at.desc()).all()

@router.post("/", response_model=BroadcastResponse)
def create_broadcast(
    data: BroadcastCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    page = db.query(Page).filter(
        Page.id == data.page_id,
        Page.user_id == current_user.id
    ).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")

    broadcast = Broadcast(
        page_id=data.page_id,
        message_text=data.message_text,
        status="draft"
    )
    db.add(broadcast)
    db.commit()
    db.refresh(broadcast)
    return broadcast

@router.post("/{broadcast_id}/send", response_model=BroadcastResponse)
def send_broadcast(
    broadcast_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    broadcast = db.query(Broadcast).filter(
        Broadcast.id == broadcast_id
    ).first()
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found")

    page = db.query(Page).filter(
        Page.id == broadcast.page_id,
        Page.user_id == current_user.id
    ).first()
    if not page:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all unique subscribers
    conversations = db.query(Conversation).filter(
        Conversation.page_id == broadcast.page_id
    ).all()

    sent = 0
    for conv in conversations:
        success = send_facebook_message(
            page.access_token,
            conv.fb_sender_id,
            broadcast.message_text
        )
        if success:
            sent += 1

    broadcast.status = "sent"
    broadcast.sent_count = sent
    db.commit()
    db.refresh(broadcast)
    return broadcast

@router.delete("/{broadcast_id}")
def delete_broadcast(
    broadcast_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    broadcast = db.query(Broadcast).filter(
        Broadcast.id == broadcast_id
    ).first()
    if not broadcast:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(broadcast)
    db.commit()
    return {"message": "Deleted"}