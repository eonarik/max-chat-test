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
  // Ref для колбэка, чтобы цикл не перезапускался при его изменении
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  // Защита от двойного запуска в StrictMode
  const isRunningRef = useRef(false);

  const deletedReceiptsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled || !apiClient) return;
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

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

            if (!deletedReceiptsRef.current.has(notification.receiptId)) {
              deletedReceiptsRef.current.add(notification.receiptId);
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
          }
        } catch (err) {
          if (cancelled) break;
          console.error("Long polling error:", err);
          await sleep(ERROR_DELAY_MS);
          continue;
        }

        // Throttle: даже если сервер ответил мгновенно — держим паузу
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_INTERVAL_MS) {
          await sleep(MIN_INTERVAL_MS - elapsed);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      isRunningRef.current = false;
    };
  }, [apiClient, apiTokenInstance, enabled]);
};
