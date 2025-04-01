import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import CookieConsent from './components/CookieConsent';
import ExitIntentPopup from './components/ExitIntentPopup';
import FacebookPixel from './components/FacebookPixel';
import Footer from './components/Footer';
import GoogleAds from './components/GoogleAds';
import GoogleAnalytics from './components/GoogleAnalytics';
import Header from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
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
    canonical: "https://najsilnejsiakl.sk"
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
        <link
          rel="preload"
          href="/logo.png"
          as="image"
          type="image/png"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <CookieConsentProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main>
                {children}
              </main>
              <Footer />
              <ExitIntentPopup />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#fff',
                    color: '#1f2937',
                    zIndex: 40,
                  },
                  className: 'text-sm font-medium',
                }}
              />
              <FacebookPixel />
              <GoogleAnalytics />
              <GoogleAds />
              <CookieConsent />
            </CartProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
