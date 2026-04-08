'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { FormData } from '../../lib/checkout/types';
import { SUPPORTED_COUNTRIES } from '../../lib/checkout/constants';

function getPostcodeProps(country: string) {
  if (country === 'HU') return { pattern: '\\d{4}', maxLength: 4, placeholder: '1011' };
  return { pattern: '\\d{5}', maxLength: 5, placeholder: '01000' };
}

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
  const t = useTranslations('checkout.shippingInformation');
  const postcodeProps = getPostcodeProps(formData.shipping.country);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
      {formData.shipping_method === 'packeta_home' && (
        <p className="mb-4 text-sm text-gray-600">
          {t('packetaHomeHint')}
        </p>
      )}
      
      {/* Same as billing checkbox */}
      <div className="mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsShipping}
            onChange={onSameAsShippingChange}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm font-medium text-gray-700">{t('sameAsBilling')}</span>
        </label>
      </div>
      
      {!sameAsShipping && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="shipping-first_name" className="block text-sm font-medium text-gray-700">
              {t('fields.firstName')} <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-first_name"
              name="first_name"
              type="text"
              placeholder={t('placeholders.firstName')}
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
              {t('fields.lastName')} <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-last_name"
              name="last_name"
              type="text"
              placeholder={t('placeholders.lastName')}
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
            <label htmlFor="shipping-company" className="block text-sm font-medium text-gray-700">{t('fields.companyOptional')}</label>
            <input
              id="shipping-company"
              name="company"
              type="text"
              placeholder={t('placeholders.company')}
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
              {t('fields.address')} <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-address_1"
              name="address_1"
              type="text"
              placeholder={t('placeholders.address')}
              value={formData.shipping.address_1}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.address_1'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping street-address"
            />
          </div>

          {/* Address 2 (Apartment/Suite) */}
          <div className="md:col-span-2">
            <label htmlFor="shipping-address_2" className="block text-sm font-medium text-gray-700">{t('fields.address2')}</label>
            <input
              id="shipping-address_2"
              name="address_2"
              type="text"
              placeholder={t('placeholders.address2')}
              value={formData.shipping.address_2 || ''}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.address_2'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              autoComplete="shipping address-line2"
            />
          </div>

          {/* City */}
          <div>
            <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700">
              {t('fields.city')} <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-city"
              name="city"
              type="text"
              placeholder={t('placeholders.city')}
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
              {t('fields.postcode')} <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-postcode"
              name="postcode"
              type="text"
              value={formData.shipping.postcode}
              onChange={(e) => onInputChange(e, 'shipping')}
              pattern={postcodeProps.pattern}
              maxLength={postcodeProps.maxLength}
              placeholder={postcodeProps.placeholder}
              title={t('postcodeTitle')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.postcode'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping postal-code"
            />
          </div>

          {/* Country */}
          <div>
            <label htmlFor="shipping-country" className="block text-sm font-medium text-gray-700">
              {t('fields.country')} <span className="text-red-500">*</span>
            </label>
            <select
              id="shipping-country"
              name="country"
              value={formData.shipping.country}
              onChange={(e) => onInputChange(e, 'shipping')}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
                formErrors?.['shipping.country'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              required
              autoComplete="shipping country"
            >
              {SUPPORTED_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
} 
