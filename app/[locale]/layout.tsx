import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
import { ClarityAnalytics } from "@/components/clarity-analytics";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://flagcdn.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className={`${almarai.variable} font-almarai antialiased`}>
        <ClarityAnalytics />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-FGGRX4K06C" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-FGGRX4K06C');
          `}
        </Script>
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
              <div className="overflow-x-hidden">
                {children}
              </div>
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
