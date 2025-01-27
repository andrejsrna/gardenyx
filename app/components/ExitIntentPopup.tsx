'use client';

import { useState, useEffect, useRef } from 'react';
import ExitIntentModal from './ExitIntentModal';

export default function ExitIntentPopup() {
  const [showModal, setShowModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isCreatingCoupon = useRef(false);

  useEffect(() => {
    const handleMouseMove = async (e: MouseEvent) => {
      if (e.clientY < 10 && !localStorage.getItem('exitIntentShown') && !isCreatingCoupon.current) {
        isCreatingCoupon.current = true;
        setShowModal(true);
        setIsLoading(true);

        try {
          const response = await fetch('/api/create-exit-coupon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const { code } = await response.json();
            setCouponCode(code);
            localStorage.setItem('exitIntentShown', 'true');
            
            window.gtag?.('event', 'exit_intent_offer_shown', {
              coupon_code: code
            });
          }
        } catch (error) {
          console.error('Failed to show exit intent:', error);
          setShowModal(false);
        } finally {
          setIsLoading(false);
          isCreatingCoupon.current = false;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      console.log('ExitIntent: Component cleanup');
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {showModal && (
        <ExitIntentModal
          code={couponCode}
          onClose={() => setShowModal(false)}
          isLoading={isLoading}
        />
      )}
    </>
  );
}