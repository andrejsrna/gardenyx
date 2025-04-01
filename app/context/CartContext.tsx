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
  originalPrices: Record<number, number>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  saveCartWithEmail: (email: string) => void;
  appliedCoupon: string | null;
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
  const [originalPrices, setOriginalPrices] = useState<Record<number, number>>({});
  const lastActionRef = useRef<{ type: 'add' | 'update', itemId: number } | null>(null);
  const [lastSavedCart, setLastSavedCart] = useState<string | null>(null);
  const [exitCoupon, setExitCoupon] = useState<string | null>(null);
  // Ref to signal that a coupon was just manually (or programmatically via applyExit/applyPending) applied
  const justAppliedCouponRef = useRef(false);

  // Store original prices when items are added
  useEffect(() => {
    const newOriginalPrices = { ...originalPrices };
    items.forEach(item => {
      if (!(item.id in newOriginalPrices)) {
        newOriginalPrices[item.id] = item.price;
      }
    });
    setOriginalPrices(newOriginalPrices);
  }, [items]);

  // Define removeCoupon early as it's needed in useEffects
  const removeCoupon = useCallback(() => {
    console.log("[CartContext] Removing coupon...");
    setAppliedCoupon(null);
    setDiscountAmount(0);

    // Restore original prices
    setItems(prevItems => {
      const restoredItems = prevItems.map(item => ({
        ...item,
        price: originalPrices[item.id] || item.price // Fallback just in case
      }));
      console.log("[CartContext] Restored item prices:", restoredItems);
      return restoredItems;
    });

    localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('pendingCoupon'); // Also clear pending flag
    toast.info('Kupón bol odstránený'); // Use info or success
    console.log("[CartContext] Coupon removed. State updated.");
  }, [originalPrices]);

  const applyCoupon = useCallback(async (code: string) => {
    console.log('[CartContext] Attempting to apply coupon:', code);
    if (!code) {
      console.log("Apply coupon called with empty code.");
      return false;
    }
    // Ensure original prices are loaded for the items being validated
    const currentOriginalPrices = { ...originalPrices };
    let missingOriginalPrice = false;
    items.forEach(item => {
      if (!(item.id in currentOriginalPrices)) {
          console.warn(`Original price missing for item ${item.id} during coupon validation.`);
          // Attempt to populate from current item price if missing - might be inaccurate if already discounted
          currentOriginalPrices[item.id] = item.price;
          missingOriginalPrice = true;
      }
    });
    if (missingOriginalPrice) {
      setOriginalPrices(currentOriginalPrices); // Update state if we had to populate
      console.warn("Attempted to fill missing original prices. Recalculation might be needed.");
    }

    const totalAmount = items.reduce((sum, item) => {
       const priceToUse = currentOriginalPrices[item.id] !== undefined ? currentOriginalPrices[item.id] : item.price;
       return sum + priceToUse * item.quantity;
    }, 0);

    console.log('Validating coupon with totalAmount:', totalAmount);

    try {
      const response = await fetch('/api/woocommerce/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          items,
          totalAmount // Use calculated total based on available original prices
        }),
      });

      console.log('Coupon validation response:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.log('Coupon validation error:', error);
        toast.error(error.message || 'Neplatný kupón alebo nespĺňa podmienky.');
        return false;
      }

      const data = await response.json();
      console.log('[CartContext] Coupon validation success:', data);

      console.log(`[CartContext] Setting appliedCoupon: ${code}, discountAmount: ${data.discount}`);
      setAppliedCoupon(code);
      setDiscountAmount(data.discount);

      // Update item prices with discount ONLY if it's a percentage discount
      if (data.coupon.discount_type === 'percent') {
        const discountPercent = parseFloat(data.coupon.amount) / 100;
        console.log("[CartContext] Applying percentage discount:", discountPercent);
        setItems(prevItems => {
          let pricesChanged = false;
          const updatedItems = prevItems.map(item => {
            const originalPrice = currentOriginalPrices[item.id] !== undefined ? currentOriginalPrices[item.id] : item.price;
            const newPrice = originalPrice * (1 - discountPercent);
            // Check if price actually needs updating (handle potential floating point inaccuracies)
            if (Math.abs(item.price - newPrice) > 0.001) {
              pricesChanged = true;
              return { ...item, price: newPrice };
            }
            return item; // Return unchanged item if price is effectively the same
          });
          if (pricesChanged) {
            console.log("[CartContext] Updated item prices (percent):", updatedItems);
            return updatedItems;
          }
          console.log("[CartContext] Percentage discount applied, but item prices did not change significantly.");
          return prevItems; // Return previous items if no prices changed
        });
      } else {
        console.log("[CartContext] Applying fixed discount (or other type). Restoring original item prices if needed.");
        // Ensure item prices reflect original prices if a fixed coupon is applied/re-applied
         setItems(prevItems => {
            let pricesRestored = false;
            const restoredItems = prevItems.map(item => {
               const originalPrice = currentOriginalPrices[item.id];
               // Only update if original price exists and is different from current price
               if (originalPrice !== undefined && Math.abs(item.price - originalPrice) > 0.001) {
                  pricesRestored = true;
                  return { ...item, price: originalPrice };
               }
               return item;
            });
            if (pricesRestored) {
                console.log("[CartContext] Restored item prices (fixed/other):", restoredItems);
                return restoredItems;
            }
            console.log("[CartContext] Fixed discount applied, but item prices did not need restoration.");
            return prevItems; // Return previous items if no prices needed restoring
         });
      }

      localStorage.setItem('appliedCoupon', code);
      toast.success('Kupón bol úspešne aplikovaný');
      console.log("[CartContext] Coupon applied. State updated.");
      // Signal that this was a direct application, not just a side effect
      justAppliedCouponRef.current = true;
      return true;
    } catch (error) {
      console.error('[CartContext] Error applying coupon:', error);
      toast.error('Chyba pri aplikácii kupónu. Skúste znova.');
      return false;
    }
  }, [items, originalPrices]);

  // applyExitCoupon needs applyCoupon, define after
  const applyExitCoupon = useCallback(async (code: string) => {
    console.log(`[CartContext] applyExitCoupon called with code: ${code}`); // Log entry
    if (!code || items.length === 0) {
        console.log("[CartContext] applyExitCoupon skipped (no code or empty cart)");
        return;
    }

    // Add a small delay to ensure the coupon is available
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Add log before calling applyCoupon
      console.log(`[CartContext] applyExitCoupon is now calling applyCoupon('${code}')`);
      const success = await applyCoupon(code);
      if (success) {
        console.log('[CartContext] Successfully applied exit coupon via applyCoupon');
        setExitCoupon(code);
        // applyCoupon already sets localStorage('appliedCoupon')
      } else {
        console.log('[CartContext] applyCoupon returned false during exit coupon application');
      }
    } catch (error) {
      console.error('[CartContext] Error during applyExitCoupon -> applyCoupon call:', error);
    }
  }, [items, applyCoupon]); // Depends on items and applyCoupon

  // Initialize cart state and potentially saved coupon from localStorage on mount
  useEffect(() => {
    console.log("[CartContext Init] Component Mounted");
    // Load cart items
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

    // Load applied coupon code into state (but don't validate yet)
    const savedCouponCode = localStorage.getItem('appliedCoupon');
    if (savedCouponCode) {
        console.log("[CartContext Init] Found saved coupon code in localStorage:", savedCouponCode);
        setAppliedCoupon(savedCouponCode);
        // Validation will happen in the next effect hook once items are potentially loaded
    }
  }, []); // Run only once on mount

  // Handle pending coupon OR revalidate applied coupon ONLY when items change
  useEffect(() => {
    // Use a flag to prevent concurrent executions if items change rapidly
    let isProcessingCoupon = false;

    const handleCouponLogic = async () => {
      if (isProcessingCoupon) {
          console.log("[Effect] Coupon processing already in progress, skipping.");
          return;
      }
      isProcessingCoupon = true;
      // Log based on items changing, check current coupon state
      console.log("[Effect] Running coupon logic triggered by item change. Items:", items.length, "Applied coupon state:", appliedCoupon);

      if (items.length === 0) {
        // If cart is empty, ensure coupon is removed if present
        if (appliedCoupon) {
           console.log("[Effect] Cart empty, removing applied coupon:", appliedCoupon);
           removeCoupon();
        }
        isProcessingCoupon = false;
        return;
      }

      // --- Handle Pending Coupon (Priority) ---
      const pendingCoupon = localStorage.getItem('pendingCoupon');
      if (pendingCoupon) {
        console.log('[Effect] Applying pending coupon:', pendingCoupon);
        await new Promise(resolve => setTimeout(resolve, 300));
        const success = await applyCoupon(pendingCoupon);
        console.log(`[Effect] Pending coupon application attempt result: ${success}`);
        localStorage.removeItem('pendingCoupon');
        isProcessingCoupon = false;
        return; // Exit after handling pending
      }

      // --- Revalidate Currently Applied Coupon (from state) because items changed ---
      // Check the state variable 'appliedCoupon' which should be loaded initially
      if (appliedCoupon) {
        // Check the ref: If true, coupon was just applied. Reset ref and skip revalidation.
        if (justAppliedCouponRef.current) {
            console.log("[Effect] Skipping revalidation because coupon was just applied.");
            justAppliedCouponRef.current = false; // Reset for next item change
        } else {
            // Ref is false, proceed with revalidation as items likely changed independently
            console.log('[Effect] Items changed independently, revalidating applied coupon from state:', appliedCoupon);
            const success = await applyCoupon(appliedCoupon); // Re-run validation
            if (!success) {
              console.log('[Effect] Revalidation failed for applied coupon, removing:', appliedCoupon);
              removeCoupon(); // This will clear state and localStorage
            } else {
                console.log('[Effect] Revalidation successful for:', appliedCoupon);
            }
        }
      }
      // If no coupon was applied, this effect does nothing further after checking pending.

      isProcessingCoupon = false;
    };

    // Directly call the logic. React batching should prevent most issues.
    handleCouponLogic();

    // Cleanup function to reset the flag if component unmounts during async op
    return () => {
        isProcessingCoupon = false;
    };
    // Depend ONLY on items and the stable callbacks.
  }, [items, applyCoupon, removeCoupon]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (items.length > 0) {
      // console.log("[Effect] Saving cart items to localStorage:", items);
      localStorage.setItem('cart', JSON.stringify(items));
    } else {
      // If cart becomes empty, the other effect handles removing the coupon.
      // Just remove the cart item here.
      // console.log("[Effect] Cart empty, removing cart from localStorage.");
      localStorage.removeItem('cart');
    }
  }, [items]); // Only depends on items

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
          value: originalPrices[item.id] * (existingItem.quantity + item.quantity),
          items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            price: originalPrices[item.id],
            quantity: existingItem.quantity + item.quantity
          }]
        });

        // Track AddToCart event
        fbq('track', 'AddToCart', {
          content_ids: [item.id],
          content_name: item.name,
          value: originalPrices[item.id] * (existingItem.quantity + item.quantity),
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
          value: originalPrices[item.id] * item.quantity,
          items: [{
            item_id: item.id.toString(),
            item_name: item.name,
            price: originalPrices[item.id],
            quantity: item.quantity
          }]
        });

        // Track AddToCart event for new item
        fbq('track', 'AddToCart', {
          content_ids: [item.id],
          content_name: item.name,
          value: originalPrices[item.id] * item.quantity,
          currency: 'EUR',
          contents: [{
            id: item.id,
            quantity: item.quantity
          }],
          content_type: 'product'
        });

        // Track add to cart conversion
        trackConversion('ADD_TO_CART_CONVERSION_ID', originalPrices[item.id] * item.quantity);

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

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('abandonedCart');
    localStorage.removeItem('appliedCoupon');
    setLastSavedCart(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + originalPrices[item.id] * item.quantity, 0);
  const totalPrice = subtotal - discountAmount;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        subtotal,
        discountAmount,
        originalPrices,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveCartWithEmail,
        appliedCoupon,
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
