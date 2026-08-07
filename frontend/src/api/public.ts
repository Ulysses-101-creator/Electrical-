import { apiClient } from "@/api/client";
import type { PublicQuote } from "@/types";

export const publicApi = {
  async getPublicQuote(shareId: string): Promise<{ quote: PublicQuote }> {
    const { data } = await apiClient.get<{ quote: PublicQuote }>(
      `/public/quotes/${shareId}`
    );
    return data;
  },

  // Add other public endpoints here as needed
  // All endpoints should be relative to the baseURL from client.ts
};
