"use client";

import { useState } from "react";
import { useBroadcasts, useCreateBroadcast, useSendBroadcast, useDeleteBroadcast } from "@/hooks/useBroadcasts";
import { usePages } from "@/hooks/usePages";

export default function BroadcastsPage() {
  const { data: broadcasts, isLoading } = useBroadcasts();
  const { data: pages } = usePages();
  const createBroadcast = useCreateBroadcast();
  const sendBroadcast = useSendBroadcast();
  const deleteBroadcast = useDeleteBroadcast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ page_id: "", message_text: "" });
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.page_id || !form.message_text) {
      setError("All fields required!");
      return;
    }
    try {
      await createBroadcast.mutateAsync(form);
      setForm({ page_id: "", message_text: "" });
      setShowForm(false);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed!");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">📢 Broadcasts</h1>
          <p className="text-slate-400 text-sm mt-1">Send messages to all your subscribers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Create Broadcast
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">New Broadcast</h3>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Select Page</label>
              <select
                value={form.page_id}
                onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a page...</option>
                {pages?.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.page_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Message</label>
              <textarea
                placeholder="Type your broadcast message..."
                value={form.message_text}
                onChange={(e) => setForm({ ...form, message_text: e.target.value })}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={createBroadcast.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {createBroadcast.isPending ? "Creating..." : "Create Draft"}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(""); }}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasts List */}
      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : !broadcasts?.length ? (
        <div className="flex flex-col items-center justify-center h-80 bg-slate-800 border border-slate-700 rounded-xl text-center">
          <div className="text-5xl mb-3">📡</div>
          <h3 className="text-white font-semibold mb-1">No broadcasts yet</h3>
          <p className="text-slate-400 text-sm">Create your first broadcast to send to subscribers</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 bg-slate-700/30">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              All Broadcasts ({broadcasts.length})
            </span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {broadcasts.map((b) => (
              <div key={b.id} className="p-5 hover:bg-slate-700/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-2">{b.message_text}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        b.status === "sent"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {b.status === "sent" ? `✅ Sent to ${b.sent_count}` : "⏳ Draft"}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {b.status === "draft" && (
                      <button
                        onClick={() => sendBroadcast.mutate(b.id)}
                        disabled={sendBroadcast.isPending}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {sendBroadcast.isPending ? "Sending..." : "🚀 Send Now"}
                      </button>
                    )}
                    <button
                      onClick={() => deleteBroadcast.mutate(b.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}