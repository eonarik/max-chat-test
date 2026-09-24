import { useState, type SubmitEvent, type ChangeEvent } from "react";
import type { Chat } from "@/types/greenApi";
import type { CreateChatResult } from "@/hooks/useChats";
import { extractPhone, formatTime } from "@/utils/format";

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
  const [phone, setPhone] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const cleanPhone = phone.replace(/\D/g, "");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (formError) setFormError(null);
  };

  const handleCreate = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasLetters = /[a-zA-Zа-яА-Я]/.test(phone);
    if (hasLetters) {
      setFormError("Номер не должен содержать буквы");
      return;
    }

    const result = onCreateChat(phone);
    if (!result.ok) {
      setFormError(result.error ?? "Не удалось создать чат");
      return;
    }
    setPhone("");
    setFormError(null);
    setShowNewChat(false);
  };

  const handleToggleForm = () => {
    setShowNewChat((s) => !s);
    setPhone("");
    setFormError(null);
  };

  const displayName = (chat: Chat) => chat.name || `+${extractPhone(chat.id)}`;

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Чаты</h2>
        <div className="flex gap-1">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors disabled:opacity-40"
            title="Обновить список"
          >
            ↻
          </button>
          <button
            onClick={handleToggleForm}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors text-lg leading-none"
            title={showNewChat ? "Отменить" : "Новый чат"}
          >
            {showNewChat ? "×" : "+"}
          </button>
        </div>
      </div>

      {showNewChat && (
        <form
          onSubmit={handleCreate}
          className="p-3 border-b border-gray-200 bg-gray-50"
        >
          <label className="block text-xs text-gray-500 mb-1">
            Номер телефона получателя
          </label>
          <input
            type="tel"
            autoFocus
            value={phone}
            onChange={handleChange}
            placeholder="+7 999 123-45-67"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
          {formError && (
            <p className="mt-1 text-xs text-red-600">{formError}</p>
          )}
          <button
            type="submit"
            disabled={cleanPhone.length < 10}
            className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg transition-colors"
          >
            Создать чат
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        {error && (
          <p className="p-3 text-xs text-red-600 bg-red-50 border-b border-red-100">
            {error}
          </p>
        )}
        {isLoading && chats.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">Загрузка...</p>
        ) : chats.length === 0 ? (
          <p className="p-4 text-sm text-gray-400 text-center">
            Нет чатов. Нажмите «+», чтобы начать.
          </p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                activeChatId === chat.id ? "bg-emerald-50" : ""
              }`}
            >
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-gray-800 text-sm truncate">
                  {displayName(chat)}
                </span>
                {chat.lastActivity && (
                  <span className="text-xs text-gray-400 ml-2 shrink-0">
                    {formatTime(chat.lastActivity)}
                  </span>
                )}
              </div>
              {chat.lastMessage && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {chat.lastMessage}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full text-sm text-gray-500 hover:text-red-600 py-2 transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
