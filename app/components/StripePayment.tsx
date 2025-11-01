'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import * as Sentry from '@sentry/nextjs';
import { usePaymentStore } from '../stores/paymentStore';

import { tracking } from '../lib/tracking';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '../lib/utils/sales-suspension';


const logPaymentEvent = (type: string, data: Record<string, unknown>) => {
  const sanitizedData = { ...data };
  if (sanitizedData.payment_intent_id) {
    sanitizedData.payment_intent_id = `***${String(sanitizedData.payment_intent_id).slice(-4)}`;
  }
  if (sanitizedData.orderId) {
    sanitizedData.orderId = `***${String(sanitizedData.orderId).slice(-2)}`;
  }
  
  if (['error', 'warning'].some(level => type.toLowerCase().includes(level))) {
    Sentry.addBreadcrumb({
      category: 'payment',
      message: type,
      data: sanitizedData,
      level: type.toLowerCase().includes('error') ? 'error' : 'warning',
    });
  }
};

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key');
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  throw new Error('Invalid Stripe publishable key format');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentFormProps {
  clientSecret: string;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface PaymentIntentItem {
  id: number;
  quantity: number;
}

interface BillingInfo {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
  ic?: string;
  dic?: string;
  dic_dph?: string;
}

interface ShippingInfo {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

function StripePaymentForm({ clientSecret, billingDetails, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentProgress, setPaymentProgress] = useState<string>('');

  const isProcessingRef = useRef(false);
  const formAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    formAbortControllerRef.current = new AbortController();
    
    return () => {
      isProcessingRef.current = false;
      Sentry.setContext('payment', null);
      if (formAbortControllerRef.current) {
        formAbortControllerRef.current.abort();
      }
    };
  }, []);



  const handleSubmitWithPolling = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if sales are suspended
    if (isSalesSuspendedClient()) {
      const message = getSalesSuspensionMessageClient();
      toast.error(message);
      onError?.(message);
      return;
    }

    if (!stripe || !elements) {
      logPaymentEvent('error_stripe_not_initialized', { 
        stripe: !!stripe, 
        elements: !!elements
      });
      return;
    }

    if (isProcessingRef.current) {
      logPaymentEvent('warning_double_submission_prevented', {
        clientSecret: clientSecret ? 'present' : 'missing'
      });
      return;
    }

    setIsProcessing(true);
    setError(null);
    setPaymentProgress('Spracovávam platbu...');
    isProcessingRef.current = true;

    Sentry.setContext('payment', {
      phase: 'confirmation',
      payment_intent_id: clientSecret.split('_secret_')[0],
      timestamp: new Date().toISOString()
    });

    try {

      const paymentMethodData: Record<string, unknown> = {};
      if (billingDetails) {
        const normalizedPhone = billingDetails.phone && /^\+\d{9,15}$/.test(billingDetails.phone) ? billingDetails.phone : undefined;
        paymentMethodData.billing_details = {
          ...(billingDetails.name ? { name: billingDetails.name } : {}),
          ...(billingDetails.email ? { email: billingDetails.email } : {}),
          ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        };
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: undefined,
          payment_method_data: Object.keys(paymentMethodData).length ? paymentMethodData : undefined,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        if (confirmError.code === 'payment_intent_unexpected_state') {
          logPaymentEvent('info_payment_already_confirmed', {
            error: confirmError.message,
            payment_intent_id: clientSecret.split('_secret_')[0]
          });
        } else if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
          const errorMessage = confirmError.message || 'Nastala chyba pri platbe.';
          logPaymentEvent('error_payment_confirmation', {
            error: confirmError.message,
            payment_intent_id: clientSecret.split('_secret_')[0],
            error_type: confirmError.type,
            error_code: confirmError.code
          });
          Sentry.captureException(new Error(`Payment error: ${confirmError.type} - ${confirmError.code}`), {
            extra: { confirmError, payment_intent_id: clientSecret.split('_secret_')[0] }
          });
          setError(errorMessage);
          setPaymentProgress('');
          setIsProcessing(false);
          isProcessingRef.current = false;
          onError?.(errorMessage);
          return;
        } else {
          const errorMessage = 'Nastala neočakávaná chyba pri platbe.';
          logPaymentEvent('error_unexpected_payment_confirmation', {
            error: confirmError.message,
            payment_intent_id: clientSecret.split('_secret_')[0],
            error_type: confirmError.type
          });
          Sentry.captureException(new Error(`Unexpected payment error: ${confirmError.type}`), {
            extra: { confirmError, payment_intent_id: clientSecret.split('_secret_')[0] }
          });
          setError(errorMessage);
          setPaymentProgress('');
          setIsProcessing(false);
          isProcessingRef.current = false;
          onError?.(errorMessage);
          return;
        }
      }

      setPaymentProgress('Dokončujem objednávku...');
      
      try {
        const finalize = await fetch('/api/stripe/finalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: clientSecret.split('_secret_')[0],
          }),
          signal: formAbortControllerRef.current?.signal,
        });

        if (finalize.ok) {
          const result = await finalize.json();
          
          if (result.orderId) {
            try {
              await tracking.purchaseWithConversionAPI(
                result.orderId.toString(),
                [],
                0,
              );
            } catch (trackingError) {
              logPaymentEvent('warning_tracking_failed_payment_succeeded', {
                error: trackingError instanceof Error ? trackingError.message : String(trackingError),
                orderId: result.orderId,
                payment_intent_id: clientSecret.split('_secret_')[0]
              });
              Sentry.captureException(trackingError, {
                extra: { orderId: result.orderId, payment_intent_id: clientSecret.split('_secret_')[0] }
              });
            }
            
            window.location.href = `/objednavka/uspesna/${result.orderId}`;
            onSuccess?.();
            return;
          } else {
            logPaymentEvent('warning_finalize_missing_order_id', {
              response: result,
              payment_intent_id: clientSecret.split('_secret_')[0]
            });
          }
        } else if (finalize.status === 409) {
          logPaymentEvent('info_order_already_processing', {
            status: finalize.status,
            payment_intent_id: clientSecret.split('_secret_')[0]
          });
        } else {
          const errorText = await finalize.text().catch(() => 'Unknown error');
          logPaymentEvent('error_finalize_request_failed', {
            status: finalize.status,
            statusText: finalize.statusText,
            response: errorText,
            payment_intent_id: clientSecret.split('_secret_')[0]
          });
        }
      } catch (fetchError) {
        logPaymentEvent('error_finalize_request_exception', {
          error: fetchError instanceof Error ? fetchError.message : String(fetchError),
          payment_intent_id: clientSecret.split('_secret_')[0]
        });
      }

      let attempts = 0;
      const maxAttempts = 10;
      const pollInterval = 2000;
      const paymentIntentId = clientSecret.split('_secret_')[0];

      setPaymentProgress('Overujem stav objednávky...');
      
      logPaymentEvent('info_starting_polling', {
        payment_intent_id: paymentIntentId,
        max_attempts: maxAttempts,
        poll_interval: pollInterval
      });

      while (attempts < maxAttempts) {
        if (!isProcessingRef.current) {
          logPaymentEvent('info_polling_aborted_unmounted', {
            payment_intent_id: paymentIntentId,
            attempts_completed: attempts
          });
          return;
        }

        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;

        try {
          const response = await fetch(`/api/woocommerce/orders/by-payment-intent?id=${paymentIntentId}`, {
            signal: formAbortControllerRef.current?.signal,
          });
          
          if (response.ok) {
            const result = await response.json();
            
            if (result && result.orderId) {
              logPaymentEvent('success_order_found_polling', {
                orderId: result.orderId,
                payment_intent_id: paymentIntentId,
                attempts_taken: attempts
              });

              try {
                await tracking.purchaseWithConversionAPI(
                  result.orderId.toString(),
                  [],
                  0,
                );
              } catch (trackingError) {
                logPaymentEvent('warning_tracking_failed_polling_succeeded', {
                  error: trackingError instanceof Error ? trackingError.message : String(trackingError),
                  orderId: result.orderId,
                  payment_intent_id: paymentIntentId
                });
                Sentry.captureException(trackingError, {
                  extra: { orderId: result.orderId, payment_intent_id: paymentIntentId, phase: 'polling' }
                });
              }

              window.location.href = `/objednavka/uspesna/${result.orderId}`;
              onSuccess?.();
              return;
            } else {
              logPaymentEvent('warning_polling_missing_order_id', {
                response: result,
                payment_intent_id: paymentIntentId,
                attempt: attempts
              });
            }
          } else {
            logPaymentEvent('error_polling_request_failed', {
              status: response.status,
              statusText: response.statusText,
              payment_intent_id: paymentIntentId,
              attempt: attempts
            });
          }
        } catch (pollError) {
          logPaymentEvent('error_polling_request_exception', {
            error: pollError instanceof Error ? pollError.message : String(pollError),
            payment_intent_id: paymentIntentId,
            attempt: attempts
          });
        }
      }

      logPaymentEvent('warning_polling_exhausted', {
        payment_intent_id: paymentIntentId,
        total_attempts: attempts
      });
      Sentry.captureMessage('Payment polling exhausted', {
        level: 'warning',
        extra: { payment_intent_id: paymentIntentId, attempts }
      });

      setError('Objednávka sa spracováva. Skontrolujte prosím svoj email pre potvrdenie.');
      onError?.('Objednávka sa spracováva. Skontrolujte prosím svoj email pre potvrdenie.');
    } catch (unexpectedError) {
      const errorMessage = 'Nastala chyba pri spracovaní platby.';
      logPaymentEvent('error_unexpected_payment_processing', {
        error: unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError),
        payment_intent_id: clientSecret.split('_secret_')[0]
      });
      Sentry.captureException(unexpectedError, {
        extra: { payment_intent_id: clientSecret.split('_secret_')[0], phase: 'payment_processing' }
      });
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setPaymentProgress('');
      setIsProcessing(false);
      isProcessingRef.current = false;
      
      Sentry.setContext('payment', null);
    }
  }, [stripe, elements, clientSecret, onSuccess, onError, billingDetails]);

  return (
    <form onSubmit={handleSubmitWithPolling} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="pt-6 px-6 pb-6">
          <PaymentElement />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">{error}</div>
      )}

      {isProcessing && paymentProgress && (
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{paymentProgress}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
          </svg>
          <span>Bezpečná platba cez Stripe</span>
        </div>

        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.937 6.937 0 006.222 6.222.75.75 0 00.859-.584c.212-1.012.395-2.036.543-3.071h.858a.75.75 0 00.22-1.094l-.465-.464a.75.75 0 00-.707-.213 9.003 9.003 0 01-4.977 0 .75.75 0 00-.707.213l-.465.464a.75.75 0 00-.22 1.094zM13.5 18.621a.75.75 0 00.75.75h.858a.75.75 0 00.22-1.094l-.465-.464a.75.75 0 00-.707-.213 9.004 9.004 0 01-4.977 0 .75.75 0 00-.707.213l-.465.464a.75.75 0 00-.22 1.094v.858zM13.5 2.621a.75.75 0 00-.75.75v.858c1.035.148 2.059.33 3.071.543a.75.75 0 00.859.584 6.937 6.937 0 006.222-6.222.75.75 0 00-.584-.859c-.212-1.012-.395-2.036-.543-3.071h-.858a.75.75 0 00-1.094-.22l-.464.465a.75.75 0 00-.213.707 9.003 9.003 0 01-4.977 0 .75.75 0 00-.213-.707l-.464-.465a.75.75 0 00-1.094.22z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-gray-600">SSL šifrovanie</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2 animate-spin">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            Spracovávam platbu...
          </>
        ) : (
          'Zaplatiť'
        )}
      </button>
    </form>
  );
}

