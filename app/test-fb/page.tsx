'use client';

import { useState } from 'react';
import { tracking } from '../lib/tracking';

export default function FacebookPixelTest() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testViewContent = async () => {
    try {
      addResult('Testing ViewContent event...');
      await tracking.viewContent({
        id: 123,
        name: 'Test Product',
        price: 29.99,
        category: 'test'
      });
      addResult('✅ ViewContent event sent');
    } catch (error) {
      addResult(`❌ ViewContent error: ${error}`);
    }
  };

  const testAddToCart = async () => {
    try {
      addResult('Testing AddToCart event...');
      await tracking.addToCart({
        id: 123,
        name: 'Test Product',
        price: 29.99,
        quantity: 2,
        category: 'test'
      });
      addResult('✅ AddToCart event sent');
    } catch (error) {
      addResult(`❌ AddToCart error: ${error}`);
    }
  };

  const testPurchase = async () => {
    try {
      addResult('Testing Purchase event...');
      await tracking.purchaseWithConversionAPI(
        'TEST_ORDER_123',
        [{
          id: 123,
          name: 'Test Product',
          price: 29.99,
          quantity: 2,
          category: 'test'
        }],
        59.98
      );
      addResult('✅ Purchase event sent');
    } catch (error) {
      addResult(`❌ Purchase error: ${error}`);
    }
  };

  const testServerSideEvent = async () => {
    try {
      addResult('Testing server-side event...');
      const response = await fetch('/api/facebook-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventName: 'TestEvent',
          eventData: {
            content_name: 'Test Event',
            value: 10.00,
            currency: 'EUR'
          },
          userData: {
            em: 'test@example.com',
            country: 'sk'
          },
          pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID
        }),
      });
      
      if (response.ok) {
        addResult('✅ Server-side event sent successfully');
      } else {
        const error = await response.text();
        addResult(`❌ Server-side event failed: ${error}`);
      }
    } catch (error) {
      addResult(`❌ Server-side event error: ${error}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Facebook Pixel & Conversion API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={testViewContent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test ViewContent
        </button>
        
        <button
          onClick={testAddToCart}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test AddToCart
        </button>
        
        <button
          onClick={testPurchase}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Purchase
        </button>
        
        <button
          onClick={testServerSideEvent}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Test Server-Side Event
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Environment Variables Required:</h3>
        <ul className="text-sm space-y-1">
          <li><code>NEXT_PUBLIC_FB_PIXEL_ID</code> - Your Facebook Pixel ID</li>
          <li><code>FB_CONVERSION_API_ACCESS_TOKEN</code> - Your Facebook Conversion API access token</li>
        </ul>
      </div>
    </div>
  );
} 