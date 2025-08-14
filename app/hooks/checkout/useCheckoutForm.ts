'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import type { FormData } from '../../lib/checkout/types';
import { INITIAL_BILLING_INFO, INITIAL_SHIPPING_INFO } from '../../lib/checkout/constants';
import { updateShippingFromBilling } from '../../lib/checkout/utils';

const INITIAL_FORM_DATA: FormData = {
  billing: INITIAL_BILLING_INFO,
  shipping: INITIAL_SHIPPING_INFO,
  shipping_method: '',
  payment_method: '',
  customer_note: '',
  meta_data: [],
  is_business: false,
  create_account: false,
  account_password: '',
  consents: { termsAndPrivacy: false, marketing: true },
};

export function useCheckoutForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const handleInputChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => {
      const newState = { ...prev };
      let newBilling: typeof prev.billing | undefined;

      if (section === 'billing' || section === 'shipping') {
        const currentSection = newState[section];
        const updatedSection = { ...currentSection, [name]: value };

        if (section === 'billing') {
          newState.billing = updatedSection as typeof prev.billing;
          newBilling = updatedSection as typeof prev.billing;
          if (sameAsShipping) {
            newState.shipping = updateShippingFromBilling(newBilling, newState.shipping);
          }
        } else {
          newState.shipping = updatedSection as typeof prev.shipping;
        }
      } else if (section === 'consents') {
        newState.consents = { ...newState.consents, [name]: checked };
      } else if (section === 'root') {
        if (type === 'checkbox') {
          (newState as Record<string, unknown>)[name] = checked;
          if (name === 'is_business' && !checked) {
             newState.billing = { ...newState.billing, company: '', ic: '', dic: '', dic_dph: ''};
             if (sameAsShipping) {
                 newState.shipping = updateShippingFromBilling(newState.billing, newState.shipping);
             }
          }
          if (name === 'create_account' && !checked) {
            newState.account_password = '';
          }
        } else {
          (newState as Record<string, unknown>)[name] = value;
        }
      }

      return newState;
    });
  }, [sameAsShipping]);

  const handleSyncedFieldChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newBilling = { ...prev.billing, [name]: value };
        return {
            ...prev,
            billing: newBilling,
            ...(sameAsShipping && { shipping: updateShippingFromBilling(newBilling, prev.shipping) }),
        };
    });
  }, [sameAsShipping]);

  const handleSameAsShippingChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSameAsShipping(isChecked);
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        shipping: updateShippingFromBilling(prev.billing, prev.shipping),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        shipping: {
          ...INITIAL_SHIPPING_INFO,
          country: prev.shipping.country,
        },
      }));
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors(null);
    setSameAsShipping(true);
  }, []);

  return {
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    sameAsShipping,
    setSameAsShipping,
    handleInputChange,
    handleSyncedFieldChange,
    handleSameAsShippingChange,
    resetForm,
  };
} 