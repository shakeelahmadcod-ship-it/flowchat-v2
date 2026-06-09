export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Page {
  id: string;
  fb_page_id: string;
  page_name: string;
  category?: string;
  profile_pic?: string;
  created_at: string;
  updated_at: string;
}

export interface ManagedPageItem {
  id: string;
  name: string;
  category?: string;
  picture_url?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: "user" | "page";
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  fb_sender_id: string;
  sender_name: string;
  sender_pic?: string;
  last_message?: string;
  unread_count: string;
  created_at: string;
  updated_at: string;
}

export interface KeywordRule {
  id: string;
  page_id: string;
  keyword: string;
  reply_text: string;
  is_active: boolean;
  created_at: string;
}
