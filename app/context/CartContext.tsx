'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { tracking } from '../lib/tracking';
import { trackConversion } from '../components/GoogleAds';

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
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponType, setCouponType] = useState<string | null>(null);
    const [couponAmountRaw, setCouponAmountRaw] = useState<number | null>(null);
    const lastActionRef = useRef<{ type: 'add' | 'update', itemId: number } | null>(null);
    const [lastSavedCart, setLastSavedCart] = useState<string | null>(null);
    const [exitCoupon, setExitCoupon] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);

    const removeCoupon = useCallback(() => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponType(null);
        setCouponAmountRaw(null);
        localStorage.removeItem('appliedCoupon');
        localStorage.removeItem('pendingCoupon');
        toast.info('Kupón bol odstránený');
    }, []);

    const applyCoupon = useCallback(async (code: string) => {
        if (!code) return false;
        if (items.length === 0) {
            toast.error("Pridajte produkty do košíka pre aplikáciu kupónu.");
            return false;
        }
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        try {
            const response = await fetch('/api/woocommerce/coupons/validate', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code, items, totalAmount}),
            });
            if (!response.ok) {
                const error = await response.json();
                if (appliedCoupon === code) removeCoupon();
                toast.error(error.message || 'Neplatný kupón alebo nespĺňa podmienky.');
                return false;
            }
            const data = await response.json();
            setAppliedCoupon(code);
            setDiscountAmount(data.discount || 0);
            setCouponType(data.coupon?.discount_type || null);
            setCouponAmountRaw(data.coupon?.amount ? parseFloat(data.coupon.amount) : null);
            localStorage.setItem('appliedCoupon', code);
            toast.success('Kupón bol úspešne aplikovaný');
            return true;
        } catch (error) {
            console.error('[CartContext] Error applying coupon:', error);
            toast.error('Chyba pri aplikácii kupónu. Skúste znova.');
            if (appliedCoupon === code) removeCoupon();
            return false;
        }
    }, [items, appliedCoupon, removeCoupon]);

    const applyExitCoupon = useCallback(async (code: string) => {
        if (!code || items.length === 0) return;
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            const success = await applyCoupon(code);
            if (success) {
                setExitCoupon(code);
            } else {
            }
        } catch (error) {
            console.error('[CartContext] Error during applyExitCoupon -> applyCoupon call:', error);
        }
    }, [items, applyCoupon]);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsedItems = JSON.parse(savedCart);
                if (Array.isArray(parsedItems)) {
                    setItems(parsedItems);
                }
            } catch (e) {
                console.error("[CartContext Init] Failed to parse cart from localStorage", e);
            }
        }

        const savedCouponCode = localStorage.getItem('appliedCoupon');
        if (savedCouponCode) {
            setAppliedCoupon(savedCouponCode);
        }
    }, []);

    useEffect(() => {
        let isProcessing = false;
        const handleEffectLogic = async () => {
            if (isProcessing) return;
            isProcessing = true;

            if (items.length === 0) {
                if (appliedCoupon) {
                    removeCoupon();
                }
                isProcessing = false;
                return;
            }

            const pendingCoupon = localStorage.getItem('pendingCoupon');
            if (pendingCoupon) {
                await new Promise(resolve => setTimeout(resolve, 300));
                await applyCoupon(pendingCoupon);
                localStorage.removeItem('pendingCoupon');
                isProcessing = false;
                return;
            }

            if (appliedCoupon) {
                const success = await applyCoupon(appliedCoupon);
                if (!success) {
                } else {
                }
            }
            isProcessing = false;
        };

        handleEffectLogic();
        return () => {
            isProcessing = false;
        };

    }, [items, applyCoupon, removeCoupon, appliedCoupon]);

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
                    tracking.initiateCheckout(items, currentSubtotal);
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
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(abandonedCart),
                });
                if (!response.ok) throw new Error('Failed to save cart');
            } catch (error) {
                console.error('Failed to save abandoned cart:', error);
            }
        }
    };

    const addToCart = useCallback((item: CartItem) => {
        const itemWithOriginalPrice = {...item, price: item.price};

        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === itemWithOriginalPrice.id);
            let updatedItems;
            if (existingItem) {
                updatedItems = prevItems.map(i =>
                    i.id === itemWithOriginalPrice.id ? {
                        ...i,
                        quantity: i.quantity + itemWithOriginalPrice.quantity
                    } : i
                );
                lastActionRef.current = {type: 'update', itemId: itemWithOriginalPrice.id};
            } else {
                updatedItems = [...prevItems, itemWithOriginalPrice];
                lastActionRef.current = {type: 'add', itemId: itemWithOriginalPrice.id};
            }
            const trackItem = updatedItems.find(i => i.id === itemWithOriginalPrice.id)!;
            const trackValue = trackItem.price * trackItem.quantity;

            tracking.addToCart(trackItem);

            if (!existingItem) {
                trackConversion('c1xXCLfG9ZgZEJ2x7aU9', trackValue);
            }
            return updatedItems;
        });
        openCart();
    }, [openCart]);

    const removeFromCart = useCallback((itemId: number) => {
        const itemToRemove = items.find(item => item.id === itemId);
        if (itemToRemove) {
            tracking.removeFromCart(itemToRemove);
        }
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    }, [items]);

    const updateQuantity = useCallback((itemId: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
        lastActionRef.current = { type: 'update', itemId };
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedCoupon');
        toast.info("Košík bol vyprázdnený");
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = Math.max(0, subtotal - discountAmount);

    const applyPendingCoupon = useCallback(() => {
        const pendingCoupon = localStorage.getItem('pendingCoupon');
        if (pendingCoupon) {
            applyCoupon(pendingCoupon);
            localStorage.removeItem('pendingCoupon');
        }
    }, [applyCoupon]);

    useEffect(() => {
        if (lastActionRef.current) {
            lastActionRef.current = null;
        }
    }, [items]);

    return (
        <CartContext.Provider value={{
            items,
            totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice,
            subtotal,
            discountAmount,
            appliedCoupon,
            couponType,
            couponAmountRaw,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            saveCartWithEmail,
            applyPendingCoupon,
            applyCoupon,
            removeCoupon,
            exitCoupon,
            applyExitCoupon,
            isCartOpen,
            openCart,
            closeCart
        }}>
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
