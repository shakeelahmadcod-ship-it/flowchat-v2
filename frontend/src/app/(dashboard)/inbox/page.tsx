export default function InboxPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">📥 Inbox</h1>
        <p className="text-slate-400 text-sm mt-1">Messages from your Facebook pages</p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
        <p className="text-slate-400 text-sm">Connect a Facebook page to start receiving messages</p>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          Connect Facebook Page
        </button>
      </div>
    </div>
  );
}