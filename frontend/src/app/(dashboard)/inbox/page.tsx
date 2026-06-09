"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useConversations, useMessages, useSendReply } from "@/hooks/useMessages";
import { useKeywords } from "@/hooks/useKeywords";

export default function InboxPage() {
  const { data: conversations, isLoading } = useConversations();
  const { data: keywords } = useKeywords();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const { data: messages } = useMessages(activeConvId);
  const sendReply = useSendReply();
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConv = conversations?.find((c) => c.id === activeConvId);
  const quickReplySuggestion = useMemo(() => {
    const shortcut = replyText.trim().toLowerCase();
    if (!shortcut) return null;

    return keywords
      ?.filter((rule) => rule.is_active)
      .find((rule) => rule.keyword.toLowerCase().startsWith(shortcut));
  }, [keywords, replyText]);

  const handleSend = async (messageText = replyText) => {
    const textToSend = messageText.trim();
    if (!textToSend || !activeConvId) return;
    await sendReply.mutateAsync({
      conversation_id: activeConvId,
      message_text: textToSend,
    });
    setReplyText("");
  };

  const handleQuickReplySend = async () => {
    if (!quickReplySuggestion) return;
    await handleSend(quickReplySuggestion.reply_text);
  };

  return (
    <div className="flex h-[calc(100vh-48px)] -m-6 overflow-hidden">

      {/* Left — Conversations */}
      <div className="w-80 border-r border-slate-700/50 flex flex-col bg-slate-900">
        <div className="p-4 border-b border-slate-700/50">
          <h2 className="text-white font-semibold">📥 Inbox</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            {conversations?.length || 0} conversations
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-slate-400 text-sm">Loading...</div>
          ) : !conversations?.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-400 text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-slate-700/30 ${
                  activeConvId === conv.id
                    ? "bg-blue-600/20 border-l-2 border-l-blue-500"
                    : "hover:bg-slate-800"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                  {conv.sender_pic ? (
                    <img src={conv.sender_pic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    conv.sender_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="text-white text-sm font-medium truncate">{conv.sender_name}</p>
                    {parseInt(conv.unread_count) > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full ml-2 shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{conv.last_message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right — Messages */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-white font-medium">Select a conversation</p>
            <p className="text-slate-400 text-sm mt-1">Choose from the left to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                {activeConv?.sender_pic ? (
                  <img src={activeConv.sender_pic} alt="" className="w-full h-full object-cover" />
                ) : (
                  activeConv?.sender_name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{activeConv?.sender_name}</p>
                <p className="text-slate-400 text-xs">via Facebook Messenger</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages?.map((msg) => {
                const isPage = msg.sender_type === "page";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isPage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isPage
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700"
                      }`}
                    >
                      <p>{msg.message_text}</p>
                      <p className={`text-xs mt-1 ${isPage ? "text-blue-200" : "text-slate-500"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <div className="p-4 bg-slate-900 border-t border-slate-700/50">
              {quickReplySuggestion && (
                <button
                  type="button"
                  onClick={handleQuickReplySend}
                  disabled={sendReply.isPending}
                  className="mb-3 w-full rounded-xl border border-blue-500/30 bg-blue-600/10 px-4 py-3 text-left transition-colors hover:bg-blue-600/20 disabled:opacity-60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase text-blue-300">
                      {quickReplySuggestion.keyword}
                    </span>
                    <span className="text-xs text-slate-400">Press Enter</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-100">
                    {quickReplySuggestion.reply_text}
                  </p>
                </button>
              )}
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    if (quickReplySuggestion) {
                      handleQuickReplySend();
                      return;
                    }
                    handleSend();
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!replyText.trim() || sendReply.isPending}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-white text-sm">➤</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
