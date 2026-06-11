from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.page import Page
from app.models.message import Conversation, Message
from app.models.keyword import KeywordRule
from app.models.page_connection import PageConnection

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Get user's pages via PageConnection
        connections = db.query(PageConnection).filter(
            PageConnection.user_id == current_user.id,
            PageConnection.is_active == True
        ).all()
        page_ids = [c.page_id for c in connections]

        total_pages = len(page_ids)

        total_conversations = db.query(Conversation).filter(
            Conversation.page_id.in_(page_ids)
        ).count() if page_ids else 0

        conv_ids = [c.id for c in db.query(Conversation).filter(
            Conversation.page_id.in_(page_ids)
        ).all()] if page_ids else []

        total_messages = db.query(Message).filter(
            Message.conversation_id.in_(conv_ids)
        ).count() if conv_ids else 0

        unread = db.query(Conversation).filter(
            Conversation.page_id.in_(page_ids),
            Conversation.unread_count != "0"
        ).count() if page_ids else 0

        active_keywords = db.query(KeywordRule).filter(
            KeywordRule.page_id.in_(page_ids),
            KeywordRule.is_active == True
        ).count() if page_ids else 0

        return {
            "total_pages": total_pages,
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "unread_conversations": unread,
            "active_keywords": active_keywords,
        }
    except Exception as e:
        return {
            "total_pages": 0,
            "total_conversations": 0,
            "total_messages": 0,
            "unread_conversations": 0,
            "active_keywords": 0,
        }