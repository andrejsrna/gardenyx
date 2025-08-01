export const TRACKING_CONFIG = {
  currency: 'EUR',
  defaultLanguage: 'sk',
  pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  
  events: {
    pageView: 'PageView',
    viewContent: 'ViewContent',
    addToCart: 'AddToCart',
    removeFromCart: 'RemoveFromCart',
    initiateCheckout: 'InitiateCheckout',
    addShippingInfo: 'AddShippingInfo',
    addPaymentInfo: 'AddPaymentInfo',
    purchase: 'Purchase',
    search: 'Search',
    viewCategory: 'ViewCategory',
    addToWishlist: 'AddToWishlist',
    lead: 'Lead',
    completeRegistration: 'CompleteRegistration',
  },

  customEvents: {
    productView: 'product_view',
    categoryView: 'category_view',
    searchPerformed: 'search_performed',
    newsletterSignup: 'newsletter_signup',
    contactForm: 'contact_form',
    reviewSubmitted: 'review_submitted',
    couponApplied: 'coupon_applied',
    freeShippingThreshold: 'free_shipping_threshold',
  },

  contentTypes: {
    product: 'product',
    category: 'product_group',
    search: 'search',
  },

  shippingTiers: {
    standard: 'standard',
    express: 'express',
    free: 'free',
  },

  paymentTypes: {
    card: 'card',
    cash: 'cash',
    bankTransfer: 'bank_transfer',
  },
};

export const TRACKING_HELPERS = {
  formatPrice: (price: number): number => {
    return Math.round(price * 100) / 100;
  },

  getProductCategory: (categories: Array<{ name: string }>): string => {
    return categories?.[0]?.name || 'Uncategorized';
  },

  getProductVariant: (attributes: Array<{ option: string }>): string => {
    return attributes?.[0]?.option || '';
  },

  calculateDiscount: (regularPrice: number, salePrice: number): number => {
    if (!regularPrice || !salePrice) return 0;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  },

  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  },

  getDeviceType: (): string => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 768 ? 'mobile' : 
           window.innerWidth < 1024 ? 'tablet' : 'desktop';
  },
}; 