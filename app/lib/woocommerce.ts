import type { WooCommerceProduct } from '../lib/wordpress'; // Import the type
import { getCsrfToken } from './utils/csrf'; // Assuming CSRF protection might be needed for POST/PUT

// Base path for the WooCommerce API proxy
const WOO_API_BASE_URL = '/api/woocommerce';

// --- Type Definitions ---

// Define a more detailed Billing Info type based on common WooCommerce fields
interface BillingInfo {
  first_name: string;
  last_name: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string; // Typically 2-letter code e.g., 'SK'
  email: string;
  phone?: string;
  ic?: string;
  dic?: string;
  dic_dph?: string;
}

// Define a more detailed Shipping Info type
interface ShippingInfo {
  first_name: string;
  last_name: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string; // Typically 2-letter code
}

// Interface for line items in an order
interface OrderLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number; // Optional: For variable products
  // Add other fields if needed, e.g., price, total, tax_class
}

// Interface for metadata entries
interface MetaData {
  key: string;
  value: string;
}

// Define a base structure for WooCommerce Order data
// Use Partial for fields that might not always be present or are optional on update
interface WooCommerceOrderBase {
  customer_id?: number;
  billing?: Partial<BillingInfo>;
  shipping?: Partial<ShippingInfo>;
  payment_method?: string;
  payment_method_title?: string;
  line_items?: OrderLineItem[];
  meta_data?: MetaData[];
  status?: string; // e.g., 'pending', 'processing', 'completed'
  customer_note?: string;
  // shipping_lines?: Array<{ method_id: string; method_title: string; total: string; total_tax?: string; taxes?: Array<unknown> }>; // Add if needed
}

// Specific type for data required when creating an order
export interface CreateOrderData extends Omit<WooCommerceOrderBase, 'billing' | 'shipping' | 'line_items' | 'meta_data'> {
  billing: BillingInfo; // Make required fields non-partial
  shipping: ShippingInfo;
  payment_method: string; // Make required
  payment_method_title: string; // Make required
  line_items: OrderLineItem[]; // Make required
  meta_data?: MetaData[]; // Optional but often used
  create_account?: boolean; // Custom field potentially handled by API route
  account_password?: string; // Custom field
}

// Type for data used when updating an order (most fields are optional)
export type UpdateOrderData = WooCommerceOrderBase;

// Type for parameters used in getProducts
interface GetProductsParams {
  include?: string; // Comma-separated string of IDs
  slug?: string;
  type?: 'simple' | 'variable' | 'grouped' | 'external';
  status?: 'any' | 'draft' | 'pending' | 'private' | 'publish';
  category?: string; // Category ID
  tag?: string; // Tag ID
  sku?: string;
  featured?: boolean;
  on_sale?: boolean;
  per_page?: number;
  page?: number;
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'modified' | 'rand' | 'menu_order' | 'price' | 'popularity' | 'rating';
  order?: 'asc' | 'desc';
  // Add other valid WooCommerce API parameters as needed
}

// --- API Error Handling ---

// Custom error class for API errors
class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// --- Core API Fetch Function ---

/**
 * Generic function to handle fetch requests to the WooCommerce API proxy.
 * Includes error handling and optional CSRF token for mutating requests.
 * @param endpoint - The API endpoint (e.g., '/products', '/orders/123')
 * @param options - Fetch options (method, headers, body)
 * @param isMutation - Set to true for POST, PUT, DELETE to include CSRF token
 * @returns Promise<T> - The parsed JSON response
 * @throws {ApiError} - If the API request fails
 */
async function fetchWooApi<T>(endpoint: string, options: RequestInit = {}, isMutation: boolean = false): Promise<T> {
  const url = `${WOO_API_BASE_URL}${endpoint}`;
  // Explicitly type headers to allow string index signature
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>, // Cast options.headers too for consistency
  };

  if (isMutation) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    // Consider adding other security headers if needed
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Try to parse error details from response
      } catch {
        // Ignore if response body is not valid JSON or empty
      }
      throw new ApiError(
        errorData?.message || `API request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    // Handle cases with no content (e.g., successful DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T; // Or return a specific success indicator if preferred
    }

    return await response.json() as T;
  } catch (error) {
    // Log the error or handle it as needed
    console.error(`WooCommerce API Error (${options.method || 'GET'} ${endpoint}):`, error);

    // Instead of rethrowing, create a new ApiError with context
    if (error instanceof ApiError) {
      return Promise.reject(error);
    }

    // Create a new ApiError with the original error message
    const apiError = new ApiError(
      error instanceof Error ? error.message : 'An unknown API error occurred',
      0,
      error
    );
    return Promise.reject(apiError);
  }
}

// --- Specific API Functions ---

/**
 * Fetches a single product by its ID.
 */
export const getProduct = (id: number): Promise<WooCommerceProduct> => {
  // Assuming WooCommerceProduct is the correct type for a single product
  return fetchWooApi<WooCommerceProduct>(`/products/${id}`);
};

/**
 * Fetches a list of products based on query parameters.
 */
export const getProducts = (params?: GetProductsParams): Promise<WooCommerceProduct[]> => {
  const queryString = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return fetchWooApi<WooCommerceProduct[]>(`/products${queryString ? `?${queryString}` : ''}`);
};

/**
 * Creates a new WooCommerce order.
 */
export const createOrder = (orderData: CreateOrderData): Promise<{ order: WooCommerceOrderBase & { id: number } }> => {
  // The API might return the full order object including the ID upon creation
  return fetchWooApi<{ order: WooCommerceOrderBase & { id: number } }>(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify(orderData),
    },
    true // This is a mutation
  );
};

/**
 * Updates an existing WooCommerce order.
 */
export const updateOrder = (orderId: number, data: UpdateOrderData): Promise<WooCommerceOrderBase & { id: number }> => {
  // The API typically returns the updated order object
  return fetchWooApi<WooCommerceOrderBase & { id: number }>(
    `/orders/${orderId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true // This is a mutation
  );
};

// Example of a DELETE request if needed
// export const deleteOrder = (orderId: number): Promise<void> => {
//   return fetchWooApi<void>(`/orders/${orderId}`, { method: 'DELETE' }, true);
// };
