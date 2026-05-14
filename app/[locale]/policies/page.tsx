import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ShieldCheck, Scale, Gavel, FileText, Truck, ArrowRight, UserCheck, Lock, Download, ExternalLink, FileCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';

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

  const getPolicyPdf = (id: string) => {
    let path = settingsData[`${id}_pdf_${locale}`] || settingsData[`${id}_pdf_en`];
    if (!path) return null;
    
    if (path.startsWith('http')) return path;
    if (path.startsWith('.')) return `https://${path.substring(1)}`;
    
    // If path starts with api/ and SERVER_URL is empty (e.g. API_URL was /api)
    // we want to ensure it's a root-relative path at least
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    return `${SERVER_URL}${fullPath}`;
  };

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
    }
  ].map(p => ({
    ...p,
    href: p.href
  }));

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-10 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
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

          {/* Official Document Section - Moved to Top */}
          {officialDocPath && (
            <div className="max-w-5xl mx-auto mb-16">
                <div className="relative bg-gradient-to-br from-primary/5 via-transparent to-transparent border border-primary/10 rounded-2xl p-6 md:p-8 overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
                        <FileCheck size={120} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <FileCheck size={32} strokeWidth={2.5} />
                        </div>
                        
                        <div className="flex-grow text-center md:text-left space-y-2">
                            <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight italic">
                                {t('official_doc')}
                            </h2>
                            <p className="text-xs text-muted-foreground font-bold leading-relaxed max-w-xl">
                                {t('official_doc_desc')}
                            </p>
                        </div>
                        
                        <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                            <a 
                                href={officialDocPath} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                            >
                                <ExternalLink size={14} />
                                {t('view')}
                            </a>
                            <a 
                                href={officialDocPath} 
                                download
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-border transition-all border"
                            >
                                <Download size={14} />
                                {t('download')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {policies.map((policy) => (
              <Link 
                key={policy.id} 
                href={policy.href}
                target={policy.href.includes('.pdf') ? '_blank' : undefined}
                rel={policy.href.includes('.pdf') ? 'noopener noreferrer' : undefined}
                className="group relative bg-card border rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex flex-col items-center text-center space-y-4 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-all"></div>
                
                <div className={`w-12 h-12 rounded-xl ${policy.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <policy.icon size={20} strokeWidth={2.5} />
                </div>

                <div className="space-y-2 flex-grow">
                  <h3 className="text-sm font-black text-foreground leading-tight tracking-tight uppercase">
                    {policy.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed opacity-70">
                    {policy.desc}
                  </p>
                </div>

                <div className="pt-2 mt-auto">
                   <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ArrowRight size={14} className={locale === 'ar' ? 'rotate-180' : ''} />
                   </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
