'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { getCookieConsentValue } from 'react-cookie-consent';
import { hasConsentFor } from './CookieConsentBanner';

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  useEffect(() => {
    const cookieConsent = getCookieConsentValue('cookieConsent');
    const hasAnalyticsConsent = hasConsentFor('analytics');

    if (cookieConsent === 'true' && hasAnalyticsConsent && typeof window.fbq === 'function' && pixelId) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, pixelId]);

  if (!pixelId) {
    console.error('Facebook Pixel ID is not defined in environment variables');
    return null;
  }

  const cookieConsent = getCookieConsentValue('cookieConsent');
  const hasAnalyticsConsent = hasConsentFor('analytics');

  if (!cookieConsent || cookieConsent === 'false' || !hasAnalyticsConsent) {
    return null;
  }

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* noscript is rendered server-side in RootLayout to avoid hydration issues */}
    </>
  );
}

export const fbq = (action: string, eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!pixelId) {
    console.warn('Cannot track Facebook event - Pixel ID not configured');
    return;
  }

  try {
    if (typeof window.fbq === 'function') {
      window.fbq(action, eventName, params);
      console.log('Facebook Pixel event tracked:', action, eventName, params);
    } else {
      console.warn('Cannot track Facebook event - fbq not available');
    }
  } catch (error) {
    console.error('Error tracking Facebook event:', error);
  }
}; 