// src/pages/Chat.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Credentials } from "@/types/greenApi";
import { useChats } from "@/hooks/useChats";
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
  } = useChats();

  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const loadChats = useCallback(
    async (force = false) => {
      // Не грузим повторно, если уже грузили — если только не форсим
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
        hasLoadedRef.current = false; // разрешаем повтор при ошибке
      } finally {
        setIsLoadingChats(false);
      }
    },
    [apiClient, credentials.apiTokenInstance, mergeChats],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

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
        onSelectChat={setActiveChatId}
        onCreateChat={createChat}
        onLogout={onLogout}
        onRefresh={loadChats}
        isLoading={isLoadingChats}
        error={chatsError}
      />
      <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default Chat;
