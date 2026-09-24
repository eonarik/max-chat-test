import type { Chat } from "@/types/greenApi";

export const formatChatId = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

export const extractPhone = (chatId: string): string => {
  return chatId.replace(/\D/g, "");
};

export const formatPhone = (phone: number | string): string => {
  const clean = String(phone).replace(/\D/g, "");
  if (clean.length === 11 && clean.startsWith("7")) {
    return `+7 ${clean.slice(1, 4)} ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9)}`;
  }
  return clean;
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getDisplayName = (chat: Chat): string => {
  if (chat.name && chat.name.trim()) return chat.name;
  if (chat.phoneNumber && chat.phoneNumber > 0) {
    return formatPhone(chat.phoneNumber);
  }
  return chat.id;
};
