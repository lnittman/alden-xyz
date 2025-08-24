import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";

export function useChats(archived?: boolean) {
  const chats = useQuery(api.chats.list, { archived });
  const createChat = useMutation(api.chats.create);
  const toggleArchive = useMutation(api.chats.toggleArchive);
  const togglePin = useMutation(api.chats.togglePin);
  const markAsRead = useMutation(api.chats.markAsRead);

  return {
    chats,
    createChat,
    toggleArchive,
    togglePin,
    markAsRead,
    isLoading: chats === undefined,
  };
}

export function useChatById(chatId: string | undefined) {
  const chat = useQuery(
    api.chats.getById,
    chatId ? { chatId: chatId as any } : "skip"
  );

  return {
    chat,
    isLoading: chat === undefined,
  };
}

export function useChatParticipants() {
  const addParticipant = useMutation(api.chats.addParticipant);

  return {
    addParticipant,
  };
}