import { apiClient } from "@/api/client";
import type { User } from "@/types";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const authApi = {
  async register(payload: {
    email?: string;
    phone?: string;
    password?: string;
    business_name: string;
  }): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async requestOtp(phone: string): Promise<void> {
    await apiClient.post("/auth/otp/request", { phone });
  },

  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>("/auth/otp/verify", { phone, code });
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refresh_token: refreshToken });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/password/forgot", { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/password/reset", { token, new_password: newPassword });
  },
};
