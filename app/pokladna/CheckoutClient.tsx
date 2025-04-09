'use client';

import * as Sentry from '@sentry/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ZodError, ZodFormattedError } from 'zod';

import AccountCreation from '../components/checkout/AccountCreation'; // Import AccountCreation
import BillingForm from '../components/checkout/BillingForm'; // Import BillingForm
import BusinessDetailsForm from '../components/checkout/BusinessDetailsForm'; // Import BusinessDetailsForm
import Consents from '../components/checkout/Consents'; // Import Consents
import OrderSummary from '../components/checkout/OrderSummary'; // Import OrderSummary
import PaymentMethods from '../components/checkout/PaymentMethods'; // Import PaymentMethods
import ShippingForm from '../components/checkout/ShippingForm'; // Import ShippingForm
import ShippingMethods from '../components/checkout/ShippingMethods'; // Import ShippingMethods
import CouponSection from '../components/CouponSection';
import { trackFbEvent } from '../components/FacebookPixel';
import { event as gtagEvent } from '../components/GoogleAnalytics';
import PacketaPointSelector from '../components/PacketaPointSelector';
import StripePayment from '../components/StripePayment';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCookieConsent } from '../context/CookieConsentContext';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { logError } from '../lib/utils/logger';
import { checkoutFormSchema } from '../lib/validations/checkout';
import { createOrder, getProducts, type CreateOrderData } from '../lib/woocommerce';
import type { WooCommerceProduct } from '../lib/wordpress';
import type { FormData, PaymentError } from '../types/checkoutTypes';

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

const FREE_SHIPPING_THRESHOLD = 39;
const SHIPPING_COST_PACKETA_PICKUP = 2.9;
const SHIPPING_COST_PACKETA_HOME = 3.8;
const RECOMMENDED_PRODUCT_IDS = '839,680,669,47';

// Helper function to flatten ZodFormattedError
function flattenZodErrors(formattedErrors: ZodFormattedError<unknown>): Record<string, string[] | undefined> {
  const flatErrors: Record<string, string[] | undefined> = {};

  // Use unknown and type guards for safer recursion
  function recurse(obj: unknown, prefix = '') {
    if (obj && typeof obj === 'object') {
      // Check for _errors property specifically
      if ('_errors' in obj && Array.isArray((obj as { _errors: unknown })._errors) && (obj as { _errors: string[] })._errors.length > 0) {
        const key = prefix.endsWith('.') ? prefix.slice(0, -1) : prefix;
        if (key) {
          flatErrors[key] = (flatErrors[key] || []).concat((obj as { _errors: string[] })._errors);
        }
      }

      // Iterate over own properties only
      for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key) && key !== '_errors') {
              recurse((obj as Record<string, unknown>)[key], `${prefix}${key}.`);
          }
      }
    }
  }

  recurse(formattedErrors);

  // Clean trailing dots (already present, keep as is)
  const cleanedErrors: Record<string, string[] | undefined> = {};
  for (const key in flatErrors) {
      cleanedErrors[key.replace(/\.$/, '')] = flatErrors[key];
  }
  return cleanedErrors;
}

