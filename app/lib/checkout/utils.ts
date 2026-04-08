import type { BillingInfo, ShippingInfo } from './types';

export function updateShippingFromBilling(billingData: BillingInfo, currentShipping: ShippingInfo): ShippingInfo {
  return {
    ...currentShipping,
    first_name: billingData.first_name,
    last_name: billingData.last_name,
    company: billingData.company || '',
    address_1: billingData.address_1,
    address_2: billingData.address_2 || '',
    city: billingData.city,
    state: billingData.state || '',
    postcode: billingData.postcode,
    country: billingData.country || 'SK',
  };
}

export function translateFieldName(key: string): string {
  const parts = key.split('.');
  const translations: Record<string, Record<string, string>> = {
    billing: {
      _self: 'Fakturačné údaje',
      first_name: 'Meno',
      last_name: 'Priezvisko',
      company: 'Názov firmy',
      address_1: 'Adresa',
      address_2: 'Doplnková adresa',
      city: 'Mesto',
      state: 'Štát/Región',
      postcode: 'PSČ',
      country: 'Krajina',
      email: 'Email',
      phone: 'Telefón',
      ic: 'IČO',
      dic: 'DIČ',
      dic_dph: 'IČ DPH',
    },
    shipping: {
      _self: 'Adresa doručenia',
    },
    consents: {
       _self: 'Súhlasy',
       terms: 'Obchodné podmienky',
       privacy: 'Ochrana osobných údajov',
       marketing: 'Marketingové ponuky',
    },
    account_password: { _self: 'Heslo pre účet'},
    shipping_method: { _self: 'Spôsob dopravy' },
    payment_method: { _self: 'Spôsob platby' },
  };

  let translated = '';
  if (parts.length === 1) {
      translated = translations[parts[0]]?._self || parts[0];
  } else if (parts.length === 2) {
      const [section, field] = parts;
      const sectionTranslation = translations[section]?._self || section;
      const fieldTranslation = translations[section]?.[field] || field.replace('_', ' ');
      translated = `${sectionTranslation} - ${fieldTranslation}`;
  } else {
      translated = key.replace('_', ' ');
  }
  return translated.charAt(0).toUpperCase() + translated.slice(1);
} 