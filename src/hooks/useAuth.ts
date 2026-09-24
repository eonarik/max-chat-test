import { useState, useMemo, useCallback } from "react";
import type { AxiosInstance } from "axios";
import { createApiClient } from "../api/greenApi";
import type { Credentials } from "../types/greenApi";

const STORAGE_KEY = "green_api_credentials";

interface UseAuthReturn {
  isAuthenticated: boolean;
  credentials: Credentials | null;
  apiClient: AxiosInstance | null;
  login: (credentials: Credentials) => void;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Credentials) : null;
  });

  const apiClient = useMemo<AxiosInstance | null>(() => {
    if (!credentials) return null;
    return createApiClient(credentials);
  }, [credentials]);

  const login = useCallback((creds: Credentials) => {
    setCredentials(creds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
  }, []);

  const logout = useCallback(() => {
    setCredentials(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isAuthenticated: !!credentials,
    credentials,
    apiClient,
    login,
    logout,
  };
};
