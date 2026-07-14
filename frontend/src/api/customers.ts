import { apiClient } from "@/api/client";
import type { Customer, PaginatedResponse, QuoteSummary } from "@/types";

export interface CustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const customersApi = {
  async list(params?: {
    search?: string;
    is_archived?: boolean;
    cursor?: string;
  }): Promise<PaginatedResponse<Customer>> {
    const { data } = await apiClient.get<PaginatedResponse<Customer>>("/customers", { params });
    return data;
  },

  async create(payload: CustomerPayload): Promise<{ customer: Customer; duplicate_warning: boolean }> {
    const { data } = await apiClient.post<{ customer: Customer; duplicate_warning: boolean }>(
      "/customers",
      payload,
    );
    return data;
  },

  async get(id: string): Promise<{ customer: Customer; quotes: QuoteSummary[] }> {
    const { data } = await apiClient.get<{ customer: Customer; quotes: QuoteSummary[] }>(
      `/customers/${id}`,
    );
    return data;
  },

  async update(id: string, payload: Partial<CustomerPayload>): Promise<Customer> {
    const { data } = await apiClient.patch<Customer>(`/customers/${id}`, payload);
    return data;
  },

  async archive(id: string): Promise<Customer> {
    const { data } = await apiClient.post<Customer>(`/customers/${id}/archive`);
    return data;
  },
};
