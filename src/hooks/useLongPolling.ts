import { useEffect, useRef } from "react";
import type { AxiosInstance } from "axios";
import { receiveNotification, deleteNotification } from "@/api/greenApi";
import type { ReceiveNotificationResponse } from "@/types/greenApi";

interface UseLongPollingOptions {
  apiClient: AxiosInstance | null;
  apiTokenInstance: string;
  enabled: boolean;
  onNotification: (notification: ReceiveNotificationResponse) => void;
}

/** Минимальный интервал между запросами (мс) */
const MIN_INTERVAL_MS = 1500;
/** Пауза при ошибке (мс) */
const ERROR_DELAY_MS = 3000;

export const useLongPolling = ({
  apiClient,
  apiTokenInstance,
  enabled,
  onNotification,
}: UseLongPollingOptions) => {
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled || !apiClient) return;

    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise((resolve) => {
        const timer = setTimeout(resolve, ms);
        // очистка таймера при отмене
        if (cancelled) clearTimeout(timer);
      });

    const poll = async () => {
      while (!cancelled) {
        const startedAt = Date.now();

        try {
          const notification = await receiveNotification(
            apiClient,
            apiTokenInstance,
          );

          if (cancelled) break;

          if (notification) {
            onNotificationRef.current(notification);
            try {
              await deleteNotification(
                apiClient,
                apiTokenInstance,
                notification.receiptId,
              );
            } catch (err) {
              console.error("Ошибка удаления уведомления:", err);
            }
          }
        } catch (err) {
          if (cancelled) break;
          console.error("Long polling error:", err);
          await sleep(ERROR_DELAY_MS);
          continue;
        }

        // Throttle: гарантируем минимальный интервал между запросами
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_INTERVAL_MS) {
          await sleep(MIN_INTERVAL_MS - elapsed);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [apiClient, apiTokenInstance, enabled]);
};
