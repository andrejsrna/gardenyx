import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import FacebookPixel from './components/FacebookPixel';
import GoogleAnalytics from './components/GoogleAnalytics';
import GoogleAds from './components/GoogleAds';
import { CookieConsentProvider } from './context/CookieConsentContext';
import CookieConsent from './components/CookieConsent';

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
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#fff',
                    color: '#1f2937',
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
