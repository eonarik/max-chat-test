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

/** Результат создания чата */
export interface CreateChatResult {
  ok: boolean;
  error?: string;
  chatId?: string;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const createChat = useCallback((phone: string): CreateChatResult => {
    const clean = phone.replace(/\D/g, "");

    if (!clean) {
      return { ok: false, error: "Введите номер телефона" };
    }
    if (clean.length < 10) {
      return { ok: false, error: "Номер слишком короткий (минимум 10 цифр)" };
    }
    if (clean.length > 15) {
      return { ok: false, error: "Номер слишком длинный (максимум 15 цифр)" };
    }

    const chatId = formatChatId(clean);

    setChats((prev) => {
      if (prev.find((c) => c.id === chatId)) return prev;
      return [
        {
          id: chatId,
          phone: clean,
          type: "user",
          messages: [],
        },
        ...prev,
      ];
    });

    setActiveChatId(chatId);
    return { ok: true, chatId };
  }, []);

  const ensureChat = useCallback((chatId: string) => {
    setChats((prev) => {
      if (prev.find((c) => c.id === chatId)) return prev;
      return [
        {
          id: chatId,
          phone: extractPhone(chatId),
          type: "user",
          messages: [],
        },
        ...prev,
      ];
    });
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

  const mergeChats = useCallback((remoteChats: GreenApiChat[]) => {
    setChats((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));

      for (const remote of remoteChats) {
        const existing = byId.get(remote.chatId);
        if (existing) {
          byId.set(remote.chatId, {
            ...existing,
            name: remote.name || existing.name,
            type: remote.type,
            phoneNumber: remote.phoneNumber || existing.phoneNumber,
          });
        } else {
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

  /**
   * Обновляет статус конкретного сообщения.
   */
  const updateMessageStatus = useCallback(
    (chatId: string, messageId: string, status: ChatMessage["status"]) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === messageId ? { ...m, status } : m,
                ),
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
    updateMessageStatus,
    ensureChat,
  };
};
