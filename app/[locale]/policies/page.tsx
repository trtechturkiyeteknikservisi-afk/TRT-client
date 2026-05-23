import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ShieldCheck, Scale, Gavel, FileText, Truck, ArrowRight, UserCheck, Lock, Download, ExternalLink, FileCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { OfficialPolicyCard } from '@/components/official-policy-card';

export default async function PoliciesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('Policies');

  let officialDocPath = '';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  
  // Robust SERVER_URL construction
  let normalizedApiUrl = API_URL;
  if (!API_URL.startsWith('http') && !API_URL.startsWith('/')) {
      // Remove leading dot if exists and prepend https://
      const cleanUrl = API_URL.startsWith('.') ? API_URL.substring(1) : API_URL;
      normalizedApiUrl = `https://${cleanUrl}`;
  }
  const SERVER_URL = normalizedApiUrl.replace(/\/api\/?$/, '');

  let settingsData: Record<string, string> = {};
  try {
    const res = await fetch(`${API_URL}/settings`, { cache: 'no-store' });
    if (res.ok) {
        settingsData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch settings:", error);
  }

  if (settingsData.OFFICIAL_DOCUMENT_PATH) {
      const path = settingsData.OFFICIAL_DOCUMENT_PATH;
      if (path.startsWith('http')) {
          officialDocPath = path;
      } else if (path.startsWith('.')) {
          officialDocPath = `https://${path.substring(1)}`;
      } else {
          officialDocPath = `${SERVER_URL}${path.startsWith('/') ? path : `/${path}`}`;
      }
  }


  const policies = [
    {
      id: 'kvkk',
      title: t('kvkk'),
      desc: t('kvkk_desc'),
      icon: UserCheck,
      color: 'bg-red-500/10 text-red-500',
      href: '/policies/kvkk'
    },
    {
      id: 'privacy',
      title: t('privacy'),
      desc: t('privacy_desc'),
      icon: Lock,
      color: 'bg-red-500/10 text-red-500',
      href: '/policies/privacy'
    },
    {
      id: 'terms',
      title: t('terms'),
      desc: t('terms_desc'),
      icon: FileText,
      color: 'bg-red-500/10 text-red-500',
      href: '/policies/terms'
    },
    {
      id: 'warranty',
      title: t('warranty'),
      desc: t('warranty_desc'),
      icon: ShieldCheck,
      color: 'bg-red-500/10 text-red-500',
      href: '/policies/warranty'
    },
    {
      id: 'shipping',
      title: t('shipping'),
      desc: t('shipping_desc'),
      icon: Truck,
      color: 'bg-red-500/10 text-red-500',
      href: '/policies/shipping'
    },
    {
      id: 'custom',
      title: t('custom'),
      desc: t('custom_desc'),
      icon: Gavel,
      color: 'bg-red-500/10 text-red-500',
      href: '/policies/custom'
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-8 md:pt-12 pb-20">
        <div className=" mx-auto px-4 lg:px-8">
          <header className="text-center max-w-2xl mx-auto mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-2">
               <Scale size={28} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-none">
               {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground font-bold opacity-80">
              {t('desc')}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {policies.map((policy) => {
              if (policy.id === 'custom' && officialDocPath) {
                return (
                  <OfficialPolicyCard 
                    key="official-doc"
                    href="/policies/custom"
                    officialDocPath={officialDocPath}
                    title={t('official_doc')}
                    desc={t('official_doc_desc')}
                    viewText={t('view')}
                    downloadText={t('download')}
                    footerNote={t('footer_note')}
                  />
                );
              }

              return (
                <Link 
                  key={policy.id} 
                  href={policy.href}
                  target={policy.href.startsWith('http') ? '_blank' : undefined}
                  rel={policy.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group relative bg-card border rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 flex flex-col items-center   text-center space-y-5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-all"></div>
                  
               
                    <div className={`w-14 h-14 rounded-xl ${policy.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <policy.icon size={24} strokeWidth={2.5} />
                  </div>

                  <div className="space-y-2 flex-grow flex flex-col justify-center">
                    <h3 className="text-base font-black text-foreground leading-tight tracking-tight uppercase">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed opacity-70">
                      {policy.desc}
                    </p>
                  </div>

                  <div className="pt-2 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <ArrowRight size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
                    </div>
                  </div>
                
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
