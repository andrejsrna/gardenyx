'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CustomerDataType } from '../context/AuthContext'; // Import CustomerDataType
import type { CookieConsent } from '../context/CookieConsentContext'; // Corrected import path
import { getSyncedShippingInfo } from '../lib/checkoutUtils';
import { logError } from '../lib/utils/logger'; // Import logger
import { sanitizePhone } from '../lib/utils/sanitize'; // Corrected path assuming lib is at root level
import type { FormData, PacketaPoint } from '../types/checkoutTypes';

// Define the initial state structure if not imported
const INITIAL_FORM_DATA: FormData = {
  billing: {
    first_name: '', last_name: '', company: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: 'SK', email: '', phone: '',
    ic: '', dic: '', dic_dph: '',
  },
  shipping: {
    first_name: '', last_name: '', company: '', address_1: '', address_2: '',
    city: '', state: '', postcode: '', country: 'SK',
  },
  shipping_method: '', payment_method: '', customer_note: '', meta_data: [],
  is_business: false, create_account: false, account_password: '',
  consents: { terms: false, privacy: false, marketing: false },
  shipping_same_as_billing: true, // Default to true
};

// Define props for the hook
interface UseCheckoutFormProps {
  initialData?: Partial<FormData>; // Use this for initialization
  customerData: CustomerDataType | null; // Revert to specific type
  consent: CookieConsent; // Use imported CookieConsent type
  hasConsented: boolean;
}

