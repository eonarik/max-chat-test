import type { FunctionComponent } from "react";
import type { ChatMessage } from "@/types/greenApi";
import { formatTime } from "@/utils/format";

interface ChatWindowMessageItemProps {
  msg: ChatMessage;
  onRetryMessage: (message: ChatMessage) => void;
}

const ChatWindowMessageItem: FunctionComponent<ChatWindowMessageItemProps> = ({
  msg,
  onRetryMessage,
}) => {
  const hasError = msg.status === "error";

  return (
    <div className={`flex ${msg.isOutgoing ? "justify-end" : "justify-start"}`}>
      <div
        onClick={hasError ? () => onRetryMessage(msg) : undefined}
        title={hasError ? "Нажмите, чтобы повторить" : undefined}
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
          msg.isOutgoing
            ? hasError
              ? "bg-max-error text-white rounded-br-md cursor-pointer"
              : "bg-max-primary text-white rounded-br-md"
            : "bg-max-bg-light text-max-text-primary rounded-bl-md shadow-sm"
        }`}
      >
        <p className="text-detail whitespace-pre-wrap break-words">
          {msg.text}
        </p>

        {/* Время + статус */}
        <div
          className={`flex items-center justify-end gap-1 mt-0.5 text-[11px] ${
            msg.isOutgoing
              ? hasError
                ? "text-red-100"
                : "text-white/70"
              : "text-max-text-secondary"
          }`}
        >
          <span>{formatTime(msg.timestamp)}</span>

          {msg.isOutgoing && (
            <span className="inline-flex items-center">
              {hasError ? (
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  className="text-red-100"
                >
                  <use href="#icon_warning_fill_color_mini" />
                </svg>
              ) : msg.status === "read" ? (
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  className="text-white"
                >
                  <use href="#icon_status_read" />
                </svg>
              ) : msg.status === "delivered" ? (
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  className="text-white"
                >
                  <use href="#icon_status_delivered" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  className="text-white/50"
                >
                  <use href="#icon_status_delivered" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindowMessageItem;
