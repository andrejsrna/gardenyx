import Link from 'next/link';
import SuccessTracking from '../SuccessTracking';
import type { OrderItem } from '@prisma/client';
import prisma from '@/app/lib/prisma';

interface PageProps {
  params: Promise<{
    locale: string;
    orderId: string;
  }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { orderId, locale } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, meta: true }
  }).catch(() => null);

  const getMetaValue = (key: string) => order?.meta?.find(m => m.key === key)?.value ?? null;
  const packetaId = getMetaValue('_packeta_packet_id');
  const packetaBarcode = getMetaValue('_packeta_barcode');
  const shippingTotal = Number(order?.shippingTotal || 0);
  const taxTotal = Number(order?.taxTotal || 0);
  const items = (order?.items as OrderItem[] | undefined)?.map((i) => ({
    id: i.productId.toString(),
    name: i.productName,
    price: Number(i.price),
    quantity: Number(i.quantity)
  })) || [];

  // Note: Packeta will send tracking email automatically, no need for manual emails

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {order && (
        <SuccessTracking
          orderId={orderId}
          total={Number(order.total || 0)}
          tax={taxTotal}
          shipping={shippingTotal}
          items={items}
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
                href={`/${locale}/kupit`}
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
