'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, Smartphone, Laptop, Watch, Check, ArrowRight, X, Play, Briefcase 
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AppleHeadphonesIcon, RobotVacuumIcon } from './social-icons';
import Image from 'next/image';

interface WorkItem {
  id: number | string;
  title: string;
  category: string;
  beforeUrl: string;
  afterUrl: string;
  checklist: string[];
  description: string;
  type: string;
}

const richPredefinedWorks = [
  {
    category: 'phone',
    title: {
      tr: 'iPhone 13 Ekran Değişimi',
      en: 'iPhone 13 Screen Replacement',
      ar: 'تبديل شاشة آيفون 13'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e09cddeb?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Orijinal OLED Ekran', '45 Dakikada Teslim', 'Face ID Test Edildi'],
      en: ['Original OLED Screen', '45-Minute Delivery', 'Face ID Tested'],
      ar: ['شاشة OLED أصلية', 'تسليم خلال 45 دقيقة', 'تم فحص بصمة الوجه']
    },
    description: {
      tr: 'Kırık ve çalışmayan iPhone 13 ekranı, orijinal OLED yedek parça kullanılarak değiştirilmiştir. İşlem sonrası Face ID ve True Tone özellikleri test edilerek sorunsuz çalıştığı doğrulanmıştır.',
      en: 'Broken and non-functional iPhone 13 screen was replaced using an original OLED replacement part. Post-process Face ID and True Tone functions were tested and verified to work flawlessly.',
      ar: 'تم استبدال شاشة آيفون 13 المكسورة وغير الصالحة للاستخدام بقطع غيار OLED أصلية. بعد العملية، تم اختبار وظائف Face ID و True Tone والتحقق من عملها بشكل ممتاز.'
    }
  },
  {
    category: 'phone',
    title: {
      tr: 'iPhone 14 Pro Arka Cam Değişimi',
      en: 'iPhone 14 Pro Back Glass Replacement',
      ar: 'تبديل الزجاج الخلفي لآيفون 14 برو'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Orijinal Cam', 'Lazer ile Cam Söküm', 'Toz Almadan Uygulama'],
      en: ['Original Glass', 'Laser Glass Removal', 'Dust-Free Application'],
      ar: ['زجاج أصلي', 'إزالة الزجاج بالليزر', 'تركيب خالٍ من الغبار']
    },
    description: {
      tr: 'Çatlak iPhone 14 Pro arka camı, lazer makinesi kullanılarak kasa zarar görmeden sökülmüş ve orijinal kalitede yeni arka cam ile değiştirilmiştir.',
      en: 'Cracked iPhone 14 Pro back glass was removed using a laser machine without damaging the frame and replaced with a new original-quality back glass.',
      ar: 'تمت إزالة الزجاج الخلفي المكسور لهاتف آيفون 14 برو باستخدام آلة الليزر دون إلحاق أي ضرر بالهيكل وتغييره بزجاج خلفي جديد ذي جودة أصلية.'
    }
  },
  {
    category: 'phone',
    title: {
      tr: 'iPhone Batarya Değişimi',
      en: 'iPhone Battery Replacement',
      ar: 'تبديل بطارية آيفون'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1629131726692-1accd0c53db0?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Yüksek Kapasiteli Batarya', 'Pil Sağlığı Test Edildi', 'Güvenli ve Garantili'],
      en: ['High Capacity Battery', 'Battery Health Tested', 'Safe and Guaranteed'],
      ar: ['بطارية عالية السعة', 'تم فحص صحة البطارية', 'آمنة ومضمونة']
    },
    description: {
      tr: 'Pil sağlığı düşmüş ve hızlı şarj tüketen iPhone cihazının bataryası, yüksek kapasiteli ve garantili yeni batarya hücresi ile değiştirilerek pil sağlığı %100 seviyesine getirilmiştir.',
      en: 'The battery of an iPhone device with degraded battery health was replaced with a new high-capacity and guaranteed battery cell, bringing battery health back to 100%.',
      ar: 'تم استبدال بطارية جهاز آيفون الذي يعاني من تدهور في صحة البطارية بخلية بطارية جديدة عالية السعة ومضمونة، مما أعاد صحة البطارية إلى 100٪.'
    }
  },
  {
    category: 'laptop',
    title: {
      tr: 'MacBook Klavye Değişimi',
      en: 'MacBook Keyboard Replacement',
      ar: 'تبديل لوحة مفاتيح ماك بوك'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Orijinal Klavye', 'Tuş Testleri Yapıldı', 'Garantili İşçilik'],
      en: ['Original Keyboard', 'Key Tests Completed', 'Guaranteed Workmanship'],
      ar: ['لوحة مفاتيح أصلية', 'تم فحص جميع الأزرار', 'عمل مضمون ومكفول']
    },
    description: {
      tr: 'Sıvı teması nedeniyle bazı tuşları çalışmayan MacBook klavyesi, orijinal yedek parça ile tamamen yenilenmiştir. Tüm tuşların hassasiyeti ve arka aydınlatması test edilmiştir.',
      en: 'The MacBook keyboard, which had non-functional keys due to liquid damage, was completely renewed with an original replacement part. The sensitivity and backlighting of all keys were tested.',
      ar: 'تم تجديد لوحة مفاتيح ماك بوك التي تحتوي على مفاتيح غير صالحة للعمل بسبب تلف السوائل بالكامل بقطعة غيار أصلية. تم اختبار حساسية وإضاءة جميع المفاتيح.'
    }
  },
  {
    category: 'laptop',
    title: {
      tr: 'MacBook Anakart Onarımı',
      en: 'MacBook Motherboard Repair',
      ar: 'صيانة لوحة الأم لماك بوك'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Profesyonel Kart Onarımı', 'BGA & Chip Level İşlemler', 'Test Edilerek Teslim'],
      en: ['Professional Board Repair', 'BGA & Chip Level Operations', 'Tested Before Delivery'],
      ar: ['صيانة احترافية للبورد', 'عمليات على مستوى الشيب و BGA', 'تم الفحص قبل التسليم']
    },
    description: {
      tr: 'Kısa devre sonucu açılmayan MacBook anakartı, mikroskobik inceleme ile tespit edilen arızalı entegre ve çiplerin BGA hava istasyonu ile değiştirilmesiyle başarıyla onarılmıştır.',
      en: 'The MacBook motherboard, which did not turn on due to a short circuit, was successfully repaired by replacing the faulty integrated circuits and chips detected through microscopic examination.',
      ar: 'تم إصلاح لوحة الأم لماك بوك التي لم تعمل بسبب التماس كهربائي بنجاح عن طريق استبدال الدوائر المتكاملة والرقائق التالفة التي تم اكتشافها من خلال الفحص المجهري.'
    }
  },
  {
    category: 'robot',
    title: {
      tr: 'Viomi S9 Anakart Onarımı',
      en: 'Viomi S9 Motherboard Repair',
      ar: 'صيانة لوحة الأم لمكنسة Viomi S9'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Detaylı Arıza Tespiti', 'Anakart Onarımı', 'Test Edilerek Teslim'],
      en: ['Detailed Fault Detection', 'Motherboard Repair', 'Tested Before Delivery'],
      ar: ['تشخيص دقيق للأعطال', 'صيانة لوحة الأم', 'تم الفحص قبل التسليم']
    },
    description: {
      tr: 'Şarj ünitesinden ayrıldıktan sonra kapanan veya haritalama yapmayan Viomi S9 robot süpürgenin anakartındaki güç ve sensör kontrol entegreleri yenilenerek tüm testleri tamamlanmıştır.',
      en: 'The power and sensor control integrated circuits on the motherboard of the Viomi S9 robot vacuum, which shut down or failed to map after leaving the charging dock, were renewed and fully tested.',
      ar: 'تم تجديد الدوائر المتكاملة للتحكم في الطاقة والمستشعرات على لوحة الأم لمكنسة الروبوت Viomi S9، والتي تم إيقاف تشغيلها أو فشلت في رسم الخرائط بعد مغادرة قاعدة الشحن.'
    }
  },
  {
    category: 'watch',
    title: {
      tr: 'Apple Watch Ekran Değişimi',
      en: 'Apple Watch Screen Replacement',
      ar: 'تبديل شاشة آبل ووتش'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Orijinal Ekran', 'Su Sızdırmazlık Testi', 'Dokunmatik Kalibrasyonu'],
      en: ['Original Display', 'Waterproof Testing', 'Touch Calibration'],
      ar: ['شاشة أصلية', 'اختبار مقاومة الماء', 'معايرة اللمس']
    },
    description: {
      tr: 'Ekranı kırılan Apple Watch cihazının ekranı orijinal yedek parça ile değiştirilmiştir. İşlem sonrasında saate özel sıvı contalar uygulanarak su geçirmezlik testi başarıyla gerçekleştirilmiştir.',
      en: 'The display of the Apple Watch device with a broken screen was replaced with an original replacement part. Post-process water resistance tests were successfully conducted using watch-specific liquid seals.',
      ar: 'تم استبدال شاشة جهاز Apple Watch المكسورة بقطعة غيار أصلية. بعد العملية، تم إجراء اختبارات مقاومة الماء بنجاح باستخدام مواد سائلة مخصصة للساعات.'
    }
  },
  {
    category: 'headphones',
    title: {
      tr: 'AirPods Batarya Değişimi',
      en: 'AirPods Battery Replacement',
      ar: 'تبديل بطارية آيربودز'
    },
    beforeUrl: 'https://images.unsplash.com/photo-1588449668338-d15168822471?w=600&auto=format&fit=crop&q=80',
    afterUrl: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format&fit=crop&q=80',
    checklist: {
      tr: ['Yüksek Kaliteli Hücreler', 'Şarj Kutusu Testi', 'Ses Denge Kontrolü'],
      en: ['High Quality Cells', 'Charging Case Test', 'Audio Balance Control'],
      ar: ['خلايا عالية الجودة', 'فحص علبة الشحن', 'ضبط توازن الصوت']
    },
    description: {
      tr: 'Şarjı kısa sürede biten veya bağlantısı kopan AirPods kulaklıkların batarya hücreleri, yüksek kapasiteli ve kaliteli yeni hücreler ile değiştirilmiştir. Ses dengesi ve şarj süreleri test edilmiştir.',
      en: 'The battery cells of AirPods headphones, which drained quickly or disconnected, were replaced with new high-capacity and quality cells. Audio balance and charging times were fully tested.',
      ar: 'تم استبدال خلايا بطارية سماعات AirPods، التي نفدت شحنتها بسرعة أو انقطع اتصالها، بخلايا جديدة عالية السعة وعالية الجودة. تم اختبار توازن الصوت وأوقات الشحن بالكامل.'
    }
  }
];

