import Link from 'next/link';
import SuccessTracking from '../SuccessTracking';

interface PageProps {
  params: Promise<{
    orderId: string;
  }>;
}

async function getOrderMetadata(orderId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET}`).toString('base64')}`
      },
      cache: 'no-store' // No cache to get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    const order = await response.json();
    
    return {
      id: order.id,
      status: order.status,
      payment_method: order.payment_method,
      meta_data: order.meta_data,
      notes: order.notes || [],
      total: Number(order.total || '0'),
      tax: Number(order.total_tax || '0'),
      shipping_total: Number(order.shipping_total || '0'),
      shipping_lines: order.shipping_lines || [],
      shipping: order.shipping || {},
      billing: order.billing || {},
      line_items: Array.isArray(order.line_items) ? order.line_items.map((li: { product_id: number; name: string; price: string; quantity: number; category?: string }) => ({
        id: li.product_id as number,
        name: li.name as string,
        price: Number(li.price || '0'),
        quantity: Number(li.quantity || 1),
        category: li.category || undefined,
      })) : []
    };
  } catch {
    return null;
  }
}

interface OrderData {
  id: number;
  status: string;
  payment_method: string;
  total: string | number;
  meta_data: Array<{ key: string; value: string }>;
  shipping_lines: Array<{ method_id: string; method_title: string }>;
  shipping: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    city?: string;
    postcode?: string;
    email?: string;
    phone?: string;
  };
  billing: {
    first_name?: string;
    last_name?: string;
    company?: string;
    email?: string;
    phone?: string;
  };
}

async function createPacketaPacket(orderId: string, orderData: OrderData): Promise<{ success: boolean; packetId?: string; barcode?: string; barcodeText?: string; message?: string } | null> {
  try {
    console.log(`[Packeta] Attempting to create packet for order ${orderId}`);
    
    // Check if Packeta packet already exists
    const existingPacketId = orderData?.meta_data?.find((meta: { key: string; value: string }) => meta.key === '_packeta_packet_id')?.value;
    if (existingPacketId) {
      const existingBarcode = orderData?.meta_data?.find((meta: { key: string; value: string }) => meta.key === '_packeta_barcode')?.value;
      console.log(`[Packeta] Packet already exists for order ${orderId}: ${existingPacketId}`);
      return {
        success: true,
        packetId: existingPacketId,
        barcode: existingBarcode,
        message: 'Packet already exists'
      };
    }

    // Check if this is a Packeta shipment
    const isPacketaShipment = orderData?.shipping_lines?.some((line: { method_id: string }) => 
      line.method_id === 'packeta_pickup' || line.method_id === 'packeta_home'
    );

    if (!isPacketaShipment) {
      console.log(`[Packeta] Not a Packeta shipment for order ${orderId}`);
      return null;
    }

    // Check if order is in correct status
    if (orderData?.status !== 'processing' && orderData?.status !== 'completed') {
      console.log(`[Packeta] Order ${orderId} not in correct status: ${orderData?.status}`);
      return null;
    }

    const isHomeDelivery = orderData?.shipping_lines?.some((line: { method_id: string }) => line.method_id === 'packeta_home');
    const addressId = orderData?.meta_data?.find((meta: { key: string; value: string }) => meta.key === '_packeta_point_id')?.value;

    // Prepare Packeta request data with fallbacks
    const firstName = orderData?.shipping?.first_name || orderData?.billing?.first_name || '';
    const lastName = orderData?.shipping?.last_name || orderData?.billing?.last_name || '';
    const email = orderData?.billing?.email || orderData?.shipping?.email || '';
    const phone = (orderData?.billing?.phone || orderData?.shipping?.phone || '').replace(/\s/g, '');
    const company = orderData?.shipping?.company || orderData?.billing?.company;
    
    console.log(`[Packeta] Using data - Name: "${firstName}", Surname: "${lastName}", Email: "${email}", Phone: "${phone}"`);
    
    // Validate required fields
    if (!firstName || !lastName) {
      console.error(`[Packeta] Missing required name fields for order ${orderId}. First name: "${firstName}", Last name: "${lastName}"`);
      return null;
    }
    
    if (!email && !phone) {
      console.error(`[Packeta] Missing contact information for order ${orderId}. Email: "${email}", Phone: "${phone}"`);
      return null;
    }
    
    const packetaData: Record<string, unknown> = {
      orderId: orderId,
      name: firstName,
      surname: lastName,
      company: company,
      email: email,
      phone: phone,
      value: Number(orderData?.total || '0'),
      weight: 0.5, // Default weight
      ...(orderData?.payment_method === 'cod' && { cod: Number(orderData?.total || '0') })
    };

    if (isHomeDelivery) {
      const addressParts = (orderData?.shipping?.address_1 || '').trim().match(/^(.+?)(\d+(?:\/\d+)?)$/);
      const street = addressParts ? addressParts[1].trim() : orderData?.shipping?.address_1 || '';
      const houseNumber = addressParts ? addressParts[2] : '';
      
      packetaData.address = {
        street: street,
        houseNumber: houseNumber,
        city: orderData?.shipping?.city || '',
        zip: orderData?.shipping?.postcode || ''
      };
    } else if (addressId) {
      packetaData.addressId = addressId;
    } else {
      console.error(`[Packeta] Missing pickup point information for order ${orderId}`);
      return null;
    }

    console.log(`[Packeta] Creating packet with data:`, JSON.stringify(packetaData, null, 2));

    // Call Packeta API directly
    const packetaResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://najsilnejsiaklbovavyziva.sk'}/api/packeta/create-packet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(packetaData)
    });

    if (!packetaResponse.ok) {
      const errorText = await packetaResponse.text();
      console.error('[Packeta] API call failed:', errorText);
      return null;
    }

    const packetaResult = await packetaResponse.json();

    if (!packetaResult.success) {
      console.error('[Packeta] Packet creation failed:', packetaResult);
      return null;
    }

    // Update order with Packeta tracking data and send tracking email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY}:${process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meta_data: [
            { key: '_packeta_packet_id', value: packetaResult.packetId },
            { key: '_packeta_barcode', value: packetaResult.barcode },
            { key: '_packeta_barcode_text', value: packetaResult.barcodeText }
          ]
        })
      });
      console.log(`[Packeta] Updated order ${orderId} with tracking data`);

    } catch (updateError) {
      console.error('[Packeta] Failed to update order with tracking data:', updateError);
      // Continue even if update fails, packet was created
    }

    return {
      success: true,
      packetId: packetaResult.packetId,
      barcode: packetaResult.barcode,
      barcodeText: packetaResult.barcodeText
    };

  } catch (error) {
    console.error('[Packeta] Error creating packet:', error);
    return null;
  }
}



