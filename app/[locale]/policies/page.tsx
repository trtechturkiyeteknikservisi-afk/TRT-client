import { Header } from '@/components/header';
import { setRequestLocale } from 'next-intl/server';
import axios from 'axios';
import { FileText, ExternalLink } from 'lucide-react';

// Ensure the page is generated dynamically to fetch the latest policy
export const dynamic = 'force-dynamic';

export default async function PoliciesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Fetch policies directly from backend (Server Component)
  let policyContent = '';
  let docUrl = '';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const BASE_URL = API_URL.replace('/api', '');

  try {
    const response = await axios.get<Record<string, string>>(`${API_URL}/settings`);
    const data = response.data;
    
    if (locale === 'ar') policyContent = data.policy_ar ?? '';
    else if (locale === 'tr') policyContent = data.policy_tr ?? '';
    else policyContent = data.policy_en ?? '';

    if (data.OFFICIAL_DOCUMENT_PATH) {
      const cleanPath = data.OFFICIAL_DOCUMENT_PATH.replace(/^\//, "");
      
      try {
        // Use standard URL API to get the origin (e.g., https://trtservis.com)
        // This is the most robust way to get the base URL
        const apiOrigin = new URL(API_URL).origin;
        
        docUrl = data.OFFICIAL_DOCUMENT_PATH.startsWith('http') 
          ? data.OFFICIAL_DOCUMENT_PATH 
          : `${apiOrigin}/${cleanPath}`;
      } catch (e) {
        // Fallback if API_URL is a relative path (like "/api")
        docUrl = data.OFFICIAL_DOCUMENT_PATH.startsWith('http') 
          ? data.OFFICIAL_DOCUMENT_PATH 
          : `/${cleanPath}`;
      }
    }

  } catch (error) {
    console.error('Failed to fetch policies:', error);
  }

  const isRTL = locale === 'ar';

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <span className="text-2xl">⚖️</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
                 {locale === 'ar' ? 'السياسة والشروط' : locale === 'tr' ? 'Politika ve Şartlar' : 'Policy & Terms'}
              </h1>
            </div>

            {docUrl && (
              <div className="mb-12 p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-primary/40 transition-all group relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform shadow-2xl shadow-primary/20">
                    <FileText size={40} strokeWidth={2.5} />
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <h3 className="text-2xl font-black text-foreground tracking-tight">
                      {locale === 'ar' ? 'الوثيقة الرسمية المختومة' : locale === 'tr' ? 'Resmi Mühürlü Belge' : 'Official Sealed Document'}
                    </h3>
                    <p className="text-base text-muted-foreground font-bold mt-1 opacity-80">
                      {locale === 'ar' ? 'يمكنك الاطلاع على الوثيقة الرسمية من هنا' : locale === 'tr' ? 'Resmi belgeyi buradan görüntüleyebilirsiniz' : 'You can view the official document here'}
                    </p>
                  </div>
                </div>

                <a 
                  href={docUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-10 py-5 bg-foreground text-background rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl active:scale-95 group/btn relative z-10"
                >
                  <ExternalLink size={20} className="group-hover/btn:rotate-12 transition-transform" />
                  {locale === 'ar' ? 'فتح الوثيقة' : locale === 'tr' ? 'Belgeyi Aç' : 'Open Document'}
                </a>
              </div>
            )}
            
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-black prose-a:text-primary">
              {policyContent ? (
                <div 
                  className="whitespace-pre-wrap leading-relaxed font-medium"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {policyContent}
                </div>
              ) : (
                <div className="py-20 text-center text-muted-foreground font-bold flex flex-col items-center">
                   <span className="text-4xl mb-4">📄</span>
                   <p>{locale === 'ar' ? 'لم يتم العثور على محتوى.' : locale === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
