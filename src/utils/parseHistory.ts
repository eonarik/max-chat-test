import type { ChatHistoryItem, ChatMessage } from "@/types/greenApi";

const PLACEHOLDERS: Record<string, string> = {
  imageMessage: "[Изображение]",
  videoMessage: "[Видео]",
  audioMessage: "[Голосовое сообщение]",
  documentMessage: "[Документ]",
  locationMessage: "[Геолокация]",
  contactMessage: "[Контакт]",
  stickerMessage: "[Стикер]",
  reactionMessage: "[Реакция]",
  pollMessage: "[Опрос]",
};

const extractHistoryText = (item: ChatHistoryItem): string | null => {
  if (!item.typeMessage) return null;

  if (item.typeMessage === "extendedTextMessage") {
    return item.extendedTextMessage?.text ?? item.textMessage ?? null;
  }

  if (item.typeMessage === "textMessage") {
    return item.textMessage ?? null;
  }

  const placeholder = PLACEHOLDERS[item.typeMessage];
  if (placeholder) return placeholder;

  return "[Unknown Message]";
};

const parseStatus = (
  statusMessage: string | undefined,
): ChatMessage["status"] => {
  if (!statusMessage) return undefined;
  if (statusMessage === "read") return "read";
  if (statusMessage === "delivered") return "delivered";
  if (statusMessage === "sent") return "sent";
  if (statusMessage === "failed" || statusMessage === "noAccount") {
    return "error";
  }
  return undefined;
};

export const parseHistory = (history: ChatHistoryItem[]): ChatMessage[] => {
  return history
    .filter((item) => extractHistoryText(item) !== null)
    .map((item) => ({
      id: item.idMessage,
      chatId: item.chatId,
      text: extractHistoryText(item)!,
      timestamp: item.timestamp,
      isOutgoing: item.type === "outgoing",
      status:
        item.type === "outgoing" ? parseStatus(item.statusMessage) : undefined,
    }))
    .reverse();
};
