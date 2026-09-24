import type { Chat } from "@/types/greenApi";
import type { CreateChatResult } from "@/hooks/useChats";

import SidebarFooter from "./SidebarFooter";
import SidebarChatList from "./SidebarChatList";
import SidebarHeader from "./SidebarHeader";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: (phone: string) => CreateChatResult;
  onLogout: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
}

function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onLogout,
  onRefresh,
  isLoading,
  error,
}: SidebarProps) {
  return (
    <aside className="w-80 flex flex-col bg-max-bg-light border-r border-gray-100">
      <SidebarHeader
        isLoading={isLoading}
        onCreateChat={onCreateChat}
        onRefresh={onRefresh}
      />

      <SidebarChatList
        activeChatId={activeChatId}
        isLoading={isLoading}
        chats={chats}
        error={error}
        onSelectChat={onSelectChat}
      />

      <SidebarFooter onLogout={onLogout} />
    </aside>
  );
}

export default Sidebar;
