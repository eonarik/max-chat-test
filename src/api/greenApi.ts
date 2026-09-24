import axios, { type AxiosInstance } from "axios";

import type {
  Credentials,
  SendMessageResponse,
  ReceiveNotificationResponse,
  DeleteNotificationResponse,
} from "../types/greenApi";

const API_URL = "https://api.green-api.com";

export const createApiClient = (credentials: Credentials): AxiosInstance => {
  return axios.create({
    baseURL: `${API_URL}/waInstance${credentials.idInstance}`,
    params: {
      apiTokenInstance: credentials.apiTokenInstance,
    },
  });
};

export const sendMessage = async (
  client: AxiosInstance,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> => {
  try {
    const { data } = await client.post<SendMessageResponse>("/sendMessage", {
      chatId,
      message,
    });
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
): Promise<ReceiveNotificationResponse | null> => {
  try {
    const { data } = await client.get<ReceiveNotificationResponse>(
      "/receiveNotification",
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return null;
    }
    throw error;
  }
};

export const deleteNotification = async (
  client: AxiosInstance,
  receiptId: number,
): Promise<DeleteNotificationResponse> => {
  const { data } = await client.delete<DeleteNotificationResponse>(
    `/deleteNotification/${receiptId}`,
  );
  return data;
};
