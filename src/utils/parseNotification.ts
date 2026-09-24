import type {
  ReceiveNotificationResponse,
  ChatMessage,
} from "@/types/greenApi";

/**
 * Преобразует уведомление GREEN-API во внутренний формат ChatMessage.
 * Возвращает null, если уведомление не является входящим текстовым сообщением.
 */
export const parseNotification = (
  notification: ReceiveNotificationResponse,
): { chatId: string; message: ChatMessage } | null => {
  const { body } = notification;

  if (body.typeWebhook !== "incomingMessageReceived") {
    return null;
  }

  const messageData = body.messageData;

  // Нас интересуют только текстовые сообщения
  if (messageData.typeMessage !== "textMessage") {
    return null;
  }

  const text = messageData.textMessageData?.textMessage;
  if (!text) return null;

  const chatId = body.senderData.chatId;

  return {
    chatId,
    message: {
      id: body.idMessage,
      chatId,
      text,
      timestamp: body.timestamp,
      isOutgoing: false,
    },
  };
};
