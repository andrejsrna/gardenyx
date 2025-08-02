import { event as gtagEvent } from '../components/GoogleAnalytics';
import { sendFacebookConversionEvent, hashUserData } from './facebook-conversion';
import { PIXEL_ID } from '../components/FacebookPixel';

// Dynamic import to avoid SSR issues - fire and forget to keep functions sync
const trackFbEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  
  import('../components/FacebookPixel')
    .then(({ trackFbEvent: fbTracker }) => fbTracker(eventName, params))
    .catch(error => console.error('Error importing Facebook Pixel tracker:', error));
};

// Track event with both client-side pixel and server-side conversion API
const trackFbEventWithConversionAPI = async (
  eventName: string, 
  params?: Record<string, unknown>,
  userData?: Record<string, unknown>
) => {
  // Client-side pixel tracking (immediate)
  trackFbEvent(eventName, params);
  
  // Server-side conversion API (for better reliability)
  if (userData) {
    const hashedUserData = hashUserData(userData);
    await sendFacebookConversionEvent(eventName, params || {}, hashedUserData, PIXEL_ID);
  } else {
    await sendFacebookConversionEvent(eventName, params || {}, {}, PIXEL_ID);
  }
};

interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  variant?: string;
}



export const tracking = {
  viewContent: (product: Product) => {
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

    trackFbEvent('ViewContent', fbParams);
    gtagEvent('view_item', gaParams);
  },

  addToCart: (product: Product) => {
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

    trackFbEvent('AddToCart', fbParams);
    gtagEvent('add_to_cart', gaParams);
  },

  removeFromCart: (product: Product) => {
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

    trackFbEvent('RemoveFromCart', fbParams);
    gtagEvent('remove_from_cart', gaParams);
  },

  initiateCheckout: (products: Product[], totalValue: number) => {
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

    trackFbEvent('InitiateCheckout', fbParams);
    gtagEvent('begin_checkout', gaParams);
  },

  addShippingInfo: (products: Product[], totalValue: number, shippingTier: string) => {
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

    trackFbEvent('AddShippingInfo', fbParams);
    gtagEvent('add_shipping_info', gaParams);
  },

  addPaymentInfo: (products: Product[], totalValue: number, paymentType: string) => {
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

    trackFbEvent('AddPaymentInfo', fbParams);
    gtagEvent('add_payment_info', gaParams);
  },

  purchase: (orderId: string, products: Product[], totalValue: number, tax?: number, shipping?: number) => {
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
      // Enhanced metadata for better tracking
      event_source_url: window.location.href,
      content_type: 'product',
      ...(typeof window !== 'undefined' && typeof window.fbq === 'function' && {
        external_id: 'order_' + orderId,
      })
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

    trackFbEvent('Purchase', fbParams);
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

  search: (searchTerm: string, resultsCount?: number) => {
    const fbParams = {
      search_string: searchTerm,
      content_category: 'search',
    };

    const gaParams = {
      search_term: searchTerm,
      results_count: resultsCount,
    };

    trackFbEvent('Search', fbParams);
    gtagEvent('search', gaParams);
  },

  viewCategory: (categoryName: string, products?: Product[]) => {
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

    trackFbEvent('ViewCategory', fbParams);
    gtagEvent('view_item_list', gaParams);
  },

  addToWishlist: (product: Product) => {
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

    trackFbEvent('AddToWishlist', fbParams);
    gtagEvent('add_to_wishlist', gaParams);
  },

  lead: (formName: string, value?: number) => {
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


    trackFbEvent('Lead', fbParams);
    gtagEvent('generate_lead', gaParams);
  },

  completeRegistration: (method: string) => {
    const fbParams = {
      content_name: 'registration',
      status: true,
      registration_source: method,
    };

    const gaParams = {
      method: method,
    };

    trackFbEvent('CompleteRegistration', fbParams);
    gtagEvent('sign_up', gaParams);
  },

  custom: (eventName: string, params?: Record<string, unknown>) => {
    trackFbEvent(eventName, params || {});
    gtagEvent(eventName, params || {});
  },
};
