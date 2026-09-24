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
    baseURL: `${credentials.apiUrl}/waInstance${credentials.idInstance}`,
  });
};

export const getStateInstance = async (
  credentials: Credentials,
): Promise<GetStateInstanceResponse> => {
  const client = createApiClient(credentials);
  const { data } = await client.get<GetStateInstanceResponse>(
    `/getStateInstance/${credentials.apiTokenInstance}`,
  );
  return data;
};

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

export const deleteNotification = async (
  client: AxiosInstance,
  apiTokenInstance: string,
  receiptId: number,
): Promise<DeleteNotificationResponse> => {
  const { data } = await client.delete<DeleteNotificationResponse>(
    `/deleteNotification/${apiTokenInstance}/${receiptId}`,
  );
  return data;
};

export const getChats = async (
  client: AxiosInstance,
  apiTokenInstance: string,
): Promise<GreenApiChat[]> => {
  const { data } = await client.get<GreenApiChat[]>(
    `/getChats/${apiTokenInstance}`,
  );
  return data;
};

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

export const readChat = async (
  client: AxiosInstance,
  apiTokenInstance: string,
  chatId: string,
): Promise<{ setRead: boolean }> => {
  const { data } = await client.post<{ setRead: boolean }>(
    `/readChat/${apiTokenInstance}`,
    { chatId },
  );
  return data;
};
