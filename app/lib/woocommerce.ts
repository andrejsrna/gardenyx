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
export const createOrder = async (orderData: WooCommerceOrder) => {
  try {
    const response = await fetch('/api/woocommerce/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });

    if (!response.ok) {
      throw new Error(data.message || `Server responded with status ${response.status}`);
    }

    if (!data.order || !data.order.id) {
      throw new Error('Server returned invalid order data');
    }

    return data;
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Detailed error in createOrder:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });
    return { 
      error: {
        message: err.message || 'An error occurred while creating the order',
        details: err
      }
    };
  }
};
export const updateOrder = (orderId: number, data: Partial<WooCommerceOrder>) => wooApi.put(`/orders/${orderId}`, data); 