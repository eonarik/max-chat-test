import { useCallback, useState } from "react";
import type { AxiosInstance } from "axios";
import { getChatHistory } from "@/api/greenApi";
import { parseHistory } from "@/utils/parseHistory";
import type { ChatMessage } from "@/types/greenApi";

interface UseChatHistoryOptions {
  apiClient: AxiosInstance;
  apiTokenInstance: string;
  onLoaded: (chatId: string, messages: ChatMessage[]) => void;
}

export const useChatHistory = ({
  apiClient,
  apiTokenInstance,
  onLoaded,
}: UseChatHistoryOptions) => {
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = useCallback(
    async (chatId: string) => {
      setIsLoadingHistory(true);
      try {
        const history = await getChatHistory(
          apiClient,
          apiTokenInstance,
          chatId,
          50,
        );
        onLoaded(chatId, parseHistory(history));
      } catch (err) {
        console.error("Ошибка загрузки истории:", err);
        // если истории нет — просто не показываем сообщения
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [apiClient, apiTokenInstance, onLoaded],
  );

  return { loadHistory, isLoadingHistory };
};
