"use client";

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import CouponSection from './CouponSection';

interface CartProps {
  onClose: () => void;
}

export default function Cart({ onClose }: CartProps) {
  const { items, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const { customerData, isAuthenticated, isLoading } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && customerData?.billing?.first_name) {
      setUserName(customerData.billing.first_name);
    } else {
      setUserName(null);
    }
  }, [isAuthenticated, customerData]);

  if (totalItems === 0) {
    return (
      <div className="p-4 text-center">
        {!isLoading && userName && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Ahoj, {userName}!
            </span>
          </div>
        )}
        <p className="text-gray-500">Váš košík je prázdny</p>
        <Link 
          href="/kupit" 
          onClick={onClose}
          className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
        >
          Prejsť do obchodu
        </Link>
      </div>
    );
  }

  const handleRemove = (itemId: number) => {
    removeFromCart(itemId);
    if (totalItems === 1) { // If this is the last item
      onClose();
    }
  };

  return (
    <div className="p-4">
      {!isLoading && userName && (
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Ahoj, {userName}!
          </span>
        </div>
      )}
      <div className="space-y-4 mb-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex gap-4 bg-white p-3 rounded-lg shadow-sm"
          >
            {item.image && (
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex-grow min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Medzisúčet:</span>
          <span className="font-medium">{totalPrice.toFixed(2)} €</span>
        </div>
        <CouponSection />
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Spolu:</span>
          <span className="text-lg font-bold">{totalPrice.toFixed(2)} €</span>
        </div>
        <Link
          href="/pokladna"
          onClick={onClose}
          className="block w-full text-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Pokračovať k pokladni ({totalItems})
        </Link>
      </div>
    </div>
  );
} 