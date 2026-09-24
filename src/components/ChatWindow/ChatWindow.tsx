import type { Chat, ChatMessage } from "@/types/greenApi";

import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowMessages from "./ChatWindowMessages";
import ChatWindowSend from "./ChatWindowSend";
import ChatWindowFallback from "./ChatWindowFallback";

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (text: string) => void;
  onRetryMessage: (message: ChatMessage) => void;
  isLoadingHistory?: boolean;
}

function ChatWindow({
  chat,
  isLoadingHistory,
  onSendMessage,
  onRetryMessage,
}: ChatWindowProps) {
  if (!chat) {
    return <ChatWindowFallback />;
  }

  return (
    <div className="flex-1 flex flex-col bg-max-bg-secondary">
      <ChatWindowHeader chat={chat} />

      <ChatWindowMessages
        chat={chat}
        onRetryMessage={onRetryMessage}
        isLoadingHistory={isLoadingHistory}
      />

      <ChatWindowSend onSendMessage={onSendMessage} />
    </div>
  );
}

export default ChatWindow;
