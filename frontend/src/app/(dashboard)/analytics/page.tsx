export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">📊 Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Track your platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Messages", value: "0", icon: "💬", color: "blue" },
          { label: "Subscribers", value: "0", icon: "👥", color: "green" },
          { label: "Broadcasts Sent", value: "0", icon: "📢", color: "purple" },
          { label: "Active Keywords", value: "0", icon: "🔑", color: "orange" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center h-64 text-center bg-slate-800 border border-slate-700 rounded-xl">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-slate-400 text-sm">Connect pages to see analytics data</p>
      </div>
    </div>
  );
}