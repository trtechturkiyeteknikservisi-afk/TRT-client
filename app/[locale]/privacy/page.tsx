import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ShieldCheck } from 'lucide-react';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

export default async function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations('Policies');
  
  let privacyContent = t('updated_soon');
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' });
    if (res.ok) {
        const settings = await res.json();
        privacyContent = settings[`privacy_${locale}`] || settings[`privacy_en`] || privacyContent;
    }
  } catch (error) {
    console.error("Failed to fetch privacy policy", error);
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <header className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 text-primary mb-4">
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                    {t('privacy')}
                </h1>
                <div className="w-24 h-2 bg-primary mx-auto rounded-full" />
            </header>

            <div className="bg-card p-8 md:p-16 rounded-[3rem] border shadow-2xl shadow-primary/5 prose prose-stone dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-bold leading-relaxed text-lg">
                    {privacyContent}
                </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
