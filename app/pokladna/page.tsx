'use client';

import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import CouponSection from '../components/CouponSection';
import { fbq } from '../components/FacebookPixel';
import { event as gtagEvent } from '../components/GoogleAnalytics';
import PacketaPointSelector from '../components/PacketaPointSelector';
import StripePayment from '../components/StripePayment';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCookieConsent } from '../context/CookieConsentContext';
import { getCsrfToken } from '../lib/utils/csrf';
import { logError } from '../lib/utils/logger';
import { validatePassword } from '../lib/utils/password';
import { sanitizeInput, sanitizePhone, sanitizePostcode } from '../lib/utils/sanitize';
import { checkoutFormSchema } from '../lib/validations/checkout';
import { createOrder, getProducts } from '../lib/woocommerce';
import type { WooCommerceProduct } from '../lib/wordpress';

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

interface FormData {
  billing: {
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
  shipping: {
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
  shipping_method: string;
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
  meta_data: Array<{
    key: string;
    value: string;
  }>;
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
  billing: FormData['billing'];
  shipping: FormData['shipping'];
  shipping_method: string;
  payment_method: string;
  payment_method_title: string;
  meta_data: Array<{
    key: string;
    value: string;
  }>;
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_lines: Array<{
    method_id: string;
    method_title: string;
    total: string;
  }>;
}

// Move this function BEFORE the component definition
function updateShippingFromBilling(prevData: FormData) {
  return {
    ...prevData,
    shipping: {
      ...prevData.billing,
      first_name: prevData.billing.first_name,
      last_name: prevData.billing.last_name,
      company: prevData.billing.company || '',
      address_1: prevData.billing.address_1,
      address_2: prevData.billing.address_2 || '',
      city: prevData.billing.city,
      state: prevData.billing.state || '',
      postcode: prevData.billing.postcode,
      country: prevData.billing.country
    }
  };
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, addToCart, appliedCoupon, discountAmount } = useCart();
  const [recommendedProducts, setRecommendedProducts] = useState<WooCommerceProduct[]>([]);
  const { consent, hasConsented } = useCookieConsent();
  const [formData, setFormData] = useState<FormData>({
    billing: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'SK',
      email: '',
      phone: '',
      ic: '',
      dic: '',
      dic_dph: '',
    },
    shipping: {
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      state: '',
      postcode: '',
      country: 'SK',
    },
    shipping_method: '',
    payment_method: '',
    payment_method_title: '',
    customer_note: '',
    meta_data: [],
    is_business: false,
    create_account: false,
    account_password: '',
    consents: {
      terms: false,
      privacy: false,
      marketing: false
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showPacketaSelector, setShowPacketaSelector] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentError | null>(null);
  const { customerData } = useAuth();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [placesLoaded, setPlacesLoaded] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [orderIdCreated, setOrderIdCreated] = useState<number | null>(null);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Track begin_checkout event in GA4
  useEffect(() => {
    if (items.length > 0) {
      gtagEvent('begin_checkout', {
        currency: 'EUR',
        value: totalPrice,
        items: items.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      // Track InitiateCheckout event
      fbq('track', 'InitiateCheckout', {
        content_ids: items.map(item => item.id),
        contents: items.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        value: totalPrice,
        currency: 'EUR',
        num_items: items.length
      });
    }
  }, [items, totalPrice]);

  // Fetch recommended products
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const products = await getProducts('include=839,680,669,47');
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      }
    };

    if (totalPrice < 39) {
      fetchRecommendedProducts();
    }
  }, [totalPrice]);

  // This useEffect should come AFTER the function is defined
  useEffect(() => {
    setFormData(prev => updateShippingFromBilling(prev));
  }, []);

