import { SHIPPING_COST_PACKETA_HOME_NET, SHIPPING_COST_PACKETA_PICKUP_NET } from '@/app/lib/pricing/constants';

export const FREE_SHIPPING_THRESHOLD = 29;
export const SHIPPING_COST_PACKETA_PICKUP = SHIPPING_COST_PACKETA_PICKUP_NET; // základ bez DPH
export const SHIPPING_COST_PACKETA_HOME = SHIPPING_COST_PACKETA_HOME_NET;   // základ bez DPH
export const RECOMMENDED_PRODUCT_IDS = '839,680,669,47';

export const INITIAL_BILLING_INFO = {
  first_name: '',
  last_name: '',
  company: '',
  address_1: '',
  address_2: '',
  city: '',
  state: 'Slovenská republika',
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
  state: 'Slovenská republika',
  postcode: '',
  country: 'SK',
}; 