export default async function OrderSuccessPage({ params }: PageProps) {
  const { orderId } = await params;
  const orderData = await getOrderMetadata(orderId);
  
  let packetaId = orderData?.meta_data?.find((meta: { key: string; value: string }) => meta.key === '_packeta_packet_id')?.value;
  let packetaBarcode = orderData?.meta_data?.find((meta: { key: string; value: string }) => meta.key === '_packeta_barcode')?.value;

  // Check if this is a Packeta shipment that doesn't have a packet yet
  const isPacketaShipment = orderData?.shipping_lines?.some((line: { method_id: string }) => 
    line.method_id === 'packeta_pickup' || line.method_id === 'packeta_home'
  );

  // Create Packeta packet if needed (for both COD and card payments)
  if (isPacketaShipment && !packetaId && orderData?.status === 'processing') {
    console.log(`[Packeta] Order ${orderId} is Packeta shipment without packet, creating...`);
    const packetResult = await createPacketaPacket(orderId, orderData as unknown as OrderData);
    if (packetResult?.success) {
      packetaId = packetResult.packetId;
      packetaBarcode = packetResult.barcode;
      console.log(`[Packeta] Successfully created packet ${packetaId} for order ${orderId}`);
    }
  }

  // Note: Packeta will send tracking email automatically, no need for manual emails

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {orderData && (
        <SuccessTracking
          orderId={orderId}
          total={orderData.total}
          tax={orderData.tax}
          shipping={orderData.shipping_total}
          items={orderData.line_items}
        />
      )}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Objednávka bola úspešne vytvorená!
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Číslo objednávky: <span className="font-semibold">{orderId}</span>
          </p>
          {packetaId && (
            <p className="text-gray-600 mb-2">
              Číslo Packeta zásielky: <span className="font-semibold">{packetaId}</span>
            </p>
          )}
          <p className="text-gray-600 mb-8">
            Ďakujeme za Vašu objednávku. O jej stave Vás budeme informovať emailom.
          </p>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold mb-4">Čo ďalej?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {packetaBarcode ? (
                <a
                  href={`https://tracking.app.packeta.com/sk/${packetaBarcode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white border border-gray-300 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span className="font-medium">Sledovať zásielku</span>
                </a>
              ) : (
                <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span className="font-medium">Sledovanie zásielky bude dostupné čoskoro</span>
                </div>
              )}
              <Link
                href="/"
                className="flex items-center justify-center gap-3 bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="font-medium">Pokračovať v nákupe</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 