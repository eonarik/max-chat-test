import { useState, useCallback, useEffect } from "react";
import type { Chat, ChatMessage, GreenApiChat } from "@/types/greenApi";
import { formatChatId, extractPhone } from "@/utils/format";
import { useActiveChat } from "./useActiveChat";

const STORAGE_KEY = "green_api_chats";

const loadChats = (): Chat[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
};

export interface CreateChatResult {
  ok: boolean;
  error?: string;
  chatId?: string;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(loadChats);

  const { activeChatId, setActiveChatId } = useActiveChat();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  const createChat = useCallback(
    (phone: string): CreateChatResult => {
      const clean = phone.replace(/\D/g, "");

      if (!clean) return { ok: false, error: "Введите номер телефона" };
      if (clean.length < 10 || clean.length > 15) {
        return { ok: false, error: "Неверная длина номера" };
      }

      const existing = chats.find(
        (c) => String(c.phoneNumber) === clean || c.phone === clean,
      );

      if (existing) {
        setActiveChatId(existing.id);
        return { ok: true, chatId: existing.id };
      }

      const chatId = formatChatId(clean);
      const sendId = `${clean}@c.us`;

      setChats((prev) => [
        {
          id: chatId,
          sendId,
          phone: clean,
          phoneNumber: Number(clean),
          messages: [],
        },
        ...prev,
      ]);
      setActiveChatId(chatId);
      return { ok: true, chatId };
    },
    [chats],
  );

  const ensureChat = useCallback((chatId: string, phoneNumber?: number) => {
    setChats((prev) => {
      if (prev.find((c) => c.id === chatId)) return prev;

      const sendId =
        phoneNumber && phoneNumber > 0 ? `${phoneNumber}@c.us` : undefined;

      return [
        {
          id: chatId,
          sendId,
          phone: extractPhone(chatId),
          phoneNumber,
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

        const sendId =
          remote.phoneNumber && remote.phoneNumber > 0
            ? `${remote.phoneNumber}@c.us`
            : undefined;

        if (existing) {
          byId.set(remote.chatId, {
            ...existing,
            name: remote.name || existing.name,
            type: remote.type,
            phoneNumber: remote.phoneNumber || existing.phoneNumber,
            sendId: sendId ?? existing.sendId,
          });
        } else {
          byId.set(remote.chatId, {
            id: remote.chatId,
            sendId, // ← добавляем
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

  const mergeMessages = useCallback(
    (chatId: string, incoming: ChatMessage[]) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          // Сообщения из localStorage + из истории, объединённые по id
          const byId = new Map<string, ChatMessage>();
          for (const m of chat.messages) byId.set(m.id, m);
          for (const m of incoming) byId.set(m.id, m);

          // Сортируем по timestamp
          const merged = Array.from(byId.values()).sort(
            (a, b) => a.timestamp - b.timestamp,
          );

          return {
            ...chat,
            messages: merged,
            lastMessage: merged[merged.length - 1]?.text,
            lastActivity: merged[merged.length - 1]?.timestamp,
          };
        }),
      );
    },
    [],
  );

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

  const replaceMessageId = useCallback(
    (chatId: string, oldId: string, newId: string) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === oldId ? { ...m, id: newId } : m,
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
    replaceMessageId,
    mergeMessages,
  };
};
