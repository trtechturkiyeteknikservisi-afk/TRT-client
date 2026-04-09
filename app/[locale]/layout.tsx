import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { StickyContact } from "@/components/sticky-contact";
import { NewsBar } from "@/components/news-bar";
import { TopTrustBar } from "@/components/top-trust-bar";
import { HideOnAdmin } from "@/components/hide-on-admin";

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

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const { children } = props;
  const messages = await getMessages();

  // Fetch WhatsApp number from settings
  let whatsappNumber = "905302094094";
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/settings`, { 
        cache: 'no-store',
        next: { revalidate: 0 } 
    });
    if (res.ok) {
      const settings = (await res.json()) as any;
      whatsappNumber = settings.whatsapp || whatsappNumber;
    }
  } catch (error) {
    console.error("Failed to fetch settings for layout", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "TRT Technical Service",
    "image": "https://trt-service.com/logo.png",
    "@id": "https://trt-service.com",
    "url": "https://trt-service.com",
    "telephone": "+905302094094",
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HideOnAdmin>
              <TopTrustBar />
              <NewsBar />
            </HideOnAdmin>
            {children}
            <HideOnAdmin>
              <StickyContact />
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-2xl bg-green-500 text-white shadow-2xl shadow-green-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <MessageCircle size={26} />
              </a>
            </HideOnAdmin>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
