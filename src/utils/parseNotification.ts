import type {
  ReceiveNotificationResponse,
  ChatMessage,
} from "@/types/greenApi";

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
  quotedMessage: "[Цитата]",
};

const extractIncomingText = (messageData: any): string | null => {
  if (!messageData?.typeMessage) return null;

  if (messageData.typeMessage === "extendedTextMessage") {
    return (
      messageData.extendedTextMessageData?.text ??
      messageData.textMessageData?.textMessage ??
      null
    );
  }

  if (messageData.typeMessage === "textMessage") {
    return messageData.textMessageData?.textMessage ?? null;
  }

  const placeholder = PLACEHOLDERS[messageData.typeMessage];
  if (placeholder) return placeholder;

  return "[Unknown message]";
};

export const parseNotification = (
  notification: ReceiveNotificationResponse,
): { chatId: string; phoneNumber?: number; message: ChatMessage } | null => {
  const { body } = notification;

  if (body.typeWebhook !== "incomingMessageReceived") {
    return null;
  }

  const text = extractIncomingText(body.messageData);
  if (!text) return null;

  const chatId = body.senderData.chatId;
  const phoneNumber = (body.senderData as any).senderPhoneNumber;

  return {
    chatId,
    phoneNumber: phoneNumber && phoneNumber > 0 ? phoneNumber : undefined,
    message: {
      id: body.idMessage,
      chatId,
      text,
      timestamp: body.timestamp,
      isOutgoing: false,
    },
  };
};

export interface ParsedStatusUpdate {
  idMessage: string;
  chatId: string;
  status: "sent" | "delivered" | "read" | "error";
}

export const parseStatusNotification = (
  notification: ReceiveNotificationResponse,
): ParsedStatusUpdate | null => {
  const { body } = notification;
  if (body.typeWebhook !== "outgoingMessageStatus") return null;

  const chatId = (body as any).chatId;
  const status = (body as any).status;
  const idMessage = (body as any).idMessage;

  if (!chatId || !idMessage) return null;

  const statusMap: Record<string, ParsedStatusUpdate["status"]> = {
    delivered: "delivered",
    read: "read",
    sent: "sent",
    failed: "error",
    noAccount: "error",
  };

  const mappedStatus = statusMap[status];
  if (!mappedStatus) return null;

  return { idMessage, chatId, status: mappedStatus };
};
