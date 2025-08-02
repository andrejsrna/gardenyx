import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.FB_CONVERSION_API_ACCESS_TOKEN;

export async function POST(request: Request) {
  if (!ACCESS_TOKEN) {
    console.error('Missing Facebook Conversion API configuration');
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
  }

  try {
    const { eventName, eventData, userData, pixelId } = await request.json();
    
    const event: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: eventData.event_source_url || 'https://najsilnejsiaklbovavyziva.sk',
      custom_data: eventData || {},
    };

    if (userData && Object.keys(userData).length > 0) {
      event.user_data = userData;
    }

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
