"use client";

import { useAuthStore } from "@/stores/authStore";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">⚙️ Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mb-4">
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              defaultValue={user?.full_name}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              disabled
              className="w-full bg-slate-700/50 border border-slate-600 text-slate-400 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Webhook Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl">
        <h3 className="text-white font-semibold mb-4">Webhook Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Verify Token</label>
            <input
              type="text"
              value="flowchat_verify_token_2024"
              disabled
              className="w-full bg-slate-700/50 border border-slate-600 text-slate-400 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed font-mono"
            />
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm font-medium">Webhook Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}