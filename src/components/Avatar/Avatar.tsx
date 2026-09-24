import type { Chat } from "@/types/greenApi";
import { getAvatarData } from "@/utils/avatar";

interface AvatarProps {
  chat: Chat;
  size?: number;
}

const Avatar = ({ chat, size = 56 }: AvatarProps) => {
  const data = getAvatarData(chat);

  if (data.type === "icon") {
    return (
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          background: data.bgColor,
        }}
      >
        <svg
          aria-hidden="true"
          width={size * 0.55}
          height={size * 0.55}
          className="text-white"
        >
          <use href={`#${data.iconId}`} />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-white font-semibold select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${data.gradient![0]}, ${data.gradient![1]})`,
        fontSize: size * 0.4,
      }}
    >
      {data.letter}
    </div>
  );
};

export default Avatar;
