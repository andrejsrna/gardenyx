'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ onSuccess, onError }: { onSuccess: () => void, onError: (error: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const orderId = sessionStorage.getItem('lastOrderId');
      if (!orderId) {
        throw new Error('Order ID not found in session storage');
      }

      const { error } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/objednavka/uspesna/${orderId}`,
        }
      });

      if (error) {
        // Handle specific card errors
        if (error.type === 'card_error') {
          let errorMessage = 'Nastala chyba pri spracovaní platby.';
          
          switch (error.code) {
            case 'card_declined':
              errorMessage = 'Platba bola zamietnutá. Skontrolujte údaje karty alebo použite inú kartu.';
              break;
            case 'expired_card':
              errorMessage = 'Karta je expirovaná.';
              break;
            case 'incorrect_cvc':
              errorMessage = 'Nesprávny bezpečnostný kód karty.';
              break;
            case 'processing_error':
              errorMessage = 'Nastala chyba pri spracovaní platby. Skúste to prosím znova.';
              break;
            case 'insufficient_funds':
              errorMessage = 'Na karte nie je dostatok prostriedkov.';
              break;
            case 'payment_intent_payment_attempt_failed':
              errorMessage = error.message || 'Platba bola zamietnutá. Skúste to prosím znova s inou kartou.';
              break;
            default:
              errorMessage = error.message || 'Nastala neočakávaná chyba pri platbe.';
          }
          throw new Error(errorMessage);
        } else if (error.type === 'validation_error') {
          throw new Error('Prosím, skontrolujte zadané údaje platobnej karty.');
        } else {
          throw new Error('Nastala neočakávaná chyba pri spracovaní platby.');
        }
      }

      // Payment was successful
      onSuccess();
      
      // Only redirect on successful payment
      router.push(`/objednavka/uspesna/${orderId}`);
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected payment error';
      setErrorMessage(message);
      onError(message);
      
      // Update order status to failed without redirect
      const orderId = sessionStorage.getItem('lastOrderId');
      if (orderId) {
        try {
          await fetch(`/api/woocommerce/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'failed' })
          });
        } catch (updateError) {
          console.error('Failed to update order status:', updateError);
        }
      }

      toast.error('Platba zlyhala', {
        description: message,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-100 opacity-50 rounded-lg" />
            <div className="relative">
              <PaymentElement 
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card', 'apple_pay', 'google_pay', 'link'],
                  defaultValues: {
                    billingDetails: {
                      name: '',
                      email: '',
                    }
                  },
                  fields: {
                    billingDetails: 'auto'
                  },
                  wallets: {
                    applePay: 'auto',
                    googlePay: 'auto'
                  }
                }}
                className="p-4"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 flex items-start space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                <span>Spracovávam...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" clipRule="evenodd" />
                </svg>
                <span>Zaplatiť</span>
              </div>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Bezpečná platba
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                <path d="M4.464 3.162A2 2 0 016.28 2h7.44a2 2 0 011.816 1.162l1.154 2.5c.067.145.115.291.145.438A3.508 3.508 0 0016 6H4c-.288 0-.568.035-.835.1.03-.147.078-.293.145-.438l1.154-2.5z" />
                <path fillRule="evenodd" d="M2 9.5a2 2 0 012-2h12a2 2 0 110 4H4a2 2 0 01-2-2zm13.24 0a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V9.5zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V9.5a.75.75 0 00-.75-.75h-.01z" clipRule="evenodd" />
              </svg>
              Šifrované údaje
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StripePayment({ amount, onSuccess, onError }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string | undefined>();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        console.log('Creating payment intent...');
        const response = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            metadata: {
              customer_email: sessionStorage.getItem('customerEmail') || undefined
            }
          }),
        });

        const data = await response.json();
        console.log('Payment intent response:', { status: response.status, data });
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        console.log('Payment setup completed successfully');
        setClientSecret(data.clientSecret);

      } catch (error) {
        console.error('Payment setup error:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        onError(error instanceof Error ? error.message : 'Failed to initialize payment');
        toast.error('Chyba pri inicializácii platby', {
          description: 'Prosím skúste to znova alebo kontaktujte podporu.'
        });
      }
    };

    if (amount > 0) {
      initializePayment();
    }
  }, [amount, onError]);

  if (!clientSecret) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        <p className="text-sm text-gray-500">Pripravujem platbu...</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#16a34a',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            borderRadius: '8px',
            spacingUnit: '4px',
          },
          rules: {
            '.Input': {
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            },
            '.Input:focus': {
              border: '1px solid #16a34a',
              boxShadow: '0 0 0 1px #16a34a',
            },
            '.Tab': {
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            },
            '.Tab:hover': {
              border: '1px solid #16a34a',
              color: '#16a34a',
            },
            '.Tab--selected': {
              border: '1px solid #16a34a',
              boxShadow: '0 0 0 1px #16a34a',
            },
          },
        },
        locale: 'sk',
      }}
    >
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
} 