'use client';

import React, { ChangeEvent } from 'react';

import type { ShippingInfo } from '@/app/types/checkoutTypes';
import FormField from './FormField';

interface ShippingFormProps {
  shippingData: ShippingInfo;
  formErrors: Record<string, string[] | undefined> | null;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section: 'shipping') => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  shippingData,
  formErrors,
  handleInputChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Adresa doručenia</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="shipping-first_name"
          name="first_name"
          label="Meno"
          type="text"
          value={shippingData.first_name}
          onChange={(e) => handleInputChange(e, 'shipping')}
          required
          autoComplete="shipping given-name"
          errors={formErrors?.['shipping.first_name']}
        />
        <FormField
          id="shipping-last_name"
          name="last_name"
          label="Priezvisko"
          type="text"
          value={shippingData.last_name}
          onChange={(e) => handleInputChange(e, 'shipping')}
          required
          autoComplete="shipping family-name"
          errors={formErrors?.['shipping.last_name']}
        />
        <div className="md:col-span-2">
          <FormField
            id="shipping-address_1"
            name="address_1"
            label="Adresa"
            type="text"
            value={shippingData.address_1}
            onChange={(e) => handleInputChange(e, 'shipping')}
            required
            autoComplete="shipping street-address"
            errors={formErrors?.['shipping.address_1']}
          />
        </div>
        <FormField
          id="shipping-city"
          name="city"
          label="Mesto"
          type="text"
          value={shippingData.city}
          onChange={(e) => handleInputChange(e, 'shipping')}
          required
          autoComplete="shipping address-level2"
          errors={formErrors?.['shipping.city']}
        />
        <FormField
          id="shipping-postcode"
          name="postcode"
          label="PSČ"
          type="text"
          value={shippingData.postcode}
          onChange={(e) => handleInputChange(e, 'shipping')}
          required
          pattern="\d{5}"
          maxLength={5}
          placeholder="XXXXX"
          title="PSČ musí obsahovať 5 číslic"
          autoComplete="shipping postal-code"
          errors={formErrors?.['shipping.postcode']}
        />
      </div>
    </div>
  );
};

export default ShippingForm;
