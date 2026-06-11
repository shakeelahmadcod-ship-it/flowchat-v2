import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { FacebookStatus, Page, ManagedPageItem } from "@/types";

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await api.get<Page[]>("/pages/");
      return res.data;
    },
  });
}

export function useFacebookLogin() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get<{ url: string }>("/facebook/login");
      return res.data.url;
    },
  });
}

export function useManagedPages(enabled: boolean) {
  return useQuery({
    queryKey: ["facebook-managed-pages"],
    queryFn: async () => {
      const res = await api.get<ManagedPageItem[]>("/facebook/managed-pages");
      return res.data;
    },
    enabled,
    retry: false,
  });
}

export function useConnectPages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageIds: string[]) => {
      const res = await api.post<Page[]>("/facebook/connect-pages", {
        page_ids: pageIds,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["facebook-managed-pages"] });
      queryClient.invalidateQueries({ queryKey: ["facebook-status"] });
    },
  });
}

export function useFacebookStatus() {
  return useQuery({
    queryKey: ["facebook-status"],
    queryFn: async () => {
      const res = await api.get<FacebookStatus>("/facebook/status");
      return res.data;
    },
    retry: false,
  });
}

export function useDisconnectPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageId: string) => {
      await api.delete(`/facebook/disconnect/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}
