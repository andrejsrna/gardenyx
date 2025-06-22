'use client';

import { ChangeEvent } from 'react';
import type { FormData } from '../../lib/checkout/types';

interface ShippingInformationSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  sameAsShipping: boolean;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
  onSameAsShippingChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFormDataChange: (data: FormData) => void;
}

export default function ShippingInformationSection({
  formData,
  formErrors,
  sameAsShipping,
  onInputChange,
  onSameAsShippingChange,
}: ShippingInformationSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Adresa doručenia</h2>
      
      {/* Same as billing checkbox */}
      <div className="mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsShipping}
            onChange={onSameAsShippingChange}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Adresa doručenia je rovnaká ako fakturačná adresa
          </span>
        </label>
      </div>
      
      {!sameAsShipping && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="shipping-first_name" className="block text-sm font-medium text-gray-700">
              Meno <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-first_name"
              name="first_name"
              type="text"
              value={formData.shipping.first_name}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.first_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping given-name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="shipping-last_name" className="block text-sm font-medium text-gray-700">
              Priezvisko <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-last_name"
              name="last_name"
              type="text"
              value={formData.shipping.last_name}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.last_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping family-name"
            />
          </div>

          {/* Company (optional) */}
          <div className="md:col-span-2">
            <label htmlFor="shipping-company" className="block text-sm font-medium text-gray-700">
              Názov firmy (nepovinné)
            </label>
            <input
              id="shipping-company"
              name="company"
              type="text"
              value={formData.shipping.company}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.company'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              autoComplete="shipping organization"
            />
          </div>

          {/* Address 1 (Street) */}
          <div className="md:col-span-2">
            <label htmlFor="shipping-address_1" className="block text-sm font-medium text-gray-700">
              Adresa <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-address_1"
              name="address_1"
              type="text"
              value={formData.shipping.address_1}
              onChange={(e) => onInputChange(e, 'shipping')}
              placeholder="Názov ulice a číslo domu"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.address_1'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping street-address"
            />
          </div>

          {/* Address 2 (Apartment/Suite) */}
          <div className="md:col-span-2">
            <label htmlFor="shipping-address_2" className="block text-sm font-medium text-gray-700">
              Doplnková adresa
            </label>
            <input
              id="shipping-address_2"
              name="address_2"
              type="text"
              value={formData.shipping.address_2 || ''}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.address_2'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Názov ulice, číslo domu, číslo miesta"
              autoComplete="shipping address-line2"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700">
              Mesto <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-city"
              name="city"
              type="text"
              value={formData.shipping.city}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.city'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping address-level2"
            />
          </div>

          {/* Postcode */}
          <div>
            <label htmlFor="shipping-postcode" className="block text-sm font-medium text-gray-700">
              PSČ <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-postcode"
              name="postcode"
              type="text"
              value={formData.shipping.postcode}
              onChange={(e) => onInputChange(e, 'shipping')}
              pattern="\d{5}"
              maxLength={5}
              placeholder="XXXXX"
              title="PSČ musí obsahovať 5 číslic"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.postcode'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping postal-code"
            />
          </div>
        </div>
      )}
    </div>
  );
} 