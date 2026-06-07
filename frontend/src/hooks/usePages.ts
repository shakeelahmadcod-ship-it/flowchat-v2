import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Page } from "@/types";

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await api.get<Page[]>("/pages/");
      return res.data;
    },
  });
}

export function useAddPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      fb_page_id: string;
      page_name: string;
      access_token: string;
    }) => {
      const res = await api.post<Page>("/pages/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pageId: string) => {
      await api.delete(`/pages/${pageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
    },
  });
}