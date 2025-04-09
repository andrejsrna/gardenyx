'use client';

import Image from 'next/image';
import React, { ChangeEvent } from 'react';

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Spôsob platby <span className="text-red-500">*</span></h2>
      <div className="space-y-3">
        {/* COD */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
          <input
            type="radio"
            name="payment_method"
            value="cod"
            checked={selectedMethod === 'cod'}
            onChange={onMethodChange}
            className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500"
            required
          />
          <div className="flex-1">
            <div className="font-medium">Dobierka</div>
            <div className="text-sm text-gray-500">Platba v hotovosti alebo kartou pri prevzatí tovaru.</div>
            {/* Optional COD fee display: <span className="ml-2 font-medium">1.00 €</span> */}
          </div>
        </label>
        {/* Stripe */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
          <input
            type="radio"
            name="payment_method"
            value="stripe"
            checked={selectedMethod === 'stripe'}
            onChange={onMethodChange}
            className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500"
            required
          />
          <div className="flex-1">
            <div className="font-medium">Platba kartou online</div>
            <div className="text-sm text-gray-500">Bezpečná platba cez Stripe (Visa, Mastercard, Google Pay, Apple Pay).</div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Image src="/paymets/visa.svg" alt="Visa" width={35} height={22} className="h-5" />
              <Image src="/paymets/mastercard.svg" alt="Mastercard" width={35} height={22} className="h-5" />
              <Image src="/paymets/gpay.svg" alt="Google Pay" width={40} height={22} className="h-5" />
              <Image src="/paymets/applepay.svg" alt="Apple Pay" width={40} height={22} className="h-5" />
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethods;
