interface UserAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
}

interface UserBilling extends UserAddress {
  company?: string;
  ic?: string;
  dic?: string;
  dic_dph?: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  billing?: UserBilling;
  shipping?: UserAddress;
} 