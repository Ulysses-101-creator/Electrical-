import axios from "axios";

import type { QuoteItem } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

// A dedicated, unauthenticated Axios instance: the public quote view must
// never attach an Authorization header or trigger the token-refresh flow.
const publicClient = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 });

export interface PublicQuote {
  business: { business_name: string; logo_url: string | null };
  customer_name: string;
  items: QuoteItem[];
  subtotal: string;
  tax_amount: string;
  total: string;
  valid_until: string | null;
  status: string;
  notes: string | null;
  expired: boolean;
}

export const publicQuoteApi = {
  async get(shareToken: string): Promise<PublicQuote> {
    const { data } = await publicClient.get<PublicQuote>(`/public/quotes/${shareToken}`);
    return data;
  },

  async respond(shareToken: string, response: "accepted" | "declined"): Promise<{ status: string }> {
    const { data } = await publicClient.post<{ status: string }>(
      `/public/quotes/${shareToken}/respond`,
      { response },
    );
    return data;
  },
};
