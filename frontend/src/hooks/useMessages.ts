import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Conversation, Message } from "@/types";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get<Conversation[]>("/conversations");
      return res.data;
    },
    refetchInterval: 3000,
  });
}

export function useMessages(convId: string | null) {
  return useQuery({
    queryKey: ["messages", convId],
    queryFn: async () => {
      const res = await api.get<Message[]>(`/conversations/${convId}/messages`);
      return res.data;
    },
    enabled: !!convId,
    refetchInterval: 3000,
  });
}

export function useSendReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      conversation_id: string;
      message_text: string;
    }) => {
      await api.post("/conversations/reply", data);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["messages", vars.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}