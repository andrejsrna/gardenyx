import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '../../i18n/routing';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SalesSuspensionBanner from '../components/SalesSuspensionBanner';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CookieConsentProvider } from '../context/CookieConsentContext';
import { headers } from 'next/headers';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const headerList = await headers();
  const isAdminRoute = headerList.get('x-admin-route') === '1';

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <CartProvider>
          <CookieConsentProvider>
            {!isAdminRoute && <SalesSuspensionBanner />}
            {!isAdminRoute && <Header locale={locale} />}
            {children}
            {!isAdminRoute && <Footer />}
          </CookieConsentProvider>
        </CartProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
