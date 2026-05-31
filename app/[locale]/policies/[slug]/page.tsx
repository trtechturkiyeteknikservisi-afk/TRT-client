import React from 'react';
import { FileText, ShieldCheck, Scale, Gavel, Truck, ChevronLeft, Download } from 'lucide-react';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const validSlugs = ['privacy', 'terms', 'kvkk', 'warranty', 'shipping', 'custom'];
  if (!validSlugs.includes(slug)) return { title: 'Policy | TRT' };
  
  const t = await getTranslations({ locale, namespace: 'Policies' });
  const title = t(slug as any) || t('title');
  
  return {
    title: `${title} | TRT`,
    description: `Read TRT's ${title} document for important information regarding your rights and our services.`,
    keywords: `${slug} policy, TRT policy, legal, terms`,
  };
}


const iconMap: Record<string, any> = {
  privacy: ShieldCheck,
  terms: Scale,
  kvkk: Gavel,
  warranty: FileText,
  shipping: Truck,
  custom: Gavel,
};

export default async function PolicyDetailPage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await props.params;
  setRequestLocale(locale);

  const validSlugs = ['privacy', 'terms', 'kvkk', 'warranty', 'shipping', 'custom'];
  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations('Policies');
  
  let content = t('updated_soon');
  let pdfUrl = '';
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' });
    if (res.ok) {
        const settings = await res.json();
        const settingKey = slug === 'terms' ? 'policy' : slug;
        content = settings[`${settingKey}_${locale}`] || settings[`${settingKey}_tr`] || settings[`${settingKey}_en`] || content;
        
        let path = settings[`${slug}_pdf_${locale}`] || settings[`${slug}_pdf_tr`] || settings[`${slug}_pdf_en`];
        if (path) {
            if (path.startsWith('http')) {
                pdfUrl = path;
            } else if (path.startsWith('.')) {
                pdfUrl = `https://${path.substring(1)}`;
            } else {
                let normalizedApiUrl = API_URL;
                if (!API_URL.startsWith('http') && !API_URL.startsWith('/')) {
                    const cleanUrl = API_URL.startsWith('.') ? API_URL.substring(1) : API_URL;
                    normalizedApiUrl = `https://${cleanUrl}`;
                }
                const SERVER_URL = normalizedApiUrl.replace(/\/api\/?$/, '');
                const fullPath = path.startsWith('/') ? path : `/${path}`;
                pdfUrl = `${SERVER_URL}${fullPath}`;
            }
        }
    }
  } catch (error) {
    console.error(`Failed to fetch policy: ${slug}`, error);
  }

  const Icon = iconMap[slug] || FileText;
  const isRTL = locale === 'ar';

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="min-h-screen bg-background">
        <main className="pt-8 md:pt-12 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-10">
            {/* Breadcrumb / Back Link */}
            <nav className="flex items-center gap-2">
                <Link 
                    href="/policies" 
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
                >
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ChevronLeft size={16} className={isRTL ? 'rotate-180' : ''} />
                    </div>
                    {t('title')}
                </Link>
            </nav>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-card border border-border/50 p-8 rounded-xl relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                    <Icon size={120} />
                </div>
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                        <Icon size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase leading-none text-foreground italic">
                            {t(slug)}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-2 flex items-center gap-2">
                            <span className="w-8 h-0.5 bg-primary rounded-full" />
                            {t('official_doc')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('footer_note')}</p>
                        <p className="text-xs font-bold text-foreground">
                            {new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
                        </p>
                    </div>
                    {pdfUrl && (
                        <a 
                            href={pdfUrl}
                            download
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all ml-4 shadow-lg shadow-red-600/20"
                        >
                            <Download size={16} />
                            {t('download')}
                        </a>
                    )}
                </div>
            </header>

            {pdfUrl && (
                <div className="w-full aspect-[1/1.4] md:aspect-[1.4/1] bg-card rounded-xl border-2 border-primary/5 shadow-2xl overflow-hidden relative group">
                    <iframe 
                        src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                        className="w-full h-full border-none"
                        title={t(slug)}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            )}

            <div className="bg-card p-8 md:p-12 lg:p-16 rounded-xl border shadow-2xl shadow-black/5 prose prose-stone dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-bold leading-relaxed text-lg text-foreground/90 selection:bg-primary/10" dir={isRTL ? "rtl" : "ltr"}>
                    {content}
                </div>
            </div>
            
            <footer className="flex justify-center pt-10">
                 <Link 
                    href="/policies" 
                    className="px-10 py-4 bg-muted text-foreground border rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-border transition-all active:scale-95"
                 >
                    {t('title')}
                 </Link>
            </footer>
          </div>
        </main>
      </div>
    </NextIntlClientProvider>
  );
}
