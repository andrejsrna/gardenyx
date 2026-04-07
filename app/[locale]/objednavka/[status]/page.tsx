'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OrderSuccessProps {
  params: Promise<{
    status: string;
  }>;
}

interface OrderData {
  id: number;
  status: string;
  total: string;
  // Add other order properties you need
}

export default function OrderStatusPage(props: OrderSuccessProps) {
  const params = use(props.params);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const { clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`/api/orders/${params.status}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }
        const data = await response.json();
        setOrderData(data);
        if (params.status === 'success') {
          clearCart();
        }
      } catch {
        router.push('/objednavka/neuspesna');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [params.status, clearCart, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isSuccess = params.status === 'success' || params.status === 'uspesna';

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {isSuccess ? (
                <CheckCircleIcon className="h-24 w-24 text-green-600" />
              ) : (
                <XCircleIcon className="h-24 w-24 text-red-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isSuccess ? 'Objednávka bola úspešne vytvorená!' : 'Objednávka nebola dokončená'}
            </h1>
            <p className="text-gray-600">
              {isSuccess 
                ? 'Ďakujeme za Váš nákup. O stave objednávky Vás budeme informovať emailom.'
                : 'Pri spracovaní objednávky nastala chyba. Prosím, skúste to znova alebo nás kontaktujte.'}
            </p>
            {orderData?.id && (
              <p className="text-sm text-gray-500">
                Číslo objednávky: {orderData.id}
              </p>
            )}
            <div className="pt-4">
              <Link
                href={isSuccess ? '/' : '/pokladna'}
                className={`inline-flex items-center px-6 py-3 text-base font-medium text-white rounded-lg ${
                  isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isSuccess ? 'Späť na e-shop' : 'Skúsiť znova'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 
