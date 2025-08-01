'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getCookieConsentValue } from 'react-cookie-consent';
import { hasConsentFor } from './CookieConsentBanner';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    const cookieConsent = getCookieConsentValue('cookieConsent');
    const hasAnalyticsConsent = hasConsentFor('analytics');

    if (cookieConsent === 'true' && hasAnalyticsConsent && typeof window.gtag === 'function' && gaId) {
      window.gtag('config', gaId, {
        page_path: pathname + searchParams.toString(),
      });
    }
  }, [pathname, searchParams, gaId]);

  if (!gaId) {
    console.error('Google Analytics ID is not defined in environment variables');
    return null;
  }

  const cookieConsent = getCookieConsentValue('cookieConsent');
  const hasAnalyticsConsent = hasConsentFor('analytics');

  if (!cookieConsent || cookieConsent === 'false' || !hasAnalyticsConsent) {
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
