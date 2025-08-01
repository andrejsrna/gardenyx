# Pixel Tracking Implementation

Tento dokument popisuje implementáciu pixel tracking pre e-commerce stránku.

## Prehľad

Implementovali sme centralizovaný tracking systém, ktorý podporuje:
- Facebook Pixel
- Google Analytics 4
- Server-side tracking cez Conversion API

## Komponenty

### 1. Centralizovaný Tracking (`app/lib/tracking.ts`)

Hlavný tracking objekt s metódami pre všetky e-commerce udalosti:

```typescript
import { tracking } from '../lib/tracking';

// Príklady použitia
tracking.viewContent(product);
tracking.addToCart(product);
tracking.initiateCheckout(products, totalValue);
tracking.purchase(orderId, products, totalValue);
```

### 2. Konfigurácia (`app/lib/tracking-config.ts`)

Konštanty a nastavenia pre tracking:

```typescript
import { TRACKING_CONFIG, TRACKING_HELPERS } from '../lib/tracking-config';
```

### 3. Tracking Komponenty

#### ProductTracking
Automaticky trackuje zobrazenie produktu:

```tsx
<ProductTracking product={product} />
```

#### SearchTracking
Trackuje vyhľadávanie:

```tsx
<SearchTracking searchTerm="kĺbová výživa" resultsCount={5} />
```

#### LeadTracking
Trackuje generovanie leadov:

```tsx
<LeadTracking formName="newsletter" value={0}>
  <button>Prihlásiť sa</button>
</LeadTracking>
```

## Implementované Eventy

### E-commerce Eventy

1. **ViewContent** - Zobrazenie produktu
2. **AddToCart** - Pridanie do košíka
3. **RemoveFromCart** - Odstránenie z košíka
4. **InitiateCheckout** - Začatie checkout procesu
5. **AddShippingInfo** - Pridanie dodacích informácií
6. **AddPaymentInfo** - Pridanie platobných informácií
7. **Purchase** - Dokončenie nákupu

### Custom Eventy

1. **Search** - Vyhľadávanie
2. **ViewCategory** - Zobrazenie kategórie
3. **Lead** - Generovanie leadov
4. **CompleteRegistration** - Registrácia

## Použitie v Komponentoch

### Cart Context
```typescript
// Automaticky trackuje add to cart
tracking.addToCart(product);

// Automaticky trackuje checkout
tracking.initiateCheckout(items, totalPrice);
```

### Product Pages
```typescript
// Automaticky trackuje view content
<ProductTracking product={product} />
```

### Checkout
```typescript
// Trackuje purchase
tracking.purchase(orderId, items, totalValue);
```

## Environment Variables

Nastavte tieto premenné v `.env.local`:

```env
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_GA_ID=your_google_analytics_id
FB_ACCESS_TOKEN=your_facebook_access_token
GA_API_SECRET=your_google_analytics_api_secret
```

## Server-side Tracking

Implementované API endpointy pre server-side tracking:

- `/api/facebook-conversion/route.ts` - Facebook Conversion API
- `/api/google-analytics/route.ts` - Google Analytics Measurement Protocol

## Cookie Consent

Všetky tracking eventy respektujú cookie consent:

```typescript
const { consent, hasConsented } = useCookieConsent();

if (hasConsented && consent.analytics) {
  tracking.viewContent(product);
}
```

## Debugging

V development móde sa tracking eventy logujú do konzoly:

```typescript
// V lib/tracking.ts
console.log('Facebook Pixel event tracked:', eventName, params);
```

## Best Practices

1. **Vždy kontrolujte consent** pred trackingom
2. **Používajte centralizované metódy** namiesto priameho volania fbq/gtag
3. **Testujte v development móde** pomocou konzolových logov
4. **Validujte dáta** pred odoslaním
5. **Respektujte GDPR** a cookie consent

## Rozšírenie

Pre pridanie nového eventu:

1. Pridajte metódu do `tracking` objektu v `app/lib/tracking.ts`
2. Pridajte konštantu do `TRACKING_CONFIG.events`
3. Implementujte v príslušnom komponente
4. Otestujte v development móde

## Troubleshooting

### Eventy sa neodosielajú
- Skontrolujte environment variables
- Overte cookie consent
- Skontrolujte konzolu pre chyby

### Nesprávne dáta
- Validujte formát produktových dát
- Skontrolujte currency a value formát
- Overte product IDs

### Performance Issues
- Používajte debouncing pre časté eventy
- Implementujte lazy loading pre tracking skripty
- Optimalizujte veľkosť payload 