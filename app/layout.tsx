import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import CookieConsent from './components/CookieConsent';
import ExitIntentPopupLoader from './components/ExitIntentPopupLoader';
import FacebookPixel from './components/FacebookPixel';
import Footer from './components/Footer';
import GoogleAds from './components/GoogleAds';
import GoogleAnalytics from './components/GoogleAnalytics';
import GoogleMaps from './components/GoogleMaps';
import Header from './components/Header';
import OrganizationSchema from './components/seo/OrganizationSchema';
import WebSiteSchema from './components/seo/WebSiteSchema';
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get('cookieConsent');
  let showConsentBanner = true;

  if (consentCookie) {
    showConsentBanner = false;
  }

  return (
    <html lang="sk" className={`${inter.variable} antialiased`}>
      <head>
        <OrganizationSchema />
        <WebSiteSchema />
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
              <ExitIntentPopupLoader />
              <Toaster/>
              <FacebookPixel />
              <GoogleAnalytics />
              <GoogleAds />
              <GoogleMaps />
              {showConsentBanner && <CookieConsent />}
            </CartProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
