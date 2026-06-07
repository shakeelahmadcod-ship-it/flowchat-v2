import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface AnalyticsData {
  total_pages: number;
  total_conversations: number;
  total_messages: number;
  unread_conversations: number;
  active_keywords: number;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await api.get<AnalyticsData>("/analytics/");
      return res.data;
    },
    refetchInterval: 10000,
  });
}