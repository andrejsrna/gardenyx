"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface CartProps {
    onCloseAction: () => void;
}

export default function Cart({onCloseAction}: CartProps) {
    const {
        items,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        subtotal,
        discountAmount,
        appliedCoupon,
        couponType,
        couponAmountRaw,
    } = useCart();
    const {customerData, isAuthenticated, isLoading} = useAuth();
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && customerData?.billing?.first_name) {
            setUserName(customerData.billing.first_name);
        } else {
            setUserName(null);
        }
    }, [isAuthenticated, customerData]);

    const handleRemove = (itemId: number) => {
        removeFromCart(itemId);
        if (items.length === 1 && items.find(item => item.id === itemId)) {
            onCloseAction();
        }
    };

    if (totalItems === 0 && !isLoading) {
        return (
            <div className="p-4 text-center">
                {!isLoading && userName && (
                    <div className="mb-4">
            <span
                className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Ahoj, {userName}!
            </span>
                    </div>
                )}
                <p className="text-gray-500">Váš košík je prázdny</p>
                <Link
                    href="/kupit"
                    onClick={onCloseAction}
                    className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
                >
                    Prejsť do obchodu
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-[80vh] bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                {!isLoading && userName && (
                    <div className="mb-2">
          <span
              className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Ahoj, {userName}!
          </span>
                    </div>
                )}
                <h2 className="text-lg font-semibold text-gray-900">Košík ({totalItems})</h2>
            </div>

            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                <div className="space-y-3">
                    {items.map((item) => {
                        const originalPrice = item.price;
                        let displayPrice = originalPrice;
                        let showOriginalStrikethrough = false;

                        if (appliedCoupon && couponType === 'percent' && couponAmountRaw && discountAmount > 0) {
                            const discountMultiplier = 1 - (couponAmountRaw / 100);
                            displayPrice = originalPrice * discountMultiplier;
                            if (Math.abs(displayPrice - originalPrice) > 0.001) {
                                showOriginalStrikethrough = true;
                            }
                        }

                        const lineTotalOriginal = originalPrice * item.quantity;
                        const lineTotalDisplay = displayPrice * item.quantity;

                        return (
                            <div
                                key={item.id}
                                className="flex gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100"
                            >
                                {item.image && (
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            sizes="64px"
                                            className="object-contain rounded"
                                        />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0 flex flex-col justify-between">
                                    <h3 className="font-medium text-sm line-clamp-2 mb-1.5">{item.name}</h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-auto gap-2">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-gray-100 transition-colors text-gray-600 shadow-sm"
                                                aria-label={`Znížiť množstvo ${item.name}`}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium" aria-label={`Množstvo ${item.name}`}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-gray-100 transition-colors text-gray-600 shadow-sm"
                                                aria-label={`Zvýšiť množstvo ${item.name}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 flex-shrink-0 ml-auto sm:ml-0">
                                            <div className="flex flex-col items-end">
                                                <span className="font-medium text-sm">{lineTotalDisplay.toFixed(2)} €</span>
                                                {showOriginalStrikethrough && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                      {lineTotalOriginal.toFixed(2)} €
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                                                 aria-label={`Odstrániť ${item.name} z košíka`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                     strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer with summary and checkout button - always visible */}
            <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg flex-shrink-0">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Medzisúčet:</span>
                        <span className="font-medium">{subtotal.toFixed(2)} €</span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-green-600">Kupón ({appliedCoupon}):</span>
                            {discountAmount > 0 ? (
                                <span className="text-green-600 font-medium">-{discountAmount.toFixed(2)} €</span>
                            ) : (
                                <span className="text-gray-500 italic text-xs">Podmienky nesplnené</span>
                            )}
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-gray-900 font-semibold">Spolu:</span>
                        <span className="text-lg font-bold text-green-600">{totalPrice.toFixed(2)} €</span>
                    </div>
                </div>

                <Link
                    href="/pokladna"
                    onClick={onCloseAction}
                    className="block w-full text-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-base shadow-sm"
                >
                    Pokračovať do pokladne
                </Link>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                    💰 Zľavové kupóny môžete použiť v pokladni
                </p>
            </div>
        </div>
    );
}
