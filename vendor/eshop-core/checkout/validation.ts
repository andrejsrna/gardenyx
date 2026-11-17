import { z } from 'zod';

const IC_REGEX = /^\d{8}$/;
const DIC_REGEX = /^\d{10}$/;
const IC_DPH_REGEX = /^SK\d{10}$/;

export type CheckoutSchemaConfig = {
  /** e.g. `/^\d{5}$/` (SK) or `/^\d{4,5}$/` (SK/CZ/HU). */
  postcode: RegExp;
  postcodeMessage: string;
  /** Phone without spaces. */
  phone: RegExp;
};

/** Checkout form schema (Slovak messages); postcode and phone formats depend on the shop's countries. */
export function createCheckoutFormSchema(config: CheckoutSchemaConfig) {

  const billingSchema = z.object({
    first_name: z.string().min(2, 'Meno musí mať aspoň 2 znaky'),
    last_name: z.string().min(2, 'Priezvisko musí mať aspoň 2 znaky'),
    company: z.string().optional(),
    address_1: z.string().min(5, 'Adresa musí mať aspoň 5 znakov'),
    address_2: z.string().optional(),
    city: z.string().min(2, 'Mesto musí mať aspoň 2 znaky'),
    state: z.string().optional(),
    postcode: z.string().regex(config.postcode, config.postcodeMessage),
    country: z.string(),
    email: z.string().email('Neplatný email'),
    phone: z.preprocess(
      (val) => (typeof val === "string" ? val.replace(/\s+/g, '') : val),
      z.string().regex(config.phone, 'Neplatné telefónne číslo')
    ),
    ic: z.string().optional().refine((val) => !val || IC_REGEX.test(val), {
      message: 'IČO musí mať 8 číslic'
    }),
    dic: z.string().optional().refine((val) => !val || DIC_REGEX.test(val), {
      message: 'DIČ musí mať 10 číslic'
    }),
    dic_dph: z.string().optional().refine((val) => !val || IC_DPH_REGEX.test(val), {
      message: 'IČ DPH musí byť v tvare SK+10 číslic'
    }),
  });

  return z.object({
    billing: billingSchema,
    shipping_method: z.string().min(1, 'Vyberte spôsob dopravy'),
    payment_method: z.string().min(1, 'Vyberte spôsob platby'),
    is_business: z.boolean(),
    create_account: z.boolean(),
    account_password: z.string().optional().refine((val) => !val || val.length >= 8, {
      message: 'Heslo musí mať aspoň 8 znakov'
    }),
    meta_data: z.array(z.object({
      key: z.string(),
      value: z.string()
    })),
    consents: z.object({
      termsAndPrivacy: z.boolean().refine(val => val === true, {
        message: 'Je potrebné súhlasiť s obchodnými podmienkami a zásadami ochrany osobných údajov'
      }),
      marketing: z.boolean().optional(),
    }),
  });
}
