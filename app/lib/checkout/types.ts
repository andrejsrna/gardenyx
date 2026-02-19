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
  state: string;
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
  state: string;
  postcode: string;
  country: string;
};

export interface FormData {
  billing: BillingInfo;
  shipping: ShippingInfo;
  shipping_method: string;
  payment_method: string;
  customer_note: string;
  meta_data: Array<{ key: string; value: string }>;
  is_business: boolean;
  create_account: boolean;
  account_password?: string;
  consents: {
    termsAndPrivacy: boolean;
    marketing: boolean;
  };
}

export interface PaymentError {
  type: string;
  message: string;
  code?: string;
}

export interface WooCommerceOrder {
  status: string;
  customer_id?: number;
  billing: BillingInfo;
  shipping: ShippingInfo;
  shipping_method: string;
  payment_method: string;
  payment_method_title: string;
  meta_data: Array<{ key: string; value: string }>;
  line_items: Array<{ product_id: number; quantity: number }>;
  shipping_lines: Array<{ method_id: string; method_title: string; total: string; total_tax?: string; taxes?: Array<unknown> }>;
  idempotency_key?: string;
}

export interface AddressComponents {
  streetNumber?: string;
  route?: string;
  locality?: string;
  postalCode?: string;
  country?: string;
  formattedAddress?: string;
} 