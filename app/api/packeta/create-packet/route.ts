import { NextResponse } from 'next/server';
import { Builder, Parser } from 'xml2js';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
const PACKETA_ESHOP_ID = process.env.PACKETA_ESHOP_ID || 'FITDOPLNKY';

interface PacketaAddress {
  street: string;
  houseNumber: string;
  city: string;
  zip: string;
}

interface PacketaSize {
  width: number;
  height: number;
  length: number;
}

interface PacketaCreatePacketRequest {
  orderId: string;
  name: string;
  surname: string;
  company?: string;
  email: string;
  phone: string;
  addressId?: string;
  address?: PacketaAddress;
  size?: PacketaSize;
  cod?: number;
  value: number;
  weight: number;
  isHomeDelivery?: boolean;
}

export async function POST(request: Request) {
  try {
    if (!PACKETA_API_PASSWORD) {
      console.error('Packeta API key is not configured');
      return NextResponse.json(
        { error: 'Packeta API key is not configured' },
        { status: 500 }
      );
    }

    const data: PacketaCreatePacketRequest = await request.json();
    
    // Validate that either addressId or address is provided
    if (!data.addressId && !data.address) {
      return NextResponse.json(
        { error: 'Either pickup point (addressId) or delivery address is required' },
        { status: 400 }
      );
    }


    // Create request body
    const requestBody = {
      createPacket: {
        apiPassword: PACKETA_API_PASSWORD,
        packetAttributes: {
          number: data.orderId,
          name: data.name,
          surname: data.surname,
          ...(data.company && { company: data.company }),
          email: data.email,
          phone: data.phone,
          ...(data.addressId && !data.address && { addressId: data.addressId }),
          ...(data.address && {
            addressId: "131",
            street: data.address.street,
            houseNumber: data.address.houseNumber,
            city: data.address.city,
            zip: data.address.zip,
            country: "SK"
          }),
          ...(data.size && {
            size: data.size
          }),
          ...(data.cod && !data.orderId.includes('stripe') && { cod: data.cod }),
          value: data.value,
          currency: 'EUR',
          weight: data.weight,
          eshop_id: PACKETA_ESHOP_ID
        }
      }
    };

    const xmlRequest = new Builder().buildObject(requestBody);

    // Send request to Packeta API
    const response = await fetch(PACKETA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml'
      },
      body: xmlRequest
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Packeta API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json(
        { error: `HTTP error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse XML response
    const xmlResponse = await response.text();
    
    const packetaResponse = await new Parser({ explicitArray: false }).parseStringPromise(xmlResponse);

    if (packetaResponse.response.status !== 'ok') {
      console.error('Packeta error response:', packetaResponse.response);
      return NextResponse.json(
        { 
          error: packetaResponse.response.string || 'Failed to create Packeta packet',
          details: packetaResponse.response
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      packetId: packetaResponse.response.result.id,
      barcode: packetaResponse.response.result.barcode,
      barcodeText: packetaResponse.response.result.barcodeText
    });
  } catch (error) {
    console.error('Error creating Packeta packet:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Packeta packet' },
      { status: 500 }
    );
  }
} 
