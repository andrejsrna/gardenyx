'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { fbq } from '../components/FacebookPixel';
import { trackConversion } from '../components/GoogleAds';
import { event as gtagEvent } from '../components/GoogleAnalytics';

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
  subtotal: number;
  discountAmount: number;
  appliedCoupon: string | null;
  couponType: string | null;
  couponAmountRaw: number | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  saveCartWithEmail: (email: string) => void;
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
  const [couponType, setCouponType] = useState<string | null>(null);
  const [couponAmountRaw, setCouponAmountRaw] = useState<number | null>(null);
  const lastActionRef = useRef<{ type: 'add' | 'update', itemId: number } | null>(null);
  const [lastSavedCart, setLastSavedCart] = useState<string | null>(null);
  const [exitCoupon, setExitCoupon] = useState<string | null>(null);

  const removeCoupon = useCallback(() => {
    console.log("[CartContext] Removing coupon...");
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponType(null);
    setCouponAmountRaw(null);
    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('pendingCoupon');
    toast.info('Kupón bol odstránený');
    console.log("[CartContext] Coupon removed. State updated.");
  }, []);

  const applyCoupon = useCallback(async (code: string) => {
    console.log('[CartContext] Attempting to apply coupon:', code);
    if (!code) return false;
    if (items.length === 0) {
      toast.error("Pridajte produkty do košíka pre aplikáciu kupónu.");
      return false;
    }
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log('Validating coupon with totalAmount:', totalAmount);
    try {
      const response = await fetch('/api/woocommerce/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, items, totalAmount }),
      });
      console.log('Coupon validation response:', response.status);
      if (!response.ok) {
        const error = await response.json();
        console.log('Coupon validation error:', error);
        if (appliedCoupon === code) removeCoupon();
        toast.error(error.message || 'Neplatný kupón alebo nespĺňa podmienky.');
        return false;
      }
      const data = await response.json();
      console.log('[CartContext] Coupon validation success:', data);
      setAppliedCoupon(code);
      setDiscountAmount(data.discount || 0);
      setCouponType(data.coupon?.discount_type || null);
      setCouponAmountRaw(data.coupon?.amount ? parseFloat(data.coupon.amount) : null);
      console.log(`[CartContext] State Set: appliedCoupon=${code}, discountAmount=${data.discount}, couponType=${data.coupon?.discount_type}, couponAmountRaw=${data.coupon?.amount}`);
      localStorage.setItem('appliedCoupon', code);
      toast.success('Kupón bol úspešne aplikovaný');
      console.log("[CartContext] Coupon applied. State updated.");
      return true;
    } catch (error) {
      console.error('[CartContext] Error applying coupon:', error);
      toast.error('Chyba pri aplikácii kupónu. Skúste znova.');
      if (appliedCoupon === code) removeCoupon();
      return false;
    }
  }, [items, appliedCoupon, removeCoupon]);

  const applyExitCoupon = useCallback(async (code: string) => {
    console.log(`[CartContext] applyExitCoupon called with code: ${code}`);
    if (!code || items.length === 0) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      console.log(`[CartContext] applyExitCoupon is now calling applyCoupon('${code}')`);
      const success = await applyCoupon(code);
      if (success) {
        console.log('[CartContext] Successfully applied exit coupon via applyCoupon');
        setExitCoupon(code);
      } else {
        console.log('[CartContext] applyCoupon returned false during exit coupon application');
      }
    } catch (error) {
      console.error('[CartContext] Error during applyExitCoupon -> applyCoupon call:', error);
    }
  }, [items, applyCoupon]);

  useEffect(() => {
    console.log("[CartContext Init] Component Mounted");
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart);
        if (Array.isArray(parsedItems)) {
          console.log("[CartContext Init] Loading cart items from localStorage:", parsedItems);
          setItems(parsedItems);
        }
      } catch (e) {
        console.error("[CartContext Init] Failed to parse cart from localStorage", e);
      }
    }

    const savedCouponCode = localStorage.getItem('appliedCoupon');
    if (savedCouponCode) {
        console.log("[CartContext Init] Found saved coupon code in localStorage:", savedCouponCode);
        setAppliedCoupon(savedCouponCode);
    }
  }, []);

  useEffect(() => {
    let isProcessing = false;
    const handleEffectLogic = async () => {
        if (isProcessing) return;
        isProcessing = true;
        console.log("[Effect] Running check. Items:", items.length, "Applied coupon:", appliedCoupon);

        if (items.length === 0) {
            if (appliedCoupon) {
                console.log("[Effect] Cart empty, removing coupon.");
                removeCoupon();
            }
            isProcessing = false;
            return;
        }

        const pendingCoupon = localStorage.getItem('pendingCoupon');
        if (pendingCoupon) {
            console.log('[Effect] Applying pending coupon:', pendingCoupon);
            await new Promise(resolve => setTimeout(resolve, 300));
            await applyCoupon(pendingCoupon);
            localStorage.removeItem('pendingCoupon');
            isProcessing = false;
            return;
        }

        if (appliedCoupon) {
            console.log('[Effect] Items changed, revalidating applied coupon:', appliedCoupon);
            const success = await applyCoupon(appliedCoupon);
            if (!success) {
                console.log('[Effect] Revalidation failed, coupon removed by applyCoupon failure handling.');
            } else {
                 console.log('[Effect] Revalidation successful for:', appliedCoupon);
            }
        }
        isProcessing = false;
    };

    handleEffectLogic();
    return () => { isProcessing = false; };

  }, [items, applyCoupon, removeCoupon]);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      const cartKey = JSON.stringify(items);
      if (cartKey !== lastSavedCart) {
        const currentSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const abandonedCart: AbandonedCart = {
          items,
          totalPrice: currentSubtotal,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('abandonedCart', JSON.stringify(abandonedCart));
        setLastSavedCart(cartKey);

        if (items.length > 0) {
          gtagEvent('begin_checkout', {
            currency: 'EUR', value: currentSubtotal,
            items: items.map(item => ({ item_id: item.id.toString(), item_name: item.name, price: item.price, quantity: item.quantity }))
          });
        }
      }
    } else {
      localStorage.removeItem('abandonedCart');
      setLastSavedCart(null);
    }
  }, [items, lastSavedCart]);

  const saveCartWithEmail = async (email: string) => {
    if (items.length > 0) {
      const currentSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const abandonedCart: AbandonedCart = {
        items,
        totalPrice: currentSubtotal,
        timestamp: new Date().toISOString(),
        email
      };
      try {
        localStorage.setItem('abandonedCart', JSON.stringify(abandonedCart));
        const response = await fetch('/api/cart/abandoned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(abandonedCart),
        });
        if (!response.ok) throw new Error('Failed to save cart');
      } catch (error) {
        console.error('Failed to save abandoned cart:', error);
      }
    }
  };

  useEffect(() => {
    if (lastActionRef.current) {
      const item = items.find(i => i.id === lastActionRef.current?.itemId);
      if (item) {
        const message = lastActionRef.current.type === 'add'
          ? `${item.name} bol pridaný do košíka`
          : `Množstvo pre ${item.name} bolo aktualizované`;
         toast.success(message);
      }
      lastActionRef.current = null;
    }
  }, [items]);

  const applyPendingCoupon = useCallback(() => {
    const pending = localStorage.getItem('pendingCoupon');
    if (pending) {
      console.log("External call to applyPendingCoupon");
      applyCoupon(pending);
      localStorage.removeItem('pendingCoupon');
    }
  }, [applyCoupon]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPrice = Math.max(0, subtotal - discountAmount);

  const addToCart = useCallback((item: CartItem) => {
    console.log("[CartContext] addToCart:", item);
    // Ensure item price is treated as the original price
    const itemWithOriginalPrice = { ...item, price: item.price };

    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === itemWithOriginalPrice.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = prevItems.map(i =>
          i.id === itemWithOriginalPrice.id ? { ...i, quantity: i.quantity + itemWithOriginalPrice.quantity } : i
        );
        lastActionRef.current = { type: 'update', itemId: itemWithOriginalPrice.id };
      } else {
        updatedItems = [...prevItems, itemWithOriginalPrice];
        lastActionRef.current = { type: 'add', itemId: itemWithOriginalPrice.id };
      }
      // Tracking Logic (uses item.price which is original price)
      const trackItem = updatedItems.find(i => i.id === itemWithOriginalPrice.id)!;
      const trackValue = trackItem.price * trackItem.quantity;
      gtagEvent('add_to_cart', {
        currency: 'EUR', value: trackValue,
        items: [{ item_id: trackItem.id.toString(), item_name: trackItem.name, price: trackItem.price, quantity: trackItem.quantity }]
      });
      fbq('track', 'AddToCart', {
        content_ids: [trackItem.id.toString()], content_name: trackItem.name, value: trackValue, currency: 'EUR',
        contents: [{ id: trackItem.id.toString(), quantity: trackItem.quantity }], content_type: 'product'
      });
      if (!existingItem) {
        trackConversion('ADD_TO_CART_CONVERSION_ID', trackValue);
      }
      return updatedItems;
    });
  }, []); // No external dependencies needed here

  const removeFromCart = useCallback((itemId: number) => {
    console.log("[CartContext] removeFromCart:", itemId);
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []); // No dependencies

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    console.log(`[CartContext] updateQuantity: itemId=${itemId}, quantity=${quantity}`);
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
    lastActionRef.current = { type: 'update', itemId: itemId };
  }, [removeFromCart]); // Depends on removeFromCart

  const clearCart = useCallback(() => {
    console.log("[CartContext] clearCart called");
    setItems([]);
    removeCoupon(); // Ensure coupon state is cleared
    localStorage.removeItem('abandonedCart');
    setLastSavedCart(null);
  }, [removeCoupon]); // Depends on removeCoupon

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        subtotal,
        discountAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveCartWithEmail,
        appliedCoupon,
        couponType,
        couponAmountRaw,
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
