import { setRequestLocale } from 'next-intl/server';
import axios from 'axios';

// Ensure the page is generated dynamically to fetch the latest policy
export const dynamic = 'force-dynamic';

export default async function PoliciesPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Fetch policies directly from backend (Server Component)
  let policyContent = '';
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await axios.get<Record<string, string>>(`${API_URL}/settings`);
    const data = response.data;
    if (locale === 'ar') policyContent = data.policy_ar ?? '';
    else if (locale === 'tr') policyContent = data.policy_tr ?? '';
    else policyContent = data.policy_en ?? '';

  } catch (error) {
    console.error('Failed to fetch policies:', error);
  }

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <span className="text-2xl">⚖️</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">
               {locale === 'ar' ? 'السياسة والشروط' : locale === 'tr' ? 'Politika ve Şartlar' : 'Policy & Terms'}
            </h1>
          </div>
          
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
  );
}