interface PortfolioProps {
  limit?: number;
  showTitle?: boolean;
}

export function Portfolio({ limit = 6, showTitle = true }: PortfolioProps) {
  const t = useTranslations('Portfolio');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);

  // Define Category Tabs
  const categories = [
    { id: 'all', label: t('category_all'), icon: LayoutGrid },
    { id: 'phone', label: t('category_phone'), icon: Smartphone },
    { id: 'laptop', label: t('category_laptop'), icon: Laptop },
    { id: 'watch', label: t('category_watch'), icon: Watch },
    { id: 'robot', label: t('category_robot'), icon: RobotVacuumIcon },
    { id: 'headphones', label: t('category_headphones'), icon: AppleHeadphonesIcon }
  ];

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${API_URL}/content/portfolio?locale=${locale}`);
        if (!response.ok) {
          throw new Error(`Portfolio request failed: ${response.status}`);
        }
        const data = await response.json();
        
        // Parse and enrich database content
        const parsedWorks = data.map((item: any) => {
          const titleLower = item.title.toLowerCase();
          
          // Find matching rich item
          const matched = richPredefinedWorks.find(p => {
            return p.title.tr.toLowerCase() === titleLower ||
                   p.title.en.toLowerCase() === titleLower ||
                   p.title.ar.toLowerCase() === titleLower ||
                   titleLower.includes(p.title.en.toLowerCase().replace('replacement', '').trim()) ||
                   titleLower.includes(p.title.tr.toLowerCase().replace('değişimi', '').trim());
          });

          if (matched) {
            return {
              id: item.id,
              category: matched.category,
              title: item.title,
              beforeUrl: matched.beforeUrl,
              afterUrl: matched.afterUrl,
              checklist: matched.checklist[locale as 'tr' | 'en' | 'ar'] || matched.checklist.tr,
              description: item.description || matched.description[locale as 'tr' | 'en' | 'ar'] || matched.description.tr,
              type: item.type
            };
          }

          // Dynamic parsing
          let beforeUrl = '';
          let afterUrl = item.url || '';
          if (item.url && item.url.includes('|')) {
            const parts = item.url.split('|');
            beforeUrl = parts[0].trim();
            afterUrl = parts[1].trim();
          }

          let checklist: string[] = [];
          let description = item.description || '';
          
          if (description.includes('---')) {
            const parts = description.split('---');
            checklist = parts[0].split('\n').map((s: string) => s.trim().replace(/^[-*✓]\s*/, '')).filter(Boolean);
            description = parts[1].trim();
          } else if (description.includes('\n')) {
            const lines = description.split('\n').map((s: string) => s.trim()).filter(Boolean);
            if (lines.length > 1) {
              checklist = lines.slice(0, 3).map((s: string) => s.replace(/^[-*✓]\s*/, ''));
              description = lines.slice(3).join('\n');
            }
          }

          // Infer category
          let category = 'phone';
          if (titleLower.includes('laptop') || titleLower.includes('computer') || titleLower.includes('macbook') || titleLower.includes('klavye') || titleLower.includes('bilgisayar')) {
            category = 'laptop';
          } else if (titleLower.includes('watch') || titleLower.includes('saat')) {
            category = 'watch';
          } else if (titleLower.includes('vacuum') || titleLower.includes('robot') || titleLower.includes('süpürge') || titleLower.includes('viomi') || titleLower.includes('roborock')) {
            category = 'robot';
          } else if (titleLower.includes('headphone') || titleLower.includes('earphone') || titleLower.includes('airpods') || titleLower.includes('kulaklık')) {
            category = 'headphones';
          }

          // Fallbacks for checklist if empty
          if (checklist.length === 0) {
            if (category === 'phone') {
              checklist = locale === 'ar' 
                ? ["قطع غيار أصلية", "ضمان معتمد", "فحص كامل للجهاز"]
                : locale === 'en'
                ? ["Original Parts", "Certified Warranty", "Full Device Check"]
                : ["Orijinal Parça", "Garantili Onarım", "Detaylı Testler"];
            } else if (category === 'laptop') {
              checklist = locale === 'ar'
                ? ["صيانة احترافية للبورد", "قطع غيار عالية الجودة", "تسليم سريع"]
                : locale === 'en'
                ? ["Professional Board Repair", "High-Quality Parts", "Fast Turnaround"]
                : ["Profesyonel Anakart Onarımı", "Yüksek Kaliteli Parça", "Hızlı Teslimat"];
            } else if (category === 'watch') {
              checklist = locale === 'ar'
                ? ["فحص مقاومة الماء", "معايرة دقيقة", "قطع أصلية"]
                : locale === 'en'
                ? ["Waterproof Testing", "Precision Calibration", "Original Parts"]
                : ["Su Geçirmezlik Testi", "Hassas Kalibrasyon", "Orijinal Parça"];
            } else if (category === 'robot') {
              checklist = locale === 'ar'
                ? ["تنظيف عميق داخلي", "صيانة محركات وحساسات", "قطع أصلية"]
                : locale === 'en'
                ? ["Deep Internal Cleaning", "Motor & Sensor Repair", "Original Parts"]
                : ["Derin İç Temizlik", "Motor & Sensör Onarımı", "Orijinal Parçalar"];
            } else {
              checklist = locale === 'ar'
                ? ["ضبط توازن الصوت", "قطع غيار معتمدة", "فحص البطارية والعلبة"]
                : locale === 'en'
                ? ["Audio Balance Control", "Certified Parts", "Battery & Case Test"]
                : ["Ses Dengesi Kontrolü", "Garantili Hücre Değişimi", "Şarj Kutusu Testi"];
            }
          }

          return {
            id: item.id,
            category,
            title: item.title,
            beforeUrl,
            afterUrl,
            checklist,
            description,
            type: item.type
          };
        });

        // Set works directly from the database response
        setWorks(parsedWorks || []);
      } catch (error) {
        console.warn('Error fetching portfolio database', error);
        setWorks([]);
      }
    };
    fetchWorks();
  }, [locale]);

  // Utility to convert rich predefined data based on active locale
  const getPredefinedWorksLocal = (): WorkItem[] => {
    return richPredefinedWorks.map((rich, index) => ({
      id: `predef-${index}`,
      category: rich.category,
      title: rich.title[locale as 'tr' | 'en' | 'ar'] || rich.title.tr,
      beforeUrl: rich.beforeUrl,
      afterUrl: rich.afterUrl,
      checklist: rich.checklist[locale as 'tr' | 'en' | 'ar'] || rich.checklist.tr,
      description: rich.description[locale as 'tr' | 'en' | 'ar'] || rich.description.tr,
      type: 'image'
    }));
  };

  useEffect(() => {
    if (selectedWork) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedWork]);

  // Filter items by category
  const filteredWorks = activeCategory === 'all' 
    ? works 
    : works.filter(w => w.category === activeCategory);

  const displayedWorks = limit > 0 ? filteredWorks.slice(0, limit) : filteredWorks;

  // Helper to fetch the correct icon component
  const getCategoryIcon = (cat: string) => {
    const found = categories.find(c => c.id === cat);
    return found ? found.icon : Smartphone;
  };

  return (
    <section id="works" className="py-12 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Title Section matching the premium layout */}
        {showTitle && (
          <div className="flex flex-col items-center text-center mb-12 md:mb-16 space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Briefcase size={22} />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase">
              {t('title').split(' ').map((word, i) => (
                <span key={i} className={i === 1 || i === t('title').split(' ').length - 1 ? "text-primary" : "text-foreground"}>
                  {word}{' '}
                </span>
              ))}
            </h2>
            
            <div className="w-16 h-1 bg-primary rounded-full" />
            
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl font-semibold leading-relaxed">
              {t('desc')}
            </p>
          </div>
        )}

        {/* Category Navigation Tabs */}
        <div className="grid grid-cols-3 md:flex md:flex-nowrap justify-center gap-2 md:gap-4 pt-3 pb-4 mb-12 px-2 max-w-md mx-auto md:max-w-none" dir={isRTL ? 'rtl' : 'ltr'}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 md:py-4 md:px-6 rounded-xl md:rounded-2xl border text-center transition-all duration-300 w-full md:w-auto md:min-w-[130px] cursor-pointer hover:-translate-y-0.5 shrink-0 ${
                  isActive 
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5 scale-105 font-bold' 
                    : 'border-black/5 dark:border-border/30 bg-card hover:bg-muted/50 hover:border-black/10 dark:hover:border-border/60 text-muted-foreground'
                }`}
              >
                <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl mb-1.5 md:mb-2 transition-all ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted dark:bg-background text-foreground/80'}`}>
                  <Icon size="100%" className="w-4 h-4 md:w-5.5 md:h-5.5" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] md:text-xs font-black tracking-wider uppercase">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Works Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayedWorks.map((work, index) => {
            const CategoryIcon = getCategoryIcon(work.category);

            return (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => setSelectedWork(work)}
                className="group flex flex-col justify-between bg-card border border-black/5 dark:border-border/30 rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden cursor-pointer"
              >
                <div className="space-y-6">
                  {/* Before / After Images Layout */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center font-black text-xs tracking-widest uppercase mb-1">
                      <span className="text-red-500">{t('once')}</span>
                      <span className="w-6" />
                      <span className="text-green-500">{t('sonra')}</span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 relative">
                      {/* Before Image */}
                      <div className="aspect-[4/5] relative w-full overflow-hidden rounded-xl bg-muted border border-black/5 dark:border-border/20">
                        {work.beforeUrl ? (
                          <img 
                            src={work.beforeUrl} 
                            alt="" 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] text-muted-foreground font-black">N/A</div>
                        )}
                      </div>

                      {/* Middle Arrow Circle */}
                      <div className="w-7 h-7 rounded-full bg-white dark:bg-white border shadow-md flex items-center justify-center z-10 -mx-3 shrink-0 text-slate-800">
                        <ArrowRight size={14} className={`stroke-[3px] ${isRTL ? 'rotate-180' : ''}`} />
                      </div>

                      {/* After Image */}
                      <div className="aspect-[4/5] relative w-full overflow-hidden rounded-xl bg-muted border border-black/5 dark:border-border/20">
                        {work.afterUrl ? (
                          <img 
                            src={work.afterUrl} 
                            alt="" 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-[10px] text-muted-foreground font-black">N/A</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Title with Category Icon */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <CategoryIcon size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-base md:text-lg font-black tracking-tight text-foreground uppercase line-clamp-1">
                      {work.title}
                    </h3>
                  </div>

                  {/* Features Checklist */}
                  <ul className="space-y-2.5 pl-0.5">
                    {work.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground">
                        <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                          <Check size={10} className="stroke-[3.5px]" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Details Button */}
                <div className="mt-8 pt-4 border-t border-muted/50 w-full flex items-center justify-between text-primary font-black text-xs tracking-widest uppercase transition-all duration-300">
                  <span>{t('view_details')}</span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={12} className={`stroke-[3px] ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* View More Button */}
        {limit > 0 && works.length > limit && (
          <div className="mt-16 text-center">
            <Link
              href="/our-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <span>{t('view_more')}</span>
              <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
            </Link>
          </div>
        )}
      </div>

      {/* Lightbox / Details Modal */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedWork(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-muted/50 shadow-2xl relative cursor-default scrollbar-thin overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer z-50 shadow-md"
                onClick={() => setSelectedWork(null)}
                aria-label="Close details"
              >
                <X size={20} className="stroke-[2.5px]" />
              </button>

              {/* Large Image Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 bg-black aspect-video md:aspect-[21/9] w-full border-b divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="relative w-full h-full flex flex-col justify-center bg-black/40">
                  <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md z-10 border border-white/10 shadow-md">
                    {t('once')}
                  </span>
                  {selectedWork.beforeUrl ? (
                    <img
                      src={selectedWork.beforeUrl}
                      alt={selectedWork.title}
                      className="w-full h-full object-contain max-h-[35vh]"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[200px] flex items-center justify-center text-xs font-black text-white/55">{t('once')} N/A</div>
                  )}
                </div>
                <div className="relative w-full h-full flex flex-col justify-center bg-black/40">
                  <span className="absolute top-3 left-3 bg-green-600/90 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md z-10 border border-white/10 shadow-md">
                    {t('sonra')}
                  </span>
                  {selectedWork.afterUrl ? (
                    <img
                      src={selectedWork.afterUrl}
                      alt={selectedWork.title}
                      className="w-full h-full object-contain max-h-[35vh]"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[200px] flex items-center justify-center text-xs font-black text-white/55">{t('sonra')} N/A</div>
                  )}
                </div>
              </div>

              {/* Content Panel */}
              <div className="p-6 md:p-8 space-y-6 bg-card text-card-foreground">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {React.createElement(getCategoryIcon(selectedWork.category), { size: 20, strokeWidth: 2.5 })}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">{selectedWork.title}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 pt-4 border-t border-muted">
                  {/* Specs List */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground ml-1">Onarım Detayları</h4>
                    <ul className="space-y-3">
                      {selectedWork.checklist.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-sm font-bold text-foreground/80">
                          <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                            <Check size={10} className="stroke-[3.5px]" />
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description text */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground ml-1">Açıklama</h4>
                    <p className="text-muted-foreground text-sm font-semibold leading-relaxed whitespace-pre-line">
                      {selectedWork.description || t('no_description')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
