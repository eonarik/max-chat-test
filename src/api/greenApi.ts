// src/api/greenApi.ts
import axios, { type AxiosInstance } from "axios";
import type {
  Credentials,
  SendMessageResponse,
  ReceiveNotificationResponse,
  DeleteNotificationResponse,
  GetStateInstanceResponse,
  GreenApiChat,
  ChatHistoryItem,
} from "../types/greenApi";

export const createApiClient = (credentials: Credentials): AxiosInstance => {
  return axios.create({
    baseURL: `/green-api/waInstance${credentials.idInstance}`,
  });
};

/**
 * Проверка валидности токенов.
 * GET /waInstance{id}/getStateInstance/{token}
 */
export const getStateInstance = async (
  credentials: Credentials,
): Promise<GetStateInstanceResponse> => {
  const client = createApiClient(credentials);
  const { data } = await client.get<GetStateInstanceResponse>(
    `/getStateInstance/${credentials.apiTokenInstance}`,
  );
  return data;
};

/**
 * Отправка текстового сообщения.
 * POST /waInstance{id}/sendMessage/{token}
 */
export const sendMessage = async (
  client: AxiosInstance,
  apiTokenInstance: string,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> => {
  try {
    const { data } = await client.post<SendMessageResponse>(
      `/sendMessage/${apiTokenInstance}`,
      { chatId, message },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Ошибка отправки:", error.response?.data);
    }
    throw error;
  }
};

/**
 * Получение входящих уведомлений (Long Polling).
 * GET /waInstance{id}/receiveNotification/{token}
 */
export const receiveNotification = async (
  client: AxiosInstance,
  apiTokenInstance: string,
): Promise<ReceiveNotificationResponse | null> => {
  try {
    const { data } = await client.get<ReceiveNotificationResponse>(
      `/receiveNotification/${apiTokenInstance}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      // Очередь пуста — норма для Long Polling
      return null;
    }
    throw error;
  }
};

/**
 * Удаление уведомления из очереди.
 * DELETE /waInstance{id}/deleteNotification/{receiptId}/{token}
 */
export const deleteNotification = async (
  client: AxiosInstance,
  apiTokenInstance: string,
  receiptId: number,
): Promise<DeleteNotificationResponse> => {
  const { data } = await client.delete<DeleteNotificationResponse>(
    `/deleteNotification/${receiptId}/${apiTokenInstance}`,
  );
  return data;
};

/**
 * Получение списка чатов.
 * GET /waInstance{id}/getChats/{token}
 */
export const getChats = async (
  client: AxiosInstance,
  apiTokenInstance: string,
): Promise<GreenApiChat[]> => {
  const { data } = await client.get<GreenApiChat[]>(
    `/getChats/${apiTokenInstance}`,
  );
  return data;
};

/**
 * Получение истории сообщений чата.
 * POST /waInstance{id}/getChatHistory/{token}
 */
export const getChatHistory = async (
  client: AxiosInstance,
  apiTokenInstance: string,
  chatId: string,
  count: number = 50,
): Promise<ChatHistoryItem[]> => {
  const { data } = await client.post<ChatHistoryItem[]>(
    `/getChatHistory/${apiTokenInstance}`,
    { chatId, count },
  );
  return data;
};
