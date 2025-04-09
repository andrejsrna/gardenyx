// app/types/checkoutTypes.ts

// Note: AddressComponent might be specific to Google Places API usage in CheckoutClient
// Consider keeping it there unless needed elsewhere.
// export interface AddressComponent {
//   long_name: string;
//   short_name: string;
//   types: string[];
// }

export interface PacketaPoint {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
}

export type BillingInfo = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string; // Consider if state is actually used/needed for SK/CZ
  postcode: string;
  country: string;
  email: string;
  phone: string;
  ic?: string;
  dic?: string;
  dic_dph?: string;
};

export type ShippingInfo = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string; // Consider if state is actually used/needed for SK/CZ
  postcode: string;
  country: string;
  phone?: string; // Ensure optional phone is present
};

export interface FormData {
  billing: BillingInfo;
  shipping: ShippingInfo;
  shipping_same_as_billing: boolean; // Added flag
  shipping_method: string;
  payment_method: string;
  customer_note: string;
  meta_data: Array<{ key: string; value: string }>;
  is_business: boolean;
  create_account: boolean;
  account_password?: string;
  consents: {
    terms: boolean; // Required by form validation
    privacy: boolean; // Required by form validation
    marketing?: boolean; // Optional marketing consent
    analytics?: boolean; // Optional analytics consent (from cookie context)
    necessary?: boolean; // Always true (from cookie context)
    [key: string]: boolean | undefined; // Allow flexibility
  };
}

// Interface for errors during payment processing or form validation
// Keep this separate if PaymentError is used broadly, or move near usage if specific.
export interface PaymentError {
  type: string;
  message: string;
  code?: string;
}

// Re-exporting CreateOrderData type if needed by other components
// This should ideally come from lib/woocommerce.ts but re-exporting for visibility if needed.
// export type { CreateOrderData } from '../lib/woocommerce'; // Assuming it's defined and exported there
