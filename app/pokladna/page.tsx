import CheckoutClient from './CheckoutClient';

// Force dynamic rendering - this page needs cookies/localStorage/cart
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return (
    <main>
      <CheckoutClient />
    </main>
  );
}
