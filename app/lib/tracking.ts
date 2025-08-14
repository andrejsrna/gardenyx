import { event as gtagEvent } from '../components/GoogleAnalytics';
import { fbq } from '../components/FacebookPixel';
import { sendFacebookConversionEvent, hashUserData } from './facebook-conversion';
import { getCookie } from 'cookies-next';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

// Track event with both client-side pixel and server-side conversion API
const trackFbEventWithConversionAPI = async (
  eventName: string, 
  params?: Record<string, unknown>,
  userData: Record<string, unknown> = {}
) => {
  if (!PIXEL_ID) {
    return;
  }

  // Prepare user data for Conversion API
  const fbp = getCookie('_fbp')?.toString();
  const fbc = getCookie('_fbc')?.toString();
  
  if (fbp) {
    userData.fbp = fbp;
  }

  if (fbc) {
    userData.fbc = fbc;
  }
  
  // Add external_id for better event deduplication
  const timestamp = Date.now();
  const eventParams = {
    ...params,
    external_id: `${eventName}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    event_id: `${eventName}_${timestamp}`,
  };
  
  // Track with both client-side pixel and server-side conversion API
  fbq('track', eventName, eventParams);
  const hashedUserData = hashUserData(userData);
  await sendFacebookConversionEvent(eventName, eventParams, hashedUserData, PIXEL_ID);
};

interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  variant?: string;
}

// Enhanced viewContent tracking with Conversion API
const viewContentWithConversionAPI = async (
  product: Product,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: product.name,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: product.price,
    currency: 'EUR',
    content_category: product.category,
    // Enhanced metadata for better Event Match Quality
    event_source_url: window.location.href,
    ...(typeof window !== 'undefined' && typeof window.fbq === 'function' && {
      external_id: 'user_' + Date.now(), // Unique user identifier
    })
  };

  const gaParams = {
    currency: 'EUR',
    value: product.price,
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
      item_category: product.category,
      item_variant: product.variant,
    }],
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('ViewContent', fbParams, userData);
  gtagEvent('view_item', gaParams);
};

// Enhanced addToCart tracking with Conversion API
const addToCartWithConversionAPI = async (
  product: Product,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: product.name,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: product.price * (product.quantity || 1),
    currency: 'EUR',
    content_category: product.category,
  };

  const gaParams = {
    currency: 'EUR',
    value: product.price * (product.quantity || 1),
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
      item_category: product.category,
      item_variant: product.variant,
    }],
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('AddToCart', fbParams, userData);
  gtagEvent('add_to_cart', gaParams);
}

// Enhanced removeFromCart tracking with Conversion API
const removeFromCartWithConversionAPI = async (
  product: Product,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: product.name,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: product.price * (product.quantity || 1),
    currency: 'EUR',
  };

  const gaParams = {
    currency: 'EUR',
    value: product.price * (product.quantity || 1),
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
    }],
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('RemoveFromCart', fbParams, userData);
  gtagEvent('remove_from_cart', gaParams);
}

// Enhanced initiateCheckout tracking with Conversion API
const initiateCheckoutWithConversionAPI = async (
  products: Product[],
  totalValue: number,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_ids: products.map(p => p.id.toString()),
    contents: products.map(p => ({ 
      id: p.id.toString(), 
      quantity: p.quantity || 1 
    })),
    value: totalValue,
    currency: 'EUR',
    num_items: products.length,
  };

  const gaParams = {
    currency: 'EUR',
    value: totalValue,
    items: products.map(p => ({
      item_id: p.id.toString(),
      item_name: p.name,
      price: p.price,
      quantity: p.quantity || 1,
      item_category: p.category,
    })),
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('InitiateCheckout', fbParams, userData);
  gtagEvent('begin_checkout', gaParams);
}

// Enhanced addShippingInfo tracking with Conversion API
const addShippingInfoWithConversionAPI = async (
  products: Product[],
  totalValue: number,
  shippingTier: string,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_ids: products.map(p => p.id.toString()),
    contents: products.map(p => ({ 
      id: p.id.toString(), 
      quantity: p.quantity || 1 
    })),
    value: totalValue,
    currency: 'EUR',
    shipping_tier: shippingTier,
  };

  const gaParams = {
    currency: 'EUR',
    value: totalValue,
    shipping_tier: shippingTier,
    items: products.map(p => ({
      item_id: p.id.toString(),
      item_name: p.name,
      price: p.price,
      quantity: p.quantity || 1,
    })),
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('AddShippingInfo', fbParams, userData);
  gtagEvent('add_shipping_info', gaParams);
}

// Enhanced addPaymentInfo tracking with Conversion API
const addPaymentInfoWithConversionAPI = async (
  products: Product[],
  totalValue: number,
  paymentType: string,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_ids: products.map(p => p.id.toString()),
    contents: products.map(p => ({ 
      id: p.id.toString(), 
      quantity: p.quantity || 1 
    })),
    value: totalValue,
    currency: 'EUR',
    payment_type: paymentType,
  };

  const gaParams = {
    currency: 'EUR',
    value: totalValue,
    payment_type: paymentType,
    items: products.map(p => ({
      item_id: p.id.toString(),
      item_name: p.name,
      price: p.price,
      quantity: p.quantity || 1,
    })),
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('AddPaymentInfo', fbParams, userData);
  gtagEvent('add_payment_info', gaParams);
}

// Enhanced search tracking with Conversion API
const searchWithConversionAPI = async (
  searchTerm: string,
  resultsCount?: number,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    search_string: searchTerm,
    content_category: 'search',
  };

  const gaParams = {
    search_term: searchTerm,
    results_count: resultsCount,
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('Search', fbParams, userData);
  gtagEvent('search', gaParams);
}

// Enhanced viewCategory tracking with Conversion API
const viewCategoryWithConversionAPI = async (
  categoryName: string,
  products?: Product[],
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: categoryName,
    content_category: categoryName,
    content_type: 'product_group',
    contents: products?.map(p => ({ 
      id: p.id.toString(), 
      quantity: 1 
    })),
  };

  const gaParams = {
    item_list_name: categoryName,
    items: products?.map(p => ({
      item_id: p.id.toString(),
      item_name: p.name,
      price: p.price,
      item_category: categoryName,
    })),
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('ViewCategory', fbParams, userData);
  gtagEvent('view_item_list', gaParams);
}

// Enhanced addToWishlist tracking with Conversion API
const addToWishlistWithConversionAPI = async (
  product: Product,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: product.name,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: product.price,
    currency: 'EUR',
  };

  const gaParams = {
    currency: 'EUR',
    value: product.price,
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      price: product.price,
      quantity: 1,
    }],
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('AddToWishlist', fbParams, userData);
  gtagEvent('add_to_wishlist', gaParams);
}

// Enhanced lead tracking with Conversion API
const leadWithConversionAPI = async (
  formName: string,
  value?: number,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: formName,
    value: value,
    currency: 'EUR',
  };

  const gaParams = {
    event_category: 'engagement',
    event_label: formName,
    value: value,
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('Lead', fbParams, userData);
  gtagEvent('generate_lead', gaParams);
}

// Enhanced completeRegistration tracking with Conversion API
const completeRegistrationWithConversionAPI = async (
  method: string,
  userData?: Record<string, unknown>
) => {
  const fbParams = {
    content_name: 'registration',
    status: true,
    registration_source: method,
  };

  const gaParams = {
    method: method,
  };

  // Track with both client-side pixel and server-side conversion API
  await trackFbEventWithConversionAPI('CompleteRegistration', fbParams, userData);
  gtagEvent('sign_up', gaParams);
}



export const tracking = {
  viewContent: viewContentWithConversionAPI,
  addToCart: addToCartWithConversionAPI,
  removeFromCart: removeFromCartWithConversionAPI,
  initiateCheckout: initiateCheckoutWithConversionAPI,
  addShippingInfo: addShippingInfoWithConversionAPI,
  addPaymentInfo: addPaymentInfoWithConversionAPI,
  search: searchWithConversionAPI,
  viewCategory: viewCategoryWithConversionAPI,
  addToWishlist: addToWishlistWithConversionAPI,
  lead: leadWithConversionAPI,
  completeRegistration: completeRegistrationWithConversionAPI,

  purchase: (orderId: string, products: Product[], totalValue: number, tax?: number, shipping?: number) => {
    const gaParams = {
      transaction_id: orderId,
      value: totalValue,
      currency: 'EUR',
      tax: tax,
      shipping: shipping,
      items: products.map(p => ({
        item_id: p.id.toString(),
        item_name: p.name,
        price: p.price,
        quantity: p.quantity || 1,
        item_category: p.category,
      })),
    };

    gtagEvent('purchase', gaParams);
  },

  // Enhanced purchase tracking with Conversion API
  purchaseWithConversionAPI: async (
    orderId: string, 
    products: Product[], 
    totalValue: number, 
    userData?: Record<string, unknown>,
    tax?: number, 
    shipping?: number
  ) => {
    const fbParams = {
      content_ids: products.map(p => p.id.toString()),
      contents: products.map(p => ({ 
        id: p.id.toString(), 
        quantity: p.quantity || 1 
      })),
      value: totalValue,
      currency: 'EUR',
      num_items: products.length,
      order_id: orderId,
      tax: tax,
      shipping: shipping,
      event_source_url: window.location.href,
      content_type: 'product',
    };

    const gaParams = {
      transaction_id: orderId,
      value: totalValue,
      currency: 'EUR',
      tax: tax,
      shipping: shipping,
      items: products.map(p => ({
        item_id: p.id.toString(),
        item_name: p.name,
        price: p.price,
        quantity: p.quantity || 1,
        item_category: p.category,
      })),
    };

    // Track with both client-side pixel and server-side conversion API
    await trackFbEventWithConversionAPI('Purchase', fbParams, userData);
    gtagEvent('purchase', gaParams);
  },

  custom: (eventName: string, params?: Record<string, unknown>) => {
    gtagEvent(eventName, params || {});
  },
};
