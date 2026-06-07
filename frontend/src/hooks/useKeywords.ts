import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { KeywordRule } from "@/types";

export function useKeywords() {
  return useQuery({
    queryKey: ["keywords"],
    queryFn: async () => {
      const res = await api.get<KeywordRule[]>("/keywords/");
      return res.data;
    },
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      page_id: string;
      keyword: string;
      reply_text: string;
    }) => {
      const res = await api.post<KeywordRule>("/keywords/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/keywords/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });
}

export function useToggleKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: KeywordRule) => {
      const res = await api.patch(`/keywords/${rule.id}`, {
        keyword: rule.keyword,
        reply_text: rule.reply_text,
        is_active: !rule.is_active,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
    },
  });
}