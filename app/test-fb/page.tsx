'use client';

import { useEffect } from 'react';
import { testFacebookPixel } from '../components/FacebookPixel';

export default function TestFacebookPixel() {
  useEffect(() => {
    console.log('Test: Component mounted');
    
    // Test after a delay to ensure everything is loaded
    setTimeout(() => {
      testFacebookPixel();
      
      // Additional tests
      console.log('Test: Environment variables:');
      console.log('NEXT_PUBLIC_FB_PIXEL_ID:', process.env.NEXT_PUBLIC_FB_PIXEL_ID);
      
      console.log('Test: Window object:');
      console.log('window.fbq:', typeof window.fbq);
      console.log('window._fbq:', window._fbq);
      
      // Test if we can call fbq
      if (typeof window.fbq === 'function') {
        console.log('Test: Calling fbq function...');
        try {
          window.fbq('track', 'test_event', { test: true });
          console.log('Test: fbq call successful');
        } catch (error) {
          console.error('Test: fbq call failed:', error);
        }
      }
    }, 3000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Facebook Pixel Test</h1>
      
      <div className="space-y-4">
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
            <li>Check if fbq function is available</li>
            <li>Check if test event is tracked</li>
          </ol>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Expected Results:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>✅ Pixel ID should be: 206446762419006</li>
            <li>✅ window.fbq should be: function</li>
            <li>✅ Facebook Pixel initialized successfully</li>
            <li>✅ fbq call successful</li>
          </ul>
        </div>

        <button
          onClick={() => {
            console.log('Manual test triggered');
            testFacebookPixel();
            
            if (typeof window.fbq === 'function') {
              window.fbq('track', 'manual_test', { manual: true });
              console.log('Manual fbq call successful');
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Run Manual Test
        </button>
      </div>
    </div>
  );
} 