export function useCheckoutForm({
  initialData, // Use this prop
  customerData,
  consent,
  hasConsented,
}: UseCheckoutFormProps) {
  const [formData, setFormData] = useState<FormData>(() => ({
    ...INITIAL_FORM_DATA,
    ...(initialData || {}), // Merge initialData if provided
  }));

  // --- Unified Handlers ---

  // Unified handler for all form input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

      setFormData((prevData: FormData): FormData => {
          const newState = { ...prevData };
          const keys = name.split('.');

          // 1. Apply the primary input change using type-safe access
          if (keys.length === 1) {
              const key = keys[0] as keyof FormData;
              if (key in newState) { // Check if key exists on FormData
                  if (type === 'checkbox') {
                      (newState[key] as unknown) = checked;
                  } else {
                      (newState[key] as unknown) = value;
                  }
              }
          } else if (keys.length === 2) {
              const [section, field] = keys as [keyof FormData, string];
              // Check if section exists and is an object
              if (section in newState && typeof newState[section] === 'object' && newState[section] !== null) {
                const sectionObject = newState[section] as Record<string, unknown>;
                if (field in sectionObject) { // Check if field exists in the section object
                    if (type === 'checkbox') {
                        sectionObject[field] = checked;
                    } else {
                       // Special handling for phone sanitization
                       if (section === 'billing' && field === 'phone') {
                            sectionObject[field] = sanitizePhone(value);
                       } else {
                           sectionObject[field] = value;
                       }
                    }
                }
              }
          }

          // 2. Apply secondary updates based on the primary change
          if (name === 'billing.ic') {
              newState.is_business = !!value;
          }
          if (name === 'shipping_method' && value !== 'packeta_pickup') {
              newState.meta_data = (newState.meta_data || []).filter(item => !item.key.startsWith('_packeta_point'));
          }
          if (name === 'is_business' && checked === false) {
              // Clear business fields if checkbox is unchecked
              newState.billing = { ...newState.billing, company: '', ic: '', dic: '', dic_dph: '' };
          }
          if (name === 'create_account' && checked === false) {
              newState.account_password = '';
          }
          // Sync shipping ONLY if the 'shipping_same_as_billing' checkbox *itself* was just checked to true
          if (name === 'shipping_same_as_billing' && checked === true) {
              newState.shipping = getSyncedShippingInfo(newState.billing, newState.shipping);
          }
          // Sync shipping if a billing field changed *while* the checkbox is true (rely on useEffect instead)
          // This logic is now handled by the useEffect hook below

          // 3. Return the final state object
          return newState;
      });
  }, [setFormData]); // Only depends on setFormData

  const handlePacketaPointSelect = useCallback((point: PacketaPoint) => {
    setFormData((prevData: FormData) => ({
        ...prevData,
        meta_data: [
            ...(prevData.meta_data || []).filter(item => !item.key.startsWith('_packeta_point')),
            { key: '_packeta_point_id', value: point.id },
            { key: '_packeta_point_name', value: point.name },
            { key: '_packeta_point_address', value: `${point.street}, ${point.city} ${point.zip}` },
        ]
    }));
  }, [setFormData]);

  // --- Effects ---

  // Initialize shipping from billing on mount if checkbox is checked
  useEffect(() => {
    if (formData.shipping_same_as_billing) {
        setFormData(prev => ({
          ...prev,
          shipping: getSyncedShippingInfo(prev.billing, prev.shipping),
        }));
    }
    // Intentionally run only once on mount for initial sync based on default state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load from localStorage
  useEffect(() => {
    if (!customerData && hasConsented && consent.necessary) {
      const savedData = localStorage.getItem('checkoutFormData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as Partial<FormData>;
          setFormData(prev => ({
            ...prev,
            billing: { ...prev.billing, ...(parsedData.billing || {}) },
            shipping: { ...prev.shipping, ...(parsedData.shipping || {}) },
            shipping_method: parsedData.shipping_method || prev.shipping_method,
            payment_method: parsedData.payment_method || prev.payment_method,
            is_business: parsedData.is_business ?? prev.is_business,
            shipping_same_as_billing: parsedData.shipping_same_as_billing ?? prev.shipping_same_as_billing,
            customer_note: parsedData.customer_note || prev.customer_note,
            consents: { ...prev.consents, ...(parsedData.consents || {}) },
            meta_data: parsedData.meta_data || prev.meta_data,
          }));
          // No need to set sameAsShipping state here, formData.shipping_same_as_billing is loaded
        } catch (error) {
          logError('Error parsing saved checkout data', {
             error: error instanceof Error ? error : new Error(String(error)),
             timestamp: new Date().toISOString()
          });
          localStorage.removeItem('checkoutFormData');
        }
      }
    }
  // Only run when customerData changes (to load only if not logged in)
  // Or when consent changes to allow loading
  }, [customerData, hasConsented, consent.necessary]);

  // Save to localStorage
  useEffect(() => {
    if (!customerData && hasConsented && consent.necessary) {
      const timer = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { account_password: _account_password, ...restData } = formData;
        localStorage.setItem('checkoutFormData', JSON.stringify(restData));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData, customerData, hasConsented, consent.necessary]);

  // Sync with customerData
  useEffect(() => {
    if (customerData) {
      setFormData((prevData) => ({
        ...prevData,
        billing: {
          ...prevData.billing,
          first_name: customerData.billing?.first_name || prevData.billing.first_name || '',
          last_name: customerData.billing?.last_name || prevData.billing.last_name || '',
          company: customerData.billing?.company || prevData.billing.company || '',
          address_1: customerData.billing?.address_1 || prevData.billing.address_1 || '',
          address_2: customerData.billing?.address_2 || prevData.billing.address_2 || '',
          city: customerData.billing?.city || prevData.billing.city || '',
          postcode: customerData.billing?.postcode || prevData.billing.postcode || '',
          country: customerData.billing?.country || prevData.billing.country || 'SK',
          email: customerData.email || prevData.billing.email || '',
          phone: customerData.billing?.phone || prevData.billing.phone || '',
          ic: customerData.meta_data?.find((m) => m.key === 'billing_ic')?.value || prevData.billing.ic || '',
          dic: customerData.meta_data?.find((m) => m.key === 'billing_dic')?.value || prevData.billing.dic || '',
          dic_dph: customerData.meta_data?.find((m) => m.key === 'billing_dic_dph')?.value || prevData.billing.dic_dph || '',
        },
        shipping: {
          ...prevData.shipping,
          first_name: customerData.shipping?.first_name || prevData.shipping.first_name || '',
          last_name: customerData.shipping?.last_name || prevData.shipping.last_name || '',
          company: customerData.shipping?.company || prevData.shipping.company || '',
          address_1: customerData.shipping?.address_1 || prevData.shipping.address_1 || '',
          address_2: customerData.shipping?.address_2 || prevData.shipping.address_2 || '',
          city: customerData.shipping?.city || prevData.shipping.city || '',
          postcode: customerData.shipping?.postcode || prevData.shipping.postcode || '',
          country: customerData.shipping?.country || prevData.shipping.country || 'SK',
          phone: prevData.shipping?.phone || '',
        },
        is_business: !!customerData.meta_data?.find((m) => m.key === 'billing_ic')?.value,
        shipping_same_as_billing: true,
      }));
      localStorage.removeItem('checkoutFormData');
    }
  }, [customerData]);

  // Effect to update consent state in form data
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      consents: {
        ...prevData.consents,
        necessary: consent.necessary,
        analytics: consent.analytics,
        marketing: consent.marketing,
      },
    }));
  }, [consent]);

  // Effect to sync billing -> shipping if checkbox is checked *and* billing changes
  useEffect(() => {
    if (formData.shipping_same_as_billing) {
      setFormData((prevData: FormData) => ({
          ...prevData,
          shipping: getSyncedShippingInfo(prevData.billing, prevData.shipping),
      }));
    }
  // Run whenever billing info changes or the checkbox state changes
  }, [formData.billing, formData.shipping_same_as_billing]);

  // --- Return Values ---
  return {
    formData,
    setFormData, // Expose if needed for direct manipulation (e.g., Google Places)
    handleChange,
    handlePacketaPointSelect,
  };
}
