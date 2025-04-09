'use client';

import React, { ChangeEvent } from 'react';

import type { BillingInfo } from '@/app/types/checkoutTypes';
import FormField from './FormField'; // Import the reusable component

interface BillingFormProps {
  billingData: BillingInfo;
  formErrors: Record<string, string[] | undefined> | null;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: 'billing') => void;
  handleSyncedFieldChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handlePhoneChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  phoneError: string | null; // Keep this for now, might integrate into formErrors later
}

const BillingForm: React.FC<BillingFormProps> = ({
  billingData,
  formErrors,
  handleInputChange,
  handleSyncedFieldChange,
  handlePhoneChange,
  phoneError,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Fakturačné údaje</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="billing-first_name"
          name="first_name"
          label="Meno"
          type="text"
          value={billingData.first_name}
          onChange={handleSyncedFieldChange}
          required
          autoComplete="given-name"
          errors={formErrors?.['billing.first_name']}
        />
        <FormField
          id="billing-last_name"
          name="last_name"
          label="Priezvisko"
          type="text"
          value={billingData.last_name}
          onChange={handleSyncedFieldChange}
          required
          autoComplete="family-name"
          errors={formErrors?.['billing.last_name']}
        />
        <FormField
          id="billing-email"
          name="email"
          label="Email"
          type="email"
          value={billingData.email}
          onChange={(e) => handleInputChange(e, 'billing')}
          required
          placeholder="vas@email.sk"
          autoComplete="email"
          errors={formErrors?.['billing.email']}
        />
        {/* Phone - Uses FormField but keeps specific error display for now */}
        <div className="space-y-1">
          <FormField
            id="billing-phone"
            name="phone"
            label="Telefón"
            type="tel"
            value={billingData.phone}
            onChange={handlePhoneChange}
            required
            placeholder="+421 XXX XXX XXX"
            autoComplete="tel"
            errors={formErrors?.['billing.phone']}
            // Pass down phoneError specifically if needed for custom display
            // Note: The default FormField error display might be sufficient
          />
          {/* Keep dedicated phoneError display if FormField display isn't enough */}
          {phoneError && !formErrors?.['billing.phone'] && (
            <p className="mt-1 text-xs text-red-600">{phoneError}</p>
          )}
        </div>
        {/* Address 1 (Street) - Pass the ref here */}
        <div className="md:col-span-2">
          <FormField
            id="billing-address_1"
            name="address_1"
            label="Adresa"
            type="text"
            value={billingData.address_1}
            onChange={handleSyncedFieldChange}
            required
            placeholder="Ulica a číslo domu"
            autoComplete="street-address"
            errors={formErrors?.['billing.address_1']}
          />
        </div>
        <FormField
          id="billing-city"
          name="city"
          label="Mesto"
          type="text"
          value={billingData.city}
          onChange={handleSyncedFieldChange}
          required
          autoComplete="address-level2"
          errors={formErrors?.['billing.city']}
        />
        <FormField
          id="billing-postcode"
          name="postcode"
          label="PSČ"
          type="text"
          value={billingData.postcode}
          onChange={handleSyncedFieldChange}
          required
          pattern="\d{5}"
          maxLength={5}
          placeholder="XXXXX"
          title="PSČ musí obsahovať 5 číslic"
          autoComplete="postal-code"
          errors={formErrors?.['billing.postcode']}
        />
      </div>
    </div>
  );
};

export default BillingForm;
