import { z } from 'zod';

// Regex patterns
// Akceptuje formáty: +421XXXXXXXXX, +421 XXX XXX XXX, 09XXXXXXXX, 0914 000 000
const PSC_REGEX = /^\d{5}$/;
const IC_REGEX = /^\d{8}$/;
const DIC_REGEX = /^\d{10}$/;
const IC_DPH_REGEX = /^SK\d{10}$/;

// Regex pre čisté telefónne číslo (bez medzier)
const CLEAN_PHONE_REGEX = /^(\+421|0)[1-9]\d{8}$/;

export const billingSchema = z.object({
  first_name: z.string().min(2, 'Meno musí mať aspoň 2 znaky'),
  last_name: z.string().min(2, 'Priezvisko musí mať aspoň 2 znaky'),
  company: z.string().optional(),
  address_1: z.string().min(5, 'Adresa musí mať aspoň 5 znakov'),
  address_2: z.string().optional(),
  city: z.string().min(2, 'Mesto musí mať aspoň 2 znaky'),
  state: z.string().optional(),
  postcode: z.string().regex(PSC_REGEX, 'PSČ musí obsahovať 5 číslic'),
  country: z.string(),
  email: z.string().email('Neplatný email'),
  phone: z.preprocess(
    (val) => (typeof val === "string" ? val.replace(/\s+/g, '') : val),
    z.string().regex(CLEAN_PHONE_REGEX, 'Neplatné telefónne číslo')
  ),
  ic: z.string().regex(IC_REGEX, 'IČO musí mať 8 číslic').optional(),
  dic: z.string().regex(DIC_REGEX, 'DIČ musí mať 10 číslic').optional(),
  dic_dph: z.string().regex(IC_DPH_REGEX, 'IČ DPH musí byť v tvare SK+10 číslic').optional(),
});

export const checkoutFormSchema = z.object({
  billing: billingSchema,
  shipping_method: z.string().min(1, 'Vyberte spôsob dopravy'),
  payment_method: z.string().min(1, 'Vyberte spôsob platby'),
  is_business: z.boolean(),
  create_account: z.boolean(),
  account_password: z.string().min(8, 'Heslo musí mať aspoň 8 znakov').optional(),
  meta_data: z.array(z.object({
    key: z.string(),
    value: z.string()
  })),
  consents: z.object({
    terms: z.boolean().refine(val => val === true, {
      message: 'Musíte súhlasiť s obchodnými podmienkami'
    }),
    privacy: z.boolean().refine(val => val === true, {
      message: 'Musíte súhlasiť so spracovaním osobných údajov'
    }),
    marketing: z.boolean().optional(),
  }),
});
