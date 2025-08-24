import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import { useEffect, useRef } from "react";

export function useMessages(chatId: string | undefined, limit?: number) {
  const messages = useQuery(
    api.messages.list,
    chatId ? { chatId: chatId as any, limit } : "skip"
  );
  
  const sendMessage = useMutation(api.messages.send);
  const editMessage = useMutation(api.messages.edit);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  return {
    messages: messages?.messages || [],
    hasMore: messages?.hasMore || false,
    sendMessage,
    editMessage,
    deleteMessage,
    isLoading: messages === undefined,
  };
}

export function useMessageSubscription(chatId: string | undefined) {
  const latestMessage = useQuery(
    api.messages.subscribe,
    chatId ? { chatId: chatId as any } : "skip"
  );

  const previousMessage = useRef(latestMessage);

  useEffect(() => {
    if (latestMessage && latestMessage !== previousMessage.current) {
      // New message received
      // You can trigger notifications or other actions here
      previousMessage.current = latestMessage;
    }
  }, [latestMessage]);

  return {
    latestMessage,
  };
}

export function useSearchMessages(query: string, chatId?: string) {
  const results = useQuery(
    api.messages.search,
    query ? { query, chatId: chatId as any } : "skip"
  );

  return {
    results: results || [],
    isSearching: results === undefined,
  };
}