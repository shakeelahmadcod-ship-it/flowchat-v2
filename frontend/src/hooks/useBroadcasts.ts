import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

interface Broadcast {
  id: string;
  page_id: string;
  message_text: string;
  status: string;
  sent_count: number;
  created_at: string;
}

export function useBroadcasts() {
  return useQuery({
    queryKey: ["broadcasts"],
    queryFn: async () => {
      const res = await api.get<Broadcast[]>("/broadcasts/");
      return res.data;
    },
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { page_id: string; message_text: string }) => {
      const res = await api.post<Broadcast>("/broadcasts/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<Broadcast>(`/broadcasts/${id}/send`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
  });
}

export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/broadcasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
  });
}