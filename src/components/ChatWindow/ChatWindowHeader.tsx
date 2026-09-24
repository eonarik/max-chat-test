import type { FunctionComponent } from "react";
import { getDisplayName } from "@/utils/format";
import type { Chat } from "@/types/greenApi";

interface ChatWindowHeaderProps {
  chat: Chat;
}

const ChatWindowHeader: FunctionComponent<ChatWindowHeaderProps> = ({
  chat,
}) => {
  return (
    <header className="h-14 px-4 flex items-center bg-max-bg-light border-b border-gray-100">
      <h2 className="text-detail-lg font-semibold text-max-text-primary truncate">
        {getDisplayName(chat)}
      </h2>
    </header>
  );
};

export default ChatWindowHeader;
