from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.page import Page
from app.models.message import Conversation, Message
from app.models.keyword import KeywordRule

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user's pages
    pages = db.query(Page).filter(Page.user_id == current_user.id).all()
    page_ids = [p.id for p in pages]

    # Total conversations
    total_conversations = db.query(Conversation).filter(
        Conversation.page_id.in_(page_ids)
    ).count()

    # Total messages
    conv_ids = [c.id for c in db.query(Conversation).filter(
        Conversation.page_id.in_(page_ids)
    ).all()]
    total_messages = db.query(Message).filter(
        Message.conversation_id.in_(conv_ids)
    ).count()

    # Unread conversations
    unread = db.query(Conversation).filter(
        Conversation.page_id.in_(page_ids),
        Conversation.unread_count != "0"
    ).count()

    # Active keywords
    active_keywords = db.query(KeywordRule).filter(
        KeywordRule.page_id.in_(page_ids),
        KeywordRule.is_active == True
    ).count()

    return {
        "total_pages": len(pages),
        "total_conversations": total_conversations,
        "total_messages": total_messages,
        "unread_conversations": unread,
        "active_keywords": active_keywords,
    }