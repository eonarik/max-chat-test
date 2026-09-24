import type { Chat } from "@/types/greenApi";
import type { FunctionComponent } from "react";
import { Avatar } from "../Avatar";
import { formatTime, getDisplayName } from "@/utils/format";

interface SidebarChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelectChat: (chatId: string) => void;
}

const SidebarChatItem: FunctionComponent<SidebarChatItemProps> = ({
  chat,
  isActive,
  onSelectChat,
}) => {
  return (
    <button
      onClick={() => onSelectChat(chat.id)}
      className={`w-full text-left px-3 py-2.5 flex gap-3 items-center transition-colors ${
        isActive ? "bg-max-primary/10" : "hover:bg-gray-50"
      }`}
    >
      <Avatar chat={chat} size={56} />

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-detail font-medium text-max-text-primary truncate">
            {getDisplayName(chat)}
          </span>
          {chat.lastActivity && (
            <span className="text-xs text-max-text-secondary shrink-0">
              {formatTime(chat.lastActivity)}
            </span>
          )}
        </div>

        {chat.lastMessage && (
          <p className="text-detail text-max-text-secondary truncate mt-0.5">
            {chat.lastMessage}
          </p>
        )}
      </div>
    </button>
  );
};

export default SidebarChatItem;
