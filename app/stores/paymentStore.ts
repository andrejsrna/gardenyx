import { create } from 'zustand';

interface PaymentState {
  clientSecret: string | null;
  isCreatingPaymentIntent: boolean;
  paymentIntentId: string | null;
  error: string | null;
  cartSignature: string | null; // To track when cart changes
  
  // Actions
  setClientSecret: (clientSecret: string, paymentIntentId: string) => void;
  setIsCreatingPaymentIntent: (isCreating: boolean) => void;
  setError: (error: string | null) => void;
  setCartSignature: (signature: string) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  clientSecret: null,
  isCreatingPaymentIntent: false,
  paymentIntentId: null,
  error: null,
  cartSignature: null,
  
  setClientSecret: (clientSecret: string, paymentIntentId: string) => set({ 
    clientSecret, 
    paymentIntentId, 
    isCreatingPaymentIntent: false,
    error: null 
  }),
  
  setIsCreatingPaymentIntent: (isCreatingPaymentIntent: boolean) => set({ 
    isCreatingPaymentIntent 
  }),
  
  setError: (error: string | null) => set({ 
    error, 
    isCreatingPaymentIntent: false 
  }),
  
  setCartSignature: (signature: string) => {
    const currentSignature = get().cartSignature;
    // If cart signature changed, reset payment state
    if (currentSignature && currentSignature !== signature) {
      set({ 
        cartSignature: signature,
        clientSecret: null, 
        isCreatingPaymentIntent: false, 
        paymentIntentId: null, 
        error: null 
      });
    } else {
      set({ cartSignature: signature });
    }
  },
  
  reset: () => set({ 
    clientSecret: null, 
    isCreatingPaymentIntent: false, 
    paymentIntentId: null, 
    error: null,
    cartSignature: null
  }),
}));
