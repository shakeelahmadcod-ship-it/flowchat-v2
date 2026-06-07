import requests
import time

def send_facebook_message(page_access_token: str, recipient_id: str, text: str):
    """Send message via Facebook Graph API"""
    url = f"https://graph.facebook.com/v19.0/me/messages?access_token={page_access_token}"
    
    # Typing indicator
    requests.post(url, json={
        "recipient": {"id": recipient_id},
        "sender_action": "typing_on"
    })
    time.sleep(1)
    
    # Send message
    response = requests.post(url, json={
        "recipient": {"id": recipient_id},
        "messaging_type": "RESPONSE",
        "message": {"text": text}
    })
    
    return response.status_code == 200

def get_fb_user_profile(page_access_token: str, sender_id: str):
    """Get Facebook user's name and profile pic"""
    url = f"https://graph.facebook.com/{sender_id}?fields=first_name,last_name,profile_pic&access_token={page_access_token}"
    try:
        res = requests.get(url).json()
        first = res.get("first_name", "")
        last = res.get("last_name", "")
        full_name = f"{first} {last}".strip() or "FB User"
        profile_pic = res.get("profile_pic")
        return full_name, profile_pic
    except:
        return "FB User", None