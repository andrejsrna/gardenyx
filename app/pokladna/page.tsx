'use client';

import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z, ZodError } from 'zod';

import CouponSection from '../components/CouponSection';
import { fbq } from '../components/FacebookPixel';
import { event as gtagEvent } from '../components/GoogleAnalytics';
import PacketaPointSelector from '../components/PacketaPointSelector';
import StripePayment from '../components/StripePayment';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCookieConsent } from '../context/CookieConsentContext';
import { logError } from '../lib/utils/logger';
import { validatePassword } from '../lib/utils/password';
import { sanitizeInput, sanitizePhone, sanitizePostcode } from '../lib/utils/sanitize';
import { checkoutFormSchema } from '../lib/validations/checkout';
import { createOrder, getProducts } from '../lib/woocommerce';
import type { WooCommerceProduct } from '../lib/wordpress';

// --- Type Definitions ---

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              componentRestrictions?: { country: string[] };
              fields?: string[];
              types?: string[];
            }
          ) => {
            addListener: (event: string, handler: () => void) => void;
            getPlace: () => {
              address_components?: AddressComponent[];
              formatted_address?: string;
            };
          };
        };
      };
    };
  }
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface PacketaPoint {
  id: string;
  name: string;
  street: string;
  city: string;
  zip: string;
}

type BillingInfo = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
  ic?: string;
  dic?: string;
  dic_dph?: string;
};

type ShippingInfo = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

interface FormData {
  billing: BillingInfo;
  shipping: ShippingInfo;
  shipping_method: string;
  payment_method: string;
  customer_note: string;
  meta_data: Array<{ key: string; value: string }>;
  is_business: boolean;
  create_account: boolean;
  account_password?: string;
  consents: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  };
}

interface PaymentError {
  type: string;
  message: string;
  code?: string;
}

interface WooCommerceOrder {
  status: string;
  customer_id?: number;
  billing: BillingInfo;
  shipping: ShippingInfo;
  shipping_method: string;
  payment_method: string;
  payment_method_title: string;
  meta_data: Array<{ key: string; value: string }>;
  line_items: Array<{ product_id: number; quantity: number }>;
  shipping_lines: Array<{ method_id: string; method_title: string; total: string }>;
}

// --- Helper Functions ---

function updateShippingFromBilling(billingData: BillingInfo, currentShipping: ShippingInfo): ShippingInfo {
  return {
    ...currentShipping, // Preserve any existing shipping data not in billing
    first_name: billingData.first_name,
    last_name: billingData.last_name,
    company: billingData.company || '',
    address_1: billingData.address_1,
    address_2: billingData.address_2 || '',
    city: billingData.city,
    state: billingData.state || '',
    postcode: billingData.postcode,
    country: billingData.country,
  };
}

function validatePhone(phone: string): boolean {
  // Remove all whitespace characters
  const phoneWithoutSpaces = phone.replace(/\\s+/g, '');
  // Use a single regex to validate the two possible formats:
  // 1. +421 followed by 9 digits (first digit 1-9)
  // 2. 0 followed by 9 digits (first digit 1-9)
  const skPhoneRegex = /^(?:\\+421[1-9]\\d{8}|0[1-9]\\d{8})$/;
  return skPhoneRegex.test(phoneWithoutSpaces);
}

// --- Constants ---

const FREE_SHIPPING_THRESHOLD = 39;
const SHIPPING_COST_PACKETA_PICKUP = 2.9;
const SHIPPING_COST_PACKETA_HOME = 3.8;
const RECOMMENDED_PRODUCT_IDS = '839,680,669,47'; // Example IDs

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
};

