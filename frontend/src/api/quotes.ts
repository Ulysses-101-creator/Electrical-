import { apiClient } from "@/api/client";
import type {
  AISuggestedItem,
  PaginatedResponse,
  Quote,
  QuoteDetail,
  QuoteItem,
  QuoteItemCategory,
  QuotePhoto,
} from "@/types";

export interface QuoteItemPayload {
  description: string;
  category: QuoteItemCategory;
  quantity: number;
  unit_price: number;
}

interface QuoteTotals {
  subtotal: string;
  tax_amount: string;
  total: string;
}

export const quotesApi = {
  async list(params?: {
    status?: string;
    customer_id?: string;
    date_from?: string;
    date_to?: string;
    cursor?: string;
  }): Promise<PaginatedResponse<Quote>> {
    const { data } = await apiClient.get<PaginatedResponse<Quote>>("/quotes", { params });
    return data;
  },

  async create(payload: { customer_id: string; job_description_input?: string }): Promise<Quote> {
    const { data } = await apiClient.post<Quote>("/quotes", payload);
    return data;
  },

  async get(id: string): Promise<QuoteDetail> {
    const { data } = await apiClient.get<QuoteDetail>(`/quotes/${id}`);
    return data;
  },

  async update(
    id: string,
    payload: Partial<{
      notes: string;
      valid_until: string;
      material_markup_pct: number;
      tax_rate: number;
      status: string;
    }>,
    force = false,
  ): Promise<Quote> {
    const { data } = await apiClient.patch<Quote>(`/quotes/${id}`, payload, {
      params: { force },
    });
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/quotes/${id}`);
  },

  async duplicate(id: string): Promise<Quote> {
    const { data } = await apiClient.post<Quote>(`/quotes/${id}/duplicate`);
    return data;
  },

  async addItem(
    quoteId: string,
    payload: QuoteItemPayload,
  ): Promise<{ item: QuoteItem; quote_totals: QuoteTotals }> {
    const { data } = await apiClient.post<{ item: QuoteItem; quote_totals: QuoteTotals }>(
      `/quotes/${quoteId}/items`,
      payload,
    );
    return data;
  },

  async updateItem(
    quoteId: string,
    itemId: string,
    payload: Partial<QuoteItemPayload & { sort_order: number }>,
  ): Promise<{ item: QuoteItem; quote_totals: QuoteTotals }> {
    const { data } = await apiClient.patch<{ item: QuoteItem; quote_totals: QuoteTotals }>(
      `/quotes/${quoteId}/items/${itemId}`,
      payload,
    );
    return data;
  },

  async deleteItem(quoteId: string, itemId: string): Promise<{ quote_totals: QuoteTotals }> {
    const { data } = await apiClient.delete<{ quote_totals: QuoteTotals }>(
      `/quotes/${quoteId}/items/${itemId}`,
    );
    return data;
  },

  async uploadPhoto(quoteId: string, file: File): Promise<QuotePhoto> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<QuotePhoto>(`/quotes/${quoteId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deletePhoto(quoteId: string, photoId: string): Promise<void> {
    await apiClient.delete(`/quotes/${quoteId}/photos/${photoId}`);
  },

  async generatePdf(quoteId: string): Promise<{ pdf_url: string; pdf_version: number }> {
    const { data } = await apiClient.post<{ pdf_url: string; pdf_version: number }>(
      `/quotes/${quoteId}/pdf`,
    );
    return data;
  },

  async send(
    quoteId: string,
    channel: "email" | "whatsapp" | "link_only",
  ): Promise<{ quote: Quote; share_url: string; whatsapp_link: string | null }> {
    const { data } = await apiClient.post<{
      quote: Quote;
      share_url: string;
      whatsapp_link: string | null;
    }>(`/quotes/${quoteId}/send`, { channel });
    return data;
  },

  async setStatus(quoteId: string, status: "accepted" | "declined"): Promise<Quote> {
    const { data } = await apiClient.post<Quote>(`/quotes/${quoteId}/status`, { status });
    return data;
  },
};

export const aiApi = {
  async suggestItems(jobDescription: string, quoteId?: string): Promise<AISuggestedItem[]> {
    const { data } = await apiClient.post<{ suggestions: AISuggestedItem[] }>(
      "/ai/suggest-items",
      { job_description: jobDescription, quote_id: quoteId },
    );
    return data.suggestions;
  },
};
