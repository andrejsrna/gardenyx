import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const ACCESS_TOKEN = process.env.FB_CONVERSION_API_ACCESS_TOKEN;

function sha256Hash(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function POST(request: Request) {
  if (!ACCESS_TOKEN) {
    console.error('Missing Facebook Conversion API configuration');
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
  }

  try {
    let parsed: any = null;
    try {
      parsed = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { eventName, eventData, userData, pixelId } = parsed || {};
    if (!eventName || !pixelId) {
      return NextResponse.json({ error: 'Missing required fields: eventName or pixelId' }, { status: 400 });
    }
    
    // Extract IP address and user agent from request headers
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     '127.0.0.1'; // fallback
    
    const userAgent = request.headers.get('user-agent') || '';
    
    // Enhance user data with IP and user agent
    const enhancedUserData: Record<string, any> = {
      ...userData,
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    // If we don't have good user data, add country as fallback
    if (!enhancedUserData.em && !enhancedUserData.ph && !enhancedUserData.fn) {
      enhancedUserData.country = sha256Hash('sk'); // Slovakia - your target market
    }
    
    const event: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventData.event_source_url || 'https://najsilnejsiaklbovavyziva.sk',
      custom_data: {
        ...eventData,
        currency: eventData.currency || 'EUR',
        content_type: eventData.content_type || 'product',
      },
    };

    // Always include user data (even if just IP and user agent)
    event.user_data = enhancedUserData;

    const response = await fetch(
      `https://graph.facebook.com/v17.0/${pixelId}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          data: [event],
          test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook Conversion API Error:', errorData);
      return NextResponse.json({ error: 'Facebook API error', details: errorData }, { status: response.status });
    }

    const result = await response.json();
    console.log('Facebook Conversion API Success:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Facebook Conversion API Error:', error);
    return NextResponse.json({ error: 'Failed to send event' }, { status: 500 });
  }
}
