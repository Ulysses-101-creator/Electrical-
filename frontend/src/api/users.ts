import { apiClient } from "@/api/client";
import type { User } from "@/types";

export interface UserUpdatePayload {
  business_name?: string;
  default_labor_rate?: number;
  default_callout_fee?: number;
  default_tax_rate?: number;
  default_material_markup_pct?: number;
}

export const usersApi = {
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/users/me");
    return data;
  },

  async updateMe(payload: UserUpdatePayload): Promise<User> {
    const { data } = await apiClient.patch<User>("/users/me", payload);
    return data;
  },

  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{ logo_url: string }>("/users/me/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
