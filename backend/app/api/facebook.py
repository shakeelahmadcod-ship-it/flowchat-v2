from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.page import Page
from app.models.facebook_account import FacebookAccount
from app.models.page_connection import PageConnection
from app.schemas.page import PageResponse
from app.schemas.facebook import (
    OAuthLoginResponse,
    ManagedPageItem,
    ConnectPagesRequest,
    FacebookStatusResponse,
    DisconnectPageResponse,
)
from app.services.facebook import (
    build_facebook_login_url,
    build_oauth_state,
    decode_oauth_state,
    exchange_code_for_user_token,
    exchange_for_long_lived_token,
    fetch_facebook_user_profile,
    fetch_managed_pages,
    subscribe_page_to_webhook,
    unsubscribe_page_app,
)

router = APIRouter(prefix="/facebook", tags=["Facebook"])


@router.get("/login", response_model=OAuthLoginResponse)
def facebook_login(current_user: User = Depends(get_current_user)):
    state = build_oauth_state(current_user.id)
    url = build_facebook_login_url(state)
    return {"url": url}


@router.get("/status", response_model=FacebookStatusResponse)
def facebook_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = (
        db.query(FacebookAccount)
        .filter(FacebookAccount.user_id == current_user.id, FacebookAccount.is_active == True)
        .first()
    )
    if not account:
        return FacebookStatusResponse(is_connected=False)

    return FacebookStatusResponse(
        is_connected=True,
        fb_user_id=account.fb_user_id,
        name=account.name,
    )


@router.get("/callback")
def facebook_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db)
):
    payload = decode_oauth_state(state)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth state")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not find user")

    try:
        short_token = exchange_code_for_user_token(code)
        long_token = exchange_for_long_lived_token(short_token)
        profile = fetch_facebook_user_profile(long_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    account = (
        db.query(FacebookAccount)
        .filter(
            FacebookAccount.user_id == user.id,
            FacebookAccount.fb_user_id == profile["id"],
        )
        .first()
    )
    if not account:
        account = FacebookAccount(
            user_id=user.id,
            fb_user_id=profile["id"],
            name=profile.get("name", "Facebook User"),
            access_token=long_token,
            is_active=True,
        )
        db.add(account)
    else:
        account.name = profile.get("name", account.name)
        account.access_token = long_token
        account.is_active = True

    db.commit()

    return RedirectResponse(f"{settings.FRONTEND_URL}/settings?fb_auth=success")


@router.get("/managed-pages", response_model=List[ManagedPageItem])
def get_managed_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(FacebookAccount).filter(FacebookAccount.user_id == current_user.id, FacebookAccount.is_active == True).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facebook account not connected")

    try:
        pages = fetch_managed_pages(account.access_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return [
        ManagedPageItem(
            id=page["id"],
            name=page["name"],
            category=page.get("category"),
            picture_url=page.get("picture_url"),
        )
        for page in pages
    ]


@router.post("/connect-pages", response_model=List[PageResponse])
def connect_managed_pages(
    body: ConnectPagesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(FacebookAccount).filter(FacebookAccount.user_id == current_user.id, FacebookAccount.is_active == True).first()
    if not account:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facebook account not connected")

    try:
        available_pages = fetch_managed_pages(account.access_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    pages_by_id = {page["id"]: page for page in available_pages}
    results = []

    for page_id in body.page_ids:
        page_data = pages_by_id.get(page_id)
        if not page_data:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Page {page_id} is not available")

        if not page_data.get("access_token"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Missing page access token for page {page_id}. "
                    "Reconnect Facebook and make sure the app has page permissions."
                ),
            )

        page = db.query(Page).filter(Page.fb_page_id == page_data["id"]).first()
        if not page:
            page = Page(
                fb_page_id=page_data["id"],
                page_name=page_data["name"],
                profile_pic=page_data.get("picture_url"),
            )
            db.add(page)
            db.flush()
        else:
            page.page_name = page_data["name"]
            page.profile_pic = page_data.get("picture_url")

        connection = (
            db.query(PageConnection)
            .filter(
                PageConnection.user_id == current_user.id,
                PageConnection.page_id == page.id,
            )
            .first()
        )
        if connection is None:
            connection = PageConnection(
                user_id=current_user.id,
                page_id=page.id,
                page_access_token=page_data["access_token"],
                is_active=True,
            )
            db.add(connection)
        else:
            connection.page_access_token = page_data["access_token"]
            connection.is_active = True

        try:
            subscribe_page_to_webhook(page_data["id"], page_data["access_token"])
        except ValueError as exc:
            db.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

        results.append(page)

    db.commit()
    return results


@router.get("/connected-pages", response_model=List[PageResponse])
def get_connected_pages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    connections = (
        db.query(Page)
        .join(PageConnection, PageConnection.page_id == Page.id)
        .filter(PageConnection.user_id == current_user.id, PageConnection.is_active == True)
        .all()
    )
    return connections


@router.delete("/disconnect/{page_id}", response_model=DisconnectPageResponse)
def disconnect_page(
    page_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    connection = (
        db.query(PageConnection)
        .join(Page, Page.id == PageConnection.page_id)
        .filter(PageConnection.user_id == current_user.id, Page.fb_page_id == page_id, PageConnection.is_active == True)
        .first()
    )
    if not connection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page connection not found")

    try:
        unsubscribe_page_app(page_id, connection.page_access_token)
    except ValueError:
        pass

    connection.is_active = False
    db.commit()

    return {"message": "Page disconnected"}
