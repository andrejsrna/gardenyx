'use client';

import { useEffect } from 'react';
import { testFacebookPixel } from '../components/FacebookPixel';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function TestFacebookPixel() {
  const { consent, hasConsented } = useCookieConsent();

  useEffect(() => {
    console.log('Test: Component mounted');
    console.log('Test: hasConsented:', hasConsented);
    console.log('Test: consent:', consent);
    
    // Test after a delay to ensure everything is loaded
    setTimeout(() => {
      testFacebookPixel();
    }, 2000);
  }, [hasConsented, consent]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Facebook Pixel Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Cookie Consent Status:</h2>
          <p>Has Consented: {hasConsented ? 'Yes' : 'No'}</p>
          <p>Analytics: {consent.analytics ? 'Yes' : 'No'}</p>
          <p>Marketing: {consent.marketing ? 'Yes' : 'No'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <p>FB Pixel ID: {process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'Not set'}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open browser console (F12)</li>
            <li>Look for &quot;Test:&quot; messages</li>
            <li>Check if Facebook Pixel is loading</li>
            <li>Check if consent is properly set</li>
          </ol>
        </div>

        <button
          onClick={() => {
            console.log('Manual test triggered');
            testFacebookPixel();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Manual Test
        </button>
      </div>
    </div>
  );
} 