import type { Chat } from "@/types/greenApi";

const AVATAR_GRADIENTS: [string, string][] = [
  ["#FF6B6B", "#FF8E53"], // красно-оранжевый
  ["#4ECDC4", "#44A08D"], // бирюзовый
  ["#A78BFA", "#7C3AED"], // фиолетовый
  ["#60A5FA", "#3B82F6"], // синий
  ["#34D399", "#059669"], // зелёный
  ["#FBBF24", "#F59E0B"], // жёлтый
  ["#F472B6", "#DB2777"], // розовый
  ["#22D3EE", "#0891B2"], // голубой
];

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export interface AvatarData {
  type: "letter" | "icon";
  letter?: string;
  gradient?: [string, string];
  iconId?: string;
  bgColor?: string;
}

export const getAvatarData = (chat: Chat): AvatarData => {
  const chatId = chat.id || "";
  const name = chat.name?.trim() || "";

  // Боты и системные — иконки
  if (chatId === "543835" || name === "MAX") {
    return {
      type: "icon",
      iconId: "icon_verification_mini_themed",
      bgColor: "#007aff",
    };
  }
  if (name === "Избранное") {
    return {
      type: "icon",
      iconId: "icon_bookmark_fill",
      bgColor: "#007aff",
    };
  }
  if (chat.type === "bot") {
    return {
      type: "icon",
      iconId: "icon_bot",
      bgColor: "#8b5cf6",
    };
  }

  const letter = name
    ? name.charAt(0).toUpperCase()
    : chat.phoneNumber
      ? String(chat.phoneNumber).charAt(0)
      : "?";

  const gradient =
    AVATAR_GRADIENTS[hashString(chatId) % AVATAR_GRADIENTS.length];

  return {
    type: "letter",
    letter,
    gradient,
  };
};
