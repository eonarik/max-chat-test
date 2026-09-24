import type { FunctionComponent } from "react";

interface ChatWindowFallbackProps {}

const ChatWindowFallback: FunctionComponent<ChatWindowFallbackProps> = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-max-bg-secondary">
      <p className="text-max-text-secondary text-detail">
        Выберите чат или создайте новый
      </p>
    </div>
  );
};

export default ChatWindowFallback;
