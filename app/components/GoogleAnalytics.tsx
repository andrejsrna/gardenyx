'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;

declare global {
  interface Window {
    gtag: (command: string, action: string | Date, params?: Record<string, unknown>) => void;
  }
}

interface GoogleAnalyticsTrackingProps {
  isGtagLoaded: boolean;
}

export default function GoogleAnalytics() {
  const { consent, hasConsented } = useCookieConsent();

  if (!hasConsented || !consent.analytics) {
    return null;
  }

  return (
    <Script
      id="google-analytics"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      onLoad={() => {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(...args) {
          window.dataLayer.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID);
      }}
    />
  );
}

function GoogleAnalyticsTracking({ isGtagLoaded }: GoogleAnalyticsTrackingProps) {
  const { consent, hasConsented } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isGtagLoaded && hasConsented && consent.analytics) {
      window.gtag('event', 'page_view', {
        page_path: pathname,
        page_search: searchParams.toString(),
      });
    }
  }, [isGtagLoaded, hasConsented, consent.analytics, pathname, searchParams]);

  return null;
}

export const event = (
  action: string,
  params: {
    category?: string;
    label?: string;
    value?: number;
    [key: string]: unknown;
  }
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, params);
  }
};

export { GoogleAnalyticsTracking }; 