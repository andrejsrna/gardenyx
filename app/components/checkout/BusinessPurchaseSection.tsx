'use client';

import { ChangeEvent } from 'react';
import type { FormData } from '../../lib/checkout/types';

interface BusinessPurchaseSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
}

export default function BusinessPurchaseSection({
  formData,
  formErrors,
  onInputChange,
}: BusinessPurchaseSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="is_business"
          checked={formData.is_business}
          onChange={(e) => onInputChange(e, 'root')}
          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-sm font-medium text-gray-700">Nakupujem na firmu</span>
      </label>
      
      {formData.is_business && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="billing-company">
              Názov firmy <span className="text-red-500">*</span>
            </label>
            <input
              id="billing-company"
              name="company"
              type="text"
              value={formData.billing.company}
              onChange={(e) => onInputChange(e, 'billing')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['billing.company'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required={formData.is_business}
              placeholder="Zadajte názov firmy"
              aria-label="Názov firmy"
            />
          </div>
          
          {/* IC Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="billing-ic">
              IČO <span className="text-red-500">*</span>
            </label>
            <input
              id="billing-ic"
              name="ic"
              type="text"
              value={formData.billing.ic || ''}
              onChange={(e) => onInputChange(e, 'billing')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['billing.ic'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required={formData.is_business}
              placeholder="Zadajte IČO (8 číslic)"
              maxLength={8}
              pattern="\d{8}"
            />
          </div>
          
          {/* DIC Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic">
              DIČ <span className="text-red-500">*</span>
            </label>
            <input
              id="billing-dic"
              name="dic"
              type="text"
              value={formData.billing.dic || ''}
              onChange={(e) => onInputChange(e, 'billing')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['billing.dic'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required={formData.is_business}
              placeholder="Zadajte DIČ (10 číslic)"
              maxLength={10}
              pattern="\d{10}"
            />
          </div>
          
          {/* DIC DPH Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic_dph">
              IČ DPH
            </label>
            <input
              id="billing-dic_dph"
              name="dic_dph"
              type="text"
              value={formData.billing.dic_dph || ''}
              onChange={(e) => onInputChange(e, 'billing')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['billing.dic_dph'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="SKXXXXXXXXXX (voliteľné)"
            />
          </div>
        </div>
      )}
    </div>
  );
} 