import type { FunctionComponent } from "react";
import type { Chat } from "@/types/greenApi";

import SidebarChatItem from "./SidebarChatItem";

interface SidebarChatListProps {
  activeChatId: string | null;
  isLoading: boolean;
  chats: Chat[];
  error: string | null;
  onSelectChat: (chatId: string) => void;
}

const SidebarChatList: FunctionComponent<SidebarChatListProps> = ({
  activeChatId,
  isLoading,
  chats,
  error,
  onSelectChat,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {error && (
        <p className="px-3 py-2 text-xs text-max-error bg-red-50">{error}</p>
      )}

      {isLoading && chats.length === 0 ? (
        <p className="p-4 text-sm text-max-text-secondary text-center">
          Загрузка...
        </p>
      ) : chats.length === 0 ? (
        <p className="p-4 text-sm text-max-text-secondary text-center">
          Нет чатов. Нажмите «+», чтобы начать.
        </p>
      ) : (
        chats.map((chat) => (
          <SidebarChatItem
            key={chat.id}
            chat={chat}
            isActive={activeChatId === chat.id}
            onSelectChat={onSelectChat}
          />
        ))
      )}
    </div>
  );
};

export default SidebarChatList;
