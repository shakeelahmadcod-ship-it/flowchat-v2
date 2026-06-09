import uuid
from datetime import datetime, timedelta
from urllib.parse import urlencode
from typing import Any, Dict, List, Optional

import requests
from jose import jwt, JWTError

from app.core.config import settings

GRAPH_BASE_URL = f"https://graph.facebook.com/{settings.FACEBOOK_API_VERSION}"


def send_facebook_message(page_access_token: str, recipient_id: str, text: str):
    """Send message via Facebook Graph API"""
    url = f"{GRAPH_BASE_URL}/me/messages?access_token={page_access_token}"
    requests.post(url, json={
        "recipient": {"id": recipient_id},
        "sender_action": "typing_on"
    })
    response = requests.post(url, json={
        "recipient": {"id": recipient_id},
        "messaging_type": "RESPONSE",
        "message": {"text": text}
    })
    return response.status_code == 200


def build_facebook_login_url(state: str) -> str:
    params = {
        "client_id": settings.FACEBOOK_APP_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "scope": ",".join([
            "pages_show_list",
            "pages_read_engagement",
            "pages_manage_metadata",
            "pages_messaging",
            "pages_messaging_subscriptions"
        ]),
        "response_type": "code",
        "state": state,
        "auth_type": "rerequest"
    }
    return f"https://www.facebook.com/{settings.FACEBOOK_API_VERSION}/dialog/oauth?{urlencode(params)}"


def build_oauth_state(user_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=10),
        "nonce": str(uuid.uuid4())
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_oauth_state(state: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(state, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


def exchange_code_for_user_token(code: str) -> str:
    url = f"{GRAPH_BASE_URL}/oauth/access_token"
    params = {
        "client_id": settings.FACEBOOK_APP_ID,
        "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
        "client_secret": settings.FACEBOOK_APP_SECRET,
        "code": code
    }
    response = requests.get(url, params=params)
    data = response.json()
    if "access_token" not in data:
        raise ValueError(data.get("error", data))
    return data["access_token"]


def exchange_for_long_lived_token(short_lived_token: str) -> str:
    url = f"{GRAPH_BASE_URL}/oauth/access_token"
    params = {
        "grant_type": "fb_exchange_token",
        "client_id": settings.FACEBOOK_APP_ID,
        "client_secret": settings.FACEBOOK_APP_SECRET,
        "fb_exchange_token": short_lived_token
    }
    response = requests.get(url, params=params)
    data = response.json()
    if "access_token" not in data:
        raise ValueError(data.get("error", data))
    return data["access_token"]


def fetch_facebook_user_profile(access_token: str) -> Dict[str, Any]:
    url = f"{GRAPH_BASE_URL}/me"
    params = {
        "fields": "id,name,email",
        "access_token": access_token
    }
    response = requests.get(url, params=params).json()
    if "error" in response:
        raise ValueError(response["error"])
    return response


def fetch_managed_pages(access_token: str) -> List[Dict[str, Any]]:
    url = f"{GRAPH_BASE_URL}/me/accounts"
    params = {
        "fields": "id,name,category,picture{url},access_token",
        "access_token": access_token
    }
    response = requests.get(url, params=params).json()
    if "error" in response:
        raise ValueError(response["error"])

    pages = []
    for item in response.get("data", []):
        pages.append({
            "id": item.get("id"),
            "name": item.get("name"),
            "category": item.get("category"),
            "picture_url": item.get("picture", {}).get("data", {}).get("url"),
            "access_token": item.get("access_token")
        })
    return pages


def subscribe_page_to_webhook(page_id: str, page_access_token: str) -> None:
    url = f"{GRAPH_BASE_URL}/{page_id}/subscribed_apps"
    params = {"access_token": page_access_token}
    response = requests.post(url, params=params).json()
    if not response.get("success"):
        raise ValueError(response.get("error", response))


def unsubscribe_page_app(page_id: str, page_access_token: str) -> None:
    url = f"{GRAPH_BASE_URL}/{page_id}/subscribed_apps"
    params = {"access_token": page_access_token}
    response = requests.delete(url, params=params).json()
    if not response.get("success"):
        raise ValueError(response.get("error", response))
