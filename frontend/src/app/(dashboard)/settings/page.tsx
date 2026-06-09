"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  usePages,
  useFacebookLogin,
  useManagedPages,
  useConnectPages,
  useDisconnectPage,
} from "@/hooks/usePages";

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fbAuthSuccess = searchParams.get("fb_auth") === "success";

  const { user } = useAuthStore();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const facebookLogin = useFacebookLogin();
  const [showSelection, setShowSelection] = useState(() => fbAuthSuccess);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const managedPages = useManagedPages(showSelection || !!fbAuthSuccess);
  const connectPages = useConnectPages();
  const disconnectPage = useDisconnectPage();

  useEffect(() => {
    if (fbAuthSuccess) {
      router.replace("/dashboard/settings");
    }
  }, [fbAuthSuccess, router]);

  const togglePageSelection = (pageId: string) => {
    setSelectedPageIds((current) =>
      current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId]
    );
  };

  const handleConnectFacebook = async () => {
    try {
      const url = await facebookLogin.mutateAsync();
      window.location.href = url;
    } catch {
      alert("Unable to start Facebook connection. Please try again.");
    }
  };

  const handleConnectPages = async () => {
    if (selectedPageIds.length === 0) return;
    try {
      await connectPages.mutateAsync(selectedPageIds);
      setSelectedPageIds([]);
      setShowSelection(false);
    } catch (error: unknown) {
      let message = "Failed to connect pages.";
      if (typeof error === "object" && error !== null) {
        const typedError = error as { response?: { data?: { detail?: string } } };
        if (typedError.response?.data?.detail) {
          message = typedError.response.data.detail;
        }
      }
      alert(message);
    }
  };

  const handleDisconnectPage = async (pageId: string) => {
    if (!confirm("Disconnect this page from FlowChat?")) return;
    disconnectPage.mutate(pageId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">⚙️ Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and Facebook pages</p>
      </div>

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

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-white font-semibold">Connected Facebook Pages</h3>
            <p className="text-slate-400 text-sm mt-1">Use OAuth to connect and manage pages securely.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleConnectFacebook}
              disabled={facebookLogin.status === "pending"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {facebookLogin.status === "pending" ? "Opening Facebook..." : "Connect Facebook"}
            </button>
            <button
              onClick={() => {
                setShowSelection(true);
                managedPages.refetch();
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Select Pages
            </button>
          </div>
        </div>

        {pagesLoading ? (
          <p className="text-slate-400 text-sm">Loading connected pages...</p>
        ) : pages?.length ? (
          <div className="space-y-3">
            {pages.map((page) => (
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
                <button
                  onClick={() => handleDisconnectPage(page.fb_page_id)}
                  className="text-slate-400 hover:text-red-400 text-xs transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-3xl mb-2">📄</p>
            <p className="text-sm">No connected pages yet. Connect Facebook and select pages to get started.</p>
          </div>
        )}
      </div>

      {showSelection && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Choose Pages to Connect</h3>
              <p className="text-slate-400 text-sm mt-1">
                Select the Facebook pages you want FlowChat to manage.
              </p>
            </div>
            <button
              onClick={() => {
                setShowSelection(false);
                setSelectedPageIds([]);
              }}
              className="text-slate-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>

          {managedPages.isLoading ? (
            <p className="text-slate-400 text-sm">Fetching available pages...</p>
          ) : managedPages.error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              Unable to load Facebook pages. Make sure your account is connected and try again.
            </div>
          ) : managedPages.data?.length ? (
            <div className="space-y-3 mb-4">
              {managedPages.data.map((page) => (
                <label
                  key={page.id}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPageIds.includes(page.id)}
                    onChange={() => togglePageSelection(page.id)}
                    className="h-4 w-4 rounded border-slate-500 text-blue-500 focus:ring-blue-400"
                  />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{page.name}</p>
                    <p className="text-slate-400 text-xs">{page.category || "Facebook Page"}</p>
                  </div>
                  {page.picture_url ? (
                    <img src={page.picture_url} alt={page.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : null}
                </label>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-600 bg-slate-900/50 p-4 text-slate-300 text-sm">
              No managed Facebook pages are available for this account.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleConnectPages}
              disabled={selectedPageIds.length === 0 || connectPages.status === "pending"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {connectPages.status === "pending" ? "Connecting pages..." : "Connect Selected Pages"}
            </button>
            <button
              onClick={() => {
                setShowSelection(false);
                setSelectedPageIds([]);
              }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
