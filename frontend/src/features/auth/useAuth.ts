import { useCallback } from "react";

import { authApi } from "@/api/auth";
import { tokenStorage } from "@/lib/tokenStorage";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { user, isAuthenticated, isInitializing, setUser } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      tokenStorage.setAccessToken(response.access_token);
      tokenStorage.setRefreshToken(response.refresh_token);
      setUser(response.user);
      return response.user;
    },
    [setUser],
  );

  const register = useCallback(
    async (payload: {
      email?: string;
      phone?: string;
      password?: string;
      business_name: string;
    }) => {
      const response = await authApi.register(payload);
      tokenStorage.setAccessToken(response.access_token);
      tokenStorage.setRefreshToken(response.refresh_token);
      setUser(response.user);
      return response.user;
    },
    [setUser],
  );

  const verifyOtp = useCallback(
    async (phone: string, code: string) => {
      const response = await authApi.verifyOtp(phone, code);
      tokenStorage.setAccessToken(response.access_token);
      tokenStorage.setRefreshToken(response.refresh_token);
      setUser(response.user);
      return response.user;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Best-effort: clear local state regardless of server response.
      }
    }
    tokenStorage.clear();
    setUser(null);
  }, [setUser]);

  return { user, isAuthenticated, isInitializing, login, register, verifyOtp, logout };
}
