'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import ExitIntentModal from './ExitIntentModal';
import { tracking } from '../lib/tracking';
import { safeSetItem, safeGetItem } from '../lib/utils/safe-local-storage';

export default function ExitIntentPopup() {
  const [showModal, setShowModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasTriggeredThisSession, setHasTriggeredThisSession] = useState(false);
  const [hasMetTimeRequirement, setHasMetTimeRequirement] = useState(false);
  const [hasMetScrollRequirement, setHasMetScrollRequirement] = useState(false);
  const isCreatingCoupon = useRef(false);
  const exitIntentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTriggeredRef = useRef(false);
  const pathname = usePathname();

  const COOLDOWN_HOURS = 72;
  const MIN_TIME_ON_PAGE_MS = 15000;
  const MIN_SCROLL_DISTANCE = 200;

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
      const ts = safeGetItem('exitIntentLastShownAt');
      if (!ts) return false;
      const last = parseInt(ts, 10);
      if (Number.isNaN(last)) return false;
      const diffHours = (Date.now() - last) / (1000 * 60 * 60);
      return diffHours < COOLDOWN_HOURS;
    } catch {
      return false;
    }
  };

  const triggerExitIntent = useCallback(async (options?: { force?: boolean }) => {
    if (isCreatingCoupon.current) {
      return;
    }

    if (!options?.force) {
      if (sessionTriggeredRef.current || hasTriggeredThisSession) {
        return;
      }

      if (isWithinCooldown() || !hasMetTimeRequirement || !hasMetScrollRequirement) {
        return;
      }
    }

    sessionTriggeredRef.current = true;
    setHasTriggeredThisSession(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('exitIntentTriggered', 'true');
    }

    if (isWithinCooldown() && !options?.force) {
      return;
    }
    isCreatingCoupon.current = true;
    setShowModal(true);
    setIsLoading(true);
    setErrorMessage(null);
    setCouponCode('');

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
        safeSetItem('exitIntentLastShownAt', String(Date.now()));

        // Track exit intent offer shown
        tracking.custom('exit_intent_offer_shown', {
          coupon_code: code
        });
      } else {
        console.error('Failed to create exit coupon:', response.status, await response.text());
        setErrorMessage('Nepodarilo sa vytvoriť kupón. Skúste to prosím znova.');
      }
    } catch (error) {
      console.error('Failed to show exit intent:', error);
      setErrorMessage('Ups, niečo sa pokazilo. Skúste to prosím znova.');
    } finally {
      setIsLoading(false);
      isCreatingCoupon.current = false;
    }
  }, [hasMetScrollRequirement, hasMetTimeRequirement, hasTriggeredThisSession]);

  useEffect(() => {
    if (isMobileDevice() || isSuppressedPath(pathname)) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (showModal || isCreatingCoupon.current) {
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const triggered = sessionStorage.getItem('exitIntentTriggered') === 'true';
    sessionTriggeredRef.current = triggered;
    setHasTriggeredThisSession(triggered);

    const timer = window.setTimeout(() => {
      setHasMetTimeRequirement(true);
    }, MIN_TIME_ON_PAGE_MS);

    const handleScroll = () => {
      if (window.scrollY >= MIN_SCROLL_DISTANCE) {
        setHasMetScrollRequirement(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {showModal && (
        <ExitIntentModal
          code={couponCode}
          onCloseAction={() => {
            safeSetItem('exitIntentLastShownAt', String(Date.now()));
            tracking.custom('exit_intent_dismissed');
            setShowModal(false);
            setErrorMessage(null);
            setCouponCode('');
          }}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={() => {
            if (!isCreatingCoupon.current) {
              triggerExitIntent({ force: true });
            }
          }}
        />
      )}
    </>
  );
}
