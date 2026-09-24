import { useState, useEffect, useRef, type SubmitEvent } from "react";
import type { Chat } from "@/types/greenApi";
import { extractPhone, formatTime } from "@/utils/format";

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (text: string) => void;
}

function ChatWindow({ chat, onSendMessage }: ChatWindowProps) {
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
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">
          {chat.name || `+${extractPhone(chat.id)}`}
        </h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {chat.messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">
            Сообщений пока нет. Напишите первым!
          </p>
        ) : (
          chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOutgoing ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.isOutgoing
                    ? "bg-emerald-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.text}
                </p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    msg.isOutgoing ? "text-emerald-100" : "text-gray-400"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
