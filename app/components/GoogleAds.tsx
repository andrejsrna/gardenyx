'use client';

import Script from 'next/script';
import { useCookieConsent } from '../context/CookieConsentContext';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID!;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, action: string | Date, params?: Record<string, unknown>) => void;
  }
}

export default function GoogleAds() {
  const { consent, hasConsented } = useCookieConsent();

  if (!hasConsented || !consent.marketing) {
    return null;
  }

  return (
    <Script
      id="google-ads"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
      onLoad={() => {
        window.dataLayer = window.dataLayer || [];
        function gtag(command: string, action: string | Date, params?: Record<string, unknown>) {
          window.dataLayer.push([command, action, params]);
        }
        gtag('js', new Date());
        gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ADS_ID!);
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