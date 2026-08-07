import { apiClient } from "@/api/client";
import type { PublicQuote } from "@/types";

export interface PublicQuoteRespondPayload {
  response: "accepted" | "declined";
}

export const publicQuoteApi = {
  async get(shareToken: string): Promise<PublicQuote> {
    const { data } = await apiClient.get<PublicQuote>(
      `/public/quotes/${shareToken}`
    );
    return data;
  },

  async respond(
    shareToken: string,
    response: "accepted" | "declined"
  ): Promise<PublicQuote> {
    const { data } = await apiClient.post<PublicQuote>(
      `/public/quotes/${shareToken}/respond`,
      { response }
    );
    return data;
  },
};
