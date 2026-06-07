"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePages, useAddPage, useDeletePage } from "@/hooks/usePages";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { data: pages, isLoading } = usePages();
  const addPage = useAddPage();
  const deletePage = useDeletePage();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fb_page_id: "",
    page_name: "",
    access_token: "",
  });

  const handleAddPage = async () => {
    if (!form.fb_page_id || !form.page_name || !form.access_token) return;
    try {
      await addPage.mutateAsync(form);
      setForm({ fb_page_id: "", page_name: "", access_token: "" });
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add page");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">⚙️ Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and Facebook pages</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mb-6">
        <h3 className="text-white font-semibold mb-4">Profile Information</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{user?.full_name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Connected Pages */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Connected Facebook Pages</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            + Add Page
          </button>
        </div>

        {/* Add Page Form */}
        {showForm && (
          <div className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Page Name</label>
              <input
                type="text"
                placeholder="My Facebook Page"
                value={form.page_name}
                onChange={(e) => setForm({ ...form, page_name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Page ID</label>
              <input
                type="text"
                placeholder="123456789"
                value={form.fb_page_id}
                onChange={(e) => setForm({ ...form, fb_page_id: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Page Access Token</label>
              <input
                type="password"
                placeholder="EAAxxxxxx..."
                value={form.access_token}
                onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddPage}
                disabled={addPage.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {addPage.isPending ? "Adding..." : "Add Page"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Pages List */}
        {isLoading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : pages?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm">No pages connected yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pages?.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {page.page_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{page.page_name}</p>
                    <p className="text-slate-400 text-xs">ID: {page.fb_page_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                  <button
                    onClick={() => deletePage.mutate(page.id)}
                    className="text-slate-400 hover:text-red-400 text-xs transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Info */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl">
        <h3 className="text-white font-semibold mb-4">Webhook Configuration</h3>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Verify Token</label>
          <input
            type="text"
            value="flowchat_verify_token_2024"
            disabled
            className="w-full bg-slate-700/50 border border-slate-600 text-slate-400 rounded-lg px-3 py-2 text-sm font-mono cursor-not-allowed"
          />
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-sm">Webhook Active</span>
        </div>
      </div>
    </div>
  );
}