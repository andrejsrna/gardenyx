'use client';

import Script from 'next/script';
// Removed useState as isLoaded is not currently used
// import { useEffect, useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

// Remove type declarations as they're defined in global.d.ts

export default function FacebookPixel() {
  const { consent, hasConsented } = useCookieConsent();
  // const [isLoaded, setIsLoaded] = useState(false); // Removed state

  // Early return if no consent or no marketing consent
  if (!hasConsented || !consent.marketing) {
    return null;
  }

  // Early return if no Pixel ID
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!pixelId) {
    console.error('Facebook Pixel ID is not defined in environment variables');
    return null;
  }

  return (
    <>
      {/* Facebook Pixel Base Code */}
      <Script
        id="fb-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `
        }}
      />
      {/* Facebook Pixel Init Code */}
      <Script
        id="fb-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Export a function to track custom events, ensuring it checks for window.fbq and user consent
export const trackFbEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;

  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!pixelId) {
    console.warn('Cannot track FB event - Pixel ID not configured');
    return;
  }

  try {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (!storedConsent) return;

    const consentData = JSON.parse(storedConsent);
    if (!consentData.marketing) {
      return;
    }
  } catch (error) {
    console.warn('Error checking cookie consent, skipping event tracking:', error);
    return;
  }

  try {
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, params);
      console.log('Facebook Pixel event tracked:', eventName, params);
    } else {
      console.warn('Cannot track FB event - fbq not available');
    }
  } catch (error) {
    console.error('Error tracking Facebook Pixel event:', error);
  }
};
