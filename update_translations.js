const fs = require('fs');
const path = require('path');

const locales = ['en', 'ar', 'tr'];
const metadata = {
  en: {
    Home: { title: "TRT | Professional Repair Service in Turkey", description: "Specialized repair for smartphones, laptops, robot vacuums, and luxury watches. 20+ years of experience in technical service.", keywords: "phone repair, laptop repair, robot vacuum repair, watch repair, technical service, Turkey, Bursa" },
    AboutUs: { title: "About Us | TRT", description: "Learn more about TRT technical service, our 20+ years of experience, and our commitment to providing top-quality repair services.", keywords: "about TRT, repair experts, technical service history" },
    Contact: { title: "Contact Us | TRT", description: "Get in touch with TRT technical service. We are here to help with your smartphone, laptop, robot vacuum, or luxury watch repairs.", keywords: "contact TRT, customer support, repair inquiry" },
    Portfolio: { title: "Our Works | TRT", description: "View our portfolio of successful repairs. See why customers trust TRT for their technical service needs.", keywords: "TRT portfolio, repair works, successful repairs, before after" },
    Blog: { title: "Blog | TRT", description: "Read the latest tips, tricks, and news from TRT technical service about maintaining and repairing your devices.", keywords: "repair blog, tech tips, device maintenance" },
    Services: { title: "Our Services | TRT", description: "Explore our wide range of repair services including smartphones, laptops, robot vacuums, watches, and tablets.", keywords: "repair services, TRT services, what we repair" },
    Policies: { title: "Policies | TRT", description: "Read our privacy policy, terms of service, warranty policy, and other important legal information.", keywords: "TRT policies, terms of service, privacy policy, warranty" },
  },
  ar: {
    Home: { title: "TRT | خدمة الإصلاح الاحترافية في تركيا", description: "إصلاح متخصص للهواتف الذكية، الحواسيب المحمولة، المكانس الذكية، والساعات الفاخرة. أكثر من 20 عاماً من الخبرة.", keywords: "صيانة هواتف, صيانة حواسيب, صيانة مكانس ذكية, صيانة ساعات, خدمة فنية, تركيا, بورصة" },
    AboutUs: { title: "من نحن | TRT", description: "تعرف على خدمة TRT الفنية، وتاريخنا الممتد لأكثر من 20 عاماً في تقديم خدمات الصيانة بأعلى جودة.", keywords: "عن TRT, خبراء الصيانة, تاريخ الخدمة الفنية" },
    Contact: { title: "اتصل بنا | TRT", description: "تواصل مع خدمة TRT الفنية. نحن هنا لمساعدتك في إصلاح أجهزتك بكل احترافية.", keywords: "اتصل بـ TRT, دعم العملاء, استفسارات الصيانة" },
    Portfolio: { title: "أعمالنا | TRT", description: "شاهد معرض أعمالنا وإصلاحاتنا الناجحة. اكتشف لماذا يثق العملاء في TRT.", keywords: "أعمال TRT, إصلاحات ناجحة, قبل وبعد" },
    Blog: { title: "المدونة | TRT", description: "اقرأ أحدث النصائح والأخبار من خدمة TRT حول صيانة الأجهزة والحفاظ عليها.", keywords: "مدونة الصيانة, نصائح تقنية, الحفاظ على الأجهزة" },
    Services: { title: "خدماتنا | TRT", description: "اكتشف مجموعة واسعة من خدمات الإصلاح التي نقدمها للأجهزة الذكية والإلكترونيات.", keywords: "خدمات الإصلاح, خدمات TRT, ماذا نصلح" },
    Policies: { title: "السياسات | TRT", description: "اقرأ سياسة الخصوصية، شروط الخدمة، سياسة الضمان والمعلومات القانونية الهامة.", keywords: "سياسات TRT, شروط الخدمة, سياسة الخصوصية, الضمان" },
  },
  tr: {
    Home: { title: "TRT | Türkiye'de Profesyonel Tamir Servisi", description: "Akıllı telefonlar, dizüstü bilgisayarlar, robot süpürgeler ve lüks saatler için uzman tamir hizmeti. 20 yılı aşkın tecrübe.", keywords: "telefon tamiri, bilgisayar tamiri, robot süpürge tamiri, saat tamiri, teknik servis, Türkiye, Bursa" },
    AboutUs: { title: "Hakkımızda | TRT", description: "TRT teknik servisi hakkında daha fazla bilgi edinin, 20 yılı aşkın tecrübemizle en kaliteli tamir hizmetlerini sunuyoruz.", keywords: "TRT hakkında, tamir uzmanları, teknik servis tarihi" },
    Contact: { title: "İletişim | TRT", description: "TRT teknik servisi ile iletişime geçin. Akıllı telefon, dizüstü bilgisayar, robot süpürge veya lüks saat tamirleri için buradayız.", keywords: "TRT iletişim, müşteri hizmetleri, tamir talebi" },
    Portfolio: { title: "Çalışmalarımız | TRT", description: "Başarılı tamir portföyümüzü inceleyin. Müşterilerin neden TRT'ye güvendiğini görün.", keywords: "TRT çalışmaları, tamir işleri, başarılı tamirler, öncesi sonrası" },
    Blog: { title: "Blog | TRT", description: "Cihazlarınızın bakımı ve tamiri hakkında TRT teknik servisinden en son ipuçlarını ve haberleri okuyun.", keywords: "tamir blogu, teknoloji ipuçları, cihaz bakımı" },
    Services: { title: "Hizmetlerimiz | TRT", description: "Akıllı telefonlar, dizüstü bilgisayarlar, robot süpürgeler, saatler ve tabletler dahil olmak üzere geniş tamir hizmeti yelpazemizi keşfedin.", keywords: "tamir hizmetleri, TRT hizmetleri, neler tamir ediyoruz" },
    Policies: { title: "Politikalar | TRT", description: "Gizlilik politikamızı, hizmet şartlarımızı, garanti politikamızı ve diğer önemli yasal bilgileri okuyun.", keywords: "TRT politikaları, hizmet şartları, gizlilik politikası, garanti" },
  }
};

locales.forEach(loc => {
  const filePath = path.join(__dirname, 'messages', loc + '.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.Metadata = metadata[loc];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Updated ' + loc + '.json successfully.');
  } catch(e) {
    console.error('Error updating ' + loc + '.json', e);
  }
});
