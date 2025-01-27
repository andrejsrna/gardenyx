'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { fbq } from '../components/FacebookPixel';
import { event as gtagEvent } from '../components/GoogleAnalytics';
import { trackConversion } from '../components/GoogleAds';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AbandonedCart {
  items: CartItem[];
  totalPrice: number;
  timestamp: string;
  email?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  saveCartWithEmail: (email: string) => void;
  appliedCoupon: string | null;
  discountAmount: number;
  applyPendingCoupon: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  exitCoupon: string | null;
  applyExitCoupon: (code: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const lastActionRef = useRef<{ type: 'add' | 'update', itemId: number } | null>(null);
  const [lastSavedCart, setLastSavedCart] = useState<string | null>(null);
  const [exitCoupon, setExitCoupon] = useState<string | null>(null);

  const applyCoupon = useCallback(async (code: string) => {
    console.log('Attempting to apply coupon:', code);
    try {
      const response = await fetch('/api/woocommerce/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          items,
          totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        }),
      });

      console.log('Coupon validation response:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.log('Coupon validation error:', error);
        toast.error(error.message || 'Neplatný kupón');
        return false;
      }

      const data = await response.json();
      console.log('Coupon validation success:', data);
      
      setAppliedCoupon(code);
      setDiscountAmount(data.discount);
      localStorage.setItem('appliedCoupon', code);
      toast.success('Kupón bol úspešne aplikovaný');
      return true;
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Nepodarilo sa aplikovať kupón');
      return false;
    }
  }, [items]);

  const applyExitCoupon = useCallback(async (code: string) => {
    console.log('Applying exit coupon:', code);
    if (!code || items.length === 0) return;

    // Add a small delay to ensure the coupon is available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const success = await applyCoupon(code);
      if (success) {
        console.log('Successfully applied exit coupon');
        setExitCoupon(code);
        localStorage.setItem('appliedCoupon', code);
      } else {
        console.log('Failed to apply exit coupon');
      }
    } catch (error) {
      console.error('Error applying exit coupon:', error);
    }
  }, [items, applyCoupon]);

  // Initialize cart and coupons
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }

    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      setAppliedCoupon(savedCoupon);
    }
  }, []); // Run only once on mount

  // Handle coupons when items change
  useEffect(() => {
    const handleCoupons = async () => {
      // Only proceed if we have items in cart
      if (items.length === 0) return;

      console.log('Checking coupons...', {
        items: items.length,
        pendingCoupon: localStorage.getItem('pendingCoupon'),
        savedCoupon: localStorage.getItem('appliedCoupon')
      });

      // First check for pending coupon (from exit intent)
      const pendingCoupon = localStorage.getItem('pendingCoupon');
      if (pendingCoupon) {
        console.log('Applying pending coupon:', pendingCoupon);
        
        // Add a small delay to ensure the coupon is available
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = await applyCoupon(pendingCoupon);
        if (success) {
          console.log('Successfully applied pending coupon');
          localStorage.removeItem('pendingCoupon');
        } else {
          console.log('Failed to apply pending coupon');
          // Retry once after a delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          const retrySuccess = await applyCoupon(pendingCoupon);
          if (retrySuccess) {
            console.log('Successfully applied pending coupon on retry');
            localStorage.removeItem('pendingCoupon');
          } else {
            console.log('Failed to apply pending coupon after retry');
          }
        }
        return;
      }

      // Then check for saved coupon
      const savedCoupon = localStorage.getItem('appliedCoupon');
      if (savedCoupon) {
        console.log('Applying saved coupon:', savedCoupon);
        const success = await applyCoupon(savedCoupon);
        if (!success) {
          console.log('Failed to apply saved coupon');
          localStorage.removeItem('appliedCoupon');
        }
      }
    };

    handleCoupons();
  }, [items, applyCoupon]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [items]);

  // Track abandoned cart
  useEffect(() => {
    if (items.length > 0) {
      const cartKey = JSON.stringify(items);
      
      // Only update if cart has changed
      if (cartKey !== lastSavedCart) {
        const abandonedCart: AbandonedCart = {
          items,
          totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('abandonedCart', JSON.stringify(abandonedCart));
        setLastSavedCart(cartKey);

        // Track cart abandonment in analytics
        if (items.length > 0) {
          gtagEvent('begin_checkout', {
            currency: 'EUR',
            value: abandonedCart.totalPrice,
            items: items.map(item => ({
              item_id: item.id.toString(),
              item_name: item.name,
              price: item.price,
              quantity: item.quantity
            }))
          });
        }
      }
    } else {
      localStorage.removeItem('abandonedCart');
      setLastSavedCart(null);
    }
  }, [items, lastSavedCart]);

  // Save cart with customer email
  const saveCartWithEmail = async (email: string) => {
    if (items.length > 0) {
      const abandonedCart: AbandonedCart = {
        items,
        totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        timestamp: new Date().toISOString(),
        email
      };
      
      try {
        // Save to localStorage
        localStorage.setItem('abandonedCart', JSON.stringify(abandonedCart));
        
        // Send to backend for email recovery
        const response = await fetch('/api/cart/abandoned', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(abandonedCart),
        });

        if (!response.ok) {
          throw new Error('Failed to save cart');
        }
      } catch (error) {
        console.error('Failed to save abandoned cart:', error);
      }
    }
  };

  // Handle toast notifications
  useEffect(() => {
    if (lastActionRef.current) {
      const message = lastActionRef.current.type === 'add' 
        ? 'Produkt bol pridaný do košíka'
        : 'Množstvo produktu v košíku bolo aktualizované';
      
      toast.success(message);
      lastActionRef.current = null;
    }
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      let updatedItems;
      
      if (existingItem) {
        // Track AddToCart event in GA4
        gtagEvent('add_to_cart', {
          currency: 'EUR',
          value: item.price * (existingItem.quantity + item.quantity),
          items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: existingItem.quantity + item.quantity
          }]
        });

        // Track AddToCart event
        fbq('track', 'AddToCart', {
          content_ids: [item.id],
          content_name: item.name,
          value: item.price * (existingItem.quantity + item.quantity),
          currency: 'EUR',
          contents: [{
            id: item.id,
            quantity: existingItem.quantity + item.quantity
          }],
          content_type: 'product'
        });

        lastActionRef.current = { type: 'update', itemId: item.id };
        updatedItems = prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Track AddToCart event for new item in GA4
        gtagEvent('add_to_cart', {
          currency: 'EUR',
          value: item.price * item.quantity,
          items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
          }]
        });

        // Track AddToCart event for new item
        fbq('track', 'AddToCart', {
          content_ids: [item.id],
          content_name: item.name,
          value: item.price * item.quantity,
          currency: 'EUR',
          contents: [{
            id: item.id,
            quantity: item.quantity
          }],
          content_type: 'product'
        });

        // Track add to cart conversion
        trackConversion('ADD_TO_CART_CONVERSION_ID', item.price * item.quantity);

        lastActionRef.current = { type: 'add', itemId: item.id };
        updatedItems = [...prevItems, item];
      }

      return updatedItems;
    });
  };

  const removeFromCart = (itemId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const applyPendingCoupon = () => {
    const pendingCoupon = localStorage.getItem('pendingCoupon');
    if (pendingCoupon) {
      applyCoupon(pendingCoupon);
      localStorage.removeItem('pendingCoupon');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('appliedCoupon');
    toast.success('Kupón bol odstránený');
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('abandonedCart');
    localStorage.removeItem('appliedCoupon');
    setLastSavedCart(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0) - discountAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveCartWithEmail,
        appliedCoupon,
        discountAmount,
        applyPendingCoupon,
        applyCoupon,
        removeCoupon,
        exitCoupon,
        applyExitCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 