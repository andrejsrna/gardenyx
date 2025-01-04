const WOO_API_BASE = '/api/woocommerce';

interface WooCommerceOrder {
  payment_method: string;
  payment_method_title: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address_1?: string;
    city?: string;
    postcode?: string;
  };
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

interface CreateOrderData extends WooCommerceOrder {
  meta_data: Array<{
    key: string;
    value: string;
  }>;
}

export const wooApi = {
  get: async (endpoint: string) => {
    const response = await fetch(`${WOO_API_BASE}${endpoint}`);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return response.json();
  },

  post: async <T>(endpoint: string, data: T) => {
    const response = await fetch(`${WOO_API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return response.json();
  },

  put: async <T>(endpoint: string, data: T) => {
    const response = await fetch(`${WOO_API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return response.json();
  }
};

// Specific API functions
export const getProduct = (id: number) => wooApi.get(`/products/${id}`);
export const getProducts = (params: string) => wooApi.get(`/products?${params}`);
export async function createOrder(orderData: CreateOrderData) {
  try {
    const response = await fetch('/api/woocommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
export const updateOrder = (orderId: number, data: Partial<WooCommerceOrder>) => wooApi.put(`/orders/${orderId}`, data); 