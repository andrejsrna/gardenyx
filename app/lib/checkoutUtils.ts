import type { BillingInfo, FormData, ShippingInfo } from '../types/checkoutTypes';

/**
 * Creates a new ShippingInfo object synced with BillingInfo fields.
 */
export function getSyncedShippingInfo(billing: BillingInfo, currentShipping: ShippingInfo): ShippingInfo {
  return {
      ...currentShipping, // Keep existing fields like phone if they exist
      first_name: billing.first_name,
      last_name: billing.last_name,
      company: billing.company || '',
      address_1: billing.address_1,
      address_2: billing.address_2 || '',
      city: billing.city,
      state: billing.state || '',
      postcode: billing.postcode,
      country: billing.country,
      // phone is NOT copied automatically from billing here
  };
}

/**
 * Updates shipping address fields based on billing address fields.
 * Returns the entire updated FormData object.
 * @deprecated Consider using getSyncedShippingInfo for targeted updates within setFormData.
 */
export function updateShippingFromBilling(formData: FormData): FormData {
  if (!formData.shipping_same_as_billing) {
      return formData;
  }
  const newShipping = getSyncedShippingInfo(formData.billing, formData.shipping);
  return {
      ...formData,
      shipping: newShipping,
  };
}

// Add other checkout-related utility functions here if needed
