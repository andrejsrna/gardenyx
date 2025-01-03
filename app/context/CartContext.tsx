'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { fbq } from '../components/FacebookPixel';
import { gtag } from '../components/GoogleAnalytics';
import { trackConversion } from '../components/GoogleAds';

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

  const addToCart = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Track AddToCart event in GA4
        gtag('event', 'add_to_cart', {
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

        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      // Track AddToCart event for new item in GA4
      gtag('event', 'add_to_cart', {
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

      return [...prevItems, item];
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