interface StripePaymentProps {
  items: PaymentIntentItem[];
  shippingMethod: string;
  discountAmount: number;
  billing: BillingInfo;
  shipping: ShippingInfo;
  isBusiness: boolean;
  customerNote?: string;
  marketingConsent: boolean;
  metaData?: Array<{ key: string; value: string }>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export default function StripePayment({ 
  items, 
  shippingMethod, 
  discountAmount, 
  billing, 
  shipping, 
  isBusiness, 
  customerNote, 
  marketingConsent,
  metaData,
  onSuccess, 
  onError,
  onClose 
}: StripePaymentProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { 
    clientSecret, 
    isCreatingPaymentIntent, 
    error,
    setClientSecret, 
    setIsCreatingPaymentIntent, 
    setError,
    setCartSignature,
    reset 
  } = usePaymentStore();

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      reset(); // Reset payment state on unmount
    };
  }, [reset]);

  const stableItems = useMemo(() => 
    items?.map(item => ({ 
      product_id: Number(item.id), 
      quantity: Number(item.quantity) 
    })) || [], 
    [items]
  );

  const stableRequestData = useMemo(() => ({
    cart: {
      line_items: stableItems,
      shipping_method: shippingMethod,
    },
    discountAmount: Number(discountAmount) || 0,
    customer: {
      billing,
      shipping,
      is_business: Boolean(isBusiness),
      customer_note: customerNote || '',
      marketing_consent: Boolean(marketingConsent),
      meta_data: metaData || [],
    },
  }), [stableItems, shippingMethod, discountAmount, billing, shipping, isBusiness, customerNote, marketingConsent, metaData]);

  // Create a signature for the cart to detect changes
  const currentCartSignature = useMemo(() => 
    JSON.stringify({
      items: stableItems,
      shipping: shippingMethod,
      discount: discountAmount,
      billing: billing?.email
    })
  , [stableItems, shippingMethod, discountAmount, billing?.email]);

  // Update cart signature and reset payment state if cart changed
  useEffect(() => {
    setCartSignature(currentCartSignature);
  }, [currentCartSignature, setCartSignature]);

  useEffect(() => {
    if (isCreatingPaymentIntent || clientSecret) {
      return;
    }

    // Set creating flag immediately (synchronously) to prevent double execution
    setIsCreatingPaymentIntent(true);
    
    let cancelled = false;
    
    const createPaymentIntent = async () => {
      try {
        if (cancelled) return;

        if (!stableItems?.length) {
          throw new Error('Košík je prázdny');
        }
        if (!billing?.email) {
          throw new Error('Chýba fakturačná emailová adresa');
        }
        if (!shippingMethod) {
          throw new Error('Vyberte spôsob doručenia');
        }

        logPaymentEvent('info_creating_payment_intent', {
          cart_items: stableItems.length,
          shipping_method: shippingMethod,
          discount_amount: discountAmount,
          is_business: isBusiness
        });

        const response = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(stableRequestData),
          signal: abortControllerRef.current?.signal,
        });

        if (cancelled) return;

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: `HTTP ${response.status}: ${response.statusText}` 
          }));
          
          logPaymentEvent('error_payment_intent_creation_failed', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          throw new Error(errorData.message || 'Nastala chyba pri vytváraní platby');
        }

        const data = await response.json();
        
        if (cancelled) return;
        
        if (!data.clientSecret) {
          logPaymentEvent('error_payment_intent_missing_client_secret', {
            response: data
          });
          throw new Error('Neplatná odpoveď zo servera');
        }

        setClientSecret(data.clientSecret, data.paymentIntentId);
        
        logPaymentEvent('success_payment_intent_created', {
          has_client_secret: !!data.clientSecret
        });

      } catch (err) {
        if (cancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Nastala chyba pri načítaní platby';
        
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        logPaymentEvent('error_payment_intent_creation', {
          error: err instanceof Error ? err.message : String(err)
        });
        
        Sentry.captureException(err, {
          extra: { 
            phase: 'payment_intent_creation',
            items_count: stableItems?.length,
            shipping_method: shippingMethod 
          }
        });
        
        setError(errorMessage);
        onError?.(errorMessage);
        toast.error('Chyba pri inicializácii platby', {
          description: errorMessage
        });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    createPaymentIntent();
    
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableRequestData, billing?.email, shippingMethod, stableItems.length, discountAmount, isBusiness, onError]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Načítavame platbu</h3>
          <p className="text-gray-600">Prosím čakajte...</p>
        </div>
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md mx-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chyba pri platbe</h3>
            <p className="text-gray-600">{error || 'Nastala neočakávaná chyba'}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Zavrieť
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Skúsiť znova
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Platba kartou</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#059669',
                },
              },
            }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              billingDetails={{
                name: [billing?.first_name, billing?.last_name].filter(Boolean).join(' ').trim() || undefined,
                email: billing?.email || undefined,
                phone: billing?.phone || undefined,
              }}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}
