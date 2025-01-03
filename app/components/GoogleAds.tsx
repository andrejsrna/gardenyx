'use client';

import Script from 'next/script';
import { useCookieConsent } from '../context/CookieConsentContext';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID!;

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

export default function GoogleAds() {
  const { consent, hasUserConsented } = useCookieConsent();

  if (!hasUserConsented || !consent.marketing) {
    return null;
  }

  return (
    <Script
      id="google-ads"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `,
      }}
    />
  );
}

export const trackConversion = (conversionId: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_ID}/${conversionId}`,
      ...(value && { value, currency: 'EUR' })
    });
  }
}; 