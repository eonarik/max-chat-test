import type { Credentials } from "../types/greenApi";

interface LoginProps {
  onLogin: (credentials: Credentials) => void;
}

function Login({ onLogin }: LoginProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Вход в GREEN-API</h1>
        <p className="text-gray-500">Форма будет здесь</p>
      </div>
    </div>
  );
}

export default Login;
