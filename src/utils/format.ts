export const formatChatId = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, "");
  return `${cleanPhone}@c.us`;
};

export const extractPhone = (chatId: string): string => {
  return chatId.split("@")[0];
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
