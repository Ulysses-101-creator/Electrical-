/**
 * Access/refresh token storage.
 *
 * Access tokens are short-lived (15 min) and kept in memory only, to reduce
 * XSS exfiltration surface. Refresh tokens are longer-lived and persisted to
 * localStorage so a returning user isn't forced to log in on every visit —
 * this is a pragmatic V1 tradeoff; a future phase can move to an httpOnly
 * cookie-based refresh flow for stronger protection.
 */

const REFRESH_TOKEN_KEY = "eq_refresh_token";

let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },
  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string | null): void {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },
  clear(): void {
    inMemoryAccessToken = null;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
