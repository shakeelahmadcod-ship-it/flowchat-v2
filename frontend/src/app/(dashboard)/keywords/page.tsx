"use client";

import { useState } from "react";
import { useKeywords, useCreateKeyword, useDeleteKeyword, useToggleKeyword } from "@/hooks/useKeywords";
import { usePages } from "@/hooks/usePages";

export default function KeywordsPage() {
  const { data: keywords, isLoading } = useKeywords();
  const { data: pages } = usePages();
  const createKeyword = useCreateKeyword();
  const deleteKeyword = useDeleteKeyword();
  const toggleKeyword = useToggleKeyword();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    page_id: "",
    keyword: "",
    reply_text: "",
  });
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.page_id || !form.keyword || !form.reply_text) {
      setError("All fields are required!");
      return;
    }
    try {
      await createKeyword.mutateAsync(form);
      setForm({ page_id: "", keyword: "", reply_text: "" });
      setShowForm(false);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create rule");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">🔑 Keywords</h1>
          <p className="text-slate-400 text-sm mt-1">Auto-reply when users send specific keywords</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {/* Add Rule Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Create Keyword Rule</h3>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
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
              <label className="block text-xs text-slate-400 mb-1">Keyword</label>
              <input
                type="text"
                placeholder="e.g. price, order, help"
                value={form.keyword}
                onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1">Auto Reply Text</label>
            <textarea
              placeholder="Type the automatic reply message..."
              value={form.reply_text}
              onChange={(e) => setForm({ ...form, reply_text: e.target.value })}
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={createKeyword.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {createKeyword.isPending ? "Creating..." : "Create Rule"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keywords List */}
      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : !keywords?.length ? (
        <div className="flex flex-col items-center justify-center h-80 text-center bg-slate-800 border border-slate-700 rounded-xl">
          <div className="text-5xl mb-3">🤖</div>
          <h3 className="text-white font-semibold mb-1">No keyword rules yet</h3>
          <p className="text-slate-400 text-sm">Create rules to automatically reply to messages</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700 bg-slate-700/30">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Active Rules ({keywords.length})
            </span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {keywords.map((rule) => (
              <div key={rule.id} className="flex items-start justify-between p-5 hover:bg-slate-700/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/20">
                      🔑 {rule.keyword}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rule.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">↩️ {rule.reply_text}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleKeyword.mutate(rule)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      rule.is_active
                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                    }`}
                  >
                    {rule.is_active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteKeyword.mutate(rule.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}