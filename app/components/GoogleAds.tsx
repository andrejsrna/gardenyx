'use client';

import Script from 'next/script';
import { getCookieConsentValue } from 'react-cookie-consent';
import { hasConsentFor } from './CookieConsentBanner';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16627910487';
const PURCHASE_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL || 'aXspCIyAm8gZENeO5_g9';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, action: string | Date, params?: Record<string, unknown>) => void;
    gtag_report_conversion?: (url?: string, value?: number, transactionId?: string) => boolean;
  }
}

export default function GoogleAds() {
  const cookieConsent = getCookieConsentValue('cookieConsent');
  const hasMarketingConsent = hasConsentFor('marketing');

  if (!cookieConsent || cookieConsent === 'false' || !hasMarketingConsent) {
    return null;
  }

  return (
    <Script
      id="google-ads"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      onLoad={() => {
        window.dataLayer = window.dataLayer || [];
        function gtag(command: string, action: string | Date, params?: Record<string, unknown>) {
          window.dataLayer.push([command, action, params]);
        }
        gtag('js', new Date());
        gtag('config', GOOGLE_ADS_ID);

        window.gtag_report_conversion = (url?: string, value = 1.0, transactionId?: string) => {
          if (typeof window.gtag !== 'function') {
            return false;
          }
          const callback = () => {
            if (typeof url !== 'undefined') {
              window.location.href = url;
            }
          };
          window.gtag('event', 'conversion', {
            send_to: `${GOOGLE_ADS_ID}/${PURCHASE_CONVERSION_LABEL}`,
            value,
            currency: 'EUR',
            transaction_id: transactionId || '',
            event_callback: callback,
          });
          return false;
        };
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

type ConversionOptions = {
  url?: string;
  value?: number;
  transactionId?: string;
};

export const reportPurchaseConversion = (options?: ConversionOptions) => {
  if (typeof window === 'undefined' || typeof window.gtag_report_conversion !== 'function') {
    return false;
  }

  const { url, value, transactionId } = options || {};
  return window.gtag_report_conversion(url, value, transactionId);
};
