import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET;

interface ShippingZoneLocation {
  code: string;
  type: string;
}

interface ShippingZone {
  id: number;
  name: string;
  order: number;
  locations?: ShippingZoneLocation[];
}

export async function GET() {
  try {
    // Get shipping zones to find Slovakia zone
    const zonesResponse = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/shipping/zones?consumer_key=${WOO_CONSUMER_KEY}&consumer_secret=${WOO_CONSUMER_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 60,
        },
      }
    );

    if (!zonesResponse.ok) {
      throw new Error('Failed to fetch shipping zones');
    }

    const zones = await zonesResponse.json() as ShippingZone[];
    
    // Find Slovakia zone (usually named "Slovensko" or with locations set to SK)
    const slovakiaZone = zones.find((zone) => 
      zone.name.toLowerCase().includes('slovensko') || 
      zone.locations?.some((loc) => loc.code === 'SK')
    );

    if (!slovakiaZone) {
      console.error('Slovakia shipping zone not found');
      return NextResponse.json([]);
    }

    // Get methods for Slovakia zone
    const methodsResponse = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/shipping/zones/${slovakiaZone.id}/methods?consumer_key=${WOO_CONSUMER_KEY}&consumer_secret=${WOO_CONSUMER_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 60,
        },
      }
    );

    if (!methodsResponse.ok) {
      throw new Error('Failed to fetch shipping methods');
    }

    const methods = await methodsResponse.json();

    return NextResponse.json(methods);
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return NextResponse.json({ error: 'Failed to fetch shipping methods' }, { status: 500 });
  }
} 