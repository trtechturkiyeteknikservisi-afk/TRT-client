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
import { CurrencyProvider } from "@/components/currency-context";
import { StoreProvider } from "@/components/store-context";
import { CartDrawer } from "@/components/cart-drawer";
import { DeferredAnalytics } from "@/components/deferred-analytics";

const SITE_URL = "https://www.trtservis.com";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
  preload: false,
});

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const isAr = locale === 'ar';
  const isTr = locale === 'tr';

  const defaultTitle = isAr
    ? 'TR TECH | خدمة الصيانة الفنية الاحترافية في تركيا'
    : isTr
    ? 'TR TECH | Türkiye Profesyonel Teknik Servis'
    : 'TR TECH | Professional Repair Service in Turkey';

  const defaultDesc = isAr
    ? 'مركز صيانة متخصص للهواتف الذكية، الحواسيب المحمولة، المكانس الروبوتية، والساعات الذكية بضمان حقيقي وخبرة أكثر من 20 عاماً في تركيا.'
    : isTr
    ? 'Akıllı telefonlar, dizüstü bilgisayarlar, robot süpürgeler ve akıllı saatler için profesyonel teknik servis ve orijinal yedek parçalar.'
    : 'Specialized repair for smartphones, laptops, robot vacuums, and smart watches. 20+ years of experience in technical service.';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: "%s"
    },
    description: defaultDesc,
    keywords: [
      "telefon tamiri", "laptop tamiri", "robot süpürge tamiri", "akıllı saat tamiri", 
      "tablet tamiri", "phone repair", "laptop repair", "teknik servis", "Turkey", "Bursa", 
      "iPhone tamiri", "Android tamiri", "TR TECH", "ürünler ve fiyatlar"
    ],
    authors: [{ name: "TR TECH Team" }],
    creator: "TR TECH",
  };
}

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
    "image": `${SITE_URL}/day-logo.png`,
    "@id": SITE_URL,
    "url": SITE_URL,
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
            <CurrencyProvider>
              <StoreProvider>
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
                    <CartDrawer />
                  </HideOnAdmin>
                </ThemeProvider>
              </StoreProvider>
            </CurrencyProvider>
          </SettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
