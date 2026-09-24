import { useState, type FunctionComponent, type SubmitEvent } from "react";

interface ChatWindowSendProps {
  onSendMessage: (text: string) => void;
}

const ChatWindowSend: FunctionComponent<ChatWindowSendProps> = ({
  onSendMessage,
}) => {
  const [text, setText] = useState("");

  const handleSend = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={handleSend}
      className="px-4 py-3 flex items-center gap-2 bg-max-bg-light border-t border-gray-100"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите сообщение..."
        className="flex-1 h-10 px-4 rounded-full bg-max-bg-secondary text-detail text-max-text-primary placeholder:text-max-text-secondary focus:outline-none focus:ring-2 focus:ring-max-primary"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="w-10 h-10 rounded-full bg-max-primary hover:bg-max-primary-hover disabled:bg-gray-300 text-white flex items-center justify-center transition-colors"
      >
        <svg aria-hidden="true" width="20" height="20">
          <use href="#icon_send" />
        </svg>
      </button>
    </form>
  );
};

export default ChatWindowSend;
