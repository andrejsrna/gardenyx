import { NextResponse } from 'next/server';

const API_SECRET = process.env.GA_API_SECRET!;
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!;
const MEASUREMENT_PROTOCOL_API = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

export async function POST(request: Request) {
  const data = await request.json();
  
  try {
    const response = await fetch(MEASUREMENT_PROTOCOL_API, {
      method: 'POST',
      body: JSON.stringify({
        client_id: data.client_id,
        events: [data.event],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send event to GA4');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to send event' }, { status: 500 });
  }
} 