import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['sk', 'en', 'hu'],
  defaultLocale: 'sk',
  pathnames: {
    '/': '/',
    '/kupit': {
      sk: '/kupit',
      en: '/shop',
      hu: '/vasarlas',
    },
    '/kontakt': {
      sk: '/kontakt',
      en: '/contact',
      hu: '/kapcsolat',
    },
    '/moj-ucet': {
      sk: '/moj-ucet',
      en: '/my-account',
      hu: '/fiokom',
    },
    '/obchodne-podmienky': {
      sk: '/obchodne-podmienky',
      en: '/terms-and-conditions',
      hu: '/aszf',
    },
    '/ochrana-osobnych-udajov': {
      sk: '/ochrana-osobnych-udajov',
      en: '/privacy-policy',
      hu: '/adatvedelem',
    },
    '/stiahnut': {
      sk: '/stiahnut',
      en: '/download',
      hu: '/letoltes',
    },
    '/newsletter': {
      sk: '/newsletter',
      en: '/newsletter',
      hu: '/hirlevel',
    },
    '/pokladna': {
      sk: '/pokladna',
      en: '/checkout',
      hu: '/penztar',
    },
    '/reset-hesla': {
      sk: '/reset-hesla',
      en: '/reset-password',
      hu: '/jelszo-visszaallitas',
    },
    '/overit-email': {
      sk: '/overit-email',
      en: '/verify-email',
      hu: '/email-ellenorzes',
    },
    '/produkt/[slug]': {
      sk: '/produkt/[slug]',
      en: '/product/[slug]',
      hu: '/termek/[slug]',
    },
  },
});
