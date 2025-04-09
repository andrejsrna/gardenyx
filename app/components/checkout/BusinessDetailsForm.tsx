'use client';

import React, { ChangeEvent } from 'react';

// Import BillingInfo from the correct central types file
import type { BillingInfo } from '../../types/checkoutTypes';
import FormField from './FormField';

interface BusinessDetailsFormProps {
  isBusiness: boolean;
  billingData: BillingInfo;
  formErrors: Record<string, string[] | undefined> | null;
  handleRootInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; // Handles the checkbox
  handleBillingInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: 'billing') => void; // Handles text inputs
}

const BusinessDetailsForm: React.FC<BusinessDetailsFormProps> = ({
  isBusiness,
  billingData,
  formErrors,
  handleRootInputChange,
  handleBillingInputChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="is_business"
          checked={isBusiness}
          onChange={handleRootInputChange} // Use the root handler for the checkbox itself
          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <span className="text-sm font-medium text-gray-700">Nakupujem na firmu</span>
      </label>
      {isBusiness && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="billing-company"
            name="company"
            label="Názov firmy"
            type="text"
            value={billingData.company}
            onChange={(e) => handleBillingInputChange(e, 'billing')} // Use billing handler for fields
            required={isBusiness} // Conditionally required
            placeholder="Zadajte názov firmy"
            errors={formErrors?.['billing.company']}
            isBusinessField={true} // Indicate it's a business field
          />
          <FormField
            id="billing-ic"
            name="ic"
            label="IČO"
            type="text"
            value={billingData.ic || ''}
            onChange={(e) => handleBillingInputChange(e, 'billing')}
            required={isBusiness}
            placeholder="Zadajte IČO (8 číslic)"
            maxLength={8}
            pattern="\d{8}"
            errors={formErrors?.['billing.ic']}
            isBusinessField={true}
          />
          <FormField
            id="billing-dic"
            name="dic"
            label="DIČ"
            type="text"
            value={billingData.dic || ''}
            onChange={(e) => handleBillingInputChange(e, 'billing')}
            required={isBusiness}
            placeholder="Zadajte DIČ (10 číslic)"
            maxLength={10}
            pattern="\d{10}"
            errors={formErrors?.['billing.dic']}
            isBusinessField={true}
          />
          <FormField
            id="billing-dic_dph"
            name="dic_dph"
            label="IČ DPH"
            type="text"
            value={billingData.dic_dph || ''}
            onChange={(e) => handleBillingInputChange(e, 'billing')}
            placeholder="SKXXXXXXXXXX (nepovinné)"
            errors={formErrors?.['billing.dic_dph']}
            isBusinessField={true} // Optional, but still part of business section
          />
        </div>
      )}
    </div>
  );
};

export default BusinessDetailsForm;
