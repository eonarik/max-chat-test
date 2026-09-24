import type { AxiosInstance } from "axios";
import type { Credentials } from "../types/greenApi";

interface ChatProps {
  apiClient: AxiosInstance;
  credentials: Credentials;
  onLogout: () => void;
}

function Chat({ apiClient, credentials, onLogout }: ChatProps) {
  return (
    <div className="flex h-full">
      <div className="w-1/3 bg-white border-r">Сайдбар</div>
      <div className="flex-1 bg-gray-50">Чат</div>
    </div>
  );
}

export default Chat;
