'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { createOrder, getProducts } from '../lib/woocommerce';
import type { WooCommerceProduct } from '../lib/wordpress';
import { toast } from 'sonner';
import StripePayment from '../components/StripePayment';
import PacketaPointSelector from '../components/PacketaPointSelector';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { fbq } from '../components/FacebookPixel';
import { event as gtagEvent } from '../components/GoogleAnalytics';
import { trackConversion } from '../components/GoogleAds';
import Link from 'next/link';

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
}

interface CheckoutFormData {
  status: string;
  currency: string;
  customer_note: string;
  customer_id?: number;
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
  meta_data: Array<{ key: string; value: string }>;
  line_items: Array<{ product_id: number; quantity: number }>;
  shipping_lines: Array<{
    method_id: string;
    method_title: string;
    total: string;
    meta_data: Array<{ key: string; value: string }>;
  }>;
  set_paid: boolean;
  is_business: boolean;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, addToCart } = useCart();
  const [recommendedProducts, setRecommendedProducts] = useState<WooCommerceProduct[]>([]);
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
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showPacketaSelector, setShowPacketaSelector] = useState(false);
  const { customerData } = useAuth();

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

  // Add effect to initialize form data with user info
  useEffect(() => {
    if (customerData) {
      console.log('Customer details:', {
        id: customerData.id,
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        email: customerData.email,
        billing: customerData.billing,
        shipping: customerData.shipping
      });
      
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
          },
          shipping: {
            ...prev.shipping,
            first_name: customerData.shipping?.first_name || customerData.billing?.first_name || customerData.first_name || '',
            last_name: customerData.shipping?.last_name || customerData.billing?.last_name || customerData.last_name || '',
            company: customerData.shipping?.company || customerData.billing?.company || '',
            address_1: customerData.shipping?.address_1 || customerData.billing?.address_1 || '',
            address_2: customerData.shipping?.address_2 || customerData.billing?.address_2 || '',
            city: customerData.shipping?.city || customerData.billing?.city || '',
            state: customerData.shipping?.state || customerData.billing?.state || '',
            postcode: customerData.shipping?.postcode || customerData.billing?.postcode || '',
            country: customerData.shipping?.country || customerData.billing?.country || 'SK',
          },
          shipping_method: prev.shipping_method,
          payment_method: prev.payment_method,
          payment_method_title: prev.payment_method_title,
          customer_note: prev.customer_note,
          meta_data: [
            ...prev.meta_data,
            ...(customerData.meta_data?.filter(m => 
              m.key === 'billing_ic' || 
              m.key === 'billing_dic' || 
              m.key === 'billing_dic_dph'
            ) || [])
          ],
          is_business: Boolean(customerData.meta_data?.find(m => m.key === 'billing_ic')?.value || customerData.billing?.company)
        };
        
        console.log('New form data:', newFormData);
        return newFormData;
      });
    }
  }, [customerData]);

  // If cart is empty, show message and button to go back
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
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

    // Basic validation
    if (!formData.billing.first_name || !formData.billing.last_name || !formData.billing.email || !formData.billing.phone || !formData.billing.address_1 || !formData.billing.city || !formData.billing.postcode) {
      toast.error('Chýbajúce údaje', {
        description: 'Prosím, vyplňte všetky povinné polia.',
      });
      return;
    }

    if (formData.is_business && (!formData.billing.company || !formData.billing.ic || !formData.billing.dic)) {
      toast.error('Chýbajúce údaje', {
        description: 'Prosím, vyplňte názov firmy, IČO a DIČ.',
      });
      return;
    }

    if (!formData.shipping_method) {
      toast.error('Chýbajúce údaje', {
        description: 'Prosím, vyberte spôsob dopravy.',
      });
      return;
    }

    // Only check payment method if we're not already showing Stripe payment
    if (!showStripePayment && !formData.payment_method) {
      toast.error('Chýbajúce údaje', {
        description: 'Prosím, vyberte spôsob platby.',
      });
      return;
    }

    if (formData.shipping_method === 'packeta_pickup' && !formData.meta_data.some(item => item.key === 'packeta_point_id')) {
      toast.error('Chýbajúce údaje', {
        description: 'Prosím, vyberte výdajné miesto Packeta.',
      });
      setShowPacketaSelector(true);
      return;
    }

    // If payment method is stripe and we're not showing the payment form yet
    if (formData.payment_method === 'stripe' && !showStripePayment) {
      setShowStripePayment(true);
      return;
    }

    await processOrder();
  };

  const handlePacketaPointSelect = (point: PacketaPoint) => {
    setFormData(prev => ({
      ...prev,
      meta_data: [
        { key: 'packeta_point_id', value: point.id },
        { key: 'packeta_point_name', value: point.name },
        { key: 'packeta_point_address', value: `${point.street}, ${point.city} ${point.zip}` },
      ]
    }));
    setShowPacketaSelector(false);
  };

  const processOrder = async () => {
    setIsProcessing(true);
    let newCustomerId: number | undefined;
    
    try {
      // If creating account, register the user first
      if (formData.create_account && formData.account_password) {
        try {
          console.log('Attempting to register user:', {
            email: formData.billing.email,
            first_name: formData.billing.first_name,
            last_name: formData.billing.last_name
          });

          const registerResponse = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              first_name: formData.billing.first_name,
              last_name: formData.billing.last_name,
              email: formData.billing.email,
              password: formData.account_password,
              phone: formData.billing.phone,
              address_1: formData.billing.address_1,
              city: formData.billing.city,
              postcode: formData.billing.postcode,
              country: formData.billing.country,
              timestamp: Date.now(),
            }),
          });

          const registerData = await registerResponse.json();
          console.log('Registration response:', {
            status: registerResponse.status,
            data: registerData
          });

          if (!registerResponse.ok) {
            if (registerData.error && registerData.error.includes('email-exists')) {
              console.log('User exists error:', registerData.error);
              toast.error('Používateľ s týmto emailom už existuje', {
                description: 'Prosím, prihláste sa alebo použite inú emailovú adresu.',
              });
              return;
            } else {
              console.error('Registration error:', registerData.error);
              toast.error('Chyba pri registrácii', {
                description: registerData.error || 'Skúste to prosím znova.',
              });
              return;
            }
          }

          // If registration successful
          console.log('Registration successful:', registerData.customer);
          toast.success('Účet bol úspešne vytvorený');
          
          // Store customer data and ID
          if (registerData.customer) {
            localStorage.setItem('customerToken', registerData.customer.token);
            localStorage.setItem('customerId', registerData.customer.id.toString());
            localStorage.setItem('customerName', registerData.customer.first_name);
            newCustomerId = registerData.customer.id;
          }
        } catch (error) {
          console.error('Registration error:', error);
          toast.error('Chyba pri registrácii', {
            description: 'Skúste to prosím znova.',
          });
          return;
        }
      }

      const shippingCost = getShippingCost();
      const finalTotal = totalPrice + shippingCost;
      const orderData: CheckoutFormData = {
        status: 'processing',
        currency: 'EUR',
        customer_note: '',
        customer_id: newCustomerId || customerData?.id,
        billing: {
          first_name: formData.is_business ? formData.billing.company : formData.billing.first_name,
          last_name: formData.billing.last_name,
          company: formData.billing.company,
          address_1: formData.billing.address_1,
          address_2: '',
          city: formData.billing.city,
          state: '',
          postcode: formData.billing.postcode,
          country: formData.billing.country,
          email: formData.billing.email,
          phone: formData.billing.phone
        },
        shipping: {
          first_name: formData.billing.first_name,
          last_name: formData.billing.last_name,
          company: '',
          address_1: formData.billing.address_1,
          address_2: '',
          city: formData.billing.city,
          state: '',
          postcode: formData.billing.postcode,
          country: formData.billing.country
        },
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        payment_method_title: formData.payment_method === 'cod' ? 'Dobierka' : 'Stripe',
        meta_data: [
          ...(formData.is_business ? [
            { key: '_billing_ic', value: formData.billing.ic ?? '' },
            { key: '_billing_dic', value: formData.billing.dic ?? '' },
            { key: '_billing_dic_dph', value: formData.billing.dic_dph ?? '' },
            { key: '_billing_company', value: formData.billing.company ?? '' }
          ] : [])
        ],
        line_items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_lines: [
          {
            method_id: formData.shipping_method,
            method_title: formData.shipping_method === 'packeta_pickup' ? 'Packeta - Výdajné miesto' : 'Packeta - Doručenie domov',
            total: shippingCost.toString(),
            meta_data: [
              {
                key: 'weight',
                value: '0.1'
              }
            ]
          }
        ],
        set_paid: formData.payment_method === 'stripe',
        is_business: formData.is_business
      };

      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      const response = await createOrder(orderData);
      console.log('Raw order response:', response);
      
      if (response?.error) {
        console.error('Order creation failed:', response.error);
        throw new Error(
          response.error.message || 
          (typeof response.error === 'string' ? response.error : 'Nepodarilo sa vytvoriť objednávku')
        );
      }
      
      if (!response?.order?.id) {
        console.error('Invalid order response structure:', response);
        throw new Error('Server vrátil neplatnú odpoveď. Kontaktujte prosím podporu.');
      }

      // Track purchase event in GA4
      gtagEvent('purchase', {
        transaction_id: response.order.id.toString(),
        value: finalTotal,
        currency: 'EUR',
        tax: 0,
        shipping: getShippingCost(),
        items: items.map(item => ({
          item_id: item.id.toString(),
          item_name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      // Track Google Ads conversion
      trackConversion('YOUR_CONVERSION_ID', finalTotal);

      // Create Packeta packet if using Packeta shipping
      if (formData.shipping_method.startsWith('packeta_')) {
        try {
          const packetaResponse = await fetch('/api/packeta/create-packet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: response.order.id.toString(),
              name: formData.shipping.first_name,
              surname: formData.shipping.last_name,
              email: formData.billing.email,
              phone: formData.billing.phone,
              value: finalTotal,
              weight: 0.1,
              ...(formData.shipping_method === 'packeta_pickup' 
                ? {
                    addressId: formData.meta_data.find(item => item.key === 'packeta_point_id')?.value
                  }
                : {
                    address: {
                      street: formData.shipping.address_1,
                      houseNumber: '1', // We might need to split address_1 into street and house number
                      city: formData.shipping.city,
                      zip: formData.shipping.postcode
                    },
                    isHomeDelivery: true
                  }
              ),
              ...(formData.payment_method === 'cod' && {
                cod: finalTotal
              })
            }),
          });

          if (!packetaResponse.ok) {
            const errorData = await packetaResponse.json();
            console.error('Failed to create Packeta packet:', errorData);
          } else {
            const packetData = await packetaResponse.json();
            console.log('Packeta packet created:', packetData);

            // Store Packeta packet info in WooCommerce order metadata
            try {
              const updateResponse = await fetch(`/api/woocommerce/orders/${response.order.id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  meta_data: [
                    { key: 'packeta_packet_id', value: packetData.packetId },
                    { key: 'packeta_barcode', value: packetData.barcode },
                    { key: 'packeta_barcode_text', value: packetData.barcodeText }
                  ]
                }),
              });

              if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                console.error('Failed to update order with Packeta data:', errorData);
              }
            } catch (error) {
              console.error('Error updating order with Packeta data:', error);
            }
          }
        } catch (error) {
          console.error('Error creating Packeta packet:', error);
        }
      }

      clearCart();
      toast.success('Objednávka bola úspešne vytvorená', {
        description: 'Presmerujeme vás na potvrdenie objednávky...',
        duration: 3000, // Show for 3 seconds
      });

      // Store order ID before anything else might fail
      sessionStorage.setItem('lastOrderId', response.order.id.toString());

      // Wait for toast to be visible and then redirect
      setTimeout(() => {
        window.location.href = `/objednavka/uspesna/${response.order.id}`;
      }, 3000);

    } catch (error: unknown) {
      console.error('Full error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        error
      });
      
      let errorMessage = 'Nastala chyba pri spracovaní objednávky.';
      const err = error as Error;
      
      if (err.message?.includes('Network') || err.message?.includes('fetch')) {
        errorMessage = 'Problém s pripojením k serveru. Skontrolujte prosím svoje internetové pripojenie.';
      } else if (err.message?.includes('Server vrátil neplatnú odpoveď')) {
        errorMessage = err.message;
      } else if (typeof err.message === 'string') {
        errorMessage = err.message;
      }

      toast.error('Chyba pri vytváraní objednávky', {
        description: errorMessage,
        duration: 5000
      });

      // Don't redirect immediately on error
      setTimeout(() => {
        window.location.href = '/objednavka/neuspesna';
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripeSuccess = async () => {
    await processOrder();
  };

  const handleStripeError = (error: string) => {
    console.error('Stripe error:', error);
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

  const updateShippingFromBilling = (prev: FormData) => ({
    ...prev,
    shipping: {
      first_name: prev.billing.first_name,
      last_name: prev.billing.last_name,
      company: '',
      address_1: prev.billing.address_1,
      address_2: '',
      city: prev.billing.city,
      state: '',
      postcode: prev.billing.postcode,
      country: prev.billing.country
    }
  });

  if (showPacketaSelector) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Výber výdajného miesta</h1>
        <PacketaPointSelector onSelect={handlePacketaPointSelect} />
      </div>
    );
  }

  if (showStripePayment) {
    const shippingCost = getShippingCost();
    const finalAmount = Number((totalPrice + shippingCost).toFixed(2));
    console.log('Cart total:', totalPrice);
    console.log('Shipping cost:', shippingCost);
    console.log('Final amount for Stripe:', finalAmount);
    
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

        <StripePayment 
          amount={finalAmount}
          onSuccess={handleStripeSuccess} 
          onError={handleStripeError} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {totalPrice < 39 && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <p className="text-green-700">
                Nakúpte ešte za <span className="font-bold">{(39 - totalPrice).toFixed(2)} €</span> a máte dopravu zadarmo!
              </p>
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
                <label className="block text-sm font-medium text-gray-700">
                  Názov firmy <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billing.company}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billing: { ...prev.billing, company: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required={formData.is_business}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IČO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billing.ic}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billing: { ...prev.billing, ic: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required={formData.is_business}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DIČ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billing.dic}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billing: { ...prev.billing, dic: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required={formData.is_business}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  IČ DPH
                </label>
                <input
                  type="text"
                  value={formData.billing.dic_dph || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    billing: { ...prev.billing, dic_dph: e.target.value }
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Meno <span className="text-red-500">*</span>
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700">
                Priezvisko <span className="text-red-500">*</span>
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.billing.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  billing: { ...prev.billing, email: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefón <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.billing.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  billing: { ...prev.billing, phone: e.target.value }
                }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Adresa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mesto <span className="text-red-500">*</span>
              </label>
              <input
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
              <label className="block text-sm font-medium text-gray-700">
                PSČ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billing.postcode}
                onChange={(e) => {
                  const newValue = e.target.value;
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
                checked={formData.shipping.first_name === formData.billing.first_name}
                onChange={(e) => {
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

          {formData.shipping.first_name !== formData.billing.first_name && (
            <>
              <h2 className="text-xl font-semibold mb-4">Adresa doručenia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meno <span className="text-red-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700">
                    Priezvisko <span className="text-red-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700">
                    Adresa <span className="text-red-500">*</span>
                  </label>
                  <input
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
                  <label className="block text-sm font-medium text-gray-700">
                    Mesto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shipping: { ...prev.shipping, city: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    PSČ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shipping.postcode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shipping: { ...prev.shipping, postcode: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </>
          )}
        </div>

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
                  setShowPacketaSelector(true);
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
                {formData.shipping_method === 'packeta_pickup' && formData.meta_data.some(item => item.key === 'packeta_point_name') && (
                  <div className="mt-2">
                    <div className="text-sm text-green-600">
                      Vybrané miesto: {formData.meta_data.find(item => item.key === 'packeta_point_name')?.value}
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
                    className="peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent"
                    placeholder="Heslo"
                    minLength={8}
                  />
                  <label
                    htmlFor="account_password"
                    className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                             peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                             peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
                  >
                    Heslo pre váš účet
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Heslo musí mať aspoň 8 znakov
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Spracovávam objednávku...' : 'Dokončiť objednávku'}
        </button>
      </form>
    </div>
  );
} 