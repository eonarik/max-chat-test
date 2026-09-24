import { useEffect, useRef, type FunctionComponent } from "react";
import type { Chat, ChatMessage } from "@/types/greenApi";
import ChatWindowMessageItem from "./ChatWindowMessageItem";

interface ChatWindowMessagesProps {
  chat: Chat | null;
  onRetryMessage: (message: ChatMessage) => void;
  isLoadingHistory?: boolean;
}

const ChatWindowMessages: FunctionComponent<ChatWindowMessagesProps> = ({
  chat,
  onRetryMessage,
  isLoadingHistory,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
      {isLoadingHistory ? (
        <p className="text-center text-detail text-max-text-secondary mt-8">
          Загрузка истории...
        </p>
      ) : chat?.messages.length === 0 ? (
        <p className="text-center text-detail text-max-text-secondary mt-8">
          Сообщений пока нет. Напишите первым!
        </p>
      ) : (
        chat?.messages.map((msg) => (
          <ChatWindowMessageItem
            key={msg.id}
            msg={msg}
            onRetryMessage={onRetryMessage}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindowMessages;
