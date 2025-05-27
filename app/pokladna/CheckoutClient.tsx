'use client';

import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z, ZodError } from 'zod';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

import CouponSection from '../components/CouponSection';
import { trackFbEvent } from '../components/FacebookPixel';
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

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-unsafe-member-access */
interface GoogleMapsPlaceAutocompleteProps extends HTMLAttributes<HTMLElement> {
  class?: string;
  'data-types'?: string;
  'data-country-restrictions'?: string;
  'data-fields'?: string;
  onPlaceSelect?: (event: CustomEvent<{
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address?: string;
  }>) => void;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          PlaceAutocompleteElement: {
            prototype: HTMLElement;
            new (): HTMLElement;
          };
        };
      };
    };
  }

  interface HTMLElementTagNameMap {
    'gmp-place-autocomplete': HTMLElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': DetailedHTMLProps<GoogleMapsPlaceAutocompleteProps, HTMLElement>;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace, @typescript-eslint/no-unsafe-member-access */

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

function updateShippingFromBilling(billingData: BillingInfo, currentShipping: ShippingInfo): ShippingInfo {
  return {
    ...currentShipping,
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

function translateFieldName(key: string): string {
  const parts = key.split('.');
  const translations: Record<string, Record<string, string>> = {
    billing: {
      _self: 'Fakturačné údaje',
      first_name: 'Meno',
      last_name: 'Priezvisko',
      company: 'Názov firmy',
      address_1: 'Adresa',
      address_2: 'Doplnková adresa',
      city: 'Mesto',
      state: 'Štát/Región',
      postcode: 'PSČ',
      country: 'Krajina',
      email: 'Email',
      phone: 'Telefón',
      ic: 'IČO',
      dic: 'DIČ',
      dic_dph: 'IČ DPH',
    },
    shipping: {
      _self: 'Adresa doručenia',
    },
    consents: {
       _self: 'Súhlasy',
       terms: 'Obchodné podmienky',
       privacy: 'Ochrana osobných údajov',
       marketing: 'Marketingové ponuky',
    },
    account_password: { _self: 'Heslo pre účet'},
    shipping_method: { _self: 'Spôsob dopravy' },
    payment_method: { _self: 'Spôsob platby' },
  };

  let translated = '';
  if (parts.length === 1) {
      translated = translations[parts[0]]?._self || parts[0];
  } else if (parts.length === 2) {
      const [section, field] = parts;
      const sectionTranslation = translations[section]?._self || section;
      const fieldTranslation = translations[section]?.[field] || field.replace('_', ' ');
      translated = `${sectionTranslation} - ${fieldTranslation}`;
  } else {
      translated = key.replace('_', ' ');
  }
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

const FREE_SHIPPING_THRESHOLD = 39;
const SHIPPING_COST_PACKETA_PICKUP = 2.9;
const SHIPPING_COST_PACKETA_HOME = 3.8;
const RECOMMENDED_PRODUCT_IDS = '839,680,669,47';

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

export default function CheckoutClient() {
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
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const orderIdRef = useRef<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | null>(null);

  console.log('[Render] Current formErrors:', formErrors);

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

      trackFbEvent('InitiateCheckout', {
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

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const products = await getProducts({ include: RECOMMENDED_PRODUCT_IDS });
        setRecommendedProducts(products);
      } catch (error: unknown) {
        logError('Error fetching recommended products', {
            error: error instanceof Error ? error : new Error(String(error)),
            timestamp: new Date().toISOString()
        });
      }
    };

    if (totalPrice < FREE_SHIPPING_THRESHOLD) {
      void fetchRecommended();
    } else {
      setRecommendedProducts([]);
    }
  }, [totalPrice]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      shipping: updateShippingFromBilling(prev.billing, prev.shipping),
    }));
  }, []);

  useEffect(() => {
    if (!customerData && hasConsented && consent.necessary) {
      const savedData = localStorage.getItem('checkoutFormData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            billing: { ...prev.billing, ...parsedData.billing },
            shipping: { ...prev.shipping, ...parsedData.shipping },
            shipping_method: parsedData.shipping_method || prev.shipping_method,
            payment_method: parsedData.payment_method || prev.payment_method,
            is_business: parsedData.is_business ?? prev.is_business,
            ...(parsedData.is_business && {
                billing: {
                    ...prev.billing,
                    ...parsedData.billing,
                    company: parsedData.billing?.company || '',
                    ic: parsedData.billing?.ic || '',
                    dic: parsedData.billing?.dic || '',
                    dic_dph: parsedData.billing?.dic_dph || '',
                }
            })
          }));
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
  }, [customerData, hasConsented, consent.necessary]);

  useEffect(() => {
    if (!customerData && hasConsented && consent.necessary) {
      if (formData.billing.first_name || formData.billing.last_name || formData.billing.email) {
        const timer = setTimeout(() => {
          const dataToSave = {
            billing: formData.billing,
            shipping: formData.shipping,
            shipping_method: formData.shipping_method,
            payment_method: formData.payment_method,
            is_business: formData.is_business,
          };
          localStorage.setItem('checkoutFormData', JSON.stringify(dataToSave));
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [formData, customerData, hasConsented, consent.necessary]);

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
      setSameAsShipping(true);
      localStorage.removeItem('checkoutFormData');
    }
  }, [customerData]);

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

  const handleInputChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section: 'billing' | 'shipping' | 'consents' | 'root'
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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


  const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value;
    const formattedPhone = sanitizePhone(rawPhone);

    setFormData(prev => ({
      ...prev,
      billing: { ...prev.billing, phone: formattedPhone },
      ...(sameAsShipping && prev.billing.phone && {
          shipping: { ...prev.shipping }
      }),
    }));

    setPhoneError(null);

  }, [sameAsShipping]);

  const handlePacketaPointSelect = useCallback((point: PacketaPoint) => {
    setFormData(prev => ({
      ...prev,
      meta_data: [
        ...prev.meta_data.filter(item => !item.key.startsWith('_packeta_point_')),
        { key: '_packeta_point_id', value: point.id },
        { key: '_packeta_point_name', value: point.name },
        { key: '_packeta_point_address', value: `${point.street}, ${point.city} ${point.zip}` },
      ],
       shipping: {
         ...prev.shipping,
         address_1: point.street,
         city: point.city,
         postcode: point.zip,
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
      setFormData(prev => ({
        ...prev,
        shipping: {
          ...INITIAL_FORM_DATA.shipping,
          country: prev.shipping.country,
        },
      }));
    }
  }, []);

  const handleShippingMethodChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        shipping_method: value,
        meta_data: value === 'packeta_pickup'
          ? prev.meta_data
          : prev.meta_data.filter(item => !item.key.startsWith('_packeta_point_')),
      }));
      if (value === 'packeta_pickup') {
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
      let finalShippingAddress = formData.shipping;
      if (formData.shipping_method === 'packeta_pickup') {
        const packetaPointId = formData.meta_data.find(item => item.key === '_packeta_point_id')?.value;
        const packetaPointName = formData.meta_data.find(item => item.key === '_packeta_point_name')?.value;
        const packetaAddress = formData.meta_data.find(item => item.key === '_packeta_point_address')?.value;

        if (!packetaPointId) {
           toast.error('Chýbajúce údaje', { description: 'Prosím, vyberte výdajné miesto Packeta.' });
           setShowPacketaSelector(true);
           return undefined;
        }

        if (packetaPointName && packetaAddress) {
           const [street, cityWithZip] = packetaAddress.split(', ');
           const [city, zip] = cityWithZip ? cityWithZip.split(' ') : ['', ''];

           finalShippingAddress = {
             ...formData.shipping,
             company: packetaPointName,
             address_1: street || '',
             city: city || '',
             postcode: zip || formData.shipping.postcode,
             country: 'SK',
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
            ...(formData.is_business ? [
                { key: 'is_business', value: 'true'},
                { key: 'billing_ic', value: formData.billing.ic || ''},
                { key: 'billing_dic', value: formData.billing.dic || ''},
                { key: 'billing_dic_dph', value: formData.billing.dic_dph || ''},
            ] : []),
        ],
        ...(formData.create_account && formData.account_password && {
            create_account: true,
            account_password: formData.account_password,
        }),
      };

      const orderResponse = await createOrder(orderPayload);

      if (!orderResponse?.order?.id) {
        throw new Error('WooCommerce order creation failed - no order ID returned');
      }

      localOrderId = orderResponse.order.id;
      orderIdRef.current = localOrderId;

      sessionStorage.setItem('lastOrderId', localOrderId.toString());
      sessionStorage.setItem('customerEmail', formData.billing.email);

      if (formData.payment_method === 'stripe') {
        setShowStripePayment(true);
        return localOrderId;
      } else if (formData.payment_method === 'cod') {
        setShowLoadingOverlay(true);
        setRedirectUrl(`/objednavka/uspesna/${localOrderId}`);
        toast.success('Objednávka bola úspešne vytvorená');

        setTimeout(() => {
          window.location.href = `/objednavka/uspesna/${localOrderId!}`;
          clearCart();
        }, 1000);
      }

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
             tax: 0,
             coupon: appliedCoupon || '',
             items: items.map(item => ({
                 item_id: item.id.toString(),
                 item_name: item.name,
                 price: item.price,
                 quantity: item.quantity,
             })),
         });

         trackFbEvent('Purchase', {
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
        error: error instanceof Error ? error : new Error(String(error)),
        orderId: localOrderId !== undefined ? localOrderId.toString() : undefined,
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

      setShowLoadingOverlay(true);
      setRedirectUrl('/objednavka/neuspesna');
      setTimeout(() => {
        window.location.href = '/objednavka/neuspesna';
      }, 1000);

      orderIdRef.current = null;
      setShowStripePayment(false);
      return undefined;
    }
  }, [formData, customerData, items, finalTotal, shippingCost, clearCart, appliedCoupon, hasConsented, consent.analytics]); // Add dependencies

  const handleSubmit = useCallback(async (e: FormEvent) => {
    console.log('--- EXECUTING LATEST handleSubmit v.1.0 ---'); // <-- ADDED THIS LINE
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPaymentError(null);
    setFormErrors(null);

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
              phone: sanitizePhone(formData.billing.phone),
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

       const currentSchema = checkoutFormSchema.extend({
           billing: checkoutFormSchema.shape.billing.extend({
               ic: formData.is_business ? z.string().length(8, 'IČO musí mať 8 číslic') : z.string().optional(),
               dic: formData.is_business ? z.string().length(10, 'DIČ musí mať 10 číslic') : z.string().optional(),
               dic_dph: formData.is_business ? z.string().optional() : z.string().optional()
           }),
           account_password: formData.create_account
               ? z.string().min(8, 'Heslo musí mať aspoň 8 znakov.')
               : z.string().optional(),
           shipping_method: z.string().min(1, 'Vyberte spôsob dopravy.'),
           payment_method: z.string().min(1, 'Vyberte spôsob platby.'),
           consents: z.object({
               terms: z.literal(true, { errorMap: () => ({ message: 'Musíte súhlasiť s obchodnými podmienkami.' }) }),
               privacy: z.literal(true, { errorMap: () => ({ message: 'Musíte súhlasiť so spracovaním osobných údajov.' }) }),
               marketing: z.boolean(),
           }),
       });

       currentSchema.parse(sanitizedData);

      await processOrder();

    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        console.log('[Submit Catch] Raw Zod Field Errors:', JSON.stringify(fieldErrors, null, 2));
        setFormErrors(fieldErrors);

        const errorList = (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {Object.entries(fieldErrors).flatMap(([key, messages]) =>
              messages?.map((message, index) => (
                <li key={`${key}-${index}`}>
                  <span className="font-semibold">{translateFieldName(key)}:</span> {message}
                </li>
              )) ?? []
            )}
          </ul>
        );

        toast.error('Chyby vo formulári', {
          description: errorList,
          duration: 8000,
        });

        // --- Focus Logic ---
        let firstErrorKey: string | null = null;
        let idToFocus: string | null = null;

        if (error.issues.length > 0) {
            const firstIssue = error.issues[0];
            // Path might be ['billing', 'first_name'] or ['shipping_method']
            const path = firstIssue.path;
            if (path.length > 0) {
                // Join path elements with hyphen for the ID
                idToFocus = path.join('-');
                // For logging/display purposes, join with dot
                firstErrorKey = path.join('.');
            }
        }

        console.log('[Submit Catch] First error path:', error.issues[0]?.path); // Log the path
        console.log('[Submit Catch] First error key selected for focus:', firstErrorKey); // Log the derived key
        console.log('[Submit Catch] ID selected for focus:', idToFocus); // Log the generated ID

        // The rest of the focus logic remains similar, using idToFocus
        if (idToFocus) {
           // No need to convert firstErrorKey anymore, we already have idToFocus
           console.log(`[Submit Catch] Attempting to find element with ID: '${idToFocus}' for focus and scroll`);

           setTimeout(() => {
               const elementToFocus = document.getElementById(idToFocus);
               console.log(`[Submit Catch Timeout] Found element for ID '${idToFocus}':`, elementToFocus);
               if (elementToFocus) {
                   try {
                       console.log('[Focus Debug] Attempting scrollIntoView...');
                       elementToFocus.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll first
                       console.log('[Focus Debug] Attempting focus with preventScroll: true...'); // Updated log
                       elementToFocus.focus({ preventScroll: true }); // Focus after scrolling, WITH preventScroll
                       setTimeout(() => {
                           console.log('[Focus Debug] document.activeElement after focus attempt:', document.activeElement);
                       }, 0);
                       console.log(`[Submit Catch Timeout] Successfully attempted scroll and focus for '${idToFocus}'.`);
                   } catch (focusError) {
                       // ... error logging ...
                       console.error(`[Submit Catch Timeout] Error focusing or scrolling to '${idToFocus}':`, focusError);
                   }
               } else {
                   // ... fallback logic ...
                   console.warn(`[Submit Catch Timeout] Element with ID '${idToFocus}' not found.`);
                   const firstInput = document.querySelector<HTMLElement>('form input:not([type="hidden"]), form select, form textarea');
                   if (firstInput) {
                       console.log('[Submit Catch Timeout] Fallback: Focusing first form input:', firstInput);
                       firstInput.focus();
                       firstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   }
               }
           }, 300); // Vrátený delay na 300ms
        }
        // --- End Focus Logic ---

         logError('Checkout Validation Error', {
            error: { zodErrors: error.flatten(), selectedFocusKey: firstErrorKey }, // Add context to error object
            timestamp: new Date().toISOString()
         });
      } else {
        // Handle non-Zod errors
        logError('General Submit Error (Non-Zod)', {
          error: error instanceof Error ? error : new Error(String(error)),
          timestamp: new Date().toISOString()
        });
        Sentry.captureException(error, { tags: { stage: 'submit_non_zod' } });
        setPaymentError({ type: 'general', message: 'Nastala chyba pri odosielaní formulára.' });
        toast.error('Chyba', { description: 'Nastala neočakávaná chyba pri odosielaní formulára.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, formData, processOrder]);

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
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
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
                    <label className="block text-sm font-medium text-gray-700" htmlFor="billing-company">
                        Názov firmy <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="billing-company"
                        name="company"
                        type="text"
                        value={formData.billing.company}
                        onChange={(e) => handleInputChange(e, 'billing')}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.company'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        required={formData.is_business}
                        placeholder="Zadajte názov firmy"
                        aria-label="Názov firmy"
                    />
                  </div>
                {/* IC Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="billing-ic">IČO <span className="text-red-500">*</span></label>
                  <input
                     id="billing-ic"
                     name="ic"
                     type="text"
                     value={formData.billing.ic || ''}
                     onChange={(e) => handleInputChange(e, 'billing')}
                     className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.ic'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                     required={formData.is_business}
                     placeholder="Zadajte IČO (8 číslic)"
                     maxLength={8}
                     pattern="\d{8}" />
                </div>
                {/* DIC Input */}
                <div>
                   <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic">DIČ <span className="text-red-500">*</span></label>
                  <input
                     id="billing-dic"
                     name="dic"
                     type="text"
                     value={formData.billing.dic || ''}
                     onChange={(e) => handleInputChange(e, 'billing')}
                     className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.dic'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                     required={formData.is_business}
                     placeholder="Zadajte DIČ (10 číslic)"
                     maxLength={10}
                     pattern="\d{10}" />
                </div>
                {/* DIC DPH Input */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic_dph">IČ DPH</label>
                    <input
                       id="billing-dic_dph"
                       name="dic_dph"
                       type="text"
                       value={formData.billing.dic_dph || ''}
                       onChange={(e) => handleInputChange(e, 'billing')}
                       className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.dic_dph'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                       placeholder="SKXXXXXXXXXX (nepovinné)" />
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
                <label htmlFor="billing-first_name" className="block text-sm font-medium text-gray-700">Meno <span className="text-red-500">*</span></label>
                <input
                   id="billing-first_name"
                   name="first_name"
                   type="text"
                   value={formData.billing.first_name}
                   onChange={handleSyncedFieldChange}
                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.first_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                   required
                   autoComplete="given-name"/>
              </div>
              {/* Last Name */}
              <div>
                <label htmlFor="billing-last_name" className="block text-sm font-medium text-gray-700">Priezvisko <span className="text-red-500">*</span></label>
                <input
                   id="billing-last_name"
                   name="last_name"
                   type="text"
                   value={formData.billing.last_name}
                   onChange={handleSyncedFieldChange}
                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.last_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                   required
                   autoComplete="family-name"/>
              </div>
               {/* Email */}
               <div>
                <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                   id="billing-email"
                   name="email"
                   type="email"
                   value={formData.billing.email}
                   onChange={(e) => handleInputChange(e, 'billing')}
                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.email'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                   required
                   placeholder="vas@email.sk"
                   autoComplete="email"/>
              </div>
              {/* Phone */}
              <div className="space-y-1">
                 <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">Telefón <span className="text-red-500">*</span></label>
                 <input
                    id="billing-phone"
                    name="phone"
                    type="tel"
                    value={formData.billing.phone}
                    onChange={handlePhoneChange}
                    placeholder="+421 XXX XXX XXX"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${phoneError ? 'border-red-500' : ''} ${formErrors?.['billing.phone'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    autoComplete="tel"/>
                 {phoneError && <p className="text-xs text-red-600">{phoneError}</p>} {/* Keep this for potential non-Zod phone errors if needed */}
              </div>
               {/* Address 1 (Street) */}
               <div className="md:col-span-2">
                <label htmlFor="billing-address_1" className="block text-sm font-medium text-gray-700">Adresa <span className="text-red-500">*</span></label>
                <div
                  id="billing-address_1"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${formErrors?.['billing.address_1'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  {/* @ts-expect-error - Google Maps Place Autocomplete is not typed */}
                  <gmp-place-autocomplete
                    class="w-full"
                    data-types="address"
                    data-country-restrictions="sk"
                    data-fields="address_components,formatted_address"
                    onPlaceSelect={(e: CustomEvent<{
                      address_components?: Array<{
                        long_name: string;
                        short_name: string;
                        types: string[];
                      }>;
                      formatted_address?: string;
                    }>) => {
                      const place = e.detail;
                      if (!place.address_components) return;

                      let streetNumber = '';
                      let route = '';
                      let postalCode = '';
                      let city = '';

                      place.address_components.forEach((component) => {
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
                          ...(sameAsShipping && { shipping: updateShippingFromBilling(newBilling, prev.shipping) }),
                        };
                      });
                    }}
                  />
                </div>
               </div>
               {/* City */}
               <div>
                <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">Mesto <span className="text-red-500">*</span></label>
                <input
                   id="billing-city"
                   name="city"
                   type="text"
                   value={formData.billing.city}
                   onChange={handleSyncedFieldChange}
                   className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.city'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                   required
                   autoComplete="address-level2"/>
               </div>
               {/* Postcode */}
               <div>
                 <label htmlFor="billing-postcode" className="block text-sm font-medium text-gray-700">PSČ <span className="text-red-500">*</span></label>
                 <input
                    id="billing-postcode"
                    name="postcode"
                    type="text"
                    value={formData.billing.postcode}
                    onChange={handleSyncedFieldChange}
                    pattern="\d{5}"
                    maxLength={5}
                    placeholder="XXXXX"
                    title="PSČ musí obsahovať 5 číslic"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['billing.postcode'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    required
                    autoComplete="postal-code"/>
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
                   <label htmlFor="shipping-first_name" className="block text-sm font-medium text-gray-700">Meno <span className="text-red-500">*</span></label>
                   <input
                      id="shipping-first_name"
                      name="first_name"
                      type="text"
                      value={formData.shipping.first_name}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['shipping.first_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      autoComplete="shipping given-name"/>
                 </div>
                 {/* Shipping Last Name */}
                 <div>
                   <label htmlFor="shipping-last_name" className="block text-sm font-medium text-gray-700">Priezvisko <span className="text-red-500">*</span></label>
                   <input
                      id="shipping-last_name"
                      name="last_name"
                      type="text"
                      value={formData.shipping.last_name}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['shipping.last_name'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      autoComplete="shipping family-name"/>
                 </div>
                 {/* Shipping Address 1 */}
                 <div className="md:col-span-2">
                   <label htmlFor="shipping-address_1" className="block text-sm font-medium text-gray-700">Adresa <span className="text-red-500">*</span></label>
                   <input
                      id="shipping-address_1"
                      name="address_1"
                      type="text"
                      value={formData.shipping.address_1}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['shipping.address_1'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      autoComplete="shipping street-address"/>
                 </div>
                 {/* Shipping City */}
                 <div>
                   <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700">Mesto <span className="text-red-500">*</span></label>
                   <input
                      id="shipping-city"
                      name="city"
                      type="text"
                      value={formData.shipping.city}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['shipping.city'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      autoComplete="shipping address-level2"/>
                 </div>
                 {/* Shipping Postcode */}
                 <div>
                   <label htmlFor="shipping-postcode" className="block text-sm font-medium text-gray-700">PSČ <span className="text-red-500">*</span></label>
                   <input
                      id="shipping-postcode"
                      name="postcode"
                      type="text"
                      value={formData.shipping.postcode}
                      onChange={(e) => handleInputChange(e, 'shipping')}
                      pattern="\d{5}"
                      maxLength={5}
                      placeholder="XXXXX"
                      title="PSČ musí obsahovať 5 číslic"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${formErrors?.['shipping.postcode'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                      autoComplete="shipping postal-code"/>
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
               <input type="checkbox" id="consents-terms" name="terms" checked={formData.consents.terms} onChange={(e) => handleInputChange(e, 'consents')} className={`mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5 ${formErrors?.['consents.terms'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
               <span className="text-sm text-gray-700">Súhlasím s <Link href="/obchodne-podmienky" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">obchodnými podmienkami</Link> <span className="text-red-500 font-medium">*</span></span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
               <input type="checkbox" id="consents-privacy" name="privacy" checked={formData.consents.privacy} onChange={(e) => handleInputChange(e, 'consents')} className={`mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5 ${formErrors?.['consents.privacy'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required />
               <span className="text-sm text-gray-700">Potvrdzujem, že som sa oboznámil/a s <Link href="/ochrana-osobnych-udajov" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">informáciami o spracúvaní osobných údajov</Link> <span className="text-red-500 font-medium">*</span></span>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
               <input type="checkbox" id="consents-marketing" name="marketing" checked={formData.consents.marketing} onChange={(e) => handleInputChange(e, 'consents')} className="mt-1 flex-shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5" />
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
