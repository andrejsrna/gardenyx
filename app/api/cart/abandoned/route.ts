import { createAbandonedCartHandlers } from '@eshop-core/cart/abandoned-routes';
import { abandonedCart } from '@/app/lib/cart/abandoned';

/** POST stores the cart for the delayed reminder (cron job `abandoned`); GET ?token= restores it. */
export const { POST, GET } = createAbandonedCartHandlers(abandonedCart);
