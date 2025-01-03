export interface PacketaPoint {
  id: string;
  name: string;
  city: string;
  street: string;
  zip: string;
  country: string;
  type: string;
}

// Get API key from environment variables
const PACKETA_API_KEY = process.env.NEXT_PUBLIC_PACKETA_API_KEY;

if (!PACKETA_API_KEY) {
  console.error('Missing Packeta API key in environment variables');
}

export function transformPacketaDataToMetadata(data: {
  point_id: string;
  point_name: string;
  point_address: string;
}) {
  return [
    {
      key: '_packeta_point_id',
      value: data.point_id,
    },
    {
      key: '_packeta_point_name',
      value: data.point_name,
    },
    {
      key: '_packeta_point_address',
      value: data.point_address,
    },
  ];
}

export async function getPacketaPoints(): Promise<PacketaPoint[]> {
  try {
    // Use our internal API route instead of calling Packeta directly
    const response = await fetch('/api/packeta/points', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Packeta API error:', errorData);
      throw new Error(errorData.error || 'Failed to fetch Packeta points');
    }

    const data = await response.json();

    // Transform the response to match our PacketaPoint interface
    return data.map((point: PacketaPoint) => ({
      id: point.id,
      name: point.name,
      city: point.city,
      street: point.street,
      zip: point.zip,
      country: point.country,
      type: point.type,
    }));
  } catch (error) {
    console.error('Error fetching Packeta points:', error);
    return [];
  }
} 