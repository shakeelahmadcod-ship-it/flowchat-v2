"use client";

import { useAnalytics } from "@/hooks/useAnalytics";

const stats = [
  {
    key: "total_pages",
    label: "Connected Pages",
    icon: "📄",
    color: "blue",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  {
    key: "total_conversations",
    label: "Total Conversations",
    icon: "💬",
    color: "green",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
  },
  {
    key: "total_messages",
    label: "Total Messages",
    icon: "✉️",
    color: "purple",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    text: "text-purple-400",
  },
  {
    key: "unread_conversations",
    label: "Unread",
    icon: "🔔",
    color: "orange",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    text: "text-orange-400",
  },
  {
    key: "active_keywords",
    label: "Active Keywords",
    icon: "🔑",
    color: "pink",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    text: "text-pink-400",
  },
];

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">📊 Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your platform performance in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`${stat.bg} border ${stat.border} rounded-xl p-5`}
          >
            <div className="text-2xl mb-3">{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.text} mb-1`}>
              {isLoading ? (
                <div className="h-8 w-12 bg-slate-700 rounded animate-pulse" />
              ) : (
                data?.[stat.key as keyof typeof data] ?? 0
              )}
            </div>
            <div className="text-slate-400 text-xs font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">📈 Platform Overview</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                {
                  label: "Pages Connected",
                  value: data?.total_pages || 0,
                  max: 10,
                  color: "bg-blue-500",
                },
                {
                  label: "Conversations",
                  value: data?.total_conversations || 0,
                  max: Math.max(data?.total_conversations || 1, 1),
                  color: "bg-green-500",
                },
                {
                  label: "Active Keywords",
                  value: data?.active_keywords || 0,
                  max: Math.max(data?.active_keywords || 1, 1),
                  color: "bg-purple-500",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{
                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">🚀 Quick Stats</h3>
          <div className="space-y-3">
            {[
              {
                label: "Messages per conversation",
                value: data?.total_conversations
                  ? (
                      (data?.total_messages || 0) / data.total_conversations
                    ).toFixed(1)
                  : "0",
                icon: "💬",
              },
              {
                label: "Unread rate",
                value: data?.total_conversations
                  ? `${Math.round(
                      ((data?.unread_conversations || 0) /
                        data.total_conversations) *
                        100
                    )}%`
                  : "0%",
                icon: "📬",
              },
              {
                label: "Automation rules",
                value: data?.active_keywords || 0,
                icon: "🤖",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-slate-300 text-sm">{item.label}</span>
                </div>
                <span className="text-white font-semibold text-sm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}