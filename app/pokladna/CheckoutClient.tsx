'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ZodError } from 'zod';

import { tracking } from '../lib/tracking';
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

// Import all our new components
import {
  BusinessPurchaseSection,
  RecommendedProducts,
  FreeShippingProgress,
  BillingInformationSection,
  ShippingInformationSection,
  CreateAccountSection,
  ConsentsSection,
  ShippingMethodsSection,
  PaymentMethodsSection,
  OrderSummarySection,
} from '../components/checkout';

// Import types, constants and hooks
import type { PacketaPoint, PaymentError, WooCommerceOrder } from '../lib/checkout/types';
import { FREE_SHIPPING_THRESHOLD, RECOMMENDED_PRODUCT_IDS } from '../lib/checkout/constants';
import { updateShippingFromBilling, translateFieldName } from '../lib/checkout/utils';
import { useCheckoutForm } from '../hooks/checkout';

export default function CheckoutClient() {
  const { items, totalPrice, clearCart, addToCart, discountAmount, removeFromCart } = useCart();
  const { customerData } = useAuth();
  const { hasConsented, consentDetails } = useCookieConsent();

  // Use our new custom hook for form management
  const {
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
  } = useCheckoutForm();

  // Component state
  const [recommendedProducts, setRecommendedProducts] = useState<WooCommerceProduct[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showPacketaSelector, setShowPacketaSelector] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const orderIdRef = useRef<number | null>(null);

  // Derived state
  const selectedPacketaPoint = formData.meta_data.find(item => item.key === '_packeta_point_name')?.value ? {
    id: formData.meta_data.find(item => item.key === '_packeta_point_id')?.value || '',
    name: formData.meta_data.find(item => item.key === '_packeta_point_name')?.value || '',
    street: formData.meta_data.find(item => item.key === '_packeta_point_street')?.value || '',
    city: formData.meta_data.find(item => item.key === '_packeta_point_city')?.value || '',
    zip: formData.meta_data.find(item => item.key === '_packeta_point_zip')?.value || '',
  } : null;

  // Analytics tracking effect
  useEffect(() => {
    if (items.length > 0) {
      tracking.initiateCheckout(items, totalPrice);

      Sentry.setContext('checkout', {
        items_count: items.length,
        total_price: totalPrice,
        currency: 'EUR',
      });
    }
  }, [items, totalPrice]);

  // Fetch recommended products effect
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

  // Load saved form data effect
  useEffect(() => {
    if (!customerData && hasConsented && consentDetails?.necessary) {
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
  }, [customerData, hasConsented, consentDetails?.necessary, setFormData, setSameAsShipping]);

  // Save form data effect
  useEffect(() => {
    if (!customerData && hasConsented && consentDetails?.necessary) {
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
  }, [formData, customerData, hasConsented, consentDetails?.necessary]);

  // Load customer data effect
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
          state: 'Slovenská republika',
          postcode: customerData.billing?.postcode || '',
          country: 'SK',
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
          shipping: updateShippingFromBilling(billingFromCustomer, prev.shipping),
          is_business: isBusinessCustomer,
        };
      });
      setSameAsShipping(true);
      localStorage.removeItem('checkoutFormData');
    }
  }, [customerData, setFormData, setSameAsShipping]);

  // Shipping cost calculation
  const getShippingCost = useCallback(() => {
    if (totalPrice >= FREE_SHIPPING_THRESHOLD) return 0;
    switch (formData.shipping_method) {
      case 'packeta_pickup': return 2.9;
      case 'packeta_home': return 3.8;
      default: return 0;
    }
  }, [totalPrice, formData.shipping_method]);

  const shippingCost = getShippingCost();
  const finalTotal = parseFloat((totalPrice + shippingCost - discountAmount).toFixed(2));

  // Add to cart handler for recommended products
  const handleAddToCart = useCallback((product: WooCommerceProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      quantity: 1,
      image: product.images?.[0]?.src || undefined,
    });
    toast.success(`${product.name} bol pridaný do košíka!`);
  }, [addToCart]);

  // Packeta point selection
  const handlePacketaPointSelect = useCallback(() => {
    setShowPacketaSelector(true);
  }, []);

  const handlePacketaPointConfirm = useCallback((point: PacketaPoint) => {
    setFormData(prev => ({
      ...prev,
      meta_data: [
        ...prev.meta_data.filter(item => !item.key.startsWith('_packeta_point_')),
        { key: '_packeta_point_id', value: point.id },
        { key: '_packeta_point_name', value: point.name },
        { key: '_packeta_point_street', value: point.street },
        { key: '_packeta_point_city', value: point.city },
        { key: '_packeta_point_zip', value: point.zip },
      ],
    }));
    setShowPacketaSelector(false);
  }, [setFormData]);

  // Customer note change handler
  const handleCustomerNoteChange = useCallback((note: string) => {
    setFormData(prev => ({ ...prev, customer_note: note }));
  }, [setFormData]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    try {
      const sanitizedData = {
        ...formData,
        billing: {
          ...formData.billing,
          first_name: sanitizeInput(formData.billing.first_name),
          last_name: sanitizeInput(formData.billing.last_name),
          company: sanitizeInput(formData.billing.company),
          address_1: sanitizeInput(formData.billing.address_1),
          address_2: sanitizeInput(formData.billing.address_2),
          city: sanitizeInput(formData.billing.city),
          email: sanitizeInput(formData.billing.email),
          phone: sanitizePhone(formData.billing.phone),
          postcode: sanitizePostcode(formData.billing.postcode),
          ic: formData.is_business ? sanitizeInput(formData.billing.ic || '') : '',
          dic: formData.is_business ? sanitizeInput(formData.billing.dic || '') : '',
          dic_dph: formData.is_business ? sanitizeInput(formData.billing.dic_dph || '') : '',
        },
        shipping: {
          ...formData.shipping,
          first_name: sanitizeInput(formData.shipping.first_name),
          last_name: sanitizeInput(formData.shipping.last_name),
          company: sanitizeInput(formData.shipping.company),
          address_1: sanitizeInput(formData.shipping.address_1),
          address_2: sanitizeInput(formData.shipping.address_2),
          city: sanitizeInput(formData.shipping.city),
          postcode: sanitizePostcode(formData.shipping.postcode),
        },
      };

      if (formData.is_business) {
        if (!sanitizedData.billing.company?.trim()) {
          throw new Error('Názov firmy je povinný pre firemné objednávky');
        }
        if (!sanitizedData.billing.ic?.trim()) {
          throw new Error('IČO je povinné pre firemné objednávky');
        }
        if (!sanitizedData.billing.dic?.trim()) {
          throw new Error('DIČ je povinné pre firemné objednávky');
        }
        if (!/^\d{8}$/.test(sanitizedData.billing.ic)) {
          throw new Error('IČO musí obsahovať presne 8 číslic');
        }
        if (!/^\d{10}$/.test(sanitizedData.billing.dic)) {
          throw new Error('DIČ musí obsahovať presne 10 číslic');
        }
      }

      if (formData.create_account) {
        if (!formData.account_password?.trim()) {
          throw new Error('Heslo je povinné pre vytvorenie účtu');
        }
        const passwordValidation = validatePassword(formData.account_password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors.join(', '));
        }
      }

      if (formData.shipping_method === 'packeta_pickup') {
        const hasPacketaPoint = formData.meta_data.some(item => item.key === '_packeta_point_id');
        if (!hasPacketaPoint) {
          throw new Error('Prosím vyberte výdajné miesto Packeta');
        }
      }

      if (!formData.consents.terms) {
        throw new Error('Musíte súhlasiť s obchodnými podmienkami');
      }
      if (!formData.consents.privacy) {
        throw new Error('Musíte súhlasiť so spracovaním osobných údajov');
      }

      checkoutFormSchema.parse(sanitizedData);
      setFormErrors(null);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });
        setFormErrors(fieldErrors);

        const firstError = error.errors[0];
        const translatedField = translateFieldName(firstError.path.join('.'));
        toast.error(`${translatedField}: ${firstError.message}`);
      } else {
        toast.error(error instanceof Error ? error.message : 'Chyba pri validácii formulára');
      }
      return false;
    }
  }, [formData, setFormErrors]);

  // Form submission
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (formData.payment_method === 'stripe') {
      setShowStripePayment(true);
      return;
    }

    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const orderData: WooCommerceOrder = {
        status: 'pending',
        billing: formData.billing,
        shipping: formData.shipping,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        payment_method_title: formData.payment_method === 'stripe' ? 'Platba kartou' : 'Dobierka',
        meta_data: [
          ...formData.meta_data,
          ...(formData.customer_note ? [{ key: '_customer_note', value: formData.customer_note }] : []),
          ...(formData.is_business ? [
            { key: 'billing_ic', value: formData.billing.ic || '' },
            { key: 'billing_dic', value: formData.billing.dic || '' },
            { key: 'billing_dic_dph', value: formData.billing.dic_dph || '' },
          ] : []),
          ...(formData.consents.marketing ? [{ key: '_marketing_consent', value: 'yes' }] : []),
        ],
        line_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        shipping_lines: shippingCost > 0 ? [{
          method_id: formData.shipping_method,
          method_title: formData.shipping_method === 'packeta_pickup' ? 'Packeta - Výdajné miesto' : 'Packeta - Doručenie domov',
          total: shippingCost.toFixed(2),
        }] : [],
      };

      if (formData.create_account && customerData === null) {
        orderData.customer_id = undefined;
      }

      const result = await createOrder(orderData);
      orderIdRef.current = result.order.id;

      tracking.purchase(result.order.id.toString(), items, finalTotal);

      // Set processing state to show overlay
      setIsProcessingOrder(true);
      
      // Small delay to ensure overlay is visible before redirect
      setTimeout(() => {
        clearCart();
        resetForm();
        localStorage.removeItem('checkoutFormData');
        window.location.href = `/objednavka/uspesna/${result.order.id}`;
      }, 100);
    } catch (error: unknown) {
      logError('Error creating order', {
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: new Date().toISOString()
      });

      setIsProcessingOrder(false); // Reset processing state on error

      if (error instanceof Error) {
        setPaymentError({
          type: 'order_creation_error',
          message: error.message || 'Nastala chyba pri vytváraní objednávky',
        });
        toast.error(`Chyba pri vytváraní objednávky: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formData, items, shippingCost, finalTotal, clearCart, resetForm, customerData]);

  // Check if form is valid for submit button
  const isFormValid = Boolean(formData.billing.first_name && 
    formData.billing.last_name && 
    formData.billing.email && 
    formData.billing.phone && 
    formData.billing.address_1 && 
    formData.billing.city && 
    formData.billing.postcode && 
    formData.shipping_method && 
    formData.payment_method && 
    formData.consents.terms && 
    formData.consents.privacy);

  // Cart items in the format expected by OrderSummarySection
  const cartItems = items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || undefined,
  }));

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Váš košík je prázdny</h2>
          <p className="text-gray-600 mb-6">
            Vyzerá to, že ste zatiaľ do košíka nič nepridali.
          </p>
          <Link
            href="/kupit"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Prejsť na produkty
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              <FreeShippingProgress totalPrice={totalPrice} />
              
              <RecommendedProducts 
                totalPrice={totalPrice}
                recommendedProducts={recommendedProducts}
                onAddToCart={handleAddToCart}
              />

              <BusinessPurchaseSection
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
              />

              <BillingInformationSection
                formData={formData}
                formErrors={formErrors}
                sameAsShipping={sameAsShipping}
                phoneError={phoneError}
                onInputChange={handleInputChange}
                onSyncedFieldChange={handleSyncedFieldChange}
                onFormDataChange={setFormData}
                setPhoneError={setPhoneError}
              />

              <ShippingInformationSection
                formData={formData}
                formErrors={formErrors}
                sameAsShipping={sameAsShipping}
                onInputChange={handleInputChange}
                onSameAsShippingChange={handleSameAsShippingChange}
                onFormDataChange={setFormData}
              />

              <ShippingMethodsSection
                formData={formData}
                formErrors={formErrors}
                cartTotal={totalPrice}
                selectedPacketaPoint={selectedPacketaPoint}
                onInputChange={handleInputChange}
                onPacketaPointSelect={handlePacketaPointSelect}
              />

              <PaymentMethodsSection
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
              />

              <CreateAccountSection
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
              />

              <ConsentsSection
                formData={formData}
                formErrors={formErrors}
                onInputChange={handleInputChange}
              />
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummarySection
                cartItems={cartItems}
                formData={formData}
                isLoading={isSubmitting}
                isFormValid={isFormValid}
                onSubmit={handleSubmit}
                onCustomerNoteChange={handleCustomerNoteChange}
                onRemoveItem={removeFromCart}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order Processing Overlay */}
      {isProcessingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Spracúvame vašu objednávku</h3>
            <p className="text-gray-600">Prosím čakajte, prebieha presmerovanie...</p>
          </div>
        </div>
      )}

      {/* Modals and overlays */}
      {showPacketaSelector && (
        <PacketaPointSelector
          onSelectAction={handlePacketaPointConfirm}
        />
      )}

      {showStripePayment && (
        <StripePayment
          amount={finalTotal * 100}
        />
      )}

      {/* Payment error display */}
      {paymentError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p className="font-medium">Chyba pri platbe</p>
          <p className="text-sm">{paymentError.message}</p>
          <button 
            onClick={() => setPaymentError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Zavrieť
          </button>
        </div>
      )}
    </>
  );
} 