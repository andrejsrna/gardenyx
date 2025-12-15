export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  slug?: string;
}

export interface User {
  email?: string;
  first_name?: string;
  last_name?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address_1?: string;
    city?: string;
    postcode?: string;
    country?: string;
    company?: string;
    ic?: string;
    dic?: string;
    dic_dph?: string;
  };
  shipping?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}
