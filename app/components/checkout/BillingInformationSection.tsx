'use client';

import { ChangeEvent } from 'react';
import { useTranslations } from 'next-intl';
import type { FormData } from '../../lib/checkout/types';
import { sanitizePhone } from '../../lib/utils/sanitize';

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

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              formErrors?.['billing.first_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
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
              formErrors?.['billing.last_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <div>
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
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.email'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
            autoComplete="email"
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
              phoneError ? 'border-red-500' : ''
            } ${formErrors?.['billing.phone'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
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
              formErrors?.['billing.address_1'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
            autoComplete="street-address"
          />
        </div>

        {/* Address 2 (Apartment/Suite) */}
        <div className="md:col-span-2">
          <label htmlFor="billing-address_2" className="block text-sm font-medium text-gray-700">{t('fields.address2')}</label>
          <input
            id="billing-address_2"
            name="address_2"
            type="text"
            value={formData.billing.address_2 || ''}
            onChange={(e) => onInputChange(e, 'billing')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.address_2'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder={t('placeholders.address2')}
            aria-label={t('fields.address2')}
          />
        </div>

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
              formErrors?.['billing.city'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
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
            pattern="\d{5}"
            maxLength={5}
            placeholder="01000"
            title={t('postcodeTitle')}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
              formErrors?.['billing.postcode'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            required
            autoComplete="postal-code"
          />
        </div>
      </div>
    </div>
  );
} 
