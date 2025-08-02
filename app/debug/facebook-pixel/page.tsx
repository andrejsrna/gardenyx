'use client';

import { useState } from 'react';

interface DiagnosticResult {
  timestamp: string;
  configuration: {
    pixelId: string;
    hasAccessToken: boolean;
    accessTokenLength: number;
    accessTokenPrefix: string;
  };
  tests: Array<{
    test: string;
    status: 'PASS' | 'FAIL' | 'ERROR';
    data?: Record<string, unknown>;
    error?: Record<string, unknown> | string;
    httpStatus?: number;
  }>;
  error?: string;
}

export default function FacebookPixelDebug() {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/facebook-pixel');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        timestamp: new Date().toISOString(),
        configuration: {
          pixelId: 'ERROR',
          hasAccessToken: false,
          accessTokenLength: 0,
          accessTokenPrefix: 'ERROR'
        },
        tests: [],
        error: `Failed to fetch diagnostics: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-600 bg-green-50';
      case 'FAIL': return 'text-red-600 bg-red-50';
      case 'ERROR': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Facebook Pixel Diagnostics</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Current Issue</h2>
        <p className="text-yellow-700">
          Facebook Conversion API error: Object with ID &apos;206446962419006&apos; does not exist, 
          cannot be loaded due to missing permissions, or does not support this operation.
        </p>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {loading ? 'Running Diagnostics...' : 'Run Facebook Pixel Diagnostics'}
      </button>

      {result && (
        <div className="space-y-6">
          {/* Configuration */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pixel ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{result.configuration.pixelId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Token</label>
                <p className="mt-1 text-sm text-gray-900">
                  {result.configuration.hasAccessToken ? (
                    <span className="text-green-600">✓ Configured ({result.configuration.accessTokenLength} chars)</span>
                  ) : (
                    <span className="text-red-600">✗ Missing</span>
                  )}
                </p>
                {result.configuration.accessTokenPrefix !== 'NOT SET' && (
                  <p className="text-xs text-gray-500 font-mono">{result.configuration.accessTokenPrefix}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {result.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800">Configuration Error</h3>
              <p className="text-red-700 mt-1">{result.error}</p>
            </div>
          )}

          {/* Tests */}
          {result.tests.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              <div className="space-y-4">
                {result.tests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{test.test}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                    
                    {test.httpStatus && (
                      <p className="text-sm text-gray-600 mb-2">HTTP Status: {test.httpStatus}</p>
                    )}

                    {test.data != null && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Data
                        </summary>
                        <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}

                    {test.error != null && (
                      <div className="mt-2 bg-red-50 p-3 rounded">
                        <p className="text-sm text-red-800 font-medium">Error:</p>
                        <pre className="text-xs text-red-700 mt-1 overflow-auto">
                          {JSON.stringify(test.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solutions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Troubleshooting Steps</h2>
            <div className="space-y-3 text-blue-700">
              <div>
                <h3 className="font-medium">1. Verify Pixel ID</h3>
                <p className="text-sm">Go to Facebook Events Manager → Select your pixel → Copy the Pixel ID from the top</p>
              </div>
              <div>
                <h3 className="font-medium">2. Check Access Token</h3>
                <p className="text-sm">Ensure your access token has &apos;ads_management&apos; permission and belongs to the same Facebook account/Business Manager that owns the pixel</p>
              </div>
              <div>
                <h3 className="font-medium">3. Generate New Access Token</h3>
                <p className="text-sm">Go to Facebook Graph API Explorer → Select your app → Generate new token with required permissions</p>
              </div>
              <div>
                <h3 className="font-medium">4. Business Manager Setup</h3>
                <p className="text-sm">If using Business Manager, ensure the app has access to the pixel in Business Settings</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Diagnostics run at: {result.timestamp}
          </div>
        </div>
      )}
    </div>
  );
}