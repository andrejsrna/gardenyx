'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!;

declare global {
  interface Window {
    gtag: (
      command: string,
      target: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

interface GoogleAnalyticsTrackingProps {
  isGtagLoaded: boolean;
}

function GoogleAnalyticsTracking({ isGtagLoaded }: GoogleAnalyticsTrackingProps) {
  const { consent, hasUserConsented } = useCookieConsent();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!hasUserConsented || !consent.analytics || !pathname || !isGtagLoaded) {
      return;
    }

    try {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    } catch (error) {
      console.error('Error calling gtag:', error);
    }
  }, [pathname, searchParams, hasUserConsented, consent.analytics, isGtagLoaded]);

  return null;
}

export default function GoogleAnalytics() {
  const { consent, hasUserConsented } = useCookieConsent();
  const [isGtagLoaded, setIsGtagLoaded] = useState(false);

  if (!hasUserConsented || !consent.analytics) {
    return null;
  }

  const handleScriptLoad = () => {
    setIsGtagLoaded(true);
  };

  return (
    <>
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking isGtagLoaded={isGtagLoaded} />
      </Suspense>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={handleScriptLoad}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: url,
      });
    } catch (error) {
      console.error('Error in pageview:', error);
    }
  }
};

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
    try {
      window.gtag('event', action, params);
    } catch (error) {
      console.error('Error in event:', error);
    }
  }
}; 