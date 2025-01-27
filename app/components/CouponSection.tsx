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
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 className="text-lg font-semibold mb-4">Zľavový kupón</h2>
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
          <div>
            <p className="font-medium text-green-700">
              Aplikovaný kupón: {appliedCoupon}
              {discountAmount > 0 && (
                <span className="block text-sm">
                  Zľava: -{discountAmount.toFixed(2)} €
                </span>
              )}
            </p>
          </div>
          <button
            onClick={removeCoupon}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Odstrániť
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            name="coupon"
            placeholder="Zadajte kód kupónu"
            className="flex-1 rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Použiť
          </button>
        </form>
      )}
    </div>
  );
} 