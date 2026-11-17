'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useTranslations } from 'next-intl';
import type { FormData } from '../../lib/checkout/types';
import { sanitizePhone } from '@eshop-core/utils/sanitize';
import { SUPPORTED_COUNTRIES } from '../../lib/checkout/constants';

function getPostcodeProps(country: string) {
  if (country === 'HU') return { pattern: '\\d{4}', maxLength: 4, placeholder: '1011' };
  return { pattern: '\\d{5}', maxLength: 5, placeholder: '01000' };
}

interface BillingInformationSectionProps {
  formData: FormData;
  formErrors: Record<string, string[] | undefined> | null;
  sameAsShipping: boolean;
  phoneError: string | null;
  onInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => void;
  onSyncedFieldChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFormDataChange: (data: FormData) => void;
  setPhoneError: (error: string | null) => void;
}

export default function BillingInformationSection({
  formData,
  formErrors,
  sameAsShipping,
  phoneError,
  onInputChange,
  onSyncedFieldChange,
  onFormDataChange,
  setPhoneError,
}: BillingInformationSectionProps) {
  const t = useTranslations('checkout.billingInformation');
  const { saveCartWithEmail } = useCart();
  const savedEmailRef = useRef('');
  const [showAddress2, setShowAddress2] = useState(Boolean(formData.billing.address_2));

  // Stores the cart for a single reminder; the cron job sends it after 1 h if no order exists.
  const handleEmailBlur = () => {
    const email = formData.billing.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email === savedEmailRef.current) return;
    savedEmailRef.current = email;
    saveCartWithEmail(email);
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value;
    const formattedPhone = sanitizePhone(rawPhone);
    const digitsCount = formattedPhone.replace(/\D/g, '').length;
    const isValidPhone = formattedPhone === '' || /^\+\d{9,15}$/.test(formattedPhone);
    const shouldShowError = formattedPhone !== '' && (!isValidPhone && digitsCount >= 9);

    const newFormData = {
      ...formData,
      billing: { ...formData.billing, phone: formattedPhone },
      ...(sameAsShipping && formData.billing.phone && {
        shipping: { ...formData.shipping }
      }),
    };
    
    onFormDataChange(newFormData);
    setPhoneError(shouldShowError ? t('phoneFullError') : null);
  };

  const postcodeProps = getPostcodeProps(formData.billing.country);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="md:col-span-2">
          <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700">
            {t('fields.email')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-email"
            name="email"
            type="email"
            placeholder={t('placeholders.email')}
            value={formData.billing.email}
            onChange={(e) => onInputChange(e, 'billing')}
            onBlur={handleEmailBlur}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.email'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="email"
          />
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="billing-first_name" className="block text-sm font-medium text-gray-700">
            {t('fields.firstName')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-first_name"
            name="first_name"
            type="text"
            placeholder={t('placeholders.firstName')}
            value={formData.billing.first_name}
            onChange={onSyncedFieldChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.first_name'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="given-name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="billing-last_name" className="block text-sm font-medium text-gray-700">
            {t('fields.lastName')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-last_name"
            name="last_name"
            type="text"
            placeholder={t('placeholders.lastName')}
            value={formData.billing.last_name}
            onChange={onSyncedFieldChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.last_name'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="family-name"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">
            {t('fields.phone')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-phone"
            name="phone"
            type="tel"
            value={formData.billing.phone}
            onChange={handlePhoneChange}
            placeholder={t('placeholders.phone')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              phoneError ? 'ring-2 ring-red-500 bg-red-50' : ''
            } ${formErrors?.['billing.phone'] ? 'ring-2 ring-red-500 bg-red-50' : ''}`}
            required
            autoComplete="tel"
          />
          {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
        </div>

        {/* Address 1 (Street) */}
        <div className="md:col-span-2">
          <label htmlFor="billing-address_1" className="block text-sm font-medium text-gray-700">
            {t('fields.address')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-address_1"
            name="address_1"
            type="text"
            value={formData.billing.address_1}
            onChange={onSyncedFieldChange}
            placeholder={t('placeholders.address')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.address_1'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="street-address"
          />
        </div>

        {/* Address 2 (Apartment/Suite) */}
        {showAddress2 ? (
        <div className="md:col-span-2">
          <label htmlFor="billing-address_2" className="block text-sm font-medium text-gray-700">{t('fields.address2')}</label>
          <input
            id="billing-address_2"
            name="address_2"
            type="text"
            value={formData.billing.address_2 || ''}
            onChange={(e) => onInputChange(e, 'billing')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.address_2'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            placeholder={t('placeholders.address2')}
            aria-label={t('fields.address2')}
          />
        </div>
        ) : (
          <div className="md:col-span-2 -mt-2">
            <button type="button" onClick={() => setShowAddress2(true)} className="text-sm text-green-700 hover:text-green-800 underline">
              {t('addAddress2')}
            </button>
          </div>
        )}

        {/* City */}
        <div>
          <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">
            {t('fields.city')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-city"
            name="city"
            type="text"
            placeholder={t('placeholders.city')}
            value={formData.billing.city}
            onChange={onSyncedFieldChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.city'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="address-level2"
          />
        </div>

        {/* Postcode */}
        <div>
          <label htmlFor="billing-postcode" className="block text-sm font-medium text-gray-700">
            {t('fields.postcode')} <span className="text-red-500">*</span>
          </label>
          <input
            id="billing-postcode"
            name="postcode"
            type="text"
            value={formData.billing.postcode}
            onChange={onSyncedFieldChange}
            pattern={postcodeProps.pattern}
            maxLength={postcodeProps.maxLength}
            placeholder={postcodeProps.placeholder}
            title={t('postcodeTitle')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.postcode'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="postal-code"
          />
        </div>

        {/* Country */}
        <div>
          <label htmlFor="billing-country" className="block text-sm font-medium text-gray-700">
            {t('fields.country')} <span className="text-red-500">*</span>
          </label>
          <select
            id="billing-country"
            name="country"
            value={formData.billing.country}
            onChange={(e) => onInputChange(e, 'billing')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.country'] ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            required
            autoComplete="country"
          >
            {SUPPORTED_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 
