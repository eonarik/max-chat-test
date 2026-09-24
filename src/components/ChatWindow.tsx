import { useState, useEffect, useRef, type SubmitEvent } from "react";
import type { Chat, ChatMessage } from "@/types/greenApi";
import { extractPhone, formatTime } from "@/utils/format";

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
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  const handleSend = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText("");
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Выберите чат или создайте новый</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">
          {chat.name || `+${extractPhone(chat.id)}`}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {isLoadingHistory ? (
          <p className="text-center text-sm text-gray-400 mt-8">
            Загрузка истории...
          </p>
        ) : chat.messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">
            Сообщений пока нет. Напишите первым!
          </p>
        ) : (
          chat.messages.map((msg) => {
            const hasError = msg.status === "error";

            return (
              <div
                key={msg.id}
                className={`flex ${msg.isOutgoing ? "justify-end" : "justify-start"}`}
              >
                <div
                  onClick={hasError ? () => onRetryMessage(msg) : undefined}
                  title={hasError ? "Нажмите, чтобы повторить" : undefined}
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.isOutgoing
                      ? hasError
                        ? "bg-red-500 text-white rounded-br-sm cursor-pointer"
                        : "bg-emerald-500 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                      msg.isOutgoing
                        ? hasError
                          ? "text-red-100"
                          : "text-emerald-100"
                        : "text-gray-400"
                    }`}
                  >
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.isOutgoing && <span>{hasError ? "✕" : "✓"}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-gray-200 flex gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
