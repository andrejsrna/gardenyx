'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import ExitIntentModal from './ExitIntentModal';
import { tracking } from '../lib/tracking';

export default function ExitIntentPopup() {
  const [showModal, setShowModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isCreatingCoupon = useRef(false);
  const exitIntentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const COOLDOWN_HOURS = 72;

  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    if ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) return true;
    return window.innerWidth < 1024;
  };

  const isSuppressedPath = (path: string | null) => {
    if (!path) return false;
    return (
      path.startsWith('/pokladna') ||
      path.startsWith('/objednavka') ||
      path.startsWith('/moj-ucet') ||
      path.startsWith('/registracia')
    );
  };

  const isWithinCooldown = () => {
    try {
      const ts = localStorage.getItem('exitIntentLastShownAt');
      if (!ts) return false;
      const last = parseInt(ts, 10);
      if (Number.isNaN(last)) return false;
      const diffHours = (Date.now() - last) / (1000 * 60 * 60);
      return diffHours < COOLDOWN_HOURS;
    } catch {
      return false;
    }
  };

  const triggerExitIntent = useCallback(async () => {
    if (isCreatingCoupon.current || isWithinCooldown()) {
      return;
    }
    isCreatingCoupon.current = true;
    setShowModal(true);
    setIsLoading(true);

    // Track exit intent detection
    tracking.custom('exit_intent_detected');

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
        localStorage.setItem('exitIntentLastShownAt', String(Date.now()));

        // Track exit intent offer shown
        tracking.custom('exit_intent_offer_shown', {
          coupon_code: code
        });
      } else {
        console.error('Failed to create exit coupon:', response.status, await response.text());
        setShowModal(false);
        localStorage.setItem('exitIntentLastShownAt', String(Date.now()));
      }
    } catch (error) {
      console.error('Failed to show exit intent:', error);
      setShowModal(false);
      localStorage.setItem('exitIntentLastShownAt', String(Date.now()));
    } finally {
      setIsLoading(false);
      isCreatingCoupon.current = false;
    }
  }, []);

  useEffect(() => {
    if (isMobileDevice() || isSuppressedPath(pathname) || isWithinCooldown()) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (showModal || isCreatingCoupon.current || isWithinCooldown()) {
        return;
      }
      if (e.clientY < 10) {
        if (!exitIntentTimerRef.current) {
          exitIntentTimerRef.current = setTimeout(triggerExitIntent, 200);
        }
      } else if (exitIntentTimerRef.current) {
        clearTimeout(exitIntentTimerRef.current);
        exitIntentTimerRef.current = null;
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (showModal || isCreatingCoupon.current || isWithinCooldown()) {
        return;
      }
      const to = e.relatedTarget as Node | null;
      if (!to && e.clientY <= 0) {
        triggerExitIntent();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseout', handleMouseOut);
      if (exitIntentTimerRef.current) {
        clearTimeout(exitIntentTimerRef.current);
        exitIntentTimerRef.current = null;
      }
    };
  }, [showModal, pathname, triggerExitIntent]);

  return (
    <>
      {showModal && (
        <ExitIntentModal
          code={couponCode}
          onCloseAction={() => {
            localStorage.setItem('exitIntentLastShownAt', String(Date.now()));
            tracking.custom('exit_intent_dismissed');
            setShowModal(false);
          }}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
