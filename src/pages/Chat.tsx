import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosInstance } from "axios";
import axios from "axios";
import type {
  Credentials,
  ChatMessage,
  ReceiveNotificationResponse,
} from "@/types/greenApi";
import { useChats } from "@/hooks/useChats";
import { useChatHistory } from "@/hooks/useChatHistory";
import { sendMessage, getChats, readChat } from "@/api/greenApi";

import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import {
  parseNotification,
  parseStatusNotification,
} from "@/utils/parseNotification";
import { useLongPolling } from "@/hooks/useLongPolling";

interface ChatProps {
  apiClient: AxiosInstance;
  credentials: Credentials;
  onLogout: () => void;
}

function Chat({ apiClient, credentials, onLogout }: ChatProps) {
  const {
    chats,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    addMessage,
    mergeChats,
    setChatMessages,
    updateMessageStatus,
    ensureChat,
    replaceMessageId,
  } = useChats();

  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const handleHistoryLoaded = useCallback(
    (chatId: string, messages: ChatMessage[]) => {
      setChatMessages(chatId, messages);
    },
    [setChatMessages],
  );

  const { loadHistory, isLoadingHistory } = useChatHistory({
    apiClient,
    apiTokenInstance: credentials.apiTokenInstance,
    onLoaded: handleHistoryLoaded,
  });

  const loadChats = useCallback(
    async (force = false) => {
      if (hasLoadedRef.current && !force) return;
      hasLoadedRef.current = true;

      setIsLoadingChats(true);
      setChatsError(null);
      try {
        const remoteChats = await getChats(
          apiClient,
          credentials.apiTokenInstance,
        );
        mergeChats(remoteChats);
      } catch (err) {
        console.error("Ошибка загрузки чатов:", err);
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          setChatsError("Слишком много запросов. Подождите немного.");
        } else {
          setChatsError("Не удалось загрузить список чатов");
        }
        hasLoadedRef.current = false;
      } finally {
        setIsLoadingChats(false);
      }
    },
    [apiClient, credentials.apiTokenInstance, mergeChats],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const markChatAsRead = useCallback(
    async (chatId: string) => {
      try {
        await readChat(apiClient, credentials.apiTokenInstance, chatId);
      } catch (err) {
        console.warn("Не удалось отметить чат прочитанным:", err);
      }
    },
    [apiClient, credentials.apiTokenInstance],
  );

  const handleNotification = useCallback(
    (notification: ReceiveNotificationResponse) => {
      const parsed = parseNotification(notification);
      if (parsed) {
        ensureChat(parsed.chatId);
        addMessage(parsed.chatId, parsed.message);

        if (parsed.chatId === activeChatId) {
          markChatAsRead(parsed.chatId);
        }
        return;
      }
      const status = parseStatusNotification(notification);
      if (status) {
        updateMessageStatus(status.chatId, status.idMessage, status.status);
      }
    },
    [ensureChat, addMessage, activeChatId, markChatAsRead],
  );

  useLongPolling({
    apiClient,
    apiTokenInstance: credentials.apiTokenInstance,
    enabled: true,
    onNotification: handleNotification,
  });

  useEffect(() => {
    if (!activeChatId) return;

    const chat = chats.find((c) => c.id === activeChatId);
    if (chat && chat.messages.length === 0) {
      loadHistory(activeChatId);
    }
  }, [activeChatId, chats, loadHistory]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);
    },
    [setActiveChatId],
  );

  const handleSendMessage = async (text: string) => {
    if (!activeChat) return;

    const tempId = crypto.randomUUID();
    const chatId = activeChat.id;

    addMessage(chatId, {
      id: tempId,
      chatId,
      text,
      timestamp: Math.floor(Date.now() / 1000),
      isOutgoing: true,
      status: "sent",
    });

    try {
      const result = await sendMessage(
        apiClient,
        credentials.apiTokenInstance,
        chatId,
        text,
      );

      if (result?.idMessage) {
        replaceMessageId(chatId, tempId, result.idMessage);
      }
    } catch (err) {
      console.error("Не удалось отправить сообщение:", err);
      updateMessageStatus(chatId, tempId, "error");
    }
  };

  const handleRetryMessage = async (message: ChatMessage) => {
    if (!activeChat) return;

    updateMessageStatus(activeChat.id, message.id, "sent");

    try {
      await sendMessage(
        apiClient,
        credentials.apiTokenInstance,
        activeChat.id,
        message.text,
      );
    } catch (err) {
      console.error("Повторная отправка не удалась:", err);
      updateMessageStatus(activeChat.id, message.id, "error");
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onCreateChat={createChat}
        onLogout={onLogout}
        onRefresh={() => loadChats(true)}
        isLoading={isLoadingChats}
        error={chatsError}
      />

      <ChatWindow
        chat={activeChat}
        onSendMessage={handleSendMessage}
        onRetryMessage={handleRetryMessage}
        isLoadingHistory={isLoadingHistory}
      />
    </div>
  );
}

export default Chat;
