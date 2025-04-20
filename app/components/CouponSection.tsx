'use client';

import { useCart } from '../context/CartContext';

export default function CouponSection() {
  const { appliedCoupon, applyCoupon, removeCoupon, discountAmount } = useCart();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const code = formData.get('coupon') as string;
    if (code) {
      await applyCoupon(code);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div>
      {/* <h2 className="text-lg font-semibold mb-4">Zľavový kupón</h2> */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg text-sm">
          <div>
            <p className="font-medium text-green-700">
              Kupón: <span className="font-bold">{appliedCoupon}</span>
              {discountAmount > 0 && (
                <span className="block text-xs">
                  (Zľava: -{discountAmount.toFixed(2)} €)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={removeCoupon}
            className="text-red-500 hover:text-red-700 text-xs font-medium ml-2 flex-shrink-0"
          >
            Odstrániť
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="coupon"
            placeholder="Zadajte kód kupónu"
            className="flex-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500 w-full text-sm px-3 py-2"
            aria-label="Zľavový kód"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto text-sm"
          >
            Použiť
          </button>
        </form>
      )}
    </div>
  );
}
