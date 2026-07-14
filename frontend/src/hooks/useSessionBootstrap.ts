import { useEffect } from "react";

import { apiClient } from "@/api/client";
import { usersApi } from "@/api/users";
import { tokenStorage } from "@/lib/tokenStorage";
import { useAuthStore } from "@/stores/authStore";

/**
 * On app load, if a refresh token is present, attempt to obtain a fresh
 * access token and hydrate the current user. Runs once at the app root.
 */
export function useSessionBootstrap(): void {
  const { setUser, setInitializing } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        setInitializing(false);
        return;
      }

      try {
        const response = await apiClient.post<{ access_token: string; refresh_token: string }>(
          "/auth/refresh",
          { refresh_token: refreshToken },
        );
        tokenStorage.setAccessToken(response.data.access_token);
        tokenStorage.setRefreshToken(response.data.refresh_token);

        const user = await usersApi.getMe();
        if (!cancelled) setUser(user);
      } catch {
        tokenStorage.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    void bootstrap();

    function handleSessionExpired() {
      tokenStorage.clear();
      setUser(null);
    }
    window.addEventListener("eq:session-expired", handleSessionExpired);

    return () => {
      cancelled = true;
      window.removeEventListener("eq:session-expired", handleSessionExpired);
    };
  }, [setUser, setInitializing]);
}
