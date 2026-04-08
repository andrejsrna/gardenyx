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

const SUPPORTED_COUNTRIES = ['sk', 'cz', 'hu'];

export async function GET(request: Request) {
  try {
    if (!PACKETA_API_KEY) {
      console.error('Missing Packeta API key');
      return NextResponse.json(
        { error: 'Missing Packeta API key' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const countryParam = searchParams.get('country')?.toLowerCase();
    const filterCountry = countryParam && SUPPORTED_COUNTRIES.includes(countryParam) ? countryParam : null;

    const lang = countryParam === 'hu' ? 'hu' : countryParam === 'cz' ? 'cs' : 'sk';
    const apiUrl = `https://pickup-point.api.packeta.com/v5/${PACKETA_API_KEY}/branch/json?lang=${lang}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
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

    const points = filterCountry
      ? data.data.filter((point) => point.country === filterCountry)
      : data.data.filter((point) => SUPPORTED_COUNTRIES.includes(point.country));

    return NextResponse.json(points);
  } catch (error) {
    console.error('Error fetching Packeta points:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Packeta points' },
      { status: 500 }
    );
  }
} 