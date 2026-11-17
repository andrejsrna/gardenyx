import { createCheckoutFormSchema } from '@eshop-core/checkout/validation';

export const checkoutFormSchema = createCheckoutFormSchema({
  postcode: /^\d{4,5}$/,
  postcodeMessage: 'PSČ musí obsahovať 4 alebo 5 číslic',
  phone: /^(\+421|\+420|\+36)[1-9]\d{7,8}$|^0[1-9]\d{8}$/,
});
