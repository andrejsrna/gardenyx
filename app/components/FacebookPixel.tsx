'use client';

import Script from 'next/script';
// Removed useState as isLoaded is not currently used
// import { useEffect, useState } from 'react';
import { useCookieConsent } from '../context/CookieConsentContext';

declare global {
  interface Window {
    fbq: (action: string, event: string, params?: Record<string, unknown> | undefined) => void;
  }
}

export default function FacebookPixel() {
  const { consent, hasConsented } = useCookieConsent();
  // const [isLoaded, setIsLoaded] = useState(false); // Removed state

  if (!hasConsented || !consent.marketing) {
    return null;
  }

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      src="https://connect.facebook.net/en_US/fbevents.js"
      onLoad={() => {
        // Explicitly check and type window.fbq before calling
        const fbqFunc = window.fbq;
        if (typeof fbqFunc === 'function') {
          fbqFunc('init', process.env.NEXT_PUBLIC_FB_PIXEL_ID!);
          fbqFunc('track', 'PageView');
          // setIsLoaded(true); // Removed state update
        } else {
          console.error('Facebook Pixel function (fbq) not found after script load.');
        }
      }}
      onError={(e) => {
        console.error('Failed to load Facebook Pixel script:', e);
      }}
    />
  );
}

// Export a function to track custom events, ensuring it checks for window.fbq and user consent
export const trackFbEvent = (eventName: string, params?: Record<string, unknown>) => {
  // Check if we can access localStorage (not available in SSR)
  if (typeof window === 'undefined') return;
  
  // Verify user has consented to marketing cookies
  try {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (!storedConsent) return;
    
    const consent = JSON.parse(storedConsent);
    if (!consent.marketing) {
      // Skip tracking if user hasn't consented to marketing cookies
      return;
    }
  } catch (error) {
    console.warn('Error checking cookie consent, skipping event tracking:', error);
    return;
  }

  // Track the event if fbq is available and user has consented
  const fbqFunc = window.fbq;
  if (typeof fbqFunc === 'function') {
    fbqFunc('track', eventName, params);
  } else {
    console.warn('Cannot track FB event - fbq not available.');
  }
};
