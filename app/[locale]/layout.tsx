import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { StickyContact } from "@/components/sticky-contact";

import { TopTrustBar } from "@/components/top-trust-bar";
import { HideOnAdmin } from "@/components/hide-on-admin";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SettingsProvider } from "@/components/settings-provider";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
});

export const metadata: Metadata = {
  title: {
    default: "TRT | Professional Repair Service in Turkey",
    template: "%s | TRT"
  },
  description: "Specialized repair for smartphones, laptops, robot vacuums, and luxury watches. 20+ years of experience in technical service.",
  keywords: ["phone repair", "laptop repair", "robot vacuum repair", "watch repair", "technical service", "Turkey", "Bursa"],
  authors: [{ name: "TRT Team" }],
  creator: "TRT",
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
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
    "image": "https://trt-service.com/logo.png",
    "@id": "https://trt-service.com",
    "url": "https://trt-service.com",
    "telephone": "+908508401505",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bursa, Turkey",
      "addressLocality": "Bursa",
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
    }
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body className={`${almarai.variable} font-almarai antialiased`}>
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
              <HideOnAdmin>
                <div className="fixed top-0 left-0 right-0 z-50">
                  <TopTrustBar />
                  <Header />
                </div>
                {/* Spacer to prevent content from going under the fixed header */}
                <div className="h-[120px] lg:h-[130px]" />
              </HideOnAdmin>
              {children}
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
