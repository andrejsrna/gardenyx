'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { tracking } from '../lib/tracking';
import { trackConversion, reportAddToCartConversion } from '../components/GoogleAds';
import { isSalesSuspendedClient, getSalesSuspensionMessageClient } from '../lib/utils/sales-suspension';
import { safeGetItem, safeRemoveItem, safeSetItem } from '../lib/utils/safe-local-storage';

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sku?: string;
    slug?: string;
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
    /** Total discount applied to cart (coupons OR manual bundle discounts). */
    discountAmount: number;
    appliedCoupon: string | null;
    couponType: string | null;
    couponAmountRaw: number | null;
    couponFreeShipping: boolean;
    /** Manual discount display label (e.g. “Zľava za kúru (3 mesiace)”). */
    manualDiscountLabel: string | null;
    /** Manual discount key for analytics / order meta (e.g. “cure_3m”). */
    manualDiscountKey: string | null;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    saveCartWithEmail: (email: string) => void;
    applyPendingCoupon: () => void;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
    /** Apply a manual discount (used for “kúry” bundles). Clears any coupon code. */
    setManualDiscount: (amount: number, label?: string, key?: string) => void;
    clearManualDiscount: () => void;
    exitCoupon: string | null;
    applyExitCoupon: (code: string) => Promise<boolean>;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CURE_CAPSULES_ID = 47;
const CURE_GEL_ID = 669;

const CURE_TARGET_TOTALS: Record<number, number> = {
    1: 19.99,
    2: 34.99,
    3: 49.99,
};

function computeDynamicCureDiscount(items: CartItem[]) {
    const capsules = items.find(i => i.id === CURE_CAPSULES_ID);
    const gels = items.find(i => i.id === CURE_GEL_ID);
    if (!capsules || !gels) return null;

    const months = Math.min(capsules.quantity, gels.quantity);
    if (!Number.isFinite(months) || months <= 0) return null;

    const monthRegular = Number(capsules.price || 0) + Number(gels.price || 0);
    if (!Number.isFinite(monthRegular) || monthRegular <= 0) return null;

    // Unbounded DP for exact month count with packs 1/2/3; minimize promo total.
    const dp = Array<number>(months + 1).fill(Number.POSITIVE_INFINITY);
    const prev = Array<number>(months + 1).fill(0);
    dp[0] = 0;

    for (let m = 1; m <= months; m++) {
        for (const pack of [1, 2, 3]) {
            if (m - pack < 0) continue;
            const packPrice = CURE_TARGET_TOTALS[pack];
            const candidate = dp[m - pack] + packPrice;
            if (candidate < dp[m]) {
                dp[m] = candidate;
                prev[m] = pack;
            }
        }
    }

    if (!Number.isFinite(dp[months])) return null;

    const regularTotal = monthRegular * months;
    const promoTotal = dp[months];
    const discount = Math.max(0, Number((regularTotal - promoTotal).toFixed(2)));
    if (discount <= 0) return null;

    const packCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    let cur = months;
    while (cur > 0 && prev[cur] > 0) {
        const p = prev[cur];
        packCounts[p] += 1;
        cur -= p;
    }

    const comboParts = [3, 2, 1]
        .filter(p => packCounts[p] > 0)
        .map(p => `${packCounts[p]}x${p}m`);
    const combo = comboParts.join('+') || `${months}m`;

    const label = months === 1
        ? 'Zľava za kúru (1 mesiac)'
        : `Zľava za kúru (${months} mesiace)`;

    return {
        amount: discount,
        label,
        key: `cure_auto_${combo}`,
    };
}

