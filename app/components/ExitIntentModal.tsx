'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function ExitIntentModal({ 
  code, 
  onClose,
  isLoading = false 
}: { 
  code: string; 
  onClose: () => void;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { applyExitCoupon } = useCart();
  
  useEffect(() => {
    applyExitCoupon(code);
  }, [code, applyExitCoupon]);

  useEffect(() => {
    const timer = setTimeout(onClose, 10000); // Auto-close after 10s
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleApplyCoupon = () => {
    // Store coupon in localStorage to apply it later
    localStorage.setItem('pendingCoupon', code);
    // Close modal
    onClose();
    // Redirect to shop
    router.push('/kupit');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl animate-in fade-in-zoom-in">
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Zastavte sa! 🎁</h3>
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
                <p className="text-gray-600">
                  Máme pre vás výnimočnú ponuku - <strong>10% zľavu</strong> na vašu objednávku!
                </p>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Použite kód:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-2xl font-bold text-green-700 bg-green-100 px-4 py-2 rounded">
                      {code}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(code)}
                      className="text-green-600 hover:text-green-700"
                      aria-label="Kopírovať kód"
                    >
                      ⎘
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleApplyCoupon}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Automaticky aplikovať kupón
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Zavrieť
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}