'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { getCookieConsentValue } from 'react-cookie-consent';
import { hasConsentFor } from './CookieConsentBanner';

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16627910487';
const PURCHASE_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL || 'aXspCIyAm8gZENeO5_g9';
const ADD_TO_CART_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_ADD_TO_CART_CONVERSION_LABEL || 'YjPMCJDhxcIbENeO5_g9';

type ConversionParams = {
  sendTo: string;
  url?: string;
  value?: number;
  currency?: string;
  transactionId?: string;
};

const fireConversion = ({ sendTo, url, value = 1.0, currency = 'EUR', transactionId }: ConversionParams) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }

  const callback = () => {
    if (typeof url !== 'undefined') {
      window.location.href = url;
    }
  };

  window.gtag('event', 'conversion', {
    send_to: sendTo,
    value,
    currency,
    ...(transactionId ? { transaction_id: transactionId } : {}),
    event_callback: callback,
  });

  return false;
};

export default function GoogleAds() {
  const cookieConsent = getCookieConsentValue('cookieConsent');
  const hasMarketingConsent = hasConsentFor('marketing');

  useEffect(() => {
    if (!cookieConsent || cookieConsent === 'false' || !hasMarketingConsent) {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    if (typeof window.gtag !== 'function') {
      const gtagStub: Window['gtag'] = (command, target, params) => {
        if (typeof params === 'undefined') {
          window.dataLayer.push([command, target]);
        } else {
          window.dataLayer.push([command, target, params]);
        }
      };
      window.gtag = gtagStub;
      window.gtag('js', new Date());
      window.gtag('config', GOOGLE_ADS_ID);
    }

    window.gtag_report_conversion = (url?: string, value?: number, transactionId?: string) =>
      fireConversion({
        sendTo: `${GOOGLE_ADS_ID}/${PURCHASE_CONVERSION_LABEL}`,
        url,
        value,
        transactionId,
      });

    window.gtag_report_add_to_cart_conversion = (url?: string, value?: number) =>
      fireConversion({
        sendTo: `${GOOGLE_ADS_ID}/${ADD_TO_CART_CONVERSION_LABEL}`,
        url,
        value,
      });
  }, [cookieConsent, hasMarketingConsent]);

  if (!cookieConsent || cookieConsent === 'false' || !hasMarketingConsent) {
    return null;
  }

  return (
    <Script
      id="google-ads"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
    />
  );
}

export const trackConversion = (conversionId: string, value?: number) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
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
  currency?: string;
};

export const reportPurchaseConversion = (options?: ConversionOptions) =>
  fireConversion({
    sendTo: `${GOOGLE_ADS_ID}/${PURCHASE_CONVERSION_LABEL}`,
    url: options?.url,
    value: options?.value,
    transactionId: options?.transactionId,
    currency: options?.currency,
  });

export const reportAddToCartConversion = (options?: ConversionOptions) =>
  fireConversion({
    sendTo: `${GOOGLE_ADS_ID}/${ADD_TO_CART_CONVERSION_LABEL}`,
    url: options?.url,
    value: options?.value,
    currency: options?.currency,
  });
