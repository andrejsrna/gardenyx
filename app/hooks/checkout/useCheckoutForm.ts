'use client';

import { createCheckoutForm } from '@eshop-core/checkout/useCheckoutForm';
import { INITIAL_BILLING_INFO, INITIAL_SHIPPING_INFO } from '@/app/lib/checkout/constants';

export const { useCheckoutForm, updateShippingFromBilling } = createCheckoutForm({
  initialBilling: INITIAL_BILLING_INFO,
  initialShipping: INITIAL_SHIPPING_INFO,
});