// --- Component ---

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, addToCart, appliedCoupon, discountAmount } = useCart();
  const { customerData } = useAuth();
  const { consent, hasConsented } = useCookieConsent();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [recommendedProducts, setRecommendedProducts] = useState<WooCommerceProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showPacketaSelector, setShowPacketaSelector] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  // Store order ID temporarily between order creation and payment/redirect
  const orderIdRef = useRef<number | null>(null);

  const addressInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // Track begin_checkout event
  useEffect(() => {
    if (items.length > 0 && hasConsented && consent.analytics) {
      const eventData = {
        currency: 'EUR',
        value: totalPrice,
        items: items.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };
      gtagEvent('begin_checkout', eventData);
      fbq('track', 'InitiateCheckout', {
        content_ids: items.map(item => item.id.toString()),
        contents: items.map(item => ({ id: item.id.toString(), quantity: item.quantity })),
        value: totalPrice,
        currency: 'EUR',
        num_items: items.length,
      });
      Sentry.setContext('checkout', {
        items_count: items.length,
        total_price: totalPrice,
        currency: 'EUR',
      });
    }
  }, [items, totalPrice, hasConsented, consent.analytics]);

  // Fetch recommended products if below free shipping threshold
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const products = await getProducts({ include: RECOMMENDED_PRODUCT_IDS });
        setRecommendedProducts(products);
      } catch (error: unknown) { // Explicitly type caught error as unknown
        logError('Error fetching recommended products', {
            error: error instanceof Error ? error : new Error(String(error)), // Ensure error is an Error object
            timestamp: new Date().toISOString() // Add timestamp
        });
      }
    };

    if (totalPrice < FREE_SHIPPING_THRESHOLD) {
      // Properly handle the promise by using void to indicate intentional non-use of the result
      void fetchRecommended();
    } else {
      setRecommendedProducts([]); // Clear if threshold is met
    }
  }, [totalPrice]);

  // Initialize shipping from billing on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      shipping: updateShippingFromBilling(prev.billing, prev.shipping),
    }));
  }, []); // Run only once on mount

  // Load/Save form data from/to localStorage
  useEffect(() => {
    // Load on mount if not logged in and consent given
    if (!customerData && hasConsented && consent.necessary) {
      const savedData = localStorage.getItem('checkoutFormData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Selectively apply saved data to avoid overwriting potentially newer state
          setFormData(prev => ({
            ...prev,
            billing: { ...prev.billing, ...parsedData.billing },
            shipping: { ...prev.shipping, ...parsedData.shipping },
            shipping_method: parsedData.shipping_method || prev.shipping_method,
            payment_method: parsedData.payment_method || prev.payment_method,
            is_business: parsedData.is_business ?? prev.is_business, // Use nullish coalescing
            // Re-apply business details if is_business was saved as true
            ...(parsedData.is_business && {
                billing: {
                    ...prev.billing,
                    ...parsedData.billing, // Ensure billing fields are also updated
                    company: parsedData.billing?.company || '',
                    ic: parsedData.billing?.ic || '',
                    dic: parsedData.billing?.dic || '',
                    dic_dph: parsedData.billing?.dic_dph || '',
                }
            })
          }));
          // If shipping was saved as same as billing, ensure sync
          if (parsedData.shipping && parsedData.billing && JSON.stringify(parsedData.shipping) === JSON.stringify(updateShippingFromBilling(parsedData.billing, parsedData.shipping))) {
            setSameAsShipping(true);
          }
        } catch (error) {
          logError('Error parsing saved checkout data', {
            error,
            timestamp: new Date().toISOString()
          });
          localStorage.removeItem('checkoutFormData');
        }
      }
    }
  }, [customerData, hasConsented, consent.necessary]); // Only run on these dependencies

  // Create a separate effect for saving data
  useEffect(() => {
    // Save on formData change if not logged in and consent given
    if (!customerData && hasConsented && consent.necessary) {
      // Only save if some identifiable data exists and after initial setup
      if (formData.billing.first_name || formData.billing.last_name || formData.billing.email) {
        // Debounce the save operation to avoid excessive localStorage writes
        const timer = setTimeout(() => {
          const dataToSave = {
            billing: formData.billing,
            shipping: formData.shipping,
            shipping_method: formData.shipping_method,
            payment_method: formData.payment_method,
            is_business: formData.is_business,
          };
          localStorage.setItem('checkoutFormData', JSON.stringify(dataToSave));
        }, 500); // Wait 500ms before saving to reduce frequency

        return () => clearTimeout(timer);
      }
    }
  }, [formData, customerData, hasConsented, consent.necessary]);

  // Initialize form with logged-in customer data
  useEffect(() => {
    if (customerData) {
      setFormData(prev => {
        const billingFromCustomer = {
          ...prev.billing,
          first_name: customerData.billing?.first_name || customerData.first_name || '',
          last_name: customerData.billing?.last_name || customerData.last_name || '',
          company: customerData.billing?.company || '',
          address_1: customerData.billing?.address_1 || '',
          address_2: customerData.billing?.address_2 || '',
          city: customerData.billing?.city || '',
          state: customerData.billing?.state || '',
          postcode: customerData.billing?.postcode || '',
          country: customerData.billing?.country || 'SK',
          email: customerData.billing?.email || customerData.email || '',
          phone: customerData.billing?.phone || '',
          ic: customerData.meta_data?.find(m => m.key === 'billing_ic')?.value || '',
          dic: customerData.meta_data?.find(m => m.key === 'billing_dic')?.value || '',
          dic_dph: customerData.meta_data?.find(m => m.key === 'billing_dic_dph')?.value || '',
        };
        const isBusinessCustomer = !!billingFromCustomer.company || !!billingFromCustomer.ic;

        return {
          ...prev,
          billing: billingFromCustomer,
          shipping: updateShippingFromBilling(billingFromCustomer, prev.shipping), // Sync shipping
          is_business: isBusinessCustomer,
        };
      });
      setSameAsShipping(true); // Assume shipping is same when loading customer data
      // Clear local storage data when user logs in
      localStorage.removeItem('checkoutFormData');
    }
  }, [customerData]); // Run only when customerData changes

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (placesLoaded && addressInputRef.current && window.google?.maps?.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: ['sk'] },
        fields: ['address_components', 'formatted_address'],
        types: ['address'],
      });

      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        let streetNumber = '';
        let route = '';
        let postalCode = '';
        let city = '';

        place.address_components.forEach((component: AddressComponent) => {
          const types = component.types;
          if (types.includes('street_number')) streetNumber = component.long_name;
          if (types.includes('route')) route = component.long_name;
          if (types.includes('postal_code')) postalCode = component.long_name.replace(/\s+/g, '');
          if (types.includes('locality') || types.includes('sublocality')) city = component.long_name;
        });

        const address = `${route} ${streetNumber}`.trim();

        setFormData(prev => {
          const newBilling = {
            ...prev.billing,
            address_1: address,
            city: city,
            postcode: postalCode,
          };
          return {
            ...prev,
            billing: newBilling,
            // Update shipping only if it was previously synced
            ...(sameAsShipping && { shipping: updateShippingFromBilling(newBilling, prev.shipping) }),
          };
        });
      };

      autocomplete.addListener('place_changed', handlePlaceChanged);

      // Cleanup listener on unmount
      // Note: Google Maps API doesn't provide a direct removeListener method
      // for Autocomplete instance listeners in the standard way.
      // Relying on component unmount for cleanup.
    }
  }, [placesLoaded, sameAsShipping]); // Re-run if placesLoaded or sameAsShipping changes

  // --- Calculated Values ---

  const getShippingCost = useCallback(() => {
    if (totalPrice >= FREE_SHIPPING_THRESHOLD) return 0;
    switch (formData.shipping_method) {
      case 'packeta_pickup': return SHIPPING_COST_PACKETA_PICKUP;
      case 'packeta_home': return SHIPPING_COST_PACKETA_HOME;
      default: return 0;
    }
  }, [totalPrice, formData.shipping_method]);

  const shippingCost = getShippingCost();
  const finalTotal = parseFloat((totalPrice + shippingCost - discountAmount).toFixed(2));

  // --- Event Handlers ---

  const handleInputChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked; // For checkboxes

    setFormData(prev => {
      const newState = { ...prev };
      let newBilling: BillingInfo | undefined;

      if (section === 'billing' || section === 'shipping') {
        const currentSection = newState[section];
        const updatedSection = { ...currentSection, [name]: value };

        if (section === 'billing') {
          newState.billing = updatedSection as BillingInfo;
          newBilling = updatedSection as BillingInfo;
          if (sameAsShipping) {
            newState.shipping = updateShippingFromBilling(newBilling, newState.shipping);
          }
        } else {
          newState.shipping = updatedSection as ShippingInfo;
        }
      } else if (section === 'consents') {
        newState.consents = { ...newState.consents, [name]: checked };
      } else if (section === 'root') {
        if (type === 'checkbox') {
          (newState as Record<string, unknown>)[name] = checked; // For root level checkboxes like is_business, create_account
          // Special handling for toggling business/account creation
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
          (newState as Record<string, unknown>)[name] = value; // For root level inputs like password, customer_note
        }
      }

      return newState;
    });
  }, [sameAsShipping]);

  // Specific handler for fields that affect both billing and shipping when synced
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


  const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value;
    const formattedPhone = sanitizePhone(rawPhone);

    setFormData(prev => ({
      ...prev,
      billing: { ...prev.billing, phone: formattedPhone },
      // Update shipping phone only if it was previously synced (and phone existed in billing)
      ...(sameAsShipping && prev.billing.phone && {
          shipping: { ...prev.shipping } // Phone is not typically part of shipping, but keep structure if needed
      }),
    }));

    if (formattedPhone && !validatePhone(formattedPhone)) {
      setPhoneError('Zadajte platné telefónne číslo (+421 XXX XXX XXX alebo 09XX XXX XXX)');
    } else {
      setPhoneError(null);
    }
    // Setting value directly might interfere with React state, prefer controlled component pattern
    // e.target.value = formattedPhone; // Avoid this if possible
  }, [sameAsShipping]);

  const handlePacketaPointSelect = useCallback((point: PacketaPoint) => {
    setFormData(prev => ({
      ...prev,
      meta_data: [
        // Remove old packeta points first
        ...prev.meta_data.filter(item => !item.key.startsWith('_packeta_point_')),
        // Add new ones
        { key: '_packeta_point_id', value: point.id },
        { key: '_packeta_point_name', value: point.name },
        { key: '_packeta_point_address', value: `${point.street}, ${point.city} ${point.zip}` },
      ],
      // Update shipping address details to match the Packeta point for clarity in the order
       shipping: {
         ...prev.shipping,
         address_1: point.street,
         city: point.city,
         postcode: point.zip,
         // Optionally update company name to Packeta point name if needed for shipping label
         // company: point.name
       }
    }));
    setShowPacketaSelector(false);
  }, []);

  const handleSameAsShippingChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSameAsShipping(isChecked);
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        shipping: updateShippingFromBilling(prev.billing, prev.shipping),
      }));
    } else {
      // Optionally clear shipping or leave as is for manual entry
      setFormData(prev => ({
        ...prev,
        shipping: { // Reset to empty or keep previous non-synced values? Resetting is cleaner.
          ...INITIAL_FORM_DATA.shipping,
          country: prev.shipping.country, // Keep country
        },
      }));
    }
  }, []);

  const handleShippingMethodChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        shipping_method: value,
        // Clear Packeta point meta data if switching away from pickup
        meta_data: value === 'packeta_pickup'
          ? prev.meta_data
          : prev.meta_data.filter(item => !item.key.startsWith('_packeta_point_')),
      }));
      if (value === 'packeta_pickup') {
          // Open selector immediately if switching to Packeta pickup
          setShowPacketaSelector(true);
      }
  }, []);

  const handlePaymentMethodChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
          ...prev,
          payment_method: e.target.value
      }));
  }, []);

  const processOrder = useCallback(async (): Promise<number | undefined> => {
    // Prevent duplicate creation if an order ID is already being processed
    if (orderIdRef.current) {
      logError('Order processing blocked, order already created or in progress.', {
        error: new Error('Order creation blocked - already in progress'),
        orderId: orderIdRef.current.toString(),
        timestamp: new Date().toISOString()
      });
      toast.info('Objednávka sa už spracováva.');
      return undefined;
    }

    const paymentStartTime = Date.now();
    let localOrderId: number | undefined;

    try {
      // Prepare shipping address based on shipping method
      let finalShippingAddress = formData.shipping;
      if (formData.shipping_method === 'packeta_pickup') {
        const packetaPointId = formData.meta_data.find(item => item.key === '_packeta_point_id')?.value;
        const packetaPointName = formData.meta_data.find(item => item.key === '_packeta_point_name')?.value;
        const packetaAddress = formData.meta_data.find(item => item.key === '_packeta_point_address')?.value;

        if (!packetaPointId) {
           toast.error('Chýbajúce údaje', { description: 'Prosím, vyberte výdajné miesto Packeta.' });
           setShowPacketaSelector(true);
           return undefined; // Stop processing
        }

        if (packetaPointName && packetaAddress) {
           const [street, cityWithZip] = packetaAddress.split(', ');
           const [city, zip] = cityWithZip ? cityWithZip.split(' ') : ['', ''];

           finalShippingAddress = {
             ...formData.shipping, // Keep name from original form
             company: packetaPointName, // Set company to Packeta point name
             address_1: street || '',
             city: city || '',
             postcode: zip || formData.shipping.postcode, // Use zip from point, fallback to form input
             country: 'SK', // Assume SK for Packeta points
           };
        }
      }

      const orderPayload: Omit<WooCommerceOrder, 'status' | 'payment_method_title' | 'shipping_lines'> & {
        meta_data: Array<{ key: string; value: string }>,
        create_account?: boolean,
        account_password?: string,
        payment_method_title: string
      } = {
        customer_id: customerData?.id,
        billing: formData.billing,
        shipping: finalShippingAddress,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        payment_method_title: formData.payment_method === 'cod' ? 'Dobierka' : 'Platba kartou online',
        line_items: items.map(item => ({ product_id: item.id, quantity: item.quantity })),
        meta_data: [
            ...formData.meta_data,
            { key: 'payment_method', value: formData.payment_method },
            { key: 'consents', value: JSON.stringify({ ...formData.consents, timestamp: new Date().toISOString() }) },
            ...(appliedCoupon ? [{ key: 'coupon_code', value: appliedCoupon }] : []),
            ...(formData.is_business ? [ // Add business keys explicitly if needed by backend/reporting
                { key: 'is_business', value: 'true'},
                { key: 'billing_ic', value: formData.billing.ic || ''},
                { key: 'billing_dic', value: formData.billing.dic || ''},
                { key: 'billing_dic_dph', value: formData.billing.dic_dph || ''},
            ] : []),
        ],
        ...(formData.create_account && formData.account_password && {
            create_account: true,
            account_password: formData.account_password, // Send password only if create_account is true
        }),
      };

      const orderResponse = await createOrder(orderPayload);

      // Check if order ID exists in the response
      if (!orderResponse?.order?.id) {
        throw new Error('WooCommerce order creation failed - no order ID returned');
      }

      localOrderId = orderResponse.order.id;
      orderIdRef.current = localOrderId; // Store the created order ID

      // Store the order ID in session storage for potential use on success/failure pages
      sessionStorage.setItem('lastOrderId', localOrderId.toString());
      // Also store customer email for Stripe component to use
      sessionStorage.setItem('customerEmail', formData.billing.email);

      // If Stripe, create Payment Intent and show Stripe payment UI
      if (formData.payment_method === 'stripe') {
        // We don't need to create the payment intent here
        // The StripePayment component will handle this
        setShowStripePayment(true);
        return localOrderId;
      } else if (formData.payment_method === 'cod') {
        // COD order successful, prepare for redirect
        setShowLoadingOverlay(true);
        setRedirectUrl(`/objednavka/uspesna/${localOrderId}`);
        toast.success('Objednávka bola úspešne vytvorená');

        // Redirect after a short delay. Clear cart *after* navigation starts.
        setTimeout(() => {
          window.location.href = `/objednavka/uspesna/${localOrderId!}`;
          clearCart();
          // No need to clear orderIdRef here as page is navigating away
        }, 1000);
      }

      // Track successful order creation / payment initiation
      Sentry.setContext('order', {
        order_id: localOrderId,
        total_amount: finalTotal,
        payment_method: formData.payment_method,
        shipping_method: formData.shipping_method,
      });
      if (hasConsented && consent.analytics) {
         gtagEvent('purchase', {
             transaction_id: localOrderId.toString(),
             value: finalTotal,
             currency: 'EUR',
             shipping: shippingCost,
             tax: 0, // Assuming tax is included in prices
             coupon: appliedCoupon || '',
             items: items.map(item => ({
                 item_id: item.id.toString(),
                 item_name: item.name,
                 price: item.price,
                 quantity: item.quantity,
             })),
         });
         fbq('track', 'Purchase', {
             value: finalTotal,
             currency: 'EUR',
             content_ids: items.map(item => item.id.toString()),
             contents: items.map(item => ({ id: item.id.toString(), quantity: item.quantity })),
             num_items: items.length,
             order_id: localOrderId.toString(),
         });
      }


      const paymentDuration = Date.now() - paymentStartTime;
      console.info(`Order processing and payment initiation time: ${paymentDuration}ms`);
      return localOrderId;

    } catch (error: unknown) {
      logError('Order Processing Error', {
        error: error instanceof Error ? error : new Error(String(error)), // Ensure error is an Error object
        orderId: localOrderId !== undefined ? localOrderId.toString() : undefined, // Convert number to string or pass undefined
        customerEmail: formData.billing.email,
        timestamp: new Date().toISOString()
      });
      Sentry.captureException(error, {
        extra: { orderId: localOrderId, paymentMethod: formData.payment_method },
        tags: { stage: 'order_processing' },
      });

      toast.error('Chyba spracovania objednávky', {
        description: 'Nastala neočakávaná chyba. Skúste to prosím znova alebo nás kontaktujte.',
      });

      // Show error overlay and redirect to failure page
      setShowLoadingOverlay(true);
      setRedirectUrl('/objednavka/neuspesna');
      setTimeout(() => {
        window.location.href = '/objednavka/neuspesna';
        // Don't clear cart on failure, user might want to retry
      }, 1000);

      orderIdRef.current = null; // Reset order ID ref on failure
      setShowStripePayment(false); // Hide stripe form if it was shown before error
      return undefined;
    }
  }, [formData, customerData, items, finalTotal, shippingCost, clearCart, appliedCoupon, hasConsented, consent.analytics]); // Add dependencies

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPaymentError(null); // Clear previous errors

    // --- Basic Frontend Validations ---
    if (formData.create_account) {
      if (!formData.account_password) {
        toast.error('Chýbajúce heslo', { description: 'Pre vytvorenie účtu je potrebné zadať heslo.' });
        setIsSubmitting(false);
        return;
      }
      const { isValid, errors } = validatePassword(formData.account_password);
      if (!isValid) {
        toast.error('Neplatné heslo', { description: errors.join('\n') });
        setIsSubmitting(false);
        return;
      }
    }

    if (formData.is_business && (!formData.billing.company || !formData.billing.ic || !formData.billing.dic)) {
        toast.error('Chýbajúce firemné údaje', { description: 'Prosím, vyplňte názov firmy, IČO a DIČ.' });
        setIsSubmitting(false);
        return;
    }

    if (formData.shipping_method === 'packeta_pickup' && !formData.meta_data.some(item => item.key === '_packeta_point_id')) {
        toast.error('Chýbajúce výdajné miesto', { description: 'Prosím, vyberte výdajné miesto Packeta.' });
        setShowPacketaSelector(true);
        setIsSubmitting(false);
        return;
    }

    if (!formData.shipping_method) {
        toast.error('Chýbajúci spôsob dopravy', { description: 'Prosím, vyberte spôsob dopravy.' });
        setIsSubmitting(false);
        return;
    }

    if (!formData.payment_method) {
        toast.error('Chýbajúci spôsob platby', { description: 'Prosím, vyberte spôsob platby.' });
        setIsSubmitting(false);
        return;
    }

    if (!formData.consents.terms || !formData.consents.privacy) {
        toast.error('Chýbajúci súhlas', { description: 'Musíte súhlasiť s obchodnými podmienkami a spracovaním osobných údajov.' });
        setIsSubmitting(false);
        return;
    }

    // --- Sanitize and Zod Validate ---
    try {
        const sanitizedData = {
            ...formData,
            billing: {
              ...formData.billing,
              first_name: sanitizeInput(formData.billing.first_name),
              last_name: sanitizeInput(formData.billing.last_name),
              company: sanitizeInput(formData.billing.company || ''),
              address_1: sanitizeInput(formData.billing.address_1),
              address_2: sanitizeInput(formData.billing.address_2 || ''),
              city: sanitizeInput(formData.billing.city),
              state: sanitizeInput(formData.billing.state || ''),
              postcode: sanitizePostcode(formData.billing.postcode),
              country: sanitizeInput(formData.billing.country),
              email: sanitizeInput(formData.billing.email),
              phone: sanitizePhone(formData.billing.phone), // Already sanitized in handler, but good practice
              ic: formData.is_business ? sanitizeInput(formData.billing.ic || '') : undefined,
              dic: formData.is_business ? sanitizeInput(formData.billing.dic || '') : undefined,
              dic_dph: formData.is_business ? sanitizeInput(formData.billing.dic_dph || '') : undefined,
            },
            shipping: {
              ...formData.shipping,
              first_name: sanitizeInput(formData.shipping.first_name),
              last_name: sanitizeInput(formData.shipping.last_name),
              company: sanitizeInput(formData.shipping.company || ''),
              address_1: sanitizeInput(formData.shipping.address_1),
              address_2: sanitizeInput(formData.shipping.address_2 || ''),
              city: sanitizeInput(formData.shipping.city),
              state: sanitizeInput(formData.shipping.state || ''),
              postcode: sanitizePostcode(formData.shipping.postcode),
              country: sanitizeInput(formData.shipping.country),
            }
        };

       // Define Zod schema dynamically based on form state
       const currentSchema = checkoutFormSchema.extend({
           billing: checkoutFormSchema.shape.billing.extend({
               ic: formData.is_business ? z.string().length(8, 'IČO musí mať 8 číslic') : z.string().optional(),
               dic: formData.is_business ? z.string().length(10, 'DIČ musí mať 10 číslic') : z.string().optional(),
               dic_dph: formData.is_business ? z.string().optional() : z.string().optional()
           }),
           account_password: formData.create_account
               ? z.string().min(8, 'Heslo musí mať aspoň 8 znakov.') // Simplified regex check done above
               : z.string().optional(),
           shipping_method: z.string().min(1, 'Vyberte spôsob dopravy.'),
           payment_method: z.string().min(1, 'Vyberte spôsob platby.'),
           consents: z.object({
               terms: z.literal(true, { errorMap: () => ({ message: 'Musíte súhlasiť s obchodnými podmienkami.' }) }),
               privacy: z.literal(true, { errorMap: () => ({ message: 'Musíte súhlasiť so spracovaním osobných údajov.' }) }),
               marketing: z.boolean(),
           }),
       });

       // Validate the sanitized data
       currentSchema.parse(sanitizedData);

      // --- Validation Passed - Process Order ---
      await processOrder();

    } catch (error) {
      if (error instanceof ZodError) {
        // Combine Zod errors into a single toast message
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        toast.error('Chyby vo formulári', {
          description: errorMessages.join('\n'),
        });
         logError('Checkout Validation Error', {
            error: error.flatten(),
            timestamp: new Date().toISOString()
         });
      } else {
        logError('General Submit Error', {
          error,
          timestamp: new Date().toISOString()
        });
        setPaymentError({ type: 'general', message: 'Nastala chyba pri odosielaní formulára.' });
        toast.error('Chyba', { description: 'Nastala neočakávaná chyba pri odosielaní formulára.' });
      }
    } finally {
      setIsSubmitting(false);
      // orderIdRef is handled within processOrder
    }
  }, [isSubmitting, formData, processOrder]); // Add dependencies

  const handleAddRecommendedToCart = useCallback((product: WooCommerceProduct) => {
      addToCart({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
      });
      toast.success(`${product.name} bol pridaný do košíka`);
  }, [addToCart]);

  // --- Render Logic ---

  // Show empty cart message
  if (items.length === 0 && !showLoadingOverlay) { // Prevent showing empty cart during final redirect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {/* SVG Icon */}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Váš košík je prázdny</h2>
          <p className="text-gray-600 mb-6">Pridajte si produkty do košíka pre pokračovanie v nákupe.</p>
          <Link href="/" className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            {/* SVG Icon */}
            Späť na hlavnú stránku
          </Link>
        </div>
      </div>
    );
  }

  // Show Stripe Payment UI
  if (showStripePayment) {
    return (
      <div className="max-w-md mt-16 mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              {/* SVG Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-green-600">
                <path d="M4.464 3.162A2 2 0 016.28 2h7.44a2 2 0 011.816 1.162l1.154 2.5c.067.145.115.291.145.438A3.508 3.508 0 0016 6H4c-.288 0-.568.035-.835.1-.03-.147.078-.293.145-.438l1.154-2.5z" />
                <path fillRule="evenodd" d="M2 9.5a2 2 0 012-2h12a2 2 0 110 4H4a2 2 0 01-2-2zm13.24 0a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V9.5zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V9.5a.75.75 0 00-.75-.75h-.01z" clipRule="evenodd" />
              </svg>
            </div>
          <h2 className="text-2xl font-bold text-gray-900">Platba kartou</h2>
        </div>
        <div className="space-y-3 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Cena produktov</span>
            <span className="font-medium">{totalPrice.toFixed(2)} €</span>
          </div>
           {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Zľava</span>
                    <span className="font-medium">-{discountAmount.toFixed(2)} €</span>
                </div>
            )}
          <div className="flex justify-between text-gray-600">
            <span>Doprava</span>
            <span className="font-medium">{shippingCost.toFixed(2)} €</span>
          </div>
          <div className="h-px bg-gray-200 my-2"></div>
          <div className="flex justify-between text-lg">
             <div>
                <span className="font-medium text-gray-900">Celková suma</span>
                <div className="text-xs font-normal text-gray-500">Cena vrátane DPH</div>
            </div>
            <span className="font-bold text-green-600">{finalTotal.toFixed(2)} €</span>
          </div>
        </div>
        {paymentError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">Chyba platby: {paymentError.message}</p>
            {paymentError.code && <p className="text-sm">Kód: {paymentError.code}</p>}
          </div>
        )}
        <StripePayment
          amount={finalTotal} // Pass the final calculated amount
        />
      </div>
    );
  }

  // Show Main Checkout Form
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setPlacesLoaded(true)}
        onError={(e) => logError('Google Maps Script Load Error', {
          error: e,
          timestamp: new Date().toISOString()
        })}
      />

      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <h2 className="text-xl font-semibold mb-2">Spracovávame vašu objednávku</h2>
            <p className="text-gray-600">
              {redirectUrl?.includes('uspesna')
                ? 'Presmerujeme vás na stránku s potvrdením objednávky.'
                : redirectUrl?.includes('neuspesna')
                  ? 'Nastala chyba pri spracovaní objednávky.'
                  : 'Prosím, počkajte...'
              }
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6">

        {/* Free Shipping Progress */}
        {totalPrice < FREE_SHIPPING_THRESHOLD && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
             {/* ... Free shipping progress bar content ... */}
              <p className="text-green-700">
                  Nakúpte ešte za <span className="font-bold">{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} €</span> a máte dopravu zadarmo!
              </p>
             {/* ... Progress bar visualization ... */}
          </div>
        )}

        {/* Recommended Products */}
        {totalPrice < FREE_SHIPPING_THRESHOLD && recommendedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tieto produkty by vás mohli zaujať</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="flex flex-col items-center text-center">
                   <div className="relative w-24 h-24 mb-2">
                     <Image
                          src={product.images?.[0]?.src || '/placeholder.png'} // Fallback image
                          alt={product.images?.[0]?.alt || product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw" // Optimize image loading
                          className="object-contain"
                        />
                   </div>
                   <h3 className="text-sm font-medium mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm font-bold text-green-600 mb-2">{product.price} €</p>
                   <button
                      type="button"
                      onClick={() => handleAddRecommendedToCart(product)}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                    >
                      Pridať do košíka
                    </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <CouponSection />

        <h1 className="text-2xl font-bold mb-6">Pokladňa</h1>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate> {/* Disable native validation */}

          {/* --- Business Purchase --- */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_business"
                checked={formData.is_business}
                onChange={(e) => handleInputChange(e, 'root')}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Nakupujem na firmu</span>
            </label>
            {formData.is_business && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Company Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="company-name">
                        Názov firmy <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="company-name" name="company" type="text"
                        value={formData.billing.company}
                        onChange={(e) => handleInputChange(e, 'billing')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" // Added padding & text size
                        required={formData.is_business} placeholder="Zadajte názov firmy" aria-label="Názov firmy"
                    />
                  </div>
                {/* IC Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="billing-ic">IČO <span className="text-red-500">*</span></label>
                  <input id="billing-ic" name="ic" type="text" value={formData.billing.ic || ''} onChange={(e) => handleInputChange(e, 'billing')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required={formData.is_business} placeholder="Zadajte IČO (8 číslic)" maxLength={8} pattern="\d{8}" /> { /* Added */}
                </div>
                {/* DIC Input */}
                <div>
                   <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic">DIČ <span className="text-red-500">*</span></label>
                  <input id="billing-dic" name="dic" type="text" value={formData.billing.dic || ''} onChange={(e) => handleInputChange(e, 'billing')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required={formData.is_business} placeholder="Zadajte DIČ (10 číslic)" maxLength={10} pattern="\d{10}" /> { /* Added */}
                </div>
                {/* DIC DPH Input */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic-dph">IČ DPH</label>
                    <input id="billing-dic-dph" name="dic_dph" type="text" value={formData.billing.dic_dph || ''} onChange={(e) => handleInputChange(e, 'billing')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" placeholder="SKXXXXXXXXXX (nepovinné)" /> { /* Added */}
                 </div>
              </div>
            )}
          </div>

          {/* --- Billing Information --- */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Fakturačné údaje</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
               <div>
                <label htmlFor="billing-first-name" className="block text-sm font-medium text-gray-700">Meno <span className="text-red-500">*</span></label>
                <input id="billing-first-name" name="first_name" type="text" value={formData.billing.first_name} onChange={handleSyncedFieldChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="given-name"/> { /* Added */}
              </div>
              {/* Last Name */}
              <div>
                <label htmlFor="billing-last-name" className="block text-sm font-medium text-gray-700">Priezvisko <span className="text-red-500">*</span></label>
                <input id="billing-last-name" name="last_name" type="text" value={formData.billing.last_name} onChange={handleSyncedFieldChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="family-name"/> { /* Added */}
              </div>
               {/* Email */}
               <div>
                <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input id="billing-email" name="email" type="email" value={formData.billing.email} onChange={(e) => handleInputChange(e, 'billing')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required placeholder="vas@email.sk" autoComplete="email"/>
              </div>
              {/* Phone */}
              <div className="space-y-1">
                 <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">Telefón <span className="text-red-500">*</span></label>
                 <input id="billing-phone" name="phone" type="tel" value={formData.billing.phone} onChange={handlePhoneChange} placeholder="+421 XXX XXX XXX" className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${phoneError ? 'border-red-500' : ''}`} required autoComplete="tel"/>
                 {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
              </div>
               {/* Address 1 (Street) */}
               <div className="md:col-span-2">
                <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">Adresa <span className="text-red-500">*</span></label>
                <input id="billing-address" name="address_1" type="text" ref={addressInputRef} value={formData.billing.address_1} onChange={handleSyncedFieldChange} placeholder="Ulica a číslo domu" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="street-address"/>
               </div>
               {/* City */}
               <div>
                <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">Mesto <span className="text-red-500">*</span></label>
                <input id="billing-city" name="city" type="text" value={formData.billing.city} onChange={handleSyncedFieldChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="address-level2"/>
               </div>
               {/* Postcode */}
               <div>
                 <label htmlFor="billing-postcode" className="block text-sm font-medium text-gray-700">PSČ <span className="text-red-500">*</span></label>
                 <input id="billing-postcode" name="postcode" type="text" value={formData.billing.postcode} onChange={handleSyncedFieldChange} pattern="\d{5}" maxLength={5} placeholder="XXXXX" title="PSČ musí obsahovať 5 číslic" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="postal-code"/>
               </div>
            </div>
          </div>

           {/* --- Shipping Information Toggle --- */}
           <div className="bg-white p-6 rounded-lg shadow-sm">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={handleSameAsShippingChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                 />
                 <span className="text-sm font-medium text-gray-700">Adresa doručenia je rovnaká ako fakturačná</span>
               </label>
           </div>

           {/* --- Shipping Address Fields (Conditional) --- */}
          {!sameAsShipping && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Adresa doručenia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Shipping First Name */}
                 <div>
                   <label htmlFor="shipping-first-name" className="block text-sm font-medium text-gray-700">Meno <span className="text-red-500">*</span></label>
                   <input id="shipping-first-name" name="first_name" type="text" value={formData.shipping.first_name} onChange={(e) => handleInputChange(e, 'shipping')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="shipping given-name"/>
                 </div>
                 {/* Shipping Last Name */}
                 <div>
                   <label htmlFor="shipping-last-name" className="block text-sm font-medium text-gray-700">Priezvisko <span className="text-red-500">*</span></label>
                   <input id="shipping-last-name" name="last_name" type="text" value={formData.shipping.last_name} onChange={(e) => handleInputChange(e, 'shipping')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="shipping family-name"/>
                 </div>
                 {/* Shipping Address 1 */}
                 <div className="md:col-span-2">
                   <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700">Adresa <span className="text-red-500">*</span></label>
                   <input id="shipping-address" name="address_1" type="text" value={formData.shipping.address_1} onChange={(e) => handleInputChange(e, 'shipping')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="shipping street-address"/>
                 </div>
                 {/* Shipping City */}
                 <div>
                   <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700">Mesto <span className="text-red-500">*</span></label>
                   <input id="shipping-city" name="city" type="text" value={formData.shipping.city} onChange={(e) => handleInputChange(e, 'shipping')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="shipping address-level2"/>
                 </div>
                 {/* Shipping Postcode */}
                 <div>
                   <label htmlFor="shipping-postcode" className="block text-sm font-medium text-gray-700">PSČ <span className="text-red-500">*</span></label>
                   <input id="shipping-postcode" name="postcode" type="text" value={formData.shipping.postcode} onChange={(e) => handleInputChange(e, 'shipping')} pattern="\d{5}" maxLength={5} placeholder="XXXXX" title="PSČ musí obsahovať 5 číslic" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm" required autoComplete="shipping postal-code"/>
                 </div>
              </div>
            </div>
          )}

          {/* --- Shipping Methods --- */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Spôsob dopravy <span className="text-red-500">*</span></h2>
            <div className="space-y-3">
              {/* Packeta Pickup Point */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
                 <input type="radio" name="shipping_method" value="packeta_pickup" checked={formData.shipping_method === 'packeta_pickup'} onChange={handleShippingMethodChange} className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500" required />
                 <div className="flex-1">
                    <div className="font-medium">Packeta - Výdajné miesto</div>
                    <div className="text-sm text-gray-500">
                      Doručenie na výdajné miesto alebo Z-BOX
                      {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="ml-2 text-green-600 font-medium">Zadarmo</span>
                      ) : (
                        <span className="ml-2 font-medium">{SHIPPING_COST_PACKETA_PICKUP.toFixed(2)} €</span>
                      )}
                    </div>
                    {formData.shipping_method === 'packeta_pickup' && (
                        <div className="mt-2">
                            {formData.meta_data.find(item => item.key === '_packeta_point_name')?.value ? (
                                <>
                                    <div className="text-sm text-green-700 font-medium">
                                        Vybrané: {formData.meta_data.find(item => item.key === '_packeta_point_name')?.value}
                                    </div>
                                     <button type="button" onClick={() => setShowPacketaSelector(true)} className="mt-1 text-sm text-green-600 hover:text-green-700 underline">Zmeniť miesto</button>
                                </>
                            ) : (
                                <button type="button" onClick={() => setShowPacketaSelector(true)} className="mt-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Vybrať výdajné miesto</button>
                            )}
                        </div>
                    )}
                 </div>
              </label>
              {/* Packeta Home Delivery */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
                 <input type="radio" name="shipping_method" value="packeta_home" checked={formData.shipping_method === 'packeta_home'} onChange={handleShippingMethodChange} className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500" required />
                 <div className="flex-1">
                   <div className="font-medium">Packeta - Doručenie na adresu</div>
                    <div className="text-sm text-gray-500">
                      Doručenie kuriérom na vašu adresu
                      {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="ml-2 text-green-600 font-medium">Zadarmo</span>
                      ) : (
                        <span className="ml-2 font-medium">{SHIPPING_COST_PACKETA_HOME.toFixed(2)} €</span>
                      )}
                    </div>
                 </div>
              </label>
            </div>
            {totalPrice < FREE_SHIPPING_THRESHOLD && formData.shipping_method && (
              <div className="mt-4 text-xs text-gray-500">
                Pri nákupe nad {FREE_SHIPPING_THRESHOLD} € je doprava zadarmo.
              </div>
            )}
          </div>

          {/* --- Payment Methods --- */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Spôsob platby <span className="text-red-500">*</span></h2>
            <div className="space-y-3">
              {/* COD */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
                 <input type="radio" name="payment_method" value="cod" checked={formData.payment_method === 'cod'} onChange={handlePaymentMethodChange} className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500" required />
                 <div className="flex-1">
                   <div className="font-medium">Dobierka</div>
                    <div className="text-sm text-gray-500">Platba v hotovosti alebo kartou pri prevzatí tovaru.</div>
                    {/* Optional COD fee display: <span className="ml-2 font-medium">1.00 €</span> */}
                 </div>
              </label>
              {/* Stripe */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 has-[:checked]:bg-green-50 has-[:checked]:border-green-300">
                 <input type="radio" name="payment_method" value="stripe" checked={formData.payment_method === 'stripe'} onChange={handlePaymentMethodChange} className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500" required />
                  <div className="flex-1">
                    <div className="font-medium">Platba kartou online</div>
                    <div className="text-sm text-gray-500">Bezpečná platba cez Stripe (Visa, Mastercard, Google Pay, Apple Pay).</div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <Image src="/paymets/visa.svg" alt="Visa" width={35} height={22} className="h-5" />
                        <Image src="/paymets/mastercard.svg" alt="Mastercard" width={35} height={22} className="h-5" />
                        <Image src="/paymets/gpay.svg" alt="Google Pay" width={40} height={22} className="h-5" />
                        <Image src="/paymets/applepay.svg" alt="Apple Pay" width={40} height={22} className="h-5" />
                    </div>
                  </div>
              </label>
            </div>
          </div>

          {/* --- Order Summary --- */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Zhrnutie objednávky</h2>
            <div className="space-y-3">
               {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-gray-500 ml-2">x {item.quantity}</span>
                    </div>
                    <div className="font-medium text-gray-800">{(Number(item.price) * item.quantity).toFixed(2)} €</div>
                  </div>
              ))}
              <div className="border-t border-dashed pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Medzisúčet</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Zľavový kupón ({appliedCoupon})</span>
                      <span>-{discountAmount.toFixed(2)} €</span>
                    </div>
                )}
                 {formData.shipping_method && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Doprava</span>
                        <span>{shippingCost > 0 ? `${shippingCost.toFixed(2)} €` : 'Zadarmo'}</span>
                    </div>
                 )}
                 {/* Optional COD fee summary */}
                 {/* {formData.payment_method === 'cod' && COD_FEE > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Poplatok za dobierku</span>
                        <span>{COD_FEE.toFixed(2)} €</span>
                    </div>
                 )} */}
              </div>
              <div className="border-t pt-3 flex justify-between items-center font-bold">
                 <div>
                    <span>Celkom k úhrade</span>
                    <div className="text-xs font-normal text-gray-500">Cena vrátane DPH</div>
                 </div>
                 <span className="text-lg text-green-600">{finalTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* --- Create Account --- */}
          {!customerData && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" id="create_account" name="create_account" checked={formData.create_account} onChange={(e) => handleInputChange(e, 'root')} className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                 <label htmlFor="create_account" className="text-sm font-medium text-gray-700">Vytvoriť účet? (Rýchlejšie budúce nákupy)</label>
              </label>
              {formData.create_account && (
                <div className="mt-4">
                   <label htmlFor="account_password" className="block text-sm font-medium text-gray-700 mb-1">Zadajte heslo <span className="text-red-500">*</span></label>
                   <input type="password" id="account_password" name="account_password" required={formData.create_account} value={formData.account_password || ''} onChange={(e) => handleInputChange(e, 'root')}
                        // pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
                        // title="Heslo: min. 8 znakov, 1 veľké písmeno, 1 číslo, 1 špeciálny znak (!@#$%^&*)"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        autoComplete="new-password"
                    />
                    <p className="mt-1 text-xs text-gray-500">Min. 8 znakov, aspoň 1 veľké písmeno, 1 číslo a 1 špeciálny znak (!@#$%^&*)</p>
                </div>
              )}
            </div>
          )}

          {/* --- Consents --- */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-semibold mb-1">Súhlasy</h2>
             <p className="text-xs text-gray-500 mb-3">Pre odoslanie objednávky je potrebné súhlasiť s obchodnými podmienkami a spracovaním osobných údajov.</p>
            {/* Increased checkbox size, added padding and hover effect to labels */}
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
               <input type="checkbox" name="terms" checked={formData.consents.terms} onChange={(e) => handleInputChange(e, 'consents')} className="mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5" required />
               <span className="text-sm text-gray-700">Súhlasím s <Link href="/obchodne-podmienky" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">obchodnými podmienkami</Link> <span className="text-red-500 font-medium">*</span></span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
               <input type="checkbox" name="privacy" checked={formData.consents.privacy} onChange={(e) => handleInputChange(e, 'consents')} className="mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5" required />
               <span className="text-sm text-gray-700">Potvrdzujem, že som sa oboznámil/a s <Link href="/ochrana-osobnych-udajov" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">informáciami o spracúvaní osobných údajov</Link> <span className="text-red-500 font-medium">*</span></span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
               <input type="checkbox" name="marketing" checked={formData.consents.marketing} onChange={(e) => handleInputChange(e, 'consents')} className="mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5" />
               <span className="text-sm text-gray-700">Súhlasím so zasielaním marketingových ponúk a noviniek emailom (nepovinné)</span>
            </label>
             <p className="text-xs text-gray-500 pt-2">* Povinné polia</p>
          </div>

          {/* --- Submit Button --- */}
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold text-lg
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            transition-opacity duration-150 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            disabled={isSubmitting}
          >
            {isSubmitting
             ? ( <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Spracúva sa...
                 </span>)
             : `Odoslať objednávku (${finalTotal.toFixed(2)} €)`
            }
          </button>
        </form>

        {/* --- Packeta Modal --- */}
        {showPacketaSelector && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
               <div className="p-4 sm:p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-semibold">Výber výdajného miesta Packeta</h2>
                  <button onClick={() => setShowPacketaSelector(false)} className="text-gray-400 hover:text-gray-600" aria-label="Zatvoriť">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               <div className="flex-grow overflow-y-auto p-0"> {/* Packeta widget usually handles its own padding */}
                   <PacketaPointSelector onSelectAction={handlePacketaPointSelect} />
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
