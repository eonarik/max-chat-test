import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosInstance } from "axios";
import axios from "axios";
import type { Credentials, ChatMessage } from "@/types/greenApi";
import { useChats } from "@/hooks/useChats";
import { useChatHistory } from "@/hooks/useChatHistory";
import { sendMessage, getChats } from "@/api/greenApi";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

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
    addMessage(activeChat.id, {
      id: tempId,
      chatId: activeChat.id,
      text,
      timestamp: Math.floor(Date.now() / 1000),
      isOutgoing: true,
      status: "sent",
    });

    try {
      await sendMessage(
        apiClient,
        credentials.apiTokenInstance,
        activeChat.id,
        text,
      );
    } catch (err) {
      console.error("Не удалось отправить сообщение:", err);
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
        isLoadingHistory={isLoadingHistory}
      />
    </div>
  );
}

export default Chat;
