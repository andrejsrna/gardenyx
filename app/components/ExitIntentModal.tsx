'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { tracking } from '../lib/tracking';

// Simple Countdown Timer Logic (embedded for simplicity)
function CountdownDisplay({ initialSeconds, onComplete }: { initialSeconds: number; onComplete: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, onComplete]);

  return <span className="font-semibold">{secondsLeft}s</span>;
}

export default function ExitIntentModal({
  code,
  onCloseAction,
  isLoading = false
}: {
  code: string;
  onCloseAction: () => void;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { applyExitCoupon } = useCart();

  const handleApplyCoupon = () => {
    applyExitCoupon(code);
    
    // Track exit intent coupon applied
    tracking.custom('exit_intent_coupon_applied', {
      coupon_code: code
    });
    
    toast.success('Zľavový kód bol úspešne aplikovaný!');
    onCloseAction();
    router.push('/kupit');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl animate-in fade-in-zoom-in">
        <div className="p-6 relative">
          <button
            onClick={onCloseAction}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Zatvoriť"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900"><span role="img" aria-label="gift">🎁</span> Zastavte sa!</h3>
            {isLoading ? (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Vytváram pre vás špeciálny kupón...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-lg font-semibold text-green-600">
                  Máme pre vás výnimočnú ponuku - 10% zľavu na vašu objednávku!
                </p>

                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Použite kód:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-bold text-green-700 bg-green-100 px-4 py-2 rounded">
                      {code}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="text-green-600 hover:text-green-700 p-1 rounded-full hover:bg-green-100 transition-colors duration-150"
                      aria-label="Kopírovať kód"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 16.5v-13Z" />
                        <path d="M4.5 6.5A1.5 1.5 0 0 0 3 8v8.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5v-1.628a1.5 1.5 0 0 1-.44-1.06L13 13.179V8a1.5 1.5 0 0 0-1.5-1.5h-7Z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleApplyCoupon}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Použiť zľavu a pokračovať v nákupe
                  </button>

                  <button
                    onClick={onCloseAction}
                    className="w-full text-gray-500 py-2 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    Nie, ďakujem
                  </button>
                </div>

                <div className="text-xs text-gray-500 pt-1">
                  Táto ponuka platí ešte: <CountdownDisplay initialSeconds={10} onComplete={onCloseAction} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
