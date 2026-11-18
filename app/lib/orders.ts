import { getProducts as fetchProducts } from '@eshop-core/orders/client';
import type { Product } from './content-types';

export { createOrder, type CreateOrderData, type OrderLineItem } from '@eshop-core/orders/client';

export const getProducts = (params?: Record<string, string>) => fetchProducts<Product>(params);
