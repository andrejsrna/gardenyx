import { getCsrfToken } from './utils/csrf';
import type { Product } from './content-types';

export interface OrderLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
  price?: number;
  total?: number;
  name?: string;
  sku?: string;
  image?: string;
  meta?: unknown;
}

export interface CreateOrderData {
  customer_id?: number;
  status?: string;
  billing: Record<string, unknown>;
  shipping: Record<string, unknown>;
  shipping_method: string;
  payment_method: string;
  payment_method_title?: string;
  meta_data?: Array<{ key: string; value: string }>;
  line_items: OrderLineItem[];
  shipping_lines?: Array<{ method_id: string; method_title: string; total: string; total_tax?: string; taxes?: Array<unknown> }>;
  total?: number | string;
  customer_note?: string;
  idempotency_key?: string;
}

const API_BASE_URL = '/api';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}, isMutation = false): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (isMutation) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const resp = await fetch(url, { ...options, headers });
  if (!resp.ok) {
    let message = `Request failed with status ${resp.status}`;
    try {
      const data = await resp.json();
      if (data?.error?.message) message = data.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (resp.status === 204) {
    return undefined as T;
  }
  return resp.json() as Promise<T>;
}

export const createOrder = (data: CreateOrderData) =>
  fetchApi<{ order: { id: string | number } }>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);

export const getProducts = (params?: Record<string, string>) => {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return fetchApi<Product[]>(`/products${qs}`);
};
