import { NextResponse } from 'next/server';

const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN!;
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID!;

export async function POST(request: Request) {
  const data = await request.json();
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          data: [data],
        }),
      }
    );

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Facebook Conversion API Error:', error);
    return NextResponse.json({ error: 'Failed to send event' }, { status: 500 });
  }
} 