export default function CheckoutClient() {
  const { items, totalPrice, clearCart, addToCart, appliedCoupon, discountAmount } = useCart();
  const { customerData } = useAuth();
  const { consent, hasConsented } = useCookieConsent();

  const {
    formData,
    setFormData,
    handleChange,
    handlePacketaPointSelect,
  } = useCheckoutForm({ customerData, consent, hasConsented });

  const [formErrors, setFormErrors] = useState<ZodError | null>(null);
  const [simplifiedErrors, setSimplifiedErrors] = useState<Record<string, string[] | undefined> | null>(null);

  const [recommendedProducts, setRecommendedProducts] = useState<WooCommerceProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showPacketaSelector, setShowPacketaSelector] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const orderIdRef = useRef<number | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

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
          };
        });
      };

      autocomplete.addListener('place_changed', handlePlaceChanged);
    }
  }, [placesLoaded, setFormData]);

  // Effect to simplify Zod errors
  useEffect(() => {
    if (formErrors) {
      const formatted = formErrors.format() as ZodFormattedError<FormData>;
      setSimplifiedErrors(flattenZodErrors(formatted));
    } else {
      setSimplifiedErrors(null);
    }
  }, [formErrors]);

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

  const handleSubmit = useCallback(async (event?: FormEvent): Promise<number | undefined> => {
    if (event) event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setPaymentError(null);
    setFormErrors(null);

    const prepareOrderPayload = (): CreateOrderData => {
      let finalShippingAddress = formData.shipping;
      if (formData.shipping_method === 'packeta_pickup') {
        const packetaPointId = formData.meta_data.find(item => item.key === '_packeta_point_id')?.value;
        const packetaPointName = formData.meta_data.find(item => item.key === '_packeta_point_name')?.value;
        const packetaAddress = formData.meta_data.find(item => item.key === '_packeta_point_address')?.value;
        if (!packetaPointId) {
          toast.error('Chýbajúce údaje Packeta', { description: 'Prosím, vyberte výdajné miesto.' });
          throw new Error('Packeta point ID missing for pickup method.');
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
      const orderPayload: CreateOrderData = {
        customer_id: customerData?.id,
        billing: formData.billing,
        shipping: finalShippingAddress,
        payment_method: formData.payment_method,
        payment_method_title: formData.payment_method === 'cod' ? 'Dobierka' : 'Platba kartou online',
        line_items: items.map(item => ({ product_id: item.id, quantity: item.quantity })),
        meta_data: [
          ...formData.meta_data.filter(item => !item.key.startsWith('_packeta_point_')),
          { key: 'payment_method', value: formData.payment_method },
          { key: 'shipping_method', value: formData.shipping_method },
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
      return orderPayload;
    };

    const trackPurchaseAnalytics = (orderId: number) => {
      if (!hasConsented || !consent.analytics) return;
      const analyticsItems = items.map(item => ({
        item_id: item.id.toString(),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      gtagEvent('purchase', {
        transaction_id: orderId.toString(),
        value: finalTotal,
        currency: 'EUR',
        shipping: shippingCost,
        tax: 0,
        coupon: appliedCoupon || '',
        items: analyticsItems,
      });
      trackFbEvent('Purchase', {
        value: finalTotal,
        currency: 'EUR',
        content_ids: items.map(item => item.id.toString()),
        contents: items.map(item => ({ id: item.id.toString(), quantity: item.quantity })),
        num_items: items.length,
        order_id: orderId.toString(),
      });
    };

    const handleCodOrderSuccess = (orderId: number) => {
      setShowLoadingOverlay(true);
      setRedirectUrl(`/objednavka/uspesna/${orderId}`);
      toast.success('Objednávka bola úspešne vytvorená');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/objednavka/uspesna/${orderId}`;
          clearCart();
        }
      }, 1000);
    };

    const handleOrderError = (error: unknown, localOrderId: number | undefined) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logError('Order Processing Error', {
        error: errorObj,
        timestamp: new Date().toISOString(),
        orderId: localOrderId?.toString(),
        customerEmail: formData.billing.email,
      });
      Sentry.captureException(errorObj, {
        extra: { orderId: localOrderId },
        tags: { stage: 'order_processing' },
      });
      toast.error('Chyba spracovania objednávky', {
        description: 'Nastala neočakávaná chyba. Skúste to prosím znova alebo nás kontaktujte.',
      });
      setShowLoadingOverlay(true);
      setRedirectUrl('/objednavka/neuspesna');
      setShowStripePayment(false);
      if (orderIdRef) {
        orderIdRef.current = null;
      }
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/objednavka/neuspesna';
        }
      }, 1000);
    };

    if (orderIdRef.current) {
      logError('Order processing blocked...', {
        error: new Error('Duplicate order processing attempt'),
        timestamp: new Date().toISOString(),
        orderId: orderIdRef.current.toString(),
        customerEmail: formData.billing.email,
      });
      toast.info('Objednávka sa už spracováva.');
      setIsSubmitting(false);
      return undefined;
    }
    let localOrderId: number | undefined;
    try {
      const validationResult = checkoutFormSchema.safeParse(formData);
      if (!validationResult.success) {
        setFormErrors(validationResult.error);
        const firstError = validationResult.error.errors[0];
        const errorPath = firstError.path.join('.');
        logError('Checkout Validation Error', {
          error: validationResult.error,
          timestamp: new Date().toISOString(),
        });
        toast.error('Chyba vo formulári', { description: `Skontrolujte pole: ${errorPath}` });
        setIsSubmitting(false);
        return undefined;
      }

      const orderPayload = prepareOrderPayload();
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
      } else if (formData.payment_method === 'cod') {
        handleCodOrderSuccess(localOrderId);
        trackPurchaseAnalytics(localOrderId);
      }
      Sentry.setContext('order', { /* context */ });
      return localOrderId;

    } catch (error: unknown) {
      handleOrderError(error, localOrderId);
      return undefined;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData, customerData, items, appliedCoupon, finalTotal, shippingCost,
    clearCart, setShowLoadingOverlay, setRedirectUrl, setShowStripePayment,
    orderIdRef, consent, hasConsented, isSubmitting
  ]);

  const handleAddRecommendedToCart = useCallback((product: WooCommerceProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
    });
    toast.success(`${product.name} bol pridaný do košíka`);
  }, [addToCart]);

  if (items.length === 0 && !showLoadingOverlay) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Váš košík je prázdny</h2>
          <p className="text-gray-600 mb-6">Pridajte si produkty do košíka pre pokračovanie v nákupe.</p>
          <Link href="/" className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Späť na hlavnú stránku
          </Link>
        </div>
      </div>
    );
  }

  if (showStripePayment) {
    return (
      <div className="max-w-md mt-16 mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
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
          amount={finalTotal}
        />
      </div>
    );
  }

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

        {totalPrice < FREE_SHIPPING_THRESHOLD && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-700">
                  Nakúpte ešte za <span className="font-bold">{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} €</span> a máte dopravu zadarmo!
              </p>
          </div>
        )}

        {totalPrice < FREE_SHIPPING_THRESHOLD && recommendedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Tieto produkty by vás mohli zaujať</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((product) => (
                <div key={product.id} className="flex flex-col items-center text-center">
                   <div className="relative w-24 h-24 mb-2">
                     <Image
                          src={product.images?.[0]?.src || '/placeholder.png'}
                          alt={product.images?.[0]?.alt || product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
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
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          <BusinessDetailsForm
            isBusiness={formData.is_business}
            billingData={formData.billing}
            formErrors={simplifiedErrors}
            handleRootInputChange={handleChange}
            handleBillingInputChange={handleChange}
          />

          <BillingForm
            billingData={formData.billing}
            formErrors={simplifiedErrors}
            handleInputChange={handleChange}
            handleSyncedFieldChange={handleChange}
            handlePhoneChange={handleChange}
            phoneError={simplifiedErrors?.['billing.phone']?.join(', ') || null}
          />
          <div className="bg-white px-6 pb-6 rounded-b-lg shadow-sm -mt-6 pt-6">
            <div className="md:col-span-2">
              <label htmlFor="billing-address_1" className="block text-sm font-medium text-gray-700">Adresa <span className="text-red-500">*</span></label>
              <input
                 id="billing-address_1"
                 name="billing.address_1"
                 type="text"
                 ref={addressInputRef}
                 value={formData.billing.address_1}
                 onChange={handleChange}
                 placeholder="Ulica a číslo domu"
                 className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${simplifiedErrors?.['billing.address_1'] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                 required
                 autoComplete="street-address"/>
              {simplifiedErrors?.['billing.address_1'] && (
                <div className="mt-1 text-xs text-red-600" role="alert">
                  {simplifiedErrors['billing.address_1'].join(', ')}
                </div>
              )}
            </div>
          </div>

           <div className="bg-white p-6 rounded-lg shadow-sm">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input
                    name="shipping_same_as_billing"
                    type="checkbox"
                    checked={formData.shipping_same_as_billing}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                 />
                 <span className="text-sm font-medium text-gray-700">Adresa doručenia je rovnaká ako fakturačná</span>
               </label>
           </div>

          {!formData.shipping_same_as_billing && (
            <ShippingForm
              shippingData={formData.shipping}
              formErrors={simplifiedErrors}
              handleInputChange={handleChange}
            />
          )}

          <ShippingMethods
            selectedMethod={formData.shipping_method}
            packetaPointName={formData.meta_data.find(item => item.key === '_packeta_point_name')?.value}
            totalPrice={totalPrice}
            freeShippingThreshold={FREE_SHIPPING_THRESHOLD}
            costPacketaPickup={SHIPPING_COST_PACKETA_PICKUP}
            costPacketaHome={SHIPPING_COST_PACKETA_HOME}
            onMethodChange={handleChange}
            onShowPacketaSelector={() => setShowPacketaSelector(true)}
          />

          <PaymentMethods
            selectedMethod={formData.payment_method}
            onMethodChange={handleChange}
          />

          <OrderSummary
            items={items}
            totalPrice={totalPrice}
            shippingCost={shippingCost}
            discountAmount={discountAmount}
            appliedCoupon={appliedCoupon}
            finalTotal={finalTotal}
            shippingMethodSelected={!!formData.shipping_method}
          />

          {!customerData && (
            <AccountCreation
              createAccountChecked={formData.create_account}
              passwordValue={formData.account_password || ''}
              onCheckboxChange={handleChange}
              onPasswordChange={handleChange}
            />
          )}

          <Consents
            consentsData={{
              terms: formData.consents.terms,
              privacy: formData.consents.privacy,
              marketing: !!formData.consents.marketing,
            }}
            formErrors={simplifiedErrors}
            onConsentChange={handleChange}
          />

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg bg-green-600 text-white font-semibold text-lg
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            transition-opacity duration-150 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Spracúva sa...' : `Odoslať objednávku (${finalTotal.toFixed(2)} €)`}
          </button>
        </form>

        {showPacketaSelector && (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
               <div className="p-4 sm:p-6 border-b flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-semibold">Výber výdajného miesta Packeta</h2>
                  <button onClick={() => setShowPacketaSelector(false)} className="text-gray-400 hover:text-gray-600" aria-label="Zatvoriť">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               <div className="flex-grow overflow-y-auto p-0">
                   <PacketaPointSelector onSelectAction={handlePacketaPointSelect} />
               </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
