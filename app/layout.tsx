import type { Metadata, Viewport } from "next";
import './polyfills';
import { Fraunces, Nunito_Sans } from "next/font/google";
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import CookieConsentBanner from './components/CookieConsentBanner';
import GoogleAds from './components/GoogleAds';
import GoogleAnalytics from './components/GoogleAnalytics';
import Posthog from './components/Posthog';
import FacebookPixel from './components/FacebookPixel';
import OrganizationSchema from './components/seo/OrganizationSchema';
import WebSiteSchema from './components/seo/WebSiteSchema';
import { isSalesSuspended, getSalesSuspensionMessage } from './lib/utils/sales-suspension';
import { GoogleTagManagerHead, GoogleTagManagerBody } from "./components/GoogleTagManager";
import Loading from './loading';
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gardenyx.com";

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff'
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gardenyx",
  description: "Gardenyx",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning className={`${nunitoSans.variable} ${fraunces.variable} antialiased`}>
      <head>
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
        <GoogleTagManagerHead />
      </head>
      <body className={`${nunitoSans.variable} ${fraunces.variable} antialiased`}>
        <GoogleTagManagerBody />
        <Suspense fallback={<Loading />}>
          {children}
          <Toaster />
          <GoogleAnalytics />
          <Posthog />
          <FacebookPixel />
          <GoogleAds />
          <CookieConsentBanner />
        </Suspense>
      </body>
    </html>
  );
}
