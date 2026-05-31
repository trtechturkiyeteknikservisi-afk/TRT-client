import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LinktreePage } from "@/components/linktree-page";

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }, { locale: 'tr' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Linktree' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ["TRT", "technical service", "repair links", "TRT Servis", "smartphone repair", "laptop repair", "robot vacuum repair", "luxury watch repair"],
  };
}

export default async function LinktreePageContainer({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Linktree');

  // Statically compile translations into an object to pass down to our interactive client page
  const translations = {
    title: t('title'),
    description: t('description'),
    website: t('website'),
    website_desc: t('website_desc'),
    whatsapp_support: t('whatsapp_support'),
    whatsapp_support_desc: t('whatsapp_support_desc'),
    whatsapp_complaints: t('whatsapp_complaints'),
    whatsapp_complaints_desc: t('whatsapp_complaints_desc'),
    phone_call: t('phone_call'),
    phone_call_desc: t('phone_call_desc'),
    email_us: t('email_us'),
    email_us_desc: t('email_us_desc'),
    location_map: t('location_map'),
    location_map_desc: t('location_map_desc'),
    instagram: t('instagram'),
    instagram_desc: t('instagram_desc'),
    tiktok: t('tiktok'),
    tiktok_desc: t('tiktok_desc'),
    facebook: t('facebook'),
    facebook_desc: t('facebook_desc'),
    youtube: t('youtube'),
    youtube_desc: t('youtube_desc'),
    telegram: t('telegram'),
    telegram_desc: t('telegram_desc'),
    snapchat: t('snapchat'),
    snapchat_desc: t('snapchat_desc'),
    pinterest: t('pinterest'),
    pinterest_desc: t('pinterest_desc'),
    linkedin: t('linkedin'),
    linkedin_desc: t('linkedin_desc'),
  };

  return <LinktreePage translations={translations} locale={locale} />;
}
