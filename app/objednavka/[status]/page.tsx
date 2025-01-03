'use client';

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderStatusPageProps {
  params: {
    status?: string;
  };
}

export default function OrderStatusPage({ params }: OrderStatusPageProps) {
  const { status } = params;
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [isValidOrder, setIsValidOrder] = useState(false);

  useEffect(() => {
    // Check if we have a valid order ID either in URL or session storage
    const lastOrderId = sessionStorage.getItem('lastOrderId');
    if (orderId || lastOrderId) {
      setIsValidOrder(true);
    }
  }, [orderId]);

  console.log('Current status:', status, 'Order ID:', orderId);

  const getStatusContent = () => {
    // If we have an order ID but no status, treat it as success
    if (orderId && (!status || status === 'undefined')) {
      return {
        icon: <CheckCircleIcon className="h-24 w-24 text-green-600" />,
        title: 'Objednávka bola úspešne vytvorená!',
        message: 'Ďakujeme za Váš nákup. O stave objednávky Vás budeme informovať emailom.',
        buttonText: 'Späť na e-shop',
        buttonLink: '/',
        buttonStyle: 'bg-green-600 hover:bg-green-700',
      };
    }

    // If we're on success page but don't have a valid order, show error
    if (status === 'uspesna' && !isValidOrder) {
      return {
        icon: <XCircleIcon className="h-24 w-24 text-gray-600" />,
        title: 'Neplatný stav objednávky',
        message: 'Stav objednávky nebol nájdený.',
        buttonText: 'Späť na e-shop',
        buttonLink: '/',
        buttonStyle: 'bg-gray-600 hover:bg-gray-700',
      };
    }

    const currentStatus = (status || '').toLowerCase();
    switch (currentStatus) {
      case 'uspesna':
      case 'success':
        return {
          icon: <CheckCircleIcon className="h-24 w-24 text-green-600" />,
          title: 'Objednávka bola úspešne vytvorená!',
          message: 'Ďakujeme za Váš nákup. O stave objednávky Vás budeme informovať emailom.',
          buttonText: 'Späť na e-shop',
          buttonLink: '/',
          buttonStyle: 'bg-green-600 hover:bg-green-700',
        };
      case 'neuspesna':
      case 'failed':
        return {
          icon: <XCircleIcon className="h-24 w-24 text-red-600" />,
          title: 'Objednávka nebola dokončená',
          message: 'Pri spracovaní objednávky nastala chyba. Prosím, skúste to znova alebo nás kontaktujte.',
          buttonText: 'Skúsiť znova',
          buttonLink: '/pokladna',
          buttonStyle: 'bg-red-600 hover:bg-red-700',
        };
      default:
        console.log('Invalid status received:', status);
        return {
          icon: <XCircleIcon className="h-24 w-24 text-gray-600" />,
          title: 'Neplatný stav objednávky',
          message: 'Stav objednávky nebol nájdený.',
          buttonText: 'Späť na e-shop',
          buttonLink: '/',
          buttonStyle: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const content = getStatusContent();

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              {content.icon}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900">
              {content.title}
            </h1>

            {/* Message */}
            <p className="text-gray-600">
              {content.message}
            </p>

            {orderId && (
              <p className="text-sm text-gray-500">
                Číslo objednávky: {orderId}
              </p>
            )}

            {/* Button */}
            <div className="pt-4">
              <Link
                href={content.buttonLink}
                className={`inline-flex items-center px-6 py-3 text-base font-medium text-white rounded-lg ${content.buttonStyle} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {content.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 