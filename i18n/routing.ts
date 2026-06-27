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
    '/hnojiva-hakofyt': {
      sk: '/hnojiva-hakofyt',
      en: '/hakofyt-fertilizers',
      hu: '/hakofyt-mutragyak',
    },
    '/hnojivo': {
      sk: '/hnojivo',
      en: '/fertilizer',
      hu: '/mutragya',
    },
    '/organicke-hnojivo': {
      sk: '/organicke-hnojivo',
      en: '/organic-fertilizer',
      hu: '/szerves-mutragya',
    },
    '/hnojivo-na-zeleninu': {
      sk: '/hnojivo-na-zeleninu',
      en: '/vegetable-fertilizer',
      hu: '/zoldseg-mutragya',
    },
    '/hnojivo-na-cucoriedky': {
      sk: '/hnojivo-na-cucoriedky',
      en: '/blueberry-fertilizer',
      hu: '/afonya-mutragya',
    },
    '/hnojivo-na-citrusy': {
      sk: '/hnojivo-na-citrusy',
      en: '/citrus-fertilizer',
      hu: '/citrus-mutragya',
    },
    '/hnojivo-na-kvety': {
      sk: '/hnojivo-na-kvety',
      en: '/flower-fertilizer',
      hu: '/virag-mutragya',
    },
    '/hnojivo-na-travnik': {
      sk: '/hnojivo-na-travnik',
      en: '/lawn-fertilizer',
      hu: '/gyeptragya',
    },
    '/hnojivo-na-ovocne-stromy': {
      sk: '/hnojivo-na-ovocne-stromy',
      en: '/fruit-tree-fertilizer',
      hu: '/gyumolcsfa-tragya',
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
    '/blog': {
      sk: '/blog',
      en: '/blog',
      hu: '/blog',
    },
    '/blog/[slug]': {
      sk: '/blog/[slug]',
      en: '/blog/[slug]',
      hu: '/blog/[slug]',
    },
  },
});
