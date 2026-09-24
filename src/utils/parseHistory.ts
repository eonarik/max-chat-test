import type { ChatHistoryItem, ChatMessage } from "@/types/greenApi";

/**
 * Преобразует историю с сервера во внутренний формат ChatMessage.
 */
export const parseHistory = (history: ChatHistoryItem[]): ChatMessage[] => {
  return (
    history
      .filter((item) => item.typeMessage === "textMessage" && item.textMessage)
      .map((item) => ({
        id: item.idMessage,
        chatId: item.chatId,
        text: item.textMessage!,
        timestamp: item.timestamp,
        isOutgoing: item.type === "outgoing",
      }))
      // GREEN-API возвращает историю в порядке "от новых к старым" — переворачиваем
      .reverse()
  );
};
