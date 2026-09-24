import { useState, useCallback, useEffect } from "react";
import type { Chat, ChatMessage, GreenApiChat } from "@/types/greenApi";
import { formatChatId, extractPhone } from "@/utils/format";

const STORAGE_KEY = "green_api_chats";

const loadChats = (): Chat[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
};

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const createChat = useCallback((phone: string) => {
    const chatId = formatChatId(phone);
    setChats((prev) => {
      const existing = prev.find((c) => c.id === chatId);
      if (existing) return prev;
      return [
        { id: chatId, phone: extractPhone(chatId), messages: [] },
        ...prev,
      ];
    });
    setActiveChatId(chatId);
  }, []);

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage: message.text,
              lastActivity: message.timestamp,
            }
          : chat,
      ),
    );
  }, []);

  /**
   * Объединяет чаты с сервера с локальным состоянием.
   * - Новые чаты добавляются.
   * - Существующие сохраняют свою историю сообщений.
   * - Локальные чаты, которых нет на сервере, остаются.
   */
  const mergeChats = useCallback((remoteChats: GreenApiChat[]) => {
    setChats((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));

      for (const remote of remoteChats) {
        const existing = byId.get(remote.chatId);
        if (existing) {
          // Обновляем имя, если оно было пустым
          byId.set(remote.chatId, {
            ...existing,
            name: remote.name || existing.name,
            type: remote.type,
            phoneNumber: remote.phoneNumber || existing.phoneNumber,
          });
        } else {
          // Новый чат с сервера
          byId.set(remote.chatId, {
            id: remote.chatId,
            phone: extractPhone(remote.chatId),
            name: remote.name,
            type: remote.type,
            phoneNumber: remote.phoneNumber,
            messages: [],
          });
        }
      }

      return Array.from(byId.values());
    });
  }, []);

  const setChatMessages = useCallback(
    (chatId: string, messages: ChatMessage[]) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages,
                lastMessage: messages[messages.length - 1]?.text,
                lastActivity: messages[messages.length - 1]?.timestamp,
              }
            : chat,
        ),
      );
    },
    [],
  );

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;

  return {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    setChatMessages,
    createChat,
    addMessage,
    mergeChats,
  };
};
