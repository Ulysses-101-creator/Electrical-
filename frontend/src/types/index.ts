/**
 * Shared domain types, mirroring the backend Pydantic schemas
 * (see backend/app/schemas/*.py). Keep these in sync manually in V1;
 * a generated-client approach can replace this file in a later phase.
 */

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type QuoteItemCategory = "labor" | "material" | "callout" | "other";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  business_name: string;
  logo_url: string | null;
  default_labor_rate: string;
  default_callout_fee: string;
  default_tax_rate: string;
  default_material_markup_pct: string;
  email_verified: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  category: QuoteItemCategory;
  quantity: string;
  unit_price: string;
  sort_order: number;
  is_ai_generated: boolean;
}

export interface QuotePhoto {
  id: string;
  storage_url: string;
  sort_order: number;
}

export interface Quote {
  id: string;
  customer_id: string;
  status: QuoteStatus;
  share_token: string;
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  material_markup_pct: string;
  total: string;
  notes: string | null;
  valid_until: string | null;
  job_description_input: string | null;
  pdf_url: string | null;
  pdf_version: number;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteDetail {
  quote: Quote;
  items: QuoteItem[];
  photos: QuotePhoto[];
}

export interface QuoteSummary {
  id: string;
  status: QuoteStatus;
  total: string;
  created_at: string;
  valid_until: string | null;
}

export interface AISuggestedItem {
  description: string;
  category: QuoteItemCategory;
  quantity: string;
  unit_price: string;
  confidence: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    field_errors: { field: string; issue: string }[];
  };
}
