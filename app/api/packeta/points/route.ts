import { NextResponse } from 'next/server';

const PACKETA_API_KEY = process.env.NEXT_PUBLIC_PACKETA_API_KEY;

interface PacketaApiPoint {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
  country: string;
  type: string;
}

interface PacketaApiResponse {
  data: PacketaApiPoint[];
}

export async function GET() {
  try {
    if (!PACKETA_API_KEY) {
      console.error('Missing Packeta API key');
      return NextResponse.json(
        { error: 'Missing Packeta API key' },
        { status: 500 }
      );
    }


    const apiUrl = `https://pickup-point.api.packeta.com/v5/${PACKETA_API_KEY}/branch/json?lang=sk`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: apiUrl,
      };
      console.error('Packeta API error:', error);
      return NextResponse.json(
        { error: `Packeta API error: ${JSON.stringify(error)}` },
        { status: response.status }
      );
    }

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText) as PacketaApiResponse;
    } catch (e) {
      console.error('Failed to parse Packeta API response:', e);
      return NextResponse.json(
        { error: 'Invalid JSON response from Packeta API' },
        { status: 500 }
      );
    }

    if (!data || !data.data) {
      console.error('Invalid Packeta API response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response structure from Packeta API' },
        { status: 500 }
      );
    }

    // Filter points for Slovakia
    const slovakPoints = data.data.filter((point) => point.country === 'sk');

    return NextResponse.json(slovakPoints);
  } catch (error) {
    console.error('Error fetching Packeta points:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Packeta points' },
      { status: 500 }
    );
  }
} 