import { SHIPPING_COST_PACKETA_HOME_NET, SHIPPING_COST_PACKETA_PICKUP_NET } from '@/app/lib/pricing/constants';

export const FREE_SHIPPING_THRESHOLD = 29;
export const SHIPPING_COST_PACKETA_PICKUP = SHIPPING_COST_PACKETA_PICKUP_NET; // základ bez DPH
export const SHIPPING_COST_PACKETA_HOME = SHIPPING_COST_PACKETA_HOME_NET;   // základ bez DPH
export const RECOMMENDED_PRODUCT_IDS = '839,680,669,47';

export const SUPPORTED_COUNTRIES = [
  { code: 'SK', label: 'Slovensko' },
  { code: 'CZ', label: 'Česká republika' },
  { code: 'HU', label: 'Maďarsko' },
] as const;

export type SupportedCountryCode = typeof SUPPORTED_COUNTRIES[number]['code'];

// Packeta home delivery carrier IDs per country (addressId in Packeta API)
// Verify these IDs in your Packeta account if delivery fails.
export const PACKETA_HOME_CARRIER_IDS: Record<string, string> = {
  SK: process.env.PACKETA_CARRIER_ID_SK || '131',
  CZ: process.env.PACKETA_CARRIER_ID_CZ || '106',
  HU: process.env.PACKETA_CARRIER_ID_HU || '4892',
};

export const INITIAL_BILLING_INFO = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'SK',
  email: '',
  phone: '',
  ic: '',
  dic: '',
  dic_dph: '',
};

export const INITIAL_SHIPPING_INFO = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'SK',
}; 