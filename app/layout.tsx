import type { Metadata, Viewport } from "next";
import './polyfills';
import { Inter } from "next/font/google";
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import CookieConsentBanner from './components/CookieConsentBanner';
import ExitIntentPopupLoader from './components/ExitIntentPopupLoader';

import Footer from './components/Footer';
import GoogleAds from './components/GoogleAds';
import GoogleAnalytics from './components/GoogleAnalytics';
import Posthog from './components/Posthog';
import FacebookPixel from './components/FacebookPixel';
import Header from './components/Header';
import SalesSuspensionBanner from './components/SalesSuspensionBanner';
import Loading from './loading';

import OrganizationSchema from './components/seo/OrganizationSchema';
import WebSiteSchema from './components/seo/WebSiteSchema';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import { isSalesSuspended, getSalesSuspensionMessage } from './lib/utils/sales-suspension';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff'
};

export const metadata: Metadata = {
  title: "Najsilnejšia kĺbová výživa | Prírodné riešenie pre zdravé kĺby",
  description: "Objavte našu prírodnú kĺbovú výživu s kurkumínom, boswelliou a ďalšími účinnými látkami. Pomáha pri bolestiach kĺbov a podporuje ich zdravie.",
  keywords: "kĺbová výživa, kurkumín, boswellia, zdravé kĺby, prírodný doplnok",
  openGraph: {
    title: "Najsilnejšia kĺbová výživa | Prírodné riešenie pre zdravé kĺby",
    description: "Objavte našu prírodnú kĺbovú výživu s kurkumínom, boswelliou a ďalšími účinnými látkami.",
    type: "website",
    locale: "sk_SK",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://najsilnejsiaklbovavyziva.sk"
  },
  icons: {
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-precomposed.png' }
    ],
    icon: [
      { url: '/favicon.ico' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk'} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://admin.najsilnejsiaklbovavyziva.sk'} />
        <link rel="preconnect" href="https://cdn.najsilnejsiaklbovavyziva.sk" />
        <link rel="dns-prefetch" href="https://cdn.najsilnejsiaklbovavyziva.sk" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SALES_SUSPENDED__ = ${isSalesSuspended()};
              window.__SALES_SUSPENSION_MESSAGE__ = ${JSON.stringify(getSalesSuspensionMessage())};
            `,
          }}
        />
        <OrganizationSchema />
        <WebSiteSchema />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Suspense fallback={<Loading />}>
          <AuthProvider>
            <CartProvider>
              <CookieConsentProvider>
                {process.env.NEXT_PUBLIC_FB_PIXEL_ID ? (
                  <noscript
                    dangerouslySetInnerHTML={{
                      __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`,
                    }}
                  />
                ) : null}
                <SalesSuspensionBanner />
                <Header />
                <main>
                  {children}
                </main>
                <Footer />
                <ExitIntentPopupLoader />
                <Toaster/>

                <GoogleAnalytics />
                <Posthog />
                <FacebookPixel />
                <GoogleAds />
                <CookieConsentBanner />
              </CookieConsentProvider>
            </CartProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
