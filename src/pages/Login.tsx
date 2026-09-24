import { useState, type SubmitEvent, type ChangeEvent } from "react";
import axios from "axios";
import { getStateInstance } from "@/api/greenApi";
import type { Credentials } from "@/types/greenApi";

interface LoginProps {
  onLogin: (credentials: Credentials) => void;
}

interface FormState {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

const DEFAULT_API_URL = "https://api.green-api.com";

const INITIAL_FORM: FormState = {
  apiUrl: DEFAULT_API_URL,
  idInstance: "",
  apiTokenInstance: "",
};

function Login({ onLogin }: LoginProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.trim() }));
    if (error) setError(null);
  };

  const validate = (): string | null => {
    if (!form.apiUrl) return "Укажите apiUrl";
    if (!/^https?:\/\/.+/.test(form.apiUrl))
      return "apiUrl должен начинаться с http:// или https://";
    if (!form.idInstance) return "Укажите idInstance";
    if (!/^\d+$/.test(form.idInstance))
      return "idInstance должен содержать только цифры";
    if (!form.apiTokenInstance) return "Укажите apiTokenInstance";
    return null;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credentials: Credentials = {
        apiUrl: form.apiUrl.replace(/\/$/, ""), // убираем слэш в конце, если есть
        idInstance: form.idInstance,
        apiTokenInstance: form.apiTokenInstance,
      };

      const { stateInstance } = await getStateInstance(credentials);

      if (stateInstance !== "authorized") {
        setError(`Инстанс не авторизован. Статус: ${stateInstance}`);
        return;
      }

      onLogin(credentials);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Неверный idInstance или apiTokenInstance");
        } else if (err.response?.status === 403) {
          setError("Доступ запрещён. Проверьте токен.");
        } else if (err.code === "ERR_NETWORK") {
          setError("Не удалось подключиться. Проверьте apiUrl.");
        } else {
          setError("Ошибка соединения с GREEN-API. Попробуйте позже.");
        }
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-teal-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
        noValidate
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Вход в GREEN-API
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Укажите данные из личного кабинета{" "}
          <a
            href="https://green-api.com/max"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 hover:underline"
          >
            green-api.com
          </a>
        </p>

        <div className="mb-4">
          <label
            htmlFor="apiUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            apiUrl
          </label>
          <input
            id="apiUrl"
            name="apiUrl"
            type="url"
            autoComplete="off"
            value={form.apiUrl}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            placeholder="https://api.green-api.com"
          />
          <p className="mt-1 text-xs text-gray-400">
            Для некоторых инстансов URL отличается (например,
            https://3100.api.green-api.com)
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="idInstance"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            idInstance
          </label>
          <input
            id="idInstance"
            name="idInstance"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={form.idInstance}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            placeholder=""
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="apiTokenInstance"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            apiTokenInstance
          </label>
          <input
            id="apiTokenInstance"
            name="apiTokenInstance"
            type="text"
            autoComplete="off"
            value={form.apiTokenInstance}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition disabled:bg-gray-100"
            placeholder=""
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Проверка...
            </>
          ) : (
            "Войти"
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Данные хранятся только в вашем браузере (localStorage).
        </p>
      </form>
    </div>
  );
}

export default Login;
