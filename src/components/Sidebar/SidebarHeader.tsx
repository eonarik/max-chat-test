import type { CreateChatResult } from "@/hooks/useChats";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FunctionComponent,
  type SubmitEvent,
} from "react";

interface SidebarHeaderProps {
  isLoading: boolean;
  onCreateChat: (phone: string) => CreateChatResult;
  onRefresh: () => void;
}

const SidebarHeader: FunctionComponent<SidebarHeaderProps> = ({
  isLoading,
  onCreateChat,
  onRefresh,
}) => {
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const handleToggleForm = () => {
    setShowNewChat((s) => !s);
    setPhone("");
    setFormError(null);
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (formError) setFormError(null);
  };

  const cleanPhone = useMemo(() => phone.replace(/\D/g, ""), [phone]);

  return (
    <>
      <div className="h-14 px-4 flex items-center justify-between shrink-0">
        <h2 className="text-xl font-semibold text-max-text-primary">Чаты</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-max-text-secondary hover:bg-gray-100 transition-colors disabled:opacity-40"
            title="Обновить список"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              className={isLoading ? "animate-spin" : ""}
            >
              <use href="#icon_redo" />
            </svg>
          </button>
          <button
            onClick={handleToggleForm}
            className="w-8 h-8 rounded-full bg-max-primary hover:bg-max-primary-hover text-white flex items-center justify-center transition-colors"
            title={showNewChat ? "Отменить" : "Новый чат"}
          >
            <svg aria-hidden="true" width="20" height="20">
              <use href={showNewChat ? "#icon_cross_mini" : "#icon_plus"} />
            </svg>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="px-3 pb-3 border-b border-gray-100"
      >
        <label className="block text-xs text-max-text-secondary mb-1">
          Номер телефона получателя
        </label>
        <input
          type="tel"
          autoFocus
          value={phone}
          onChange={handleChange}
          placeholder="+7 999 123-45-67"
          className="w-full px-3 py-2 rounded-lg bg-max-bg-secondary text-detail text-max-text-primary placeholder:text-max-text-secondary focus:outline-none focus:ring-2 focus:ring-max-primary"
        />
        {formError && (
          <p className="mt-1 text-xs text-max-error">{formError}</p>
        )}
        <button
          type="submit"
          disabled={cleanPhone.length < 10}
          className="mt-2 w-full py-2 rounded-lg text-detail font-medium bg-max-primary hover:bg-max-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
        >
          Создать чат
        </button>
      </form>
    </>
  );
};

export default SidebarHeader;
