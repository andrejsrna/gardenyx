import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.FB_CONVERSION_API_ACCESS_TOKEN;
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      configuration: {
        pixelId: PIXEL_ID || 'NOT SET',
        hasAccessToken: !!ACCESS_TOKEN,
        accessTokenLength: ACCESS_TOKEN ? ACCESS_TOKEN.length : 0,
        accessTokenPrefix: ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 10) + '...' : 'NOT SET',
      },
      tests: []
    };

    if (!ACCESS_TOKEN) {
      return NextResponse.json({
        ...diagnostics,
        error: 'FB_CONVERSION_API_ACCESS_TOKEN environment variable is not set'
      });
    }

    if (!PIXEL_ID) {
      return NextResponse.json({
        ...diagnostics,
        error: 'NEXT_PUBLIC_FB_PIXEL_ID environment variable is not set'
      });
    }

    // Test 1: Check if pixel exists and we have access
    console.log('Testing Facebook Pixel access...');
    try {
      const pixelResponse = await fetch(
        `https://graph.facebook.com/v17.0/${PIXEL_ID}?fields=id,name,creation_time&access_token=${ACCESS_TOKEN}`
      );

      if (pixelResponse.ok) {
        const pixelData = await pixelResponse.json();
        diagnostics.tests.push({
          test: 'Pixel Access',
          status: 'PASS',
          data: pixelData
        });
      } else {
        const errorData = await pixelResponse.json();
        diagnostics.tests.push({
          test: 'Pixel Access',
          status: 'FAIL',
          error: errorData,
          httpStatus: pixelResponse.status
        });
      }
    } catch (error) {
      diagnostics.tests.push({
        test: 'Pixel Access',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 2: Check access token permissions
    console.log('Testing access token permissions...');
    try {
      const permissionsResponse = await fetch(
        `https://graph.facebook.com/v17.0/me/permissions?access_token=${ACCESS_TOKEN}`
      );

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json();
        diagnostics.tests.push({
          test: 'Token Permissions',
          status: 'PASS',
          data: permissionsData
        });
      } else {
        const errorData = await permissionsResponse.json();
        diagnostics.tests.push({
          test: 'Token Permissions',
          status: 'FAIL',
          error: errorData,
          httpStatus: permissionsResponse.status
        });
      }
    } catch (error) {
      diagnostics.tests.push({
        test: 'Token Permissions',
        status: 'ERROR',
        error: error.message
      });
    }

    // Test 3: Get user/app info
    console.log('Testing token owner info...');
    try {
      const userResponse = await fetch(
        `https://graph.facebook.com/v17.0/me?access_token=${ACCESS_TOKEN}`
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        diagnostics.tests.push({
          test: 'Token Owner',
          status: 'PASS',
          data: userData
        });
      } else {
        const errorData = await userResponse.json();
        diagnostics.tests.push({
          test: 'Token Owner',
          status: 'FAIL',
          error: errorData,
          httpStatus: userResponse.status
        });
      }
    } catch (error) {
      diagnostics.tests.push({
        test: 'Token Owner',
        status: 'ERROR',
        error: error.message
      });
    }

    return NextResponse.json(diagnostics);

  } catch (error) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      details: error.message
    }, { status: 500 });
  }
}