'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
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

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const lastActionRef = useRef<{ type: 'add' | 'update', itemId: number } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

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

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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