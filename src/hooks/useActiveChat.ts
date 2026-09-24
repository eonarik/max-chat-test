import { useCallback, useEffect, useState } from "react";

const HASH_PREFIX = "#/chat/";

const parseHash = (): string | null => {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  const id = hash.slice(HASH_PREFIX.length);
  return id || null;
};

export const useActiveChat = () => {
  const [activeChatId, setActiveChatIdState] = useState<string | null>(() =>
    parseHash(),
  );

  // Слушаем изменение hash (кнопки назад/вперёд в браузере)
  useEffect(() => {
    const onHashChange = () => {
      setActiveChatIdState(parseHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setActiveChatId = useCallback((chatId: string | null) => {
    if (chatId) {
      window.location.hash = `${HASH_PREFIX}${chatId}`;
    } else {
      // Убираем hash без перезагрузки
      history.pushState(
        "",
        document.title,
        window.location.pathname + window.location.search,
      );
      setActiveChatIdState(null);
    }
  }, []);

  return { activeChatId, setActiveChatId };
};
