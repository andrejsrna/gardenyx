import CheckoutClient from './CheckoutClient';

// This is now a Server Component by default (no 'use client')

export default function CheckoutPage() {
  return (
    <main>
      <CheckoutClient />
    </main>
  );
}
