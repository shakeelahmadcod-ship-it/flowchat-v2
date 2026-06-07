export default function KeywordsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">🔑 Keywords</h1>
        <p className="text-slate-400 text-sm mt-1">Auto-reply when users send specific keywords</p>
      </div>
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold text-white mb-2">No keyword rules yet</h3>
        <p className="text-slate-400 text-sm">Create rules to automatically reply to messages</p>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          + Add Keyword Rule
        </button>
      </div>
    </div>
  );
}