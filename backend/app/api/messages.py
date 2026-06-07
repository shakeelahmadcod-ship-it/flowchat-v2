from fastapi import APIRouter, Depends, HTTPException, Request, Response, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.page import Page
from app.models.message import Conversation, Message
from app.models.keyword import KeywordRule
from app.schemas.message import ConversationResponse, MessageResponse, ManualReplyRequest
from app.services.facebook import send_facebook_message, get_fb_user_profile
from typing import List
import uuid

router = APIRouter(tags=["Messages"])

# ─── WEBHOOK ────────────────────────────────────────────
@router.get("/webhook")
async def verify_webhook(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == settings.VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/webhook")
async def handle_webhook(request: Request, db: Session = Depends(get_db)):
    data = await request.json()

    if data.get("object") == "page":
        for entry in data.get("entry", []):
            for event in entry.get("messaging", []):
                if "message" in event and "text" in event["message"]:
                    sender_id = event["sender"]["id"]
                    page_fb_id = event["recipient"]["id"]
                    message_text = event["message"]["text"]

                    # Find page in DB
                    page = db.query(Page).filter(
                        Page.fb_page_id == page_fb_id
                    ).first()
                    if not page:
                        continue

                    # Get or create conversation
                    conv = db.query(Conversation).filter(
                        Conversation.fb_sender_id == sender_id,
                        Conversation.page_id == page.id
                    ).first()

                    if not conv:
                        name, pic = get_fb_user_profile(page.access_token, sender_id)
                        conv = Conversation(
                            page_id=page.id,
                            fb_sender_id=sender_id,
                            sender_name=name,
                            sender_pic=pic,
                            last_message=message_text,
                            unread_count="1"
                        )
                        db.add(conv)
                        db.commit()
                        db.refresh(conv)
                    else:
                        conv.last_message = message_text
                        conv.unread_count = str(int(conv.unread_count) + 1)
                        db.commit()

                    # Save message
                    msg = Message(
                        conversation_id=conv.id,
                        sender_type="user",
                        message_text=message_text
                    )
                    db.add(msg)
                    db.commit()

                    # Check keyword rules
                    rules = db.query(KeywordRule).filter(
                        KeywordRule.page_id == page.id,
                        KeywordRule.is_active == True
                    ).all()

                    reply_sent = False
                    for rule in rules:
                        if rule.keyword in message_text.lower():
                            send_facebook_message(page.access_token, sender_id, rule.reply_text)
                            # Save auto reply
                            db.add(Message(
                                conversation_id=conv.id,
                                sender_type="page",
                                message_text=rule.reply_text
                            ))
                            db.commit()
                            reply_sent = True
                            break

                    if not reply_sent:
                        default = "Thank you for reaching out! We'll get back to you shortly. 🙏"
                        send_facebook_message(page.access_token, sender_id, default)
                        db.add(Message(
                            conversation_id=conv.id,
                            sender_type="page",
                            message_text=default
                        ))
                        db.commit()

    return {"status": "success"}

# ─── CONVERSATIONS ───────────────────────────────────────
@router.get("/conversations", response_model=List[ConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pages = db.query(Page).filter(Page.user_id == current_user.id).all()
    page_ids = [p.id for p in pages]
    return db.query(Conversation).filter(
        Conversation.page_id.in_(page_ids)
    ).order_by(Conversation.updated_at.desc()).all()

@router.get("/conversations/{conv_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conv_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at.asc()).all()

@router.post("/conversations/reply")
def send_reply(
    data: ManualReplyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).filter(
        Conversation.id == data.conversation_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    page = db.query(Page).filter(Page.id == conv.page_id).first()
    
    send_facebook_message(page.access_token, conv.fb_sender_id, data.message_text)
    
    msg = Message(
        conversation_id=conv.id,
        sender_type="page",
        message_text=data.message_text
    )
    db.add(msg)
    db.commit()

    return {"status": "success"}