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
import { sendMessage, getChats } from "@/api/greenApi";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import { parseNotification } from "@/utils/parseNotification";
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

  /** Обработка входящих уведомлений */
  const handleNotification = useCallback(
    (notification: ReceiveNotificationResponse) => {
      const parsed = parseNotification(notification);
      if (!parsed) return;

      ensureChat(parsed.chatId);
      addMessage(parsed.chatId, parsed.message);
    },
    [ensureChat, addMessage],
  );

  // Запуск Long Polling
  useLongPolling({
    apiClient,
    apiTokenInstance: credentials.apiTokenInstance,
    enabled: true,
    onNotification: handleNotification,
  });

  /** Выбор чата: установка активного + загрузка истории */
  const handleSelectChat = useCallback(
    (chatId: string) => {
      setActiveChatId(chatId);

      // Не грузим историю повторно, если она уже есть локально
      const chat = chats.find((c) => c.id === chatId);
      if (chat && chat.messages.length === 0) {
        loadHistory(chatId);
      }
    },
    [chats, setActiveChatId, loadHistory],
  );

  const handleSendMessage = async (text: string) => {
    if (!activeChat) return;

    const tempId = crypto.randomUUID();
    const chatId = activeChat.id;

    // 1. Оптимистично показываем сообщение с временным id и статусом "sent"
    addMessage(chatId, {
      id: tempId,
      chatId,
      text,
      timestamp: Math.floor(Date.now() / 1000),
      isOutgoing: true,
      status: "sent",
    });

    // 2. Отправляем на сервер
    try {
      const result = await sendMessage(
        apiClient,
        credentials.apiTokenInstance,
        chatId,
        text,
      );

      // 3. Успех. Можно заменить id на реальный (idMessage от сервера)
      //    или просто пометить как "sent" (уже sent, но подтвердим).
      if (result?.idMessage) {
        // при желании — заменить tempId на result.idMessage
      }
    } catch (err) {
      console.error("Не удалось отправить сообщение:", err);
      // 4. Ошибка — помечаем сообщение
      updateMessageStatus(chatId, tempId, "error");
    }
  };

  /** Повторная отправка ошибочного сообщения */
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
