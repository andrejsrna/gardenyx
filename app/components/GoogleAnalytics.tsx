'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (command: string, target: string | Date, params?: Record<string, unknown>) => void;
  }
}

export default function GoogleAnalytics() {
  const { consent, hasConsented } = useCookieConsent();
  const [isLoaded, setIsLoaded] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoaded && hasConsented && consent.analytics && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pathname + searchParams.toString(),
      });
    }
  }, [isLoaded, hasConsented, consent.analytics, pathname, searchParams]);

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
        const gtagInitial = function(command: string, target: string | Date, params?: Record<string, unknown>) {
          window.dataLayer.push([command, target, params]);
        }
        window.gtag = window.gtag || gtagInitial;

        if (typeof window.gtag === 'function') {
            window.gtag('js', new Date());
            window.gtag('config', GA_ID);
        }
        setIsLoaded(true);
      }}
      onError={(e) => {
        console.error('Failed to load Google Analytics script:', e);
        setIsLoaded(false);
      }}
    />
  );
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
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};