export function CartProvider({children}: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponType, setCouponType] = useState<string | null>(null);
    const [couponAmountRaw, setCouponAmountRaw] = useState<number | null>(null);
    const [couponFreeShipping, setCouponFreeShipping] = useState(false);
    const [manualDiscountLabel, setManualDiscountLabel] = useState<string | null>(null);
    const [manualDiscountKey, setManualDiscountKey] = useState<string | null>(null);
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
        setCouponFreeShipping(false);
        setManualDiscountLabel(null);
        setManualDiscountKey(null);
        safeRemoveItem('appliedCoupon');
        safeRemoveItem('pendingCoupon');
        safeRemoveItem('manualDiscountLabel');
        safeRemoveItem('manualDiscountKey');
        toast.info('Kupón bol odstránený');
    }, []);

    const setManualDiscount = useCallback((amount: number, label?: string, key?: string) => {
        const safe = Math.max(0, Number(amount) || 0);
        const safeLabel = (label || '').trim() || 'Zľava za kúru';
        const safeKey = (key || '').trim() || null;

        // Clear coupon state (we treat this as its own discount mechanism)
        setAppliedCoupon(null);
        safeRemoveItem('appliedCoupon');
        safeRemoveItem('pendingCoupon');

        setCouponType('manual');
        setCouponAmountRaw(null);
        setCouponFreeShipping(false);

        setManualDiscountLabel(safeLabel);
        setManualDiscountKey(safeKey);
        safeSetItem('manualDiscountLabel', safeLabel);
        if (safeKey) safeSetItem('manualDiscountKey', safeKey);
        else safeRemoveItem('manualDiscountKey');

        setDiscountAmount(safe);
        if (safe > 0) {
            toast.success(`${safeLabel} (-${safe.toFixed(2)} €)`);
        }
    }, []);

    const clearManualDiscount = useCallback(() => {
        if (couponType === 'manual') {
            setDiscountAmount(0);
            setCouponType(null);
            setManualDiscountLabel(null);
            setManualDiscountKey(null);
            safeRemoveItem('manualDiscountLabel');
            safeRemoveItem('manualDiscountKey');
            toast.info('Zľava za kúru bola odstránená');
        }
    }, [couponType]);

    const applyCoupon = useCallback(async (code: string) => {
        if (!code) return false;
        if (items.length === 0) {
            toast.error("Pridajte produkty do košíka pre aplikáciu kupónu.");
            return false;
        }
        // Don’t stack coupons on top of manual bundle discounts (keeps pricing predictable).
        if (couponType === 'manual') {
            toast.error('Kupón nie je možné použiť spolu so zľavou na kúru.');
            return false;
        }
        const normalized = code.trim();
        if (!normalized) return false;
        try {
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: normalized, subtotal })
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                toast.error(err?.error || 'Kupón sa nepodarilo overiť.');
                return false;
            }
            const data = await response.json();
            const discount = Math.max(0, Number(data.discountAmount ?? data.discount_amount) || 0);
            setAppliedCoupon(data.code || normalized);
            setDiscountAmount(discount);
            setCouponType(data.type || null);
            setCouponAmountRaw(data.amount ?? null);
            setCouponFreeShipping(Boolean(data.freeShipping ?? data.free_shipping));
            safeSetItem('appliedCoupon', data.code || normalized);
            toast.success('Kupón bol aplikovaný.');
            return true;
        } catch (error) {
            console.error('[applyCoupon] failed', error);
            toast.error('Kupón sa nepodarilo overiť.');
            return false;
        }
    // couponType intentionally omitted to avoid re-creating handler on coupon change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const applyExitCoupon = useCallback(async (code: string) => {
        if (!code) return false;
        if (items.length === 0) {
            toast.error('Pridajte produkty do košíka pre aplikáciu kupónu.');
            return false;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            const success = await applyCoupon(code);
            if (success) {
                setExitCoupon(code);
            }
            return success;
        } catch (error) {
            console.error('[CartContext] Error during applyExitCoupon -> applyCoupon call:', error);
            return false;
        }
    }, [items, applyCoupon]);

    useEffect(() => {
        const savedCart = safeGetItem('cart');
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

        const savedCouponCode = safeGetItem('appliedCoupon');
        if (savedCouponCode) {
            setAppliedCoupon(savedCouponCode);
        }

        const savedManualLabel = safeGetItem('manualDiscountLabel');
        if (savedManualLabel) setManualDiscountLabel(savedManualLabel);
        const savedManualKey = safeGetItem('manualDiscountKey');
        if (savedManualKey) setManualDiscountKey(savedManualKey);
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

            const pendingCoupon = safeGetItem('pendingCoupon');
            if (pendingCoupon) {
                await new Promise(resolve => setTimeout(resolve, 300));
                await applyCoupon(pendingCoupon);
                safeRemoveItem('pendingCoupon');
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
        // Auto-apply cure discount dynamically by quantity (47 + 669 pairs), unless a non-manual coupon is active.
        if (appliedCoupon && couponType !== 'manual') return;

        const dynamicCure = computeDynamicCureDiscount(items);
        if (!dynamicCure) {
            if (couponType === 'manual' && manualDiscountKey?.startsWith('cure_')) {
                setDiscountAmount(0);
                setCouponType(null);
                setManualDiscountLabel(null);
                setManualDiscountKey(null);
                safeRemoveItem('manualDiscountLabel');
                safeRemoveItem('manualDiscountKey');
            }
            return;
        }

        const nextAmount = dynamicCure.amount;
        const changed =
            couponType !== 'manual' ||
            Math.abs((Number(discountAmount) || 0) - nextAmount) > 0.001 ||
            manualDiscountLabel !== dynamicCure.label ||
            manualDiscountKey !== dynamicCure.key;

        if (!changed) return;

        setAppliedCoupon(null);
        safeRemoveItem('appliedCoupon');
        safeRemoveItem('pendingCoupon');
        setCouponType('manual');
        setCouponAmountRaw(null);
        setCouponFreeShipping(false);
        setDiscountAmount(nextAmount);
        setManualDiscountLabel(dynamicCure.label);
        setManualDiscountKey(dynamicCure.key);
        safeSetItem('manualDiscountLabel', dynamicCure.label);
        safeSetItem('manualDiscountKey', dynamicCure.key);
    }, [items, appliedCoupon, couponType, discountAmount, manualDiscountLabel, manualDiscountKey]);

    useEffect(() => {
        if (items.length > 0) {
            safeSetItem('cart', JSON.stringify(items));
        } else {
            safeRemoveItem('cart');
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
                safeSetItem('abandonedCart', JSON.stringify(abandonedCart));
                setLastSavedCart(cartKey);

                if (items.length > 0) {
                    tracking.initiateCheckout(items, currentSubtotal);
                }
            }
        } else {
            safeRemoveItem('abandonedCart');
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
                safeSetItem('abandonedCart', JSON.stringify(abandonedCart));
            } catch (error) {
                console.error('Failed to save abandoned cart:', error);
            }
        }
    };

    const addToCart = useCallback((item: CartItem) => {
        // Check if sales are suspended
        if (isSalesSuspendedClient()) {
            const message = getSalesSuspensionMessageClient();
            toast.error(message);
            return;
        }

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
            reportAddToCartConversion({ value: trackValue });

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
        setCouponType(null);
        setCouponAmountRaw(null);
        setCouponFreeShipping(false);
        setManualDiscountLabel(null);
        setManualDiscountKey(null);
        safeRemoveItem('cart');
        safeRemoveItem('appliedCoupon');
        safeRemoveItem('manualDiscountLabel');
        safeRemoveItem('manualDiscountKey');
        toast.info("Košík bol vyprázdnený");
    }, []);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalPrice = Math.max(0, subtotal - discountAmount);

    const applyPendingCoupon = useCallback(() => {
        const pendingCoupon = safeGetItem('pendingCoupon');
        if (pendingCoupon) {
            applyCoupon(pendingCoupon);
            safeRemoveItem('pendingCoupon');
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
            couponFreeShipping,
            manualDiscountLabel,
            manualDiscountKey,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            saveCartWithEmail,
            applyPendingCoupon,
            applyCoupon,
            removeCoupon,
            setManualDiscount,
            clearManualDiscount,
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
