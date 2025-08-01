'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { consent, hasConsented } = useCookieConsent();

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (hasConsented && consent.analytics && typeof window.gtag === 'function' && gaId) {
      window.gtag('config', gaId, {
        page_path: pathname + searchParams.toString(),
      });
    }
  }, [hasConsented, consent.analytics, pathname, searchParams, gaId]);

  if (!gaId) {
    console.error('Google Analytics ID is not defined in environment variables');
    return null;
  }

  if (!hasConsented || !consent.analytics) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}

export const event = (action: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) {
    console.warn('Cannot track GA event - GA ID not configured');
    return;
  }

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', action, params);
      console.log('Google Analytics event tracked:', action, params);
    } else {
      console.warn('Cannot track GA event - gtag not available');
    }
  } catch (error) {
    console.error('Error tracking Google Analytics event:', error);
  }
};
