'use client';

import { useEffect, useRef, useState } from 'react';
import ExitIntentModal from './ExitIntentModal';

export default function ExitIntentPopup() {
  const [showModal, setShowModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isCreatingCoupon = useRef(false);
  const exitIntentTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerExitIntent = async () => {
    if (localStorage.getItem('exitIntentShown') || isCreatingCoupon.current) {
        return;
    }
    console.log('ExitIntent: Triggered after delay');
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
      } else {
          console.error('Failed to create exit coupon:', response.status, await response.text());
          setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to show exit intent:', error);
      setShowModal(false);
    } finally {
      setIsLoading(false);
      isCreatingCoupon.current = false;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (showModal || isCreatingCoupon.current || localStorage.getItem('exitIntentShown')) {
          return;
      }

      if (e.clientY < 10) {
        if (!exitIntentTimerRef.current) {
            console.log('ExitIntent: Mouse near top, starting timer...');
            exitIntentTimerRef.current = setTimeout(triggerExitIntent, 200);
        }
      } else {
        if (exitIntentTimerRef.current) {
            console.log('ExitIntent: Mouse moved away, clearing timer.');
            clearTimeout(exitIntentTimerRef.current);
            exitIntentTimerRef.current = null;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      console.log('ExitIntent: Component cleanup');
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [showModal]);

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