  // Načítanie údajov z cookies pri načítaní stránky
  useEffect(() => {
    // Načítame údaje z cookies len ak používateľ nie je prihlásený a súhlasil s cookies
    if (!customerData && hasConsented && consent.necessary) {
      const savedCheckoutData = localStorage.getItem('checkoutFormData');
      if (savedCheckoutData) {
        try {
          const parsedData = JSON.parse(savedCheckoutData);
          setFormData(prev => ({
            ...prev,
            billing: {
              ...prev.billing,
              ...parsedData.billing
            },
            shipping: {
              ...prev.shipping,
              ...parsedData.shipping
            },
            shipping_method: parsedData.shipping_method || prev.shipping_method,
            payment_method: parsedData.payment_method || prev.payment_method,
            is_business: parsedData.is_business || prev.is_business
          }));

          // Ak máme uložené údaje o firme a is_business je true
          if (parsedData.is_business && parsedData.billing.company) {
            setFormData(prev => ({
              ...prev,
              is_business: true,
              billing: {
                ...prev.billing,
                company: parsedData.billing.company || '',
                ic: parsedData.billing.ic || '',
                dic: parsedData.billing.dic || '',
                dic_dph: parsedData.billing.dic_dph || ''
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing saved checkout data:', error);
          localStorage.removeItem('checkoutFormData');
        }
      }
    }
  }, [customerData, hasConsented, consent.necessary]);

  // Uloženie údajov do cookies pri zmene formData
  useEffect(() => {
    // Ukladáme údaje do cookies len ak používateľ nie je prihlásený a súhlasil s cookies
    if (!customerData && hasConsented && consent.necessary &&
        (formData.billing.first_name || formData.billing.last_name || formData.billing.email)) {

      // Vytvoríme objekt s údajmi, ktoré chceme uložiť
      const dataToSave = {
        billing: {
          first_name: formData.billing.first_name,
          last_name: formData.billing.last_name,
          company: formData.billing.company,
          address_1: formData.billing.address_1,
          city: formData.billing.city,
          postcode: formData.billing.postcode,
          country: formData.billing.country,
          email: formData.billing.email,
          phone: formData.billing.phone,
          ic: formData.billing.ic,
          dic: formData.billing.dic,
          dic_dph: formData.billing.dic_dph
        },
        shipping: {
          first_name: formData.shipping.first_name,
          last_name: formData.shipping.last_name,
          address_1: formData.shipping.address_1,
          city: formData.shipping.city,
          postcode: formData.shipping.postcode,
          country: formData.shipping.country
        },
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        is_business: formData.is_business
      };

      localStorage.setItem('checkoutFormData', JSON.stringify(dataToSave));
    }
  }, [formData, customerData, hasConsented, consent.necessary]);

  // Add effect to initialize form data with user info
  useEffect(() => {
    if (customerData) {
      setFormData(prev => {
        const newFormData = {
          ...prev,
          billing: {
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
          }
        };

        // Always copy billing to shipping when loading customer data
        return updateShippingFromBilling(newFormData);
      });
    }
  }, [customerData]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (placesLoaded && addressInputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: ['sk'] },
        fields: ['address_components', 'formatted_address'],
        types: ['address']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        let streetNumber = '';
        let route = '';
        let postalCode = '';
        let city = '';

        place.address_components.forEach((component: AddressComponent) => {
          const types = component.types;
          if (types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (types.includes('route')) {
            route = component.long_name;
          }
          if (types.includes('postal_code')) {
            postalCode = component.long_name.replace(/\s+/g, '');
          }
          if (types.includes('locality') || types.includes('sublocality')) {
            city = component.long_name;
          }
        });

        const address = `${route} ${streetNumber}`.trim();

        setFormData(prev => {
          const newState = {
            ...prev,
            billing: {
              ...prev.billing,
              address_1: address,
              city: city,
              postcode: postalCode,
            }
          };

          // If shipping is same as billing, update shipping address too
          if (prev.shipping.city === prev.billing.city) {
            newState.shipping = {
              ...prev.shipping,
              address_1: address,
              city: city,
              postcode: postalCode,
            };
          }

          return newState;
        });
      });
    }
  }, [placesLoaded]);

  // If cart is empty, show message and button to go back
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Váš košík je prázdny</h2>
          <p className="text-gray-600 mb-6">Pridajte si produkty do košíka pre pokračovanie v nákupe.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
            </svg>
            Späť na hlavnú stránku
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ochrana proti viacnásobnému odoslaniu
    if (isSubmitting) {
      console.log('Form is already being submitted');
      return;
    }

    setIsSubmitting(true);

    try {
      // Add password validation only if creating account
      if (formData.create_account) {
        if (!formData.account_password) {
          toast.error('Chýbajúce heslo', {
            description: 'Pre vytvorenie účtu je potrebné zadať heslo.'
          });
          return;
        }

        const { isValid, errors } = validatePassword(formData.account_password);
        if (!isValid) {
          toast.error('Neplatné heslo', {
            description: errors.join('\n')
          });
          return;
        }
      }

      // Sanitize and validate form data
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

      // Validate postal code format
      const postcodeRegex = /^\d{5}$/;
      if (!postcodeRegex.test(sanitizedData.billing.postcode)) {
        toast.error('Neplatné PSČ', {
          description: 'PSČ musí obsahovať presne 5 číslic.'
        });
        setIsSubmitting(false);
        return;
      }

      if (!postcodeRegex.test(sanitizedData.shipping.postcode)) {
        toast.error('Neplatné PSČ', {
          description: 'PSČ doručenia musí obsahovať presne 5 číslic.'
        });
        setIsSubmitting(false);
        return;
      }

      // Only include business fields in validation if is_business is true
      const validationSchema = checkoutFormSchema.extend({
        billing: checkoutFormSchema.shape.billing.extend({
          ic: formData.is_business ? z.string().length(8, 'IČO musí mať 8 číslic') : z.string().optional(),
          dic: formData.is_business ? z.string().length(10, 'DIČ musí mať 10 číslic') : z.string().optional(),
          dic_dph: formData.is_business ? z.string().optional() : z.string().optional()
        }),
        account_password: formData.create_account
          ? z.string()
              .min(8, 'Heslo musí mať aspoň 8 znakov')
              .regex(
                /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                'Heslo musí obsahovať aspoň jedno veľké písmeno, číslo a špeciálny znak'
              )
          : z.string().optional()
      });

      validationSchema.parse(sanitizedData);

      // Additional business validation
      if (formData.is_business && (!formData.billing.company || !formData.billing.ic || !formData.billing.dic)) {
        toast.error('Chýbajúce údaje', {
          description: 'Prosím, vyplňte názov firmy, IČO a DIČ.',
        });
        return;
      }

      if (formData.shipping_method === 'packeta_pickup' &&
          !formData.meta_data.some(item => item.key === '_packeta_point_id')) {
        toast.error('Chýbajúce údaje', {
          description: 'Prosím, vyberte výdajné miesto Packeta.',
        });
        setShowPacketaSelector(true);
        return;
      }

      // Spracovanie objednávky
      await processOrder();
    } catch (error) {
      console.error('Error processing order:', error);
      setPaymentError({
        type: 'general',
        message: 'Nastala chyba pri spracovaní objednávky. Skúste to znova.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePacketaPointSelect = (point: PacketaPoint) => {
    setFormData(prev => ({
      ...prev,
      meta_data: [
        { key: '_packeta_point_id', value: point.id },
        { key: '_packeta_point_name', value: point.name },
        { key: '_packeta_point_address', value: `${point.street}, ${point.city} ${point.zip}` },
      ],
      shipping: {
        ...prev.shipping,
        address_1: point.street,
        city: point.city,
        postcode: point.zip
      }
    }));
    setShowPacketaSelector(false);
  };

  const processOrder = async () => {
    // Ochrana proti opakovanému vytvoreniu tej istej objednávky
    if (orderIdCreated) {
      console.log(`Order #${orderIdCreated} already created, preventing duplicate submission`);
      return;
    }

    try {
      // Start payment monitoring
      const paymentStartTime = Date.now();

      // Prepare shipping address based on shipping method
      let shippingAddress = formData.shipping;
      if (formData.shipping_method === 'packeta_pickup') {
        const packetaPoint = formData.meta_data.find(item => item.key === '_packeta_point_name')?.value;
        const packetaAddress = formData.meta_data.find(item => item.key === '_packeta_point_address')?.value;

        if (packetaPoint && packetaAddress) {
          const [street, cityWithZip] = packetaAddress.split(', ');
          const [city, zip] = cityWithZip ? cityWithZip.split(' ') : ['', ''];

          shippingAddress = {
            ...formData.shipping,
            company: packetaPoint,
            address_1: street || '',
            city: city || '',
            postcode: zip || '',
            country: 'SK'
          };
        }
      }

      // Create order in WooCommerce first
      const orderData: WooCommerceOrder = {
        status: 'processing',
        customer_id: customerData?.id,
        billing: formData.billing,
        shipping: shippingAddress,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        payment_method_title: formData.payment_method === 'stripe' ? 'Platba kartou' : 'Dobierka',
        meta_data: formData.meta_data,
        line_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_lines: [{
          method_id: formData.shipping_method,
          method_title: formData.shipping_method === 'packeta_pickup' ? 'Packeta' : 'Doručenie domov',
          total: getShippingCost().toString()
        }]
      };

      const orderResponse = await createOrder({
        ...orderData,
        meta_data: [
          ...orderData.meta_data,
          {
            key: 'payment_method',
            value: formData.payment_method
          },
          {
            key: 'consents',
            value: JSON.stringify({
              terms: formData.consents.terms,
              privacy: formData.consents.privacy,
              marketing: formData.consents.marketing,
              timestamp: new Date().toISOString()
            })
          }
        ]
      });

      if (orderResponse?.error) {
        throw new Error(orderResponse.error);
      }

      const orderId = orderResponse?.order?.id?.toString();
      if (!orderId) {
        throw new Error('WooCommerce order creation failed - no order ID returned');
      }

      // Store the order ID in session storage for the payment component
      sessionStorage.setItem('lastOrderId', orderId);

      if (formData.payment_method === 'stripe') {
        try {
          // Create payment intent with order ID
          const token = getCsrfToken();
          const paymentResponse = await fetch('/api/stripe/payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'X-CSRF-Token': token })
            },
            body: JSON.stringify({
              amount: finalTotal,
              currency: 'eur',
              metadata: {
                order_id: orderId,
                customer_email: formData.billing.email,
              }
            })
          });

          if (!paymentResponse.ok) {
            throw new Error('Payment initialization failed');
          }

          // Log payment duration
          const paymentDuration = Date.now() - paymentStartTime;
          console.info(`Payment processing time: ${paymentDuration}ms`);

        } catch (error) {
          const paymentError = error as PaymentError;
          logError('Payment Processing Error', {
            error: paymentError,
            orderId,
            customerEmail: formData.billing.email,
            amount: finalTotal,
            timestamp: new Date().toISOString()
          });

          let errorMessage = 'Nastala chyba pri spracovaní platby.';

          if (paymentError.code === 'card_declined') {
            errorMessage = 'Platba bola zamietnutá. Skontrolujte údaje karty alebo použite inú kartu.';
          } else if (paymentError.code === 'expired_card') {
            errorMessage = 'Karta je expirovaná.';
          }

          toast.error('Chyba platby', {
            description: errorMessage
          });
          return;
        }
      }

      // Clear sensitive data
      sessionStorage.removeItem('paymentIntentId');

      // Success handling
      if (formData.payment_method === 'cod') {
        // Zobrazíme loading overlay pred vyčistením košíka
        setShowLoadingOverlay(true);
        setRedirectUrl(`/objednavka/uspesna/${orderId}`);

        // Predĺžime čas zobrazenia overlay a presmerujeme priamo bez vyčistenia košíka
        setTimeout(() => {
          // Vyčistíme košík a presmerujeme v jednom kroku
          window.location.href = `/objednavka/uspesna/${orderId}`;
          // Košík vyčistíme až po začatí presmerovania
          clearCart();
        }, 1000);

        toast.success('Objednávka bola úspešne vytvorená');
      } else {
        // Pre Stripe platbu len nastavíme showStripePayment
        setShowStripePayment(true);
      }

    } catch (error) {
      logError('Order Processing Error', {
        error,
        customerEmail: formData.billing.email,
        timestamp: new Date().toISOString()
      });

      toast.error('Chyba', {
        description: 'Nastala chyba pri spracovaní objednávky. Skúste to prosím znova.'
      });

      // V prípade chyby zobrazíme overlay s chybovou správou a presmerujeme na chybovú stránku
      setShowLoadingOverlay(true);
      setRedirectUrl('/objednavka/neuspesna');

      setTimeout(() => {
        window.location.href = '/objednavka/neuspesna';
      }, 1000);
    } finally {
      setIsSubmitting(false);
      setOrderIdCreated(null);
    }
  };

  const handleStripeSuccess = async () => {
    // Predíďte duplicitným objednávkam pri callback-u
    if (!orderIdCreated) {
      console.error('Order ID not found for Stripe success callback');
      return;
    }

    // Zobrazíme loading overlay pred vyčistením košíka
    setShowLoadingOverlay(true);
    setRedirectUrl(`/objednavka/uspesna/${orderIdCreated}`);
    toast.success('Platba bola úspešná');

    // Predĺžime čas zobrazenia overlay a presmerujeme priamo bez vyčistenia košíka
    setTimeout(() => {
      // Vyčistíme košík a presmerujeme v jednom kroku
      window.location.href = `/objednavka/uspesna/${orderIdCreated}`;
      // Košík vyčistíme až po začatí presmerovania
      clearCart();
    }, 1000);
  };

  const handleStripeError = (error: string) => {
    console.error('Stripe error:', error);
    toast.error('Chyba platby', {
      description: error
    });
    setShowStripePayment(false);
  };

  // Calculate shipping cost based on cart total and selected method
  const getShippingCost = () => {
    if (totalPrice >= 39) return 0;

    switch (formData.shipping_method) {
      case 'packeta_pickup':
        return 2.9;
      case 'packeta_home':
        return 3.8;
      default:
        return 0;
    }
  };

  // Calculate final total including shipping
  const finalTotal = totalPrice + getShippingCost();

  const handlePacketaClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const currentScroll = window.scrollY;
    setShowPacketaSelector(true);
    setTimeout(() => window.scrollTo(0, currentScroll), 0);
  };

  // Add phone validation
  const validatePhone = (phone: string) => {
    // Slovak phone number format: +421 XXX XXX XXX or 09XX XXX XXX
    // Akceptuje formáty s medzerami aj bez medzier
    const phoneWithoutSpaces = phone.replace(/\s+/g, '');

    // Kontrola dĺžky
    if (phoneWithoutSpaces.startsWith('+421') && phoneWithoutSpaces.length !== 13) {
      return false;
    }

    if (phoneWithoutSpaces.startsWith('0') && phoneWithoutSpaces.length !== 10) {
      return false;
    }

    // Kontrola formátu
    const skPhoneRegex = /^(\+421|0)[1-9][0-9]{8}$/;
    return skPhoneRegex.test(phoneWithoutSpaces);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawPhone = e.target.value;

    // Formátovanie telefónneho čísla
    const formattedPhone = sanitizePhone(rawPhone);

    setFormData(prev => ({
      ...prev,
      billing: { ...prev.billing, phone: formattedPhone }
    }));

    // Validácia telefónneho čísla
    if (formattedPhone && !validatePhone(formattedPhone)) {
      setPhoneError('Zadajte platné telefónne číslo (+421 XXX XXX XXX alebo 09XX XXX XXX)');
    } else {
      setPhoneError(null);
    }

    // Ak je hodnota iná ako zadaná, nastavíme kurzor na správnu pozíciu
    if (formattedPhone !== rawPhone) {
      // Nastavenie kurzora na koniec vstupu sa vykoná automaticky
      e.target.value = formattedPhone;
    }
  };

  if (showStripePayment) {
    const shippingCost = getShippingCost();
    const finalAmount = Number((totalPrice + shippingCost).toFixed(2));

    return (
      <div className="max-w-md mt-16 mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Platba kartou</h2>
        </div>

        <div className="space-y-3 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Cena produktov</span>
            <span className="font-medium">{totalPrice.toFixed(2)} €</span>
          </div>
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
            <span className="font-bold text-green-600">{finalAmount.toFixed(2)} €</span>
          </div>
        </div>

        {paymentError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="font-medium">Chyba platby: {paymentError.message}</p>
            {paymentError.code && <p className="text-sm">Kód: {paymentError.code}</p>}
          </div>
        )}

        <StripePayment
          amount={finalAmount}
          onSuccess={handleStripeSuccess}
          onError={handleStripeError}
        />
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setPlacesLoaded(true)}
      />

      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <div className="animate-spin mb-4 mx-auto w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
            <h2 className="text-xl font-semibold mb-2">Spracovávame vašu objednávku</h2>
            <p className="text-gray-600">
              {redirectUrl?.includes('uspesna')
                ? 'Presmerujeme vás na stránku s potvrdením objednávky.'
                : 'Nastala chyba pri spracovaní objednávky.'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6">
        {/* Trust Badges Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Bezpečný nákup</h3>
              <p className="text-xs text-gray-500">SSL šifrovanie a bezpečná platba</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Doprava zadarmo</h3>
              <p className="text-xs text-gray-500">Pri nákupe nad 39€</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Rýchle doručenie</h3>
              <p className="text-xs text-gray-500">Expedujeme do 24 hodín</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-sm mb-1">Overený e-shop</h3>
              <p className="text-xs text-gray-500">Tisíce spokojných zákazníkov</p>
            </div>
          </div>
        </div>

        {totalPrice < 39 && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <p className="text-green-700">
                  Nakúpte ešte za <span className="font-bold">{(39 - totalPrice).toFixed(2)} €</span> a máte dopravu zadarmo!
                </p>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2.5 mb-1">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(totalPrice / 39) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-green-700">
                <span>0 €</span>
                <span className="font-medium">39 €</span>
              </div>
            </div>

            {recommendedProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Tieto produkty by vás mohli zaujať</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recommendedProducts.map((product) => (
                    <div key={product.id} className="flex flex-col items-center text-center">
                      <div className="relative w-24 h-24 mb-2">
                        <Image
                          src={product.images[0]?.src || ''}
                          alt={product.images[0]?.alt || product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="text-sm font-medium mb-1">{product.name}</h3>
                      <p className="text-sm font-bold text-green-600 mb-2">{product.price} €</p>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            quantity: 1,
                          });
                          toast.success('Produkt bol pridaný do košíka');
                        }}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                      >
                        Pridať do košíka
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <CouponSection />

        <h1 className="text-2xl font-bold mb-6">Pokladňa</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Purchase Toggle */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_business}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_business: e.target.checked,
                  billing: {
                    ...prev.billing,
                    company: e.target.checked ? prev.billing.company : '',
                    ic: e.target.checked ? prev.billing.ic : '',
                    dic: e.target.checked ? prev.billing.dic : '',
                    dic_dph: e.target.checked ? prev.billing.dic_dph : '',
                  }
                }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Nakupujem na firmu</span>
            </label>

            {formData.is_business && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="company-name">
                    Názov firmy <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={formData.billing.company}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      billing: { ...prev.billing, company: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required={formData.is_business}
                    placeholder="Zadajte názov firmy"
                    aria-label="Názov firmy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="billing-ic">
                    IČO <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="billing-ic"
                    type="text"
                    value={formData.billing.ic}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      billing: { ...prev.billing, ic: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required={formData.is_business}
                    placeholder="Zadajte IČO"
                    aria-label="IČO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic">
                    DIČ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="billing-dic"
                    type="text"
                    value={formData.billing.dic}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      billing: { ...prev.billing, dic: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required={formData.is_business}
                    placeholder="Zadajte DIČ"
                    aria-label="DIČ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700" htmlFor="billing-dic-dph">
                    IČ DPH
                  </label>
                  <input
                    id="billing-dic-dph"
                    type="text"
                    value={formData.billing.dic_dph || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      billing: { ...prev.billing, dic_dph: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Zadajte IČ DPH (nepovinné)"
                    aria-label="IČ DPH"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Billing Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Fakturačné údaje</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="billing-first-name" className="block text-sm font-medium text-gray-700">
                  Meno <span className="text-red-500">*</span>
                </label>
                <input
                  id="billing-first-name"
                  type="text"
                  value={formData.billing.first_name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData(prev => {
                      const newState = {
                        ...prev,
                        billing: { ...prev.billing, first_name: newValue }
                      };
                      // If shipping is same as billing, update shipping too
                      if (prev.shipping.first_name === prev.billing.first_name) {
                        newState.shipping = {
                          ...prev.shipping,
                          first_name: newValue
                        };
                      }
                      return newState;
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="billing-last-name" className="block text-sm font-medium text-gray-700">
                  Priezvisko <span className="text-red-500">*</span>
                </label>
                <input
                  id="billing-last-name"
                  type="text"
                  value={formData.billing.last_name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData(prev => {
                      const newState = {
                        ...prev,
                        billing: { ...prev.billing, last_name: newValue }
                      };
                      if (prev.shipping.last_name === prev.billing.last_name) {
                        newState.shipping = {
                          ...prev.shipping,
                          last_name: newValue
                        };
                      }
                      return newState;
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="billing-email"
                  type="email"
                  value={formData.billing.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billing: { ...prev.billing, email: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                  placeholder="Váš email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefónne číslo *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.billing.phone}
                  onChange={handlePhoneChange}
                  placeholder="+421 XXX XXX XXX"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm ${
                    phoneError ? 'border-red-300' : ''
                  }`}
                />
                {phoneError && (
                  <p className="text-sm text-red-600">{phoneError}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">
                  Adresa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  ref={addressInputRef}
                  value={formData.billing.address_1}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData(prev => {
                      const newState = {
                        ...prev,
                        billing: { ...prev.billing, address_1: newValue }
                      };
                      if (prev.shipping.address_1 === prev.billing.address_1) {
                        newState.shipping = {
                          ...prev.shipping,
                          address_1: newValue
                        };
                      }
                      return newState;
                    });
                  }}
                  placeholder="Začnite písať adresu..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">
                  Mesto <span className="text-red-500">*</span>
                </label>
                <input
                  id="billing-city"
                  type="text"
                  value={formData.billing.city}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setFormData(prev => {
                      const newState = {
                        ...prev,
                        billing: { ...prev.billing, city: newValue }
                      };
                      if (prev.shipping.city === prev.billing.city) {
                        newState.shipping = {
                          ...prev.shipping,
                          city: newValue
                        };
                      }
                      return newState;
                    });
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="billing-postcode" className="block text-sm font-medium text-gray-700">
                  PSČ <span className="text-red-500">*</span>
                </label>
                <input
                  id="billing-postcode"
                  type="text"
                  value={formData.billing.postcode}
                  onChange={(e) => {
                    // Odstránenie medzier z PSČ
                    const newValue = e.target.value.replace(/\s+/g, '');
                    setFormData(prev => {
                      const newState = {
                        ...prev,
                        billing: { ...prev.billing, postcode: newValue }
                      };
                      if (prev.shipping.postcode === prev.billing.postcode) {
                        newState.shipping = {
                          ...prev.shipping,
                          postcode: newValue
                        };
                      }
                      return newState;
                    });
                  }}
                  pattern="\d{5}"
                  placeholder="PSČ (5 číslic)"
                  title="PSČ musí obsahovať 5 číslic"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => {
                    setSameAsShipping(e.target.checked);
                    if (e.target.checked) {
                      // Copy billing address to shipping
                      setFormData(updateShippingFromBilling);
                    } else {
                      // Clear shipping address
                      setFormData(prev => ({
                        ...prev,
                        shipping: {
                          first_name: '',
                          last_name: '',
                          company: '',
                          address_1: '',
                          address_2: '',
                          city: '',
                          state: '',
                          postcode: '',
                          country: 'SK'
                        }
                      }));
                    }
                  }}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Adresa doručenia je taká istá ako fakturačná
                </span>
              </label>
            </div>
          </div>

          {!sameAsShipping && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Adresa doručenia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="shipping-first-name" className="block text-sm font-medium text-gray-700">
                    Meno <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-first-name"
                    type="text"
                    value={formData.shipping.first_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shipping: { ...prev.shipping, first_name: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="shipping-last-name" className="block text-sm font-medium text-gray-700">
                    Priezvisko <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-last-name"
                    type="text"
                    value={formData.shipping.last_name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shipping: { ...prev.shipping, last_name: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700">
                    Adresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-address"
                    type="text"
                    value={formData.shipping.address_1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shipping: { ...prev.shipping, address_1: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700">
                    Mesto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-city"
                    type="text"
                    value={formData.shipping.city}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => {
                        const newState = {
                          ...prev,
                          shipping: { ...prev.shipping, city: newValue }
                        };
                        if (prev.billing.city === prev.shipping.city) {
                          newState.billing = {
                            ...prev.billing,
                            city: newValue
                          };
                        }
                        return newState;
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="shipping-postcode" className="block text-sm font-medium text-gray-700">
                    PSČ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-postcode"
                    type="text"
                    value={formData.shipping.postcode}
                    onChange={(e) => {
                      // Odstránenie medzier z PSČ
                      const newValue = e.target.value.replace(/\s+/g, '');
                      setFormData(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, postcode: newValue }
                      }));
                    }}
                    pattern="\d{5}"
                    placeholder="PSČ (5 číslic)"
                    title="PSČ musí obsahovať 5 číslic"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipping Methods */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Spôsob dopravy</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="shipping_method"
                  value="packeta_pickup"
                  checked={formData.shipping_method === 'packeta_pickup'}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      shipping_method: e.target.value
                    }));
                    handlePacketaClick(e);
                  }}
                  className="rounded-full border-gray-300 text-green-600 focus:ring-green-500"
                  required
                />
                <div>
                  <div className="font-medium">Packeta - Výdajné miesto</div>
                  <div className="text-sm text-gray-500">
                    Vyzdvihnutie na výdajnom mieste Packeta
                    {totalPrice >= 39 ? (
                      <span className="ml-2 text-green-600 font-medium">Zadarmo</span>
                    ) : (
                      <span className="ml-2 font-medium">2.90 €</span>
                    )}
                  </div>
                  {formData.shipping_method === 'packeta_pickup' && formData.meta_data.some(item => item.key === '_packeta_point_name') && (
                    <div className="mt-2">
                      <div className="text-sm text-green-600">
                        Vybrané miesto: {formData.meta_data.find(item => item.key === '_packeta_point_name')?.value}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPacketaSelector(true)}
                        className="mt-1 text-sm text-green-600 hover:text-green-700 underline"
                      >
                        Zmeniť výdajné miesto
                      </button>
                    </div>
                  )}
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="shipping_method"
                  value="packeta_home"
                  checked={formData.shipping_method === 'packeta_home'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    shipping_method: e.target.value,
                    meta_data: prev.meta_data.filter(item => !item.key.startsWith('packeta_point_'))
                  }))}
                  className="rounded-full border-gray-300 text-green-600 focus:ring-green-500"
                  required
                />
                <div>
                  <div className="font-medium">Packeta - Doručenie domov</div>
                  <div className="text-sm text-gray-500">
                    Doručenie na vašu adresu
                    {totalPrice >= 39 ? (
                      <span className="ml-2 text-green-600 font-medium">Zadarmo</span>
                    ) : (
                      <span className="ml-2 font-medium">3.80 €</span>
                    )}
                  </div>
                </div>
              </label>
            </div>
            {totalPrice < 39 && formData.shipping_method && (
              <div className="mt-4 text-sm text-gray-600">
                Pri nákupe nad 39 € je doprava zadarmo
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Spôsob platby</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={formData.payment_method === 'cod'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    payment_method: e.target.value
                  }))}
                  className="rounded-full border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <div className="font-medium">Dobierka</div>
                  <div className="text-sm text-gray-500">Platba pri prevzatí</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment_method"
                  value="stripe"
                  checked={formData.payment_method === 'stripe'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    payment_method: e.target.value
                  }))}
                  className="rounded-full border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <div className="font-medium">Platba kartou</div>
                  <div className="text-sm text-gray-500">
                    Bezpečná platba kartou, Google Pay, Apple Pay alebo Stripe Link
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Image src="/paymets/visa.svg" alt="Visa" width={24} height={24} className="h-6" />
                    <Image src="/paymets/mastercard.svg" alt="Mastercard" width={24} height={24} className="h-6" />
                    <Image src="/paymets/gpay.svg" alt="Google Pay" width={24} height={24} className="h-6" />
                    <Image src="/paymets/applepay.svg" alt="Apple Pay" width={24} height={24} className="h-6" />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Zhrnutie objednávky</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x {item.quantity}</span>
                  </div>
                  <div className="font-medium">{(Number(item.price) * item.quantity).toFixed(2)} €</div>
                </div>
              ))}
              {appliedCoupon && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Zľavový kupón: {appliedCoupon}</span>
                  <span>-{discountAmount.toFixed(2)} €</span>
                </div>
              )}
              {formData.shipping_method && getShippingCost() > 0 && (
                <div className="flex justify-between items-center text-gray-600">
                  <span>Doprava</span>
                  <span>{getShippingCost().toFixed(2)} €</span>
                </div>
              )}
              <div className="border-t pt-4 flex justify-between items-center font-bold">
                <div>
                  <span>Celková suma</span>
                  <div className="text-xs font-normal text-gray-500">Cena vrátane DPH</div>
                </div>
                <span>{finalTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Create Account Section */}
          {!customerData && (
            <div className="mt-8">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create_account"
                  checked={formData.create_account}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    create_account: e.target.checked,
                    // Clear password if unchecked
                    account_password: e.target.checked ? prev.account_password : ''
                  }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="create_account" className="text-sm text-gray-700">
                  Vytvoriť účet pre budúce objednávky
                </label>
              </div>

              {formData.create_account && (
                <div className="mt-4">
                  <div className="relative">
                    <input
                      type="password"
                      id="account_password"
                      required={formData.create_account}
                      value={formData.account_password}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        account_password: e.target.value
                      }))}
                      pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
                      title="Heslo musí obsahovať aspoň 8 znakov, jedno veľké písmeno, číslo a špeciálny znak"
                      className="peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm
                                 focus:border-green-500 focus:ring-green-500 placeholder-transparent"
                      placeholder="Heslo"
                    />
                    <label
                      htmlFor="account_password"
                      className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600
                                transition-all peer-placeholder-shown:top-4
                                peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                                peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
                    >
                      Heslo pre váš účet
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Heslo musí obsahovať aspoň 8 znakov, jedno veľké písmeno, číslo a jeden špeciálny znak
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-xl font-semibold mb-4">Súhlas so spracovaním údajov</h2>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.consents.terms}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  consents: { ...prev.consents, terms: e.target.checked }
                }))}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <span className="text-sm text-gray-700">
                Súhlasím s <Link href="/obchodne-podmienky" className="text-green-600 hover:underline">obchodnými podmienkami</Link> *
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.consents.privacy}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  consents: { ...prev.consents, privacy: e.target.checked }
                }))}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                required
              />
              <span className="text-sm text-gray-700">
                Súhlasím so <Link href="/ochrana-osobnych-udajov" className="text-green-600 hover:underline">spracovaním osobných údajov</Link> *
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.consents.marketing}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  consents: { ...prev.consents, marketing: e.target.checked }
                }))}
                className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Súhlasím so zasielaním marketingových informácií o novinkách a zľavách
              </span>
            </label>

            <p className="text-xs text-gray-500 mt-2">
              * Povinné polia
            </p>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-md bg-green-600 text-white font-medium
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Spracovanie objednávky...' : 'Dokončiť objednávku'}
          </button>
        </form>

        {showPacketaSelector && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Výber výdajného miesta</h1>
                  <button
                    onClick={() => setShowPacketaSelector(false)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Zatvoriť výber výdajného miesta"
                    aria-label="Zatvoriť výber výdajného miesta"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <PacketaPointSelector onSelect={handlePacketaPointSelect} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
