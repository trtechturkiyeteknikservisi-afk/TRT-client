import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { StickyContact } from "@/components/sticky-contact";

import { TopTrustBar } from "@/components/top-trust-bar";
import { HideOnAdmin } from "@/components/hide-on-admin";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SettingsProvider } from "@/components/settings-provider";
import { DeferredAnalytics } from "@/components/deferred-analytics";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://trtservis.com'),
  title: {
    default: "TRT | Professional Repair Service in Turkey",
    template: "%s"
  },
  description: "Specialized repair for smartphones, laptops, robot vacuums, and smart watches. 20+ years of experience in technical service.",
  keywords: ["telefon tamiri", "laptop tamiri", "robot süpürge tamiri", "akıllı saat tamiri", "tablet tamiri", "phone repair", "laptop repair", "teknik servis", "Turkey", "Bursa", "iPhone tamiri", "Android tamiri"],
  authors: [{ name: "TRT Team" }],
  creator: "TRT",
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const { children } = props;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "TRT Technical Service",
    "image": "https://trtservis.com/day-logo.png",
    "@id": "https://trtservis.com",
    "url": "https://trtservis.com",
    "telephone": "+908508401505",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ulu, Kıbrıs Şehitleri Cd. DANACIOGLU APT NO: 73A",
      "addressLocality": "Osmangazi/Bursa",
      "postalCode": "16220",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 40.1885,
      "longitude": 29.0610
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.instagram.com/trtservis",
      "https://www.tiktok.com/@trtservis",
      "https://www.youtube.com/@TRTech"
    ]
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={`${almarai.variable} font-almarai antialiased`}>
        <DeferredAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <SettingsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="sticky top-0 z-[100] w-full bg-background">
                <HideOnAdmin>
                  <TopTrustBar />
                  <Header />
                </HideOnAdmin>
              </div>
              <main className="w-full">
                {children}
              </main>
              <HideOnAdmin>
                <Footer />
                <ScrollToTop />
                <StickyContact />
              </HideOnAdmin>
            </ThemeProvider>
          </SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
