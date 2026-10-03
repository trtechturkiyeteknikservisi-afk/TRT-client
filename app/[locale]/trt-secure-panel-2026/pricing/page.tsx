'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Plus, Search, Trash2, Edit3, X, Check, 
  Smartphone, Shield, ShieldCheck, Clock, RefreshCw, Layers,
  Upload, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';
import { STORE_CATEGORIES } from '@/lib/store-data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface QualityOption {
  quality_tr: string;
  quality_en: string;
  quality_ar: string;
  price: number;
  badge?: string;
  available?: boolean;
}

interface PricingItem {
  id: number;
  brand: string;
  device_type: string;
  category_name_tr?: string;
  category_name_en?: string;
  category_name_ar?: string;
  item_type?: 'cihaz' | 'yedek_parca' | 'aksesuar' | 'servis';
  part_type?: string;
  specs_tr?: string;
  specs_en?: string;
  specs_ar?: string;
  series: string;
  model_name: string;
  service_slug: string;
  service_name_tr: string;
  service_name_en: string;
  service_name_ar: string;
  base_price: number;
  currency: string;
  duration: string;
  warranty: string;
  quality_options: QualityOption[];
  is_popular: boolean;
  in_stock: boolean;
  sort_order: number;
  notes_tr?: string;
  notes_en?: string;
  notes_ar?: string;
  image_url?: string;
}

const dict = {
  ar: {
    dashboard_overview: "نظرة عامة",
    page_title: "إدارة المنتجات والأسعار",
    records_count: "سجل",
    load_defaults: "تحميل القوالب الافتراضية",
    load_defaults_tooltip: "تحميل وتثبيت قائمة أسعار الكتالوج الشاملة لجميع موديلات iPhone و Samsung",
    add_new_model: "إضافة منتج جديد +",
    search_placeholder: "ابحث باسم الموديل أو الفئة أو الماركة (مثال: iPhone 16, S24, 15 Pro)...",
    all_brands: "جميع الماركات",
    all_branches: "جميع الفروع والأقسام",
    all_services: "جميع الخدمات",
    th_model_series: "الموديل والفئة والصورة",
    th_brand: "الماركة",
    th_branch: "الفرع الرئيسي",
    th_service: "الخدمة / القطعة",
    th_base_price: "السعر الأساسي",
    th_qualities: "خيارات الجودة والقطع",
    th_warranty: "الضمان الرسمي",
    th_status: "الحالة والمخزون",
    th_actions: "الإجراءات",
    popular_badge: "الأكثر طلباً",
    in_stock: "متوفر بالمخزون",
    out_of_stock: "نفد من المخزون",
    single_price: "سعر موحد",
    edit_tooltip: "تعديل المنتج والأسعار",
    delete_tooltip: "حذف المنتج",
    loading_data: "جاري تحميل بيانات قائمة المنتجات والأسعار...",
    no_records: "لم يتم العثور على أي سجلات مطابقة للبحث.",
    modal_edit_title: "تعديل بيانات وتسعيرة المنتج",
    modal_add_title: "إضافة منتج وتسعيرة جديدة",
    image_section_title: "صورة المنتج (اختياري)",
    image_section_sub: "يمكنك رفع صورة المنتج أو وضع رابط مباشر للصورة لإظهارها في قائمة المنتجات والأسعار",
    upload_image_btn: "رفع صورة من الجهاز",
    uploading_image: "جاري رفع الصورة...",
    remove_image: "إزالة الصورة",
    image_url_placeholder: "أو الصق رابط الصورة مباشرة (URL)...",
    label_main_branch: "الفرع الرئيسي / القسم العام",
    select_branch_placeholder: "-- اختر الفرع الرئيسي للخدمة --",
    new_branch_option: "+ إنشاء فرع رئيسي جديد",
    custom_branch_box_title: "بيانات الفرع الرئيسي الجديد",
    label_branch_ar: "اسم الفرع (عربي)",
    label_branch_tr: "اسم الفرع (تركي)",
    label_branch_en: "اسم الفرع (إنجليزي)",
    placeholder_branch_ar: "مثال: صيانة الهواتف، صيانة اللابتوب، المكانس، شاشات...",
    placeholder_branch_tr: "Örn: Telefon Tamiri, Laptop Tamiri, Süpürge...",
    placeholder_branch_en: "e.g. Phone Repair, Laptop Repair, Vacuums...",
    branch_name_required: "يرجى تحديد أو كتابة اسم الفرع الرئيسي.",
    label_brand: "الماركة",
    placeholder_brand: "مثال: Apple, Samsung, Xiaomi",
    label_series: "اسم الفئة",
    placeholder_series: "مثال: فئة iPhone 16",
    label_model: "اسم الموديل",
    placeholder_model: "مثال: iPhone 16 Pro Max",
    label_service_type: "اسم الخدمة أو نوع العطل / المنتج",
    label_service_tr: "اسم الخدمة / المنتج (تركي - TR)",
    label_service_en: "اسم الخدمة / المنتج (إنجليزي - EN)",
    label_service_ar: "اسم الخدمة / المنتج (عربي - AR)",
    label_base_price: "السعر الأساسي (₺)",
    label_duration: "مدة الصيانة",
    placeholder_duration: "مثال: 30 دقيقة",
    label_warranty: "مدة الضمان",
    placeholder_warranty: "مثال: ضمان 6 أشهر",
    quality_section_title: "خيارات جودة القطع والأسعار (شاشات أصلية، تجارية، إلخ)",
    quality_section_sub: "يمكنك إضافة خيارات جودة متعددة مع ترجمتها والأسعار والشارات الترويجية",
    add_quality_btn: "إضافة خيار جودة +",
    label_quality_name_ar: "اسم الجودة (عربي)",
    label_quality_name_tr: "اسم الجودة (تركي)",
    label_quality_name_en: "اسم الجودة (إنجليزي)",
    placeholder_quality_ar: "مثال: شاشة وكالة سيرفس أصلية",
    placeholder_quality_tr: "Örn: Orijinal Servis Ekran",
    placeholder_quality_en: "e.g. Original Service Pack Screen",
    placeholder_price: "السعر ₺",
    placeholder_badge: "شارة (مثال: الخيار الأفضل)",
    remove_quality: "حذف",
    empty_qualities: "لم تتم إضافة خيارات جودة بعد. سيتم اعتماد السعر الأساسي فقط في الموقع.",
    popular_checkbox: "موديل مميز / الأكثر طلباً (Popüler)",
    in_stock_checkbox: "القطعة متوفرة بالمخزون حالياً",
    cancel_btn: "إلغاء",
    save_edit_btn: "حفظ التعديلات",
    save_add_btn: "حفظ وإضافة الموديل",
    model_name_required: "يرجى إدخال اسم الموديل.",
    update_success: "تم تحديث بيانات وسعر الموديل بنجاح!",
    add_success: "تمت إضافة تسعيرة الموديل الجديد بنجاح!",
    save_error: "حدث خطأ أثناء حفظ البيانات.",
    delete_confirm: "هل أنت متأكد من رغبتك في حذف تسعيرة هذا الموديل؟",
    delete_confirm_title: "تأكيد حذف تسعيرة الموديل",
    delete_confirm_desc: "هل أنت متأكد تماماً من رغبتك في حذف تسعيرة موديل ({model})؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.",
    delete_confirm_btn: "نعم، احذف التسعيرة",
    delete_success: "تم حذف السجل بنجاح.",
    delete_error: "فشلت عملية الحذف.",
    seed_confirm: "هل ترغب في تحميل وتثبيت قائمة أسعار الكتالوج الافتراضية؟",
    seed_confirm_title: "تحميل الكتالوج الافتراضي",
    seed_confirm_desc: "هل ترغب في تحميل وتثبيت قائمة أسعار وموديلات الكتالوج الافتراضية في قاعدة البيانات؟",
    seed_confirm_btn: "نعم، تحميل وتثبيت",
    seed_success: "تم تحميل الأسعار الافتراضية بنجاح!",
    seed_error: "حدث خطأ أثناء تحميل الأسعار الافتراضية.",
    clear_all_btn: "مسح القوالب الافتراضية",
    clear_all_tooltip: "حذف وتفريغ سجلات القوالب الافتراضية من قاعدة البيانات لتجهيزها للرفع أو البدء من جديد",
    clear_all_confirm_title: "تأكيد مسح القوالب الافتراضية",
    clear_all_confirm_desc: "هل أنت متأكد تماماً من رغبتك في مسح وحذف القوالب الافتراضية ({count} سجل)؟ سيتم تفريغ الجدول لتتمكن من إضافة أسعارك الخاصة قبل رفع الموقع.",
    clear_all_confirm_btn: "نعم، امسح القوالب الافتراضية",
    clear_all_success: "تم مسح القوالب الافتراضية بنجاح!",
    clear_all_error: "حدث خطأ أثناء مسح القوالب الافتراضية.",
    pagination_showing: "عرض {start} إلى {end} من أصل {total} موديل",
    pagination_per_page: "لكل صفحة:",
    prev_page: "السابق",
    next_page: "التالي"
  },
  en: {
    dashboard_overview: "Overview",
    page_title: "Products & Pricing Management",
    records_count: "Records",
    load_defaults: "Load Default Catalog",
    load_defaults_tooltip: "Loads and initializes default prices for iPhone, Samsung, and other models",
    add_new_model: "Add New Product +",
    search_placeholder: "Search by model name, series or brand (e.g. 15 Pro, S24, iPhone 16)...",
    all_brands: "All Brands",
    all_branches: "All Main Branches",
    all_services: "All Services",
    th_model_series: "Model, Series & Photo",
    th_brand: "Brand",
    th_branch: "Main Branch",
    th_service: "Service / Operation",
    th_base_price: "Starting Price",
    th_qualities: "Quality Options",
    th_warranty: "Official Warranty",
    th_status: "Status",
    th_actions: "Actions",
    popular_badge: "Popular",
    in_stock: "In Stock",
    out_of_stock: "Out of Stock",
    single_price: "Single Price",
    edit_tooltip: "Edit Product & Pricing",
    delete_tooltip: "Delete Product",
    loading_data: "Loading products & pricing data...",
    no_records: "No records found matching your search.",
    modal_edit_title: "Edit Product & Pricing",
    modal_add_title: "Add New Product Pricing",
    image_section_title: "Product Photo (Optional)",
    image_section_sub: "Upload product photo or provide an external image URL to display on the pricing list",
    upload_image_btn: "Upload Photo from Device",
    uploading_image: "Uploading image...",
    remove_image: "Remove Photo",
    image_url_placeholder: "Or paste image direct URL...",
    label_main_branch: "Main Branch / Category",
    select_branch_placeholder: "-- Select Main Branch --",
    new_branch_option: "+ Create New Main Branch",
    custom_branch_box_title: "New Main Branch Details",
    label_branch_ar: "Branch Name (AR)",
    label_branch_tr: "Branch Name (TR)",
    label_branch_en: "Branch Name (EN)",
    placeholder_branch_ar: "e.g. Phone Repair, Laptop Repair, Vacuums...",
    placeholder_branch_tr: "Örn: Telefon Tamiri, Laptop Tamiri, Süpürge...",
    placeholder_branch_en: "e.g. Phone Repair, Laptop Repair, Vacuums...",
    branch_name_required: "Please select or enter the main branch name.",
    label_brand: "Brand",
    placeholder_brand: "e.g. Apple, Samsung, Xiaomi",
    label_series: "Series Name",
    placeholder_series: "e.g. iPhone 16 Series",
    label_model: "Model Name",
    placeholder_model: "e.g. iPhone 16 Pro Max",
    label_service_type: "Service / Operation / Product Name",
    label_service_tr: "Service Name (TR)",
    label_service_en: "Service Name (EN)",
    label_service_ar: "Service Name (AR)",
    label_base_price: "Starting Price (₺)",
    label_duration: "Repair Duration",
    placeholder_duration: "e.g. 30 Minutes",
    label_warranty: "Warranty Period",
    placeholder_warranty: "e.g. 6 Months Warranty",
    quality_section_title: "Part Quality & Price Options",
    quality_section_sub: "Configure multiple quality options with multilingual names and badges",
    add_quality_btn: "Add Quality Option +",
    label_quality_name_ar: "Quality Name (AR)",
    label_quality_name_tr: "Quality Name (TR)",
    label_quality_name_en: "Quality Name (EN)",
    placeholder_quality_ar: "e.g. شاشة وكالة سيرفس أصلية",
    placeholder_quality_tr: "Örn: Orijinal Servis Ekran",
    placeholder_quality_en: "e.g. Original Service Pack Screen",
    placeholder_price: "Price ₺",
    placeholder_badge: "Badge (e.g. Best Choice)",
    remove_quality: "Remove",
    empty_qualities: "No quality options added yet. Only the starting base price will be displayed on the website.",
    popular_checkbox: "Popular / Featured Model",
    in_stock_checkbox: "Part In Stock",
    cancel_btn: "Cancel",
    save_edit_btn: "Save Changes",
    save_add_btn: "Save & Add Model",
    model_name_required: "Please enter the model name.",
    update_success: "Pricing record updated successfully!",
    add_success: "New pricing record added successfully!",
    save_error: "An error occurred while saving.",
    delete_confirm: "Are you sure you want to delete this pricing record?",
    delete_confirm_title: "Confirm Model Pricing Deletion",
    delete_confirm_desc: "Are you sure you want to delete the pricing record for ({model})? This action cannot be undone.",
    delete_confirm_btn: "Yes, Delete Record",
    delete_success: "Record deleted successfully.",
    delete_error: "Failed to delete record.",
    seed_confirm: "Do you want to load the default pricing catalog?",
    seed_confirm_title: "Load Default Catalog",
    seed_confirm_desc: "Do you want to load and initialize the default pricing catalog models into the database?",
    seed_confirm_btn: "Yes, Load Defaults",
    seed_success: "Default prices loaded successfully!",
    seed_error: "Error loading default prices.",
    clear_all_btn: "Clear Default Templates",
    clear_all_tooltip: "Deletes and clears default template records from database before going to production or starting fresh",
    clear_all_confirm_title: "Confirm Deleting Default Templates",
    clear_all_confirm_desc: "Are you absolutely sure you want to delete default templates ({count} records)? The table will be cleared so you can add your own prices before production.",
    clear_all_confirm_btn: "Yes, Clear Default Templates",
    clear_all_success: "Default templates cleared successfully!",
    clear_all_error: "Error clearing default templates.",
    pagination_showing: "Showing {start} to {end} of {total} models",
    pagination_per_page: "Per page:",
    prev_page: "Previous",
    next_page: "Next"
  },
  tr: {
    dashboard_overview: "Genel Bakış",
    page_title: "Ürünler ve Fiyatlar Yönetimi",
    records_count: "Kayıt",
    load_defaults: "Varsayılanları Yükle",
    load_defaults_tooltip: "iPhone 16, 15, 14, 13, Samsung S24 gibi modelleri hazır yükler",
    add_new_model: "Yeni Ürün / Model Ekle +",
    search_placeholder: "Model adı, seri veya marka ile ara (örn: 15 Pro, S24, iPhone 16)...",
    all_brands: "Tüm Markalar",
    all_branches: "Tüm Ana Branşlar",
    all_services: "Tüm Hizmetler",
    th_model_series: "Model, Seri & Görsel",
    th_brand: "Marka",
    th_branch: "Ana Branş",
    th_service: "Hizmet / İşlem",
    th_base_price: "Başlangıç Fiyatı",
    th_qualities: "Kalite Seçenekleri",
    th_warranty: "Resmi Garanti",
    th_status: "Durum",
    th_actions: "İşlem",
    popular_badge: "Popüler",
    in_stock: "Stokta",
    out_of_stock: "Tükendi",
    single_price: "Tek Fiyat",
    edit_tooltip: "Düzenle",
    delete_tooltip: "Sil",
    loading_data: "Fiyat verileri yükleniyor...",
    no_records: "Aramaya uygun kayıt bulunamadı.",
    modal_edit_title: "Ürün ve Fiyat Düzenle",
    modal_add_title: "Yeni Ürün ve Fiyat Ekle",
    image_section_title: "Cihaz Görseli (İsteğe Bağlı)",
    image_section_sub: "Fiyat listesinde cihazın fotoğrafını göstermek için yükleyin veya URL girin",
    upload_image_btn: "Cihazdan Resim Yükle",
    uploading_image: "Resim yükleniyor...",
    remove_image: "Görseli Kaldır",
    image_url_placeholder: "Veya doğrudan resim bağlantısını yapıştırın (URL)...",
    label_main_branch: "Ana Branş / Genel Kategori",
    select_branch_placeholder: "-- Ana Branş Seçin --",
    new_branch_option: "+ Yeni Ana Branş Oluştur",
    custom_branch_box_title: "Yeni Ana Branş Bilgileri",
    label_branch_ar: "Branş Adı (AR)",
    label_branch_tr: "Branş Adı (TR)",
    label_branch_en: "Branş Adı (EN)",
    placeholder_branch_ar: "Örn: صيانة الهواتف، صيانة اللابتوب، المكانس...",
    placeholder_branch_tr: "Örn: Telefon Tamiri, Laptop Tamiri, Süpürge...",
    placeholder_branch_en: "e.g. Phone Repair, Laptop Repair, Vacuums...",
    branch_name_required: "Lütfen bir ana branş seçin veya girin.",
    label_brand: "Marka",
    placeholder_brand: "Örn: Apple, Samsung",
    label_series: "Seri Adı",
    placeholder_series: "Örn: iPhone 16 Serisi",
    label_model: "Model Adı",
    placeholder_model: "Örn: iPhone 16 Pro Max",
    label_service_type: "Hizmet / İşlem / Ürün Adı",
    label_service_tr: "Hizmet / Ürün Adı (TR)",
    label_service_en: "Service Name (EN)",
    label_service_ar: "اسم الخدمة / المنتج (AR)",
    label_base_price: "Başlangıç Fiyatı (₺)",
    label_duration: "Tamir Süresi",
    placeholder_duration: "Örn: 30 Dakika",
    label_warranty: "Garanti Süresi",
    placeholder_warranty: "Örn: 6 Ay Garanti",
    quality_section_title: "Parça Kalitesi & Fiyat Seçenekleri",
    quality_section_sub: "Orijinal Servis, Orijinal Uyarısız, Yan Sanayi vb. seçenekler",
    add_quality_btn: "Kalite Ekle +",
    label_quality_name_ar: "Kalite Adı (AR)",
    label_quality_name_tr: "Kalite Adı (TR)",
    label_quality_name_en: "Quality Name (EN)",
    placeholder_quality_ar: "Örn: شاشة وكالة سيرفس أصلية",
    placeholder_quality_tr: "Örn: Orijinal Servis Ekran",
    placeholder_quality_en: "e.g. Original Service Pack Screen",
    placeholder_price: "Fiyat ₺",
    placeholder_badge: "Rozet (Örn: En Çok Satan)",
    remove_quality: "Kaldır",
    empty_qualities: "Henüz kalite seçeneği eklenmedi. Sadece başlangıç fiyatı gösterilecek.",
    popular_checkbox: "Popüler / Öne Çıkan Model",
    in_stock_checkbox: "Parça Stokta Var",
    cancel_btn: "İptal",
    save_edit_btn: "Değişiklikleri Kaydet",
    save_add_btn: "Kaydet ve Ekle",
    model_name_required: "Lütfen model adını giriniz.",
    update_success: "Fiyat kaydı başarıyla güncellendi!",
    add_success: "Yeni fiyat kaydı başarıyla eklendi!",
    save_error: "Kayıt kaydedilirken bir hata oluştu.",
    delete_confirm: "Bu modelin fiyat kaydını silmek istediğinize emin misiniz?",
    delete_confirm_title: "Model Fiyat Kaydını Silmeyi Onayla",
    delete_confirm_desc: "({model}) modelinin fiyat kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    delete_confirm_btn: "Evet, Kaydı Sil",
    delete_success: "Kayıt silindi.",
    delete_error: "Silme işlemi başarısız oldu.",
    seed_confirm: "Varsayılan katalog fiyatlarını yüklemek istiyor musunuz?",
    seed_confirm_title: "Varsayılan Kataloğu Yükle",
    seed_confirm_desc: "Varsayılan katalog fiyatlarını ve modellerini veritabanına yüklemek istiyor musunuz?",
    seed_confirm_btn: "Evet, Yükle",
    seed_success: "Varsayılan fiyatlar yüklendi!",
    seed_error: "Varsayılanlar yüklenirken hata oluştu.",
    clear_all_btn: "Varsayılan Şablonları Sil",
    clear_all_tooltip: "Canlıya almadan önce veya sıfırdan başlamak için varsayılan şablon kayıtlarını veritabanından siler",
    clear_all_confirm_title: "Varsayılan Şablonları Silmeyi Onayla",
    clear_all_confirm_desc: "Varsayılan şablonları ({count} kayıt) silmek istediğinizden kesinlikle emin misiniz? Canlıya geçmeden önce kendi fiyatlarınızı eklemek üzere tablo boşaltılacaktır.",
    clear_all_confirm_btn: "Evet, Varsayılan Şablonları Sil",
    clear_all_success: "Varsayılan şablonlar başarıyla silindi!",
    clear_all_error: "Şablonlar silinirken hata oluştu.",
    pagination_showing: "{total} modelden {start} - {end} arası gösteriliyor",
    pagination_per_page: "Sayfa başına:",
    prev_page: "Önceki",
    next_page: "Sonraki"
  }
};

export default function AdminPricingPage() {
  const locale = (useLocale() as 'ar' | 'en' | 'tr') || 'tr';
  const d = dict[locale] || dict.tr;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<PricingItem[]>([]);
  const [systemServices, setSystemServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PricingItem | null>(null);
  const [editingItem, setEditingItem] = useState<PricingItem | null>(null);

  // Branch customization states
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [customBranch, setCustomBranch] = useState({
    ar: '',
    tr: '',
    en: ''
  });

  // Spare part type customization state
  const [isCustomPartType, setIsCustomPartType] = useState(false);

  // Main Category Cards Customization States (Phones, Laptops, etc.)
  const [mainTab, setMainTab] = useState<'pricing' | 'categories'>('pricing');
  const [categoryCards, setCategoryCards] = useState<any[]>(STORE_CATEGORIES);
  const [savingCategoryCards, setSavingCategoryCards] = useState(false);
  const [uploadingCatId, setUploadingCatId] = useState<string | null>(null);
  const [uploadingCatBannerId, setUploadingCatBannerId] = useState<string | null>(null);
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [uploadingNewCatImage, setUploadingNewCatImage] = useState(false);
  const [uploadingNewCatBanner, setUploadingNewCatBanner] = useState(false);
  const newCatFileInputRef = useRef<HTMLInputElement>(null);
  const newCatBannerFileInputRef = useRef<HTMLInputElement>(null);
  const editCatFileInputRef = useRef<HTMLInputElement>(null);
  const editCatBannerFileInputRef = useRef<HTMLInputElement>(null);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [isEditCatModalOpen, setIsEditCatModalOpen] = useState(false);
  const [uploadingEditCatImage, setUploadingEditCatImage] = useState(false);
  const [uploadingEditCatBanner, setUploadingEditCatBanner] = useState(false);
  const [newCat, setNewCat] = useState({
    id: '',
    title_ar: '',
    title_tr: '',
    title_en: '',
    desc_ar: '',
    desc_tr: '',
    desc_en: '',
    image: '',
    banner_image: '',
    banner_title_ar: '',
    banner_title_tr: '',
    banner_title_en: '',
    banner_desc_ar: '',
    banner_desc_tr: '',
    banner_desc_en: '',
    banner_cta_ar: '',
    banner_cta_tr: '',
    banner_cta_en: ''
  });

  // Pagination states for high performance
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  const [form, setForm] = useState({
    brand: 'Apple',
    device_type: 'phone',
    item_type: 'yedek_parca' as 'cihaz' | 'yedek_parca' | 'aksesuar' | 'servis',
    part_type: 'ekran',
    specs_tr: '',
    specs_en: '',
    specs_ar: '',
    category_name_tr: '',
    category_name_en: '',
    category_name_ar: '',
    series: '',
    model_name: '',
    service_slug: '',
    service_name_tr: '',
    service_name_en: '',
    service_name_ar: '',
    base_price: 1000,
    currency: '₺',
    duration: '30 Dakika',
    warranty: '6 Ay Garanti',
    is_popular: false,
    in_stock: true,
    sort_order: 1,
    notes_tr: '',
    notes_en: '',
    notes_ar: '',
    image_url: '',
    quality_options: [] as QualityOption[]
  });

  const router = useRouter();

  const fetchItems = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_BASE}/pricing/admin-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data as PricingItem[]);
    } catch (err: any) {
      console.error('Error fetching pricing items:', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/trt-secure-panel-2026/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/content/services/admin-all`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => axios.get(`${API_BASE}/content/services`));
      if (Array.isArray(res.data)) {
        setSystemServices(res.data);
      }
    } catch (err) {
      console.error('Error fetching system services:', err);
    }
  };

  // Available Categories (Derived directly from dynamic categoryCards - 100% dynamic single source of truth!)
  const availableBranches = useMemo(() => {
    return categoryCards.map(c => ({
      slug: c.id,
      name_ar: c.title_ar || c.title_tr || c.id,
      name_tr: c.title_tr || c.title_ar || c.id,
      name_en: c.title_en || c.title_tr || c.id,
      image: c.image || '',
      desc_ar: c.desc_ar || '',
      desc_tr: c.desc_tr || '',
      desc_en: c.desc_en || '',
    }));
  }, [categoryCards]);

  const categoryProductCounts = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(item => {
      const slug = (item.device_type === 'phone' ? 'telefon' : (item.device_type || '')).toLowerCase();
      map.set(slug, (map.get(slug) || 0) + 1);
    });
    return map;
  }, [items]);

  const getLocalizedBranchName = (item: PricingItem) => {
    const slug = (item.device_type || '').toLowerCase().trim();
    if (slug === 'phone') {
      const tel = availableBranches.find(b => b.slug === 'telefon' || b.slug === 'phone');
      if (tel) return locale === 'ar' ? tel.name_ar : locale === 'en' ? tel.name_en : tel.name_tr;
    }
    const found = availableBranches.find(b => b.slug.toLowerCase() === slug);
    if (found) {
      return locale === 'ar' ? found.name_ar : locale === 'en' ? found.name_en : found.name_tr;
    }
    if (locale === 'ar') return item.category_name_ar || item.category_name_tr || slug;
    if (locale === 'en') return item.category_name_en || item.category_name_tr || slug;
    return item.category_name_tr || item.category_name_ar || slug;
  };

  const defaultPartTypes = [
    { slug: 'ekran', label_ar: 'شاشات (Ekran)', label_tr: 'Ekran', label_en: 'Screen' },
    { slug: 'batarya', label_ar: 'بطاريات (Batarya)', label_tr: 'Batarya', label_en: 'Battery' },
    { slug: 'sarj_soketi', label_ar: 'منفذ شحن (Şarj Soketi)', label_tr: 'Şarj Soketi', label_en: 'Charging Port' },
    { slug: 'arka_kapak', label_ar: 'غطاء خلفي (Arka Kapak)', label_tr: 'Arka Kapak', label_en: 'Back Cover' },
    { slug: 'kamera', label_ar: 'كاميرات (Kamera)', label_tr: 'Kamera', label_en: 'Camera' },
    { slug: 'hoparlor', label_ar: 'سبيكر ومكبر صوت (Hoparlör)', label_tr: 'Hoparlör', label_en: 'Speaker' },
    { slug: 'mikrofon', label_ar: 'ميكروفون (Mikrofon)', label_tr: 'Mikrofon', label_en: 'Microphone' },
    { slug: 'yan_tuslar', label_ar: 'أزرار جانبية (Yan Tuşlar)', label_tr: 'Yan Tuşlar', label_en: 'Side Buttons' },
    { slug: 'flex', label_ar: 'كابلات فليكس (Flex Kablolar)', label_tr: 'Flex Kablolar', label_en: 'Flex Cable' },
    { slug: 'anakart', label_ar: 'قطع مذربورد (Anakart)', label_tr: 'Anakart Parçaları', label_en: 'Motherboard' },
    { slug: 'diger', label_ar: 'قطع أخرى (Diğer)', label_tr: 'Diğer Parçalar', label_en: 'Other' },
  ];

  const availablePartTypes = useMemo(() => {
    const map = new Map<string, { slug: string; label: string }>();
    defaultPartTypes.forEach(p => {
      const label = locale === 'ar' ? p.label_ar : locale === 'en' ? p.label_en : p.label_tr;
      map.set(p.slug.toLowerCase(), { slug: p.slug, label });
    });

    items.forEach(item => {
      if (item.part_type && item.part_type.trim()) {
        const slug = item.part_type.trim();
        const slugLower = slug.toLowerCase();
        if (!map.has(slugLower)) {
          map.set(slugLower, { slug, label: slug });
        }
      }
    });

    return Array.from(map.values());
  }, [items, locale]);

  useEffect(() => {
    fetchItems();
    fetchSystemServices();
    
    // Fetch dynamic category cards from settings
    const fetchCategoryCards = async () => {
      try {
        const res: any = await axios.get(`${API_BASE}/settings`);
        if (res.data?.shop_categories) {
          const parsed = typeof res.data.shop_categories === 'string'
            ? JSON.parse(res.data.shop_categories)
            : res.data.shop_categories;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategoryCards(parsed);
          }
        }
      } catch (e) {}
    };
    fetchCategoryCards();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBrand, selectedBranch, selectedService, selectedTypeFilter, pageSize]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsCustomBranch(false);
    setCustomBranch({ ar: '', tr: '', en: '' });
    setIsCustomPartType(false);

    const firstBranch = availableBranches[0] || { slug: 'phone', name_ar: 'صيانة الهواتف', name_tr: 'Telefon Tamiri', name_en: 'Phone Repair' };

    setForm({
      brand: 'Apple',
      device_type: firstBranch.slug,
      item_type: 'yedek_parca',
      part_type: 'ekran',
      specs_tr: '',
      specs_en: '',
      specs_ar: '',
      category_name_tr: firstBranch.name_tr,
      category_name_en: firstBranch.name_en,
      category_name_ar: firstBranch.name_ar,
      series: '',
      model_name: '',
      service_slug: '',
      service_name_tr: '',
      service_name_en: '',
      service_name_ar: '',
      base_price: 1000,
      currency: '₺',
      duration: locale === 'ar' ? '30 دقيقة' : locale === 'en' ? '30 Minutes' : '30 Dakika',
      warranty: locale === 'ar' ? 'ضمان 6 أشهر' : locale === 'en' ? '6 Months Warranty' : '6 Ay Garanti',
      is_popular: false,
      in_stock: true,
      sort_order: (items.length + 1),
      notes_tr: '',
      notes_en: '',
      notes_ar: '',
      image_url: '',
      quality_options: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PricingItem) => {
    setEditingItem(item);
    const slug = (item.device_type || 'phone').toLowerCase();
    const isKnown = availableBranches.some(b => b.slug === slug);
    if (!isKnown) {
      setIsCustomBranch(true);
      setCustomBranch({
        ar: item.category_name_ar || '',
        tr: item.category_name_tr || '',
        en: item.category_name_en || ''
      });
    } else {
      setIsCustomBranch(false);
      setCustomBranch({
        ar: item.category_name_ar || '',
        tr: item.category_name_tr || '',
        en: item.category_name_en || ''
      });
    }

    const partType = (item.part_type || '').trim();
    const isStandardPart = defaultPartTypes.some(p => p.slug.toLowerCase() === partType.toLowerCase());
    setIsCustomPartType(!isStandardPart && Boolean(partType));

    setForm({
      brand: item.brand,
      device_type: item.device_type || 'phone',
      item_type: item.item_type || 'yedek_parca',
      part_type: item.part_type || 'ekran',
      specs_tr: item.specs_tr || '',
      specs_en: item.specs_en || '',
      specs_ar: item.specs_ar || '',
      category_name_tr: item.category_name_tr || '',
      category_name_en: item.category_name_en || '',
      category_name_ar: item.category_name_ar || '',
      series: item.series,
      model_name: item.model_name,
      service_slug: item.service_slug,
      service_name_tr: item.service_name_tr,
      service_name_en: item.service_name_en,
      service_name_ar: item.service_name_ar || '',
      base_price: item.base_price,
      currency: item.currency,
      duration: item.duration,
      warranty: item.warranty,
      is_popular: item.is_popular,
      in_stock: item.in_stock,
      sort_order: item.sort_order,
      notes_tr: item.notes_tr || '',
      notes_en: item.notes_en || '',
      notes_ar: item.notes_ar || '',
      image_url: item.image_url || '',
      quality_options: Array.isArray(item.quality_options) && item.quality_options.length > 0 
        ? item.quality_options.map(q => ({
            quality_tr: q.quality_tr || '',
            quality_en: q.quality_en || '',
            quality_ar: q.quality_ar || '',
            price: q.price || 0,
            badge: q.badge || '',
            available: q.available ?? true
          }))
        : []
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setForm(prev => ({ ...prev, image_url: res.data.url }));
        toast.success(locale === 'ar' ? 'تم رفع صورة الجهاز بنجاح!' : locale === 'en' ? 'Device image uploaded successfully!' : 'Cihaz görseli başarıyla yüklendi!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(locale === 'ar' ? 'فشل رفع الصورة' : locale === 'en' ? 'Upload failed' : 'Resim yükleme başarısız');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model_name.trim()) {
      toast.error(locale === 'ar' ? 'يرجى كتابة اسم المنتج أو الموديل' : d.model_name_required);
      return;
    }

    const modelName = form.model_name.trim();
    const brandName = form.brand.trim() || 'General';

    // Auto-fill multilingual names if left empty
    const arName = (form.service_name_ar || '').trim() || modelName;
    const trName = (form.service_name_tr || '').trim() || modelName;
    const enName = (form.service_name_en || '').trim() || modelName;

    // Series auto-fallback
    const seriesName = (form.series || '').trim() || `${brandName} ${modelName}`;

    // Category resolution from availableBranches (categoryCards)
    let branchSlug = form.device_type || 'telefon';
    let branchNameAr = form.category_name_ar || '';
    let branchNameTr = form.category_name_tr || '';
    let branchNameEn = form.category_name_en || '';

    const matchedBranch = availableBranches.find(b => b.slug === branchSlug);
    if (matchedBranch) {
      branchNameAr = matchedBranch.name_ar;
      branchNameTr = matchedBranch.name_tr;
      branchNameEn = matchedBranch.name_en;
    } else if (!branchNameAr) {
      branchNameAr = branchSlug;
      branchNameTr = branchSlug;
      branchNameEn = branchSlug;
    }

    // Auto-generate slug from English or Turkish or Model
    let slug = (form.service_slug || '').trim();
    if (!slug) {
      slug = (enName || trName || modelName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;
    }

    const payload = {
      ...form,
      brand: brandName,
      series: seriesName,
      model_name: modelName,
      device_type: branchSlug,
      category_name_ar: branchNameAr,
      category_name_tr: branchNameTr,
      category_name_en: branchNameEn,
      service_slug: slug,
      service_name_tr: trName,
      service_name_en: enName,
      service_name_ar: arName,
    };

    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      if (editingItem) {
        await axios.put(`${API_BASE}/pricing/${editingItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(d.update_success);
      } else {
        await axios.post(`${API_BASE}/pricing`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(d.add_success);
      }

      // If a custom branch was created, optionally save it as a system service
      if (isCustomBranch) {
        try {
          await axios.post(`${API_BASE}/content/services`, {
            slug: branchSlug,
            title_ar: branchNameAr,
            title_tr: branchNameTr,
            title_en: branchNameEn,
            description_ar: `خدمات ومنتجات قسم ${branchNameAr}`,
            description_tr: `${branchNameTr} hizmetleri ve ürünleri`,
            description_en: `${branchNameEn} services and products`,
            icon: 'Layers',
            is_active: true,
            sort_order: availableBranches.length + 1
          }, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => {});
          fetchSystemServices();
        } catch (e) {}
      }

      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error('Error saving pricing:', err);
      toast.error(d.save_error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/pricing/${deletingItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(d.delete_success);
      setDeletingItem(null);
      fetchItems();
    } catch (err) {
      console.error('Error deleting pricing:', err);
      toast.error(d.delete_error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/pricing/seed-defaults`, { force: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success((res.data as any)?.message || d.seed_success);
      setIsSeedModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error('Error seeding defaults:', err);
      toast.error(d.seed_error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAll = async () => {
    const token = localStorage.getItem('token');
    setActionLoading(true);
    try {
      await axios.delete(`${API_BASE}/pricing/clear-all/all-records`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(d.clear_all_success);
      setIsClearAllModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error('Error clearing all pricing items:', err);
      toast.error(d.clear_all_error);
    } finally {
      setActionLoading(false);
    }
  };

  // Quality option helpers
  const handleAddQuality = () => {
    setForm(prev => ({
      ...prev,
      quality_options: [
        ...prev.quality_options,
        { 
          quality_ar: 'شاشة وكالة سيرفس أصلية', 
          quality_tr: 'Yeni Kalite Seçeneği', 
          quality_en: 'New Quality Option', 
          price: prev.base_price, 
          badge: '' 
        }
      ]
    }));
  };

  const handleRemoveQuality = (idx: number) => {
    setForm(prev => ({
      ...prev,
      quality_options: prev.quality_options.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateQuality = (idx: number, field: keyof QualityOption, value: any) => {
    setForm(prev => {
      const updated = [...prev.quality_options];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, quality_options: updated };
    });
  };

  // Helper localization for series
  const getLocalizedSeries = (series: string) => {
    if (!series) return '';
    if (locale === 'ar') {
      if (series.toLowerCase().includes('diğer') || series.toLowerCase().includes('other')) return 'موديلات أخرى';
      if (series.includes('Serisi')) return `فئة ${series.replace(/Serisi/i, '').trim()}`;
      if (series.startsWith('سلسلة')) return series.replace(/^سلسلة\s*/, 'فئة ');
      return series;
    }
    if (locale === 'en') {
      if (series.toLowerCase().includes('diğer')) return 'Other Models';
      if (series.includes('Serisi')) return `${series.replace(/Serisi/i, '').trim()} Series`;
      return series;
    }
    return series;
  };

  const getLocalizedDuration = (dur: string) => {
    if (!dur) return '';
    if (locale === 'ar') {
      return dur.replace(/(\d+)\s*Dakika/gi, '$1 دقيقة').replace(/(\d+)\s*Saat/gi, '$1 ساعة');
    }
    if (locale === 'en') {
      return dur.replace(/(\d+)\s*Dakika/gi, '$1 Minutes').replace(/(\d+)\s*Saat/gi, '$1 Hours');
    }
    return dur;
  };

  const getLocalizedWarranty = (war: string) => {
    if (!war) return '';
    if (locale === 'ar') {
      return war.replace(/(\d+)\s*Ay Garanti/gi, 'ضمان $1 أشهر').replace(/1 Yıl Garanti/gi, 'ضمان سنة واحدة');
    }
    if (locale === 'en') {
      return war.replace(/(\d+)\s*Ay Garanti/gi, '$1 Months Warranty').replace(/1 Yıl Garanti/gi, '1 Year Warranty');
    }
    return war;
  };

  // Category Card Handlers
  const handleCategoryCardImageUpload = async (catId: string, file: File) => {
    setUploadingCatId(catId);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setCategoryCards(prev => prev.map(c => c.id === catId ? { ...c, image: res.data.url } : c));
        toast.success(locale === 'ar' ? 'تم رفع صورة كرت القسم بنجاح! لا تنسَ الضغط على زر حفظ التعديلات.' : 'Kategori görseli yüklendi! Kaydet butonuna basmayı unutmayın.');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل رفع الصورة' : 'Resim yükleme başarısız');
    } finally {
      setUploadingCatId(null);
    }
  };

  const handleCategoryBannerUpload = async (catId: string, file: File) => {
    setUploadingCatBannerId(catId);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setCategoryCards(prev => prev.map(c => c.id === catId ? { ...c, banner_image: res.data.url } : c));
        toast.success(locale === 'ar' ? 'تم رفع صورة بانر القسم بنجاح! لا تنسَ الضغط على زر حفظ التعديلات.' : 'Kategori bannerı yüklendi! Kaydet butonuna basmayı unutmayın.');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل رفع صورة البانر' : 'Banner yükleme başarısız');
    } finally {
      setUploadingCatBannerId(null);
    }
  };

  const handleSaveCategoryCards = async () => {
    setSavingCategoryCards(true);
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/settings`, {
        shop_categories: JSON.stringify(categoryCards)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(locale === 'ar' ? 'تم حفظ صور وبنرات وبيانات أقسام المتجر بنجاح!' : 'Kategori kartları ve bannerları kaydedildi!');
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل حفظ التعديلات' : 'Kaydetme hatası');
    } finally {
      setSavingCategoryCards(false);
    }
  };

  const handleNewCatImageUpload = async (file: File) => {
    setUploadingNewCatImage(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setNewCat(prev => ({ ...prev, image: res.data.url }));
        toast.success(locale === 'ar' ? 'تم رفع صورة كرت القسم بنجاح!' : 'Kategori görseli yüklendi!');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل رفع الصورة' : 'Resim yükleme başarısız');
    } finally {
      setUploadingNewCatImage(false);
    }
  };

  const handleNewCatBannerImageUpload = async (file: File) => {
    setUploadingNewCatBanner(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setNewCat(prev => ({ ...prev, banner_image: res.data.url }));
        toast.success(locale === 'ar' ? 'تم رفع صورة بانر القسم بنجاح!' : 'Kategori banner görseli yüklendi!');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل رفع صورة البانر' : 'Banner yükleme başarısız');
    } finally {
      setUploadingNewCatBanner(false);
    }
  };

  const handleAddNewCategory = async () => {
    const arTitle = newCat.title_ar.trim();
    if (!arTitle) {
      toast.error(locale === 'ar' ? 'يرجى كتابة اسم القسم' : 'Lütfen kategori adını giriniz');
      return;
    }
    let idClean = newCat.id.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    if (!idClean) {
      const base = (newCat.title_en || newCat.title_tr || '').trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_');
      idClean = base || `cat_${Date.now()}`;
    }
    const catImage = newCat.image || '/images/phones-category.jpg';
    const catBanner = newCat.banner_image || catImage || '/images/phones-banner.jpg';

    const newItem = {
      id: idClean,
      title_ar: arTitle,
      title_tr: newCat.title_tr.trim() || arTitle,
      title_en: newCat.title_en.trim() || arTitle,
      desc_ar: newCat.desc_ar.trim() || '',
      desc_tr: newCat.desc_tr.trim() || '',
      desc_en: newCat.desc_en.trim() || '',
      image: catImage,
      banner_image: catBanner,
      banner_title_ar: newCat.banner_title_ar.trim() || arTitle,
      banner_title_tr: newCat.banner_title_tr.trim() || newCat.title_tr.trim() || arTitle,
      banner_title_en: newCat.banner_title_en.trim() || newCat.title_en.trim() || arTitle,
      banner_desc_ar: newCat.banner_desc_ar.trim() || newCat.desc_ar.trim() || '',
      banner_desc_tr: newCat.banner_desc_tr.trim() || newCat.desc_tr.trim() || '',
      banner_desc_en: newCat.banner_desc_en.trim() || newCat.desc_en.trim() || '',
      banner_cta_ar: newCat.banner_cta_ar.trim() || 'استعراض منتجات القسم',
      banner_cta_tr: newCat.banner_cta_tr.trim() || 'Ürünleri İncele',
      banner_cta_en: newCat.banner_cta_en.trim() || 'Explore Products',
    };

    const updatedList = [...categoryCards, newItem];
    setCategoryCards(updatedList);

    // Auto-save to backend settings immediately
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/settings`, {
        shop_categories: JSON.stringify(updatedList)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Error auto-saving category to settings:', e);
    }

    // Auto-select in form
    setForm(prev => ({
      ...prev,
      device_type: idClean,
      category_name_ar: newItem.title_ar,
      category_name_tr: newItem.title_tr,
      category_name_en: newItem.title_en
    }));

    setIsNewCatModalOpen(false);
    setNewCat({
      id: '',
      title_ar: '',
      title_tr: '',
      title_en: '',
      desc_ar: '',
      desc_tr: '',
      desc_en: '',
      image: '',
      banner_image: '',
      banner_title_ar: '',
      banner_title_tr: '',
      banner_title_en: '',
      banner_desc_ar: '',
      banner_desc_tr: '',
      banner_desc_en: '',
      banner_cta_ar: '',
      banner_cta_tr: '',
      banner_cta_en: ''
    });
    toast.success(locale === 'ar' ? 'تمت إضافة وتثبيت القسم والبانر بنجاح في المتجر!' : 'Kategori ve banner başarıyla eklendi ve kaydedildi!');
  };

  const handleDeleteCategory = async (id: string) => {
    const updated = categoryCards.filter(c => c.id !== id);
    setCategoryCards(updated);
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/settings`, {
        shop_categories: JSON.stringify(updated)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(locale === 'ar' ? 'تم حذف القسم وتحديث المتجر بنجاح!' : 'Kategori silindi!');
    } catch (e) {
      toast.error(locale === 'ar' ? 'فشل حفظ الحذف' : 'Silme hatası');
    }
  };

  const handleOpenEditCat = (cat: any) => {
    setEditingCat({
      ...cat,
      title_ar: cat.title_ar || '',
      title_tr: cat.title_tr || '',
      title_en: cat.title_en || '',
      desc_ar: cat.desc_ar || '',
      desc_tr: cat.desc_tr || '',
      desc_en: cat.desc_en || '',
      image: cat.image || '',
      banner_image: cat.banner_image || cat.image || '',
      banner_title_ar: cat.banner_title_ar || '',
      banner_title_tr: cat.banner_title_tr || '',
      banner_title_en: cat.banner_title_en || '',
      banner_desc_ar: cat.banner_desc_ar || '',
      banner_desc_tr: cat.banner_desc_tr || '',
      banner_desc_en: cat.banner_desc_en || '',
      banner_cta_ar: cat.banner_cta_ar || 'استعراض منتجات القسم',
      banner_cta_tr: cat.banner_cta_tr || 'Ürünleri İncele',
      banner_cta_en: cat.banner_cta_en || 'Explore Products',
    });
    setIsEditCatModalOpen(true);
  };

  const handleEditCatImageUpload = async (file: File) => {
    setUploadingEditCatImage(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setEditingCat((prev: any) => ({ ...prev, image: res.data.url }));
        toast.success(locale === 'ar' ? 'تم رفع صورة كرت القسم بنجاح!' : 'Kategori görseli yüklendi!');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل رفع الصورة' : 'Resim yükleme başarısız');
    } finally {
      setUploadingEditCatImage(false);
    }
  };

  const handleEditCatBannerUpload = async (file: File) => {
    setUploadingEditCatBanner(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data?.url) {
        setEditingCat((prev: any) => ({ ...prev, banner_image: res.data.url }));
        toast.success(locale === 'ar' ? 'تم رفع صورة بانر القسم بنجاح!' : 'Kategori banner görseli yüklendi!');
      }
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل رفع صورة البانر' : 'Banner yükleme başarısız');
    } finally {
      setUploadingEditCatBanner(false);
    }
  };

  const handleSaveEditedCategory = async () => {
    if (!editingCat) return;
    const arTitle = (editingCat.title_ar || '').trim();
    if (!arTitle) {
      toast.error(locale === 'ar' ? 'يرجى كتابة اسم القسم' : 'Lütfen kategori adını giriniz');
      return;
    }

    const updatedList = categoryCards.map(c => c.id === editingCat.id ? { ...c, ...editingCat } : c);
    setCategoryCards(updatedList);

    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/settings`, {
        shop_categories: JSON.stringify(updatedList)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(locale === 'ar' ? 'تم حفظ وتحديث بيانات وبانر القسم بنجاح!' : 'Kategori ve banner güncellendi!');
      setIsEditCatModalOpen(false);
      setEditingCat(null);
    } catch (e) {
      toast.error(locale === 'ar' ? 'فشل حفظ التعديلات' : 'Kaydetme hatası');
    }
  };

  const handleQuickSaveSingleCat = async (cat: any) => {
    setSavingCategoryCards(true);
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE}/settings`, {
        shop_categories: JSON.stringify(categoryCards)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(locale === 'ar' ? `تم حفظ تعديلات قسم (${cat.title_ar || cat.id}) بنجاح!` : 'Kategori kaydedildi!');
    } catch (err) {
      toast.error(locale === 'ar' ? 'فشل حفظ التعديلات' : 'Kaydetme hatası');
    } finally {
      setSavingCategoryCards(false);
    }
  };

  // Filtering
  const brands = useMemo(() => Array.from(new Set(items.map(i => i.brand))).filter(Boolean), [items]);
  const services = useMemo(() => {
    const map = new Map<string, string>();
    // 1. Add dynamic systemServices from backend
    systemServices.forEach(s => {
      const name = locale === 'ar' ? (s.title_ar || s.title) : locale === 'en' ? (s.title_en || s.title) : (s.title_tr || s.title);
      if (s.slug && name) map.set(s.slug, name);
    });
    // 2. Add existing items from DB
    items.forEach(i => {
      if (!i.service_slug) return;
      const name = locale === 'ar' ? (i.service_name_ar || i.service_name_tr) : locale === 'en' ? (i.service_name_en || i.service_name_tr) : i.service_name_tr;
      if (!map.has(i.service_slug)) {
        map.set(i.service_slug, name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [items, systemServices, locale]);

  const countsByType = useMemo(() => {
    let all = items.length;
    let yedek_parca = 0;
    let cihaz = 0;
    let aksesuar = 0;
    let servis = 0;
    items.forEach(item => {
      const t = item.item_type || (item.category_name_tr?.includes('Yedek') || item.service_slug?.includes('ekran') || item.service_slug?.includes('batarya') ? 'yedek_parca' : 'cihaz');
      if (t === 'yedek_parca') yedek_parca++;
      else if (t === 'cihaz') cihaz++;
      else if (t === 'aksesuar') aksesuar++;
      else if (t === 'servis') servis++;
    });
    return { all, yedek_parca, cihaz, aksesuar, servis };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (selectedTypeFilter !== 'all') {
        const itemType = item.item_type || (item.category_name_tr?.includes('Yedek') || item.service_slug?.includes('ekran') || item.service_slug?.includes('batarya') ? 'yedek_parca' : 'cihaz');
        if (itemType !== selectedTypeFilter) return false;
      }
      if (selectedBranch !== 'all' && item.device_type !== selectedBranch) return false;
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) return false;
      if (selectedService !== 'all' && item.service_slug !== selectedService) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const serviceName = (locale === 'ar' ? (item.service_name_ar || item.service_name_tr) : locale === 'en' ? (item.service_name_en || item.service_name_tr) : item.service_name_tr).toLowerCase();
        const branchName = getLocalizedBranchName(item).toLowerCase();
        const match = item.model_name.toLowerCase().includes(q) ||
                      item.series.toLowerCase().includes(q) ||
                      item.brand.toLowerCase().includes(q) ||
                      serviceName.includes(q) ||
                      branchName.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [items, selectedTypeFilter, selectedBranch, selectedBrand, selectedService, search, locale, availableBranches]);

  // High performance pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const startIndex = filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredItems.length);

  return (
    <div className="space-y-6 pb-20" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-primary mb-2">
            <div className="w-6 h-1 bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-widest">{d.dashboard_overview}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase flex items-center gap-3">
            <span>{d.page_title}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {items.length} {d.records_count}
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mainTab === 'categories' ? (
            <>
              <button
                type="button"
                onClick={() => setIsNewCatModalOpen(true)}
                className="flex items-center gap-2 bg-muted/60 hover:bg-muted text-foreground px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>{locale === 'ar' ? 'إضافة قسم رئيسي جديد +' : 'Yeni Kategori Ekle +'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCategoryCards}
                disabled={savingCategoryCards}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Check size={16} />
                <span>{savingCategoryCards ? (locale === 'ar' ? 'جاري الحفظ...' : 'Kaydediliyor...') : (locale === 'ar' ? 'حفظ تعديلات الأقسام' : 'Değişiklikleri Kaydet')}</span>
              </button>
            </>
          ) : (
            <>
              {items.length > 0 && (
                <button
                  onClick={() => setIsClearAllModalOpen(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider border border-red-500/20 hover:border-red-500 transition-all cursor-pointer shadow-xs active:scale-95"
                  title={d.clear_all_tooltip}
                >
                  <Trash2 size={14} />
                  <span>{d.clear_all_btn}</span>
                </button>
              )}

              <button
                onClick={() => setIsSeedModalOpen(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-muted/60 hover:bg-muted text-foreground px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer"
                title={d.load_defaults_tooltip}
              >
                <RefreshCw size={14} className={cn(actionLoading && "animate-spin")} />
                <span>{d.load_defaults}</span>
              </button>
              
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>{d.add_new_model}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main View Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
        <button
          type="button"
          onClick={() => setMainTab('pricing')}
          className={cn(
            "px-4 py-2.5 rounded-md text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
            mainTab === 'pricing'
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{locale === 'ar' ? 'قائمة المنتجات والأسعار' : 'Ürünler & Fiyat Listesi'}</span>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded-full font-bold">
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab('categories')}
          className={cn(
            "px-4 py-2.5 rounded-md text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer",
            mainTab === 'categories'
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{locale === 'ar' ? 'إدارة أقسام المتجر' : 'Mağaza Kategorileri'}</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            {categoryCards.length}
          </span>
        </button>
      </div>

      {mainTab === 'categories' ? (
        /* Category Cards Management Section */
        <div className="space-y-6">
          {/* Top Categories Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-md border bg-card shadow-xs">
            <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" />
                <span>{locale === 'ar' ? 'أقسام المتجر الديناميكية والبنرات الترويجية' : 'Dinamik Mağaza Kategorileri & Bannerlar'}</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === 'ar' 
                  ? 'يمكنك هنا تخصيص صورة الكرت وصورة البانر العريض لكل قسم يظهر في أعلى صفحة المتجر.' 
                  : 'Her kategori için kart görseli ve sayfa üstünde gösterilecek geniş bannerı yönetebilirsiniz.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewCatModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus size={14} />
                <span>{locale === 'ar' ? 'إضافة قسم وبانر جديد' : 'Yeni Kategori & Banner Ekle'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCategoryCards}
                disabled={savingCategoryCards}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Check size={14} className={cn(savingCategoryCards && "animate-spin")} />
                <span>{savingCategoryCards ? (locale === 'ar' ? 'جاري الحفظ...' : 'Kaydediliyor...') : (locale === 'ar' ? 'حفظ كافة التعديلات' : 'Değişiklikleri Kaydet')}</span>
              </button>
            </div>
          </div>

          {/* Grid of Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {categoryCards.map((cat, idx) => (
              <div 
                key={cat.id || idx}
                className="rounded-md border bg-card p-4 space-y-4 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>{cat.title_ar || cat.title_tr || cat.id}</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {categoryProductCounts.get(cat.id.toLowerCase()) || (cat.id === 'telefon' ? categoryProductCounts.get('phone') || 0 : 0)} {locale === 'ar' ? 'منتج' : 'ürün'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCat(cat)}
                        className="text-muted-foreground hover:text-primary p-1 transition-colors cursor-pointer"
                        title={locale === 'ar' ? 'تعديل هذا القسم' : 'Kategoriyi Düzenle'}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-muted-foreground hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title={locale === 'ar' ? 'حذف هذا القسم' : 'Kategoriyi Sil'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 1. Category Card Thumbnail */}
                  <div className="space-y-1.5 p-2.5 rounded-md border bg-muted/20">
                    <span className="text-[10px] font-black uppercase text-foreground block">
                      {locale === 'ar' ? 'صورة كرت القسم (Thumbnail)' : 'Kart Görseli'}
                    </span>

                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-16 rounded-md bg-black/40 border border-border overflow-hidden shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.title_tr || cat.id}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCategoryCardImageUpload(cat.id, file);
                            }}
                          />
                          <span className="w-full px-2.5 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all">
                            <Upload size={12} className={cn(uploadingCatId === cat.id && "animate-spin")} />
                            <span>{uploadingCatId === cat.id ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع صورة الكرت' : 'Kart Görseli Yükle')}</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          value={cat.image || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, image: val } : c));
                          }}
                          className="w-full text-[10px] font-mono px-2 py-1 rounded bg-background border border-border text-foreground"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Category Hero Banner */}
                  <div className="space-y-2 p-2.5 rounded-md border border-primary/30 bg-primary/5">
                    <span className="text-[10px] font-black uppercase text-primary flex items-center gap-1">
                      <Layers size={11} />
                      <span>{locale === 'ar' ? 'بانر القسم العريض (Hero Banner)' : 'Kategori Geniş Bannerı'}</span>
                    </span>

                    <div className="w-full h-24 rounded-md bg-black/50 border border-border overflow-hidden relative flex items-center justify-center">
                      <img
                        src={cat.banner_image || cat.image || '/images/phones-banner.jpg'}
                        alt={`${cat.title_tr || cat.id} banner`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      <span className="absolute bottom-1.5 start-2 text-[10px] text-white font-bold drop-shadow truncate max-w-[90%]">
                        {cat.banner_title_ar || cat.title_ar || cat.title_tr}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCategoryBannerUpload(cat.id, file);
                          }}
                        />
                        <span className="w-full px-2.5 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs">
                          <Upload size={12} className={cn(uploadingCatBannerId === cat.id && "animate-spin")} />
                          <span>{uploadingCatBannerId === cat.id ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع بانر للقسم' : 'Banner Yükle')}</span>
                        </span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        value={cat.banner_image || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, banner_image: val } : c));
                        }}
                        className="w-full text-[10px] font-mono px-2 py-1 rounded bg-background border border-border text-foreground"
                        placeholder={locale === 'ar' ? 'رابط مباشر للبانر (URL)...' : 'Banner Resim URL'}
                      />
                    </div>

                    {/* Banner Custom Titles */}
                    <div className="space-y-1.5 pt-1 border-t border-primary/20">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                          {locale === 'ar' ? 'عنوان البانر بالعربي' : 'Banner Başlığı (AR)'}
                        </label>
                        <input
                          type="text"
                          value={cat.banner_title_ar || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, banner_title_ar: val } : c));
                          }}
                          placeholder={cat.title_ar || "عنوان البانر"}
                          className="w-full text-xs px-2 py-1 rounded bg-background border border-border text-foreground"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                          {locale === 'ar' ? 'وصف البانر بالعربي' : 'Banner Açıklaması (AR)'}
                        </label>
                        <input
                          type="text"
                          value={cat.banner_desc_ar || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, banner_desc_ar: val } : c));
                          }}
                          placeholder={cat.desc_ar || "شرح جذاب يظهر داخل البانر"}
                          className="w-full text-xs px-2 py-1 rounded bg-background border border-border text-foreground"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Multilingual Titles */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                        {locale === 'ar' ? 'اسم القسم بالعربي' : 'Arapça Başlık'}
                      </label>
                      <input
                        type="text"
                        value={cat.title_ar || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, title_ar: val } : c));
                        }}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border font-bold text-foreground outline-hidden focus:border-primary"
                        dir="rtl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                          {locale === 'ar' ? 'تركي' : 'Türkçe'}
                        </label>
                        <input
                          type="text"
                          value={cat.title_tr || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, title_tr: val } : c));
                          }}
                          className="w-full text-xs px-2 py-1 rounded-md bg-background border border-border font-medium text-foreground outline-hidden focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                          {locale === 'ar' ? 'إنجليزي' : 'İngilizce'}
                        </label>
                        <input
                          type="text"
                          value={cat.title_en || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, title_en: val } : c));
                          }}
                          className="w-full text-xs px-2 py-1 rounded-md bg-background border border-border font-medium text-foreground outline-hidden focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="pt-1">
                      <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                        {locale === 'ar' ? 'وصف كرت القسم بالعربي (يظهر أسفل الاسم في المتجر)' : 'Kart Açıklaması (AR)'}
                      </label>
                      <input
                        type="text"
                        value={cat.desc_ar || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCategoryCards(prev => prev.map(c => c.id === cat.id ? { ...c, desc_ar: val } : c));
                        }}
                        placeholder={locale === 'ar' ? 'مثال: آيفون، سامسونج، شاومي والمزيد' : 'Örn: iPhone, Samsung ve Dahası'}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border font-medium text-foreground outline-hidden focus:border-primary"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions for each Category Card */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCat(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                  >
                    <Edit3 size={13} />
                    <span>{locale === 'ar' ? 'تعديل بالنافذة' : 'Pencerede Düzenle'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSaveSingleCat(cat)}
                    disabled={savingCategoryCards}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Check size={13} />
                    <span>{locale === 'ar' ? 'حفظ القسم' : 'Kaydet'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Normal Pricing Table View */
        <div className="space-y-6">

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-md border shadow-xs space-y-4">
        {/* Quick Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-border/60">
          {[
            { id: 'all', label: locale === 'ar' ? 'الكل' : locale === 'en' ? 'All Items' : 'Tümü', count: countsByType.all },
            { id: 'yedek_parca', label: locale === 'ar' ? 'قطع الغيار' : locale === 'en' ? 'Spare Parts' : 'Yedek Parça', count: countsByType.yedek_parca },
            { id: 'cihaz', label: locale === 'ar' ? 'الأجهزة (بيع)' : locale === 'en' ? 'Devices' : 'Cihaz Satışı', count: countsByType.cihaz },
            { id: 'aksesuar', label: locale === 'ar' ? 'الإكسسوارات' : locale === 'en' ? 'Accessories' : 'Aksesuar', count: countsByType.aksesuar },
            { id: 'servis', label: locale === 'ar' ? 'خدمات الصيانة' : locale === 'en' ? 'Repair Services' : 'Tamir / Servis', count: countsByType.servis },
          ].map((tab) => {
            const isActive = selectedTypeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTypeFilter(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-md text-xs font-black border transition-all cursor-pointer flex items-center gap-2",
                  isActive 
                    ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border/80 hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={d.search_placeholder}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 rounded-md border bg-background text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3.5 rtl:right-auto rtl:left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
            {/* Filter by Main Branch */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">{d.all_branches} ({availableBranches.length})</option>
              {availableBranches.map(b => (
                <option key={b.slug} value={b.slug}>
                  {locale === 'ar' ? b.name_ar : locale === 'en' ? b.name_en : b.name_tr}
                </option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">{d.all_brands} ({brands.length})</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">{d.all_services}</option>
              {services.map(s => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 rounded-md border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              title={d.pagination_per_page}
            >
              <option value={10}>10 {d.pagination_per_page}</option>
              <option value={15}>15 {d.pagination_per_page}</option>
              <option value={25}>25 {d.pagination_per_page}</option>
              <option value={50}>50 {d.pagination_per_page}</option>
              <option value={100}>100 {d.pagination_per_page}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Models (Paginated & High Performance) */}
      <div className="bg-card rounded-md border shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1000px] text-start border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="py-3.5 px-4 text-start min-w-[280px] sm:min-w-[320px]">{d.th_model_series}</th>
                <th className="py-3.5 px-4 text-start">{d.th_brand}</th>
                <th className="py-3.5 px-4 text-start">{d.th_branch}</th>
                <th className="py-3.5 px-4 text-start">{d.th_service}</th>
                <th className="py-3.5 px-4 text-start">{d.th_base_price}</th>
                <th className="py-3.5 px-4 text-start">{d.th_qualities}</th>
                <th className="py-3.5 px-4 text-start">{d.th_warranty}</th>
                <th className="py-3.5 px-4 text-start">{d.th_status}</th>
                <th className="py-3.5 px-4 text-end">{d.th_actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-primary" />
                      <span>{d.loading_data}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-muted-foreground">
                    <p className="font-bold text-sm">{d.no_records}</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const serviceName = locale === 'ar' ? (item.service_name_ar || item.service_name_tr) : locale === 'en' ? (item.service_name_en || item.service_name_tr) : item.service_name_tr;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3.5 px-4 min-w-[280px] sm:min-w-[320px]">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.model_name} 
                              className="w-12 h-12 object-contain rounded-md border bg-muted/40 p-0.5 shrink-0" 
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-md border bg-muted/30 flex items-center justify-center shrink-0 text-muted-foreground/60">
                              <Smartphone size={18} />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="font-black text-sm text-foreground flex items-center gap-2 flex-wrap">
                              <span className="break-words leading-tight">{item.model_name}</span>
                              {item.is_popular && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase shrink-0">
                                  {d.popular_badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5 flex-wrap">
                              <span>{getLocalizedSeries(item.series)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              {item.item_type === 'yedek_parca' ? (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 inline-flex items-center gap-1">
                                  <Wrench size={10} />
                                  <span>{locale === 'ar' ? 'قطعة غيار' : locale === 'en' ? 'Spare Part' : 'Yedek Parça'}</span>
                                  {item.part_type && <span className="opacity-80">({item.part_type})</span>}
                                </span>
                              ) : item.item_type === 'cihaz' ? (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 inline-flex items-center gap-1">
                                  <Smartphone size={10} />
                                  <span>{locale === 'ar' ? 'جهاز إلكتروني' : locale === 'en' ? 'Device' : 'Cihaz Satışı'}</span>
                                </span>
                              ) : item.item_type === 'aksesuar' ? (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 inline-flex items-center gap-1">
                                  <Shield size={10} />
                                  <span>{locale === 'ar' ? 'إكسسوار' : locale === 'en' ? 'Accessory' : 'Aksesuar'}</span>
                                </span>
                              ) : (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 inline-flex items-center gap-1">
                                  <Wrench size={10} />
                                  <span>{locale === 'ar' ? 'خدمة صيانة' : locale === 'en' ? 'Repair' : 'Servis'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-muted border">
                          {item.brand}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                          <Layers size={11} className="shrink-0" />
                          <span>{getLocalizedBranchName(item)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">
                        {serviceName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-black text-sm text-primary">
                          {item.base_price.toLocaleString('tr-TR')} {item.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {Array.isArray(item.quality_options) && item.quality_options.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[240px]">
                            {item.quality_options.map((q, idx) => {
                              const qName = locale === 'ar' ? (q.quality_ar || q.quality_tr) : locale === 'en' ? (q.quality_en || q.quality_tr) : q.quality_tr;
                              return (
                                <span 
                                  key={idx} 
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-muted/60 border text-foreground/80"
                                  title={`${qName}: ${q.price} ₺`}
                                >
                                  {qName}: <b className="text-primary">{q.price} ₺</b>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[10px] italic">{d.single_price}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          <ShieldCheck size={14} className="shrink-0" />
                          <span>{getLocalizedWarranty(item.warranty)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                          item.in_stock 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-red-500/10 text-red-600"
                        )}>
                          {item.in_stock ? d.in_stock : d.out_of_stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title={d.edit_tooltip}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 hover:bg-red-500/10 rounded-md text-red-500 transition-colors cursor-pointer"
                            title={d.delete_tooltip}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* High Performance Pagination Bar */}
        {filteredItems.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t bg-muted/20 text-xs">
            <div className="text-muted-foreground font-semibold">
              {d.pagination_showing
                .replace('{start}', startIndex.toString())
                .replace('{end}', endIndex.toString())
                .replace('{total}', filteredItems.length.toString())}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="First Page"
              >
                {locale === 'ar' ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title={d.prev_page}
              >
                {locale === 'ar' ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && (
                          <span className="px-1 text-muted-foreground select-none">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-7 h-7 rounded-md text-xs font-bold transition-all cursor-pointer",
                            currentPage === page
                              ? "bg-primary text-primary-foreground font-black shadow-xs"
                              : "border bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title={d.next_page}
              >
                {locale === 'ar' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Last Page"
              >
                {locale === 'ar' ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )}

      {/* Modal for Add / Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-2xl rounded-md border shadow-2xl overflow-hidden my-8"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                <h3 className="font-black text-base uppercase flex items-center gap-2">
                  <Wrench size={18} className="text-primary" />
                  <span>{editingItem ? d.modal_edit_title : d.modal_add_title}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* 1. PRODUCT IMAGE UPLOAD SECTION */}
                <div className="p-4 rounded-md border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={15} className="text-primary" />
                        <span>{locale === 'ar' ? 'صورة المنتج' : d.image_section_title}</span>
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {locale === 'ar' ? 'ارفع صورة المنتج مباشرة من جهازك أو الصق رابط الصورة' : d.image_section_sub}
                      </p>
                    </div>

                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                    >
                      <Upload size={14} className={cn(uploadingImage && "animate-spin")} />
                      <span>{uploadingImage ? d.uploading_image : (locale === 'ar' ? 'رفع صورة من جهازك' : d.upload_image_btn)}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {form.image_url ? (
                      <div className="relative w-16 h-16 rounded-md border bg-background p-1 shrink-0 flex items-center justify-center group shadow-xs">
                        <img 
                          src={form.image_url} 
                          alt="Product preview" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-xs"
                          title={d.remove_image}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md border border-dashed border-border/80 bg-background/50 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
                        <Smartphone size={20} />
                        <span className="text-[8px] uppercase mt-1">لا توجد صورة</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        value={form.image_url}
                        onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder={locale === 'ar' ? 'أو الصق رابط صورة المنتج مباشرة هنا (URL)...' : d.image_url_placeholder}
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ESSENTIAL PRODUCT DETAILS (CHILD-FRIENDLY & INTUITIVE) */}
                <div className="space-y-4">
                  {/* Product Name (Field 1 - Top Priority) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-foreground flex items-center justify-between">
                      <span>{locale === 'ar' ? 'اسم المنتج أو الموديل *' : d.label_model}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {locale === 'ar' ? 'اكتب الاسم بوضوح كما تريد أن يظهر للزبون' : ''}
                      </span>
                    </label>
                    <input
                      value={form.model_name}
                      onChange={(e) => setForm(prev => ({ ...prev, model_name: e.target.value }))}
                      placeholder={locale === 'ar' ? 'مثال: iPhone 16 Pro Max 256GB أو شاشة سامسونج S24 أصلية' : d.placeholder_model}
                      className="w-full px-3.5 py-2.5 rounded-md border bg-background text-sm font-black focus:border-primary outline-hidden shadow-xs"
                      required
                    />
                  </div>

                  {/* Category & Brand in One Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Category Dropdown with [+ قسم جديد] */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                          <Layers size={13} className="text-primary" />
                          <span>{locale === 'ar' ? 'قسم المتجر' : d.label_main_branch}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsNewCatModalOpen(true)}
                          className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>{locale === 'ar' ? 'قسم جديد +' : 'Yeni Kategori +'}</span>
                        </button>
                      </div>
                      <select
                        value={form.device_type}
                        onChange={(e) => {
                          const branch = availableBranches.find(b => b.slug === e.target.value);
                          if (branch) {
                            setForm(prev => ({
                              ...prev,
                              device_type: branch.slug,
                              category_name_ar: branch.name_ar,
                              category_name_tr: branch.name_tr,
                              category_name_en: branch.name_en,
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold outline-hidden focus:border-primary cursor-pointer shadow-xs"
                      >
                        {availableBranches.map((b) => (
                          <option key={b.slug} value={b.slug}>
                            {locale === 'ar' ? b.name_ar : locale === 'en' ? b.name_en : b.name_tr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand with Quick Suggestions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-foreground">
                        {locale === 'ar' ? 'الماركة / الشركة' : d.label_brand}
                      </label>
                      <input
                        value={form.brand}
                        onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder={locale === 'ar' ? 'مثال: Apple, Samsung, Xiaomi' : d.placeholder_brand}
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                        required
                      />
                      {/* Quick Click Brand Pills */}
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {['Apple', 'Samsung', 'Xiaomi', 'Dyson', 'Roborock', 'Huawei', 'Asus', 'HP', 'Dell', 'Sony'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, brand: b }))}
                            className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer",
                              form.brand.toLowerCase() === b.toLowerCase()
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Item Type (4 Simple Buttons) */}
                  <div className="p-3.5 bg-muted/20 border rounded-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase text-foreground">
                        {locale === 'ar' ? 'نوع المعروض والنشاط' : 'Ürün / İşlem Türü'}
                      </label>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {locale === 'ar' ? 'اختر نوع المعروض لتصنيفه في المتجر' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'cihaz', label: locale === 'ar' ? 'جهاز للبيع' : 'Cihaz (Satış)' },
                        { id: 'yedek_parca', label: locale === 'ar' ? 'قطعة غيار' : 'Yedek Parça' },
                        { id: 'aksesuar', label: locale === 'ar' ? 'إكسسوار' : 'Aksesuar' },
                        { id: 'servis', label: locale === 'ar' ? 'خدمة صيانة' : 'Tamir Servisi' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, item_type: t.id as any }))}
                          className={cn(
                            "py-2.5 px-2 rounded-md text-xs font-black border transition-all cursor-pointer text-center",
                            form.item_type === t.id
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-background hover:bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* If Yedek Parça is chosen: dynamic select or custom new part type */}
                    {form.item_type === 'yedek_parca' && (
                      <div className="pt-2 border-t border-border/50 space-y-2 animate-in fade-in duration-150">
                        <label className="text-[10px] font-black uppercase text-muted-foreground block">
                          {locale === 'ar' ? 'نوع قطعة الغيار (شاشة، بطارية، كاميرا...)' : 'Yedek Parça Türü'}
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {!isCustomPartType ? (
                            <select
                              value={form.part_type || 'ekran'}
                              onChange={(e) => {
                                if (e.target.value === 'custom_new') {
                                  setIsCustomPartType(true);
                                  setForm(prev => ({ ...prev, part_type: '' }));
                                } else {
                                  setForm(prev => ({ ...prev, part_type: e.target.value }));
                                }
                              }}
                              className="flex-1 px-3 py-2 rounded-md border bg-background text-xs font-bold outline-hidden cursor-pointer"
                            >
                              <optgroup label={locale === 'ar' ? 'الأنواع الشائعة' : 'Yaygın Parça Türleri'}>
                                {availablePartTypes.map(p => (
                                  <option key={p.slug} value={p.slug}>{p.label}</option>
                                ))}
                              </optgroup>
                              <option value="custom_new" className="font-black text-primary">
                                {locale === 'ar' ? '+ كتابة نوع مخصص جديد...' : '+ Yeni Parça Türü Yaz...'}
                              </option>
                            </select>
                          ) : (
                            <input
                              value={form.part_type}
                              onChange={(e) => setForm(prev => ({ ...prev, part_type: e.target.value }))}
                              placeholder={locale === 'ar' ? 'اكتب اسم نوع القطعة (مثال: حساس بصمة، مروحة تبريد...)' : 'Parça türü adını yazın...'}
                              className="flex-1 px-3 py-2 rounded-md border bg-background text-xs font-bold outline-hidden focus:border-primary"
                              autoFocus
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const next = !isCustomPartType;
                              setIsCustomPartType(next);
                              if (next && !form.part_type) {
                                setForm(prev => ({ ...prev, part_type: '' }));
                              } else if (!next && !form.part_type) {
                                setForm(prev => ({ ...prev, part_type: 'ekran' }));
                              }
                            }}
                            className={cn(
                              "px-3 py-2 rounded-md text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1",
                              isCustomPartType 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-background hover:bg-muted text-muted-foreground"
                            )}
                          >
                            <Plus size={13} />
                            <span>{isCustomPartType ? (locale === 'ar' ? 'القائمة الجاهزة' : 'Listeye Dön') : (locale === 'ar' ? 'نوع مخصص' : 'Özel Tür')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price & Warranty & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-foreground">
                        {locale === 'ar' ? 'السعر الأساسي (₺) *' : d.label_base_price}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={form.base_price}
                          onChange={(e) => setForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-md border bg-background text-sm font-black text-primary outline-hidden focus:border-primary shadow-xs"
                          required
                        />
                        <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ₺
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-foreground">
                        {locale === 'ar' ? 'مدة الضمان' : d.label_warranty}
                      </label>
                      <input
                        value={form.warranty}
                        onChange={(e) => setForm(prev => ({ ...prev, warranty: e.target.value }))}
                        placeholder={locale === 'ar' ? 'مثال: ضمان 6 أشهر' : d.placeholder_warranty}
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase text-foreground">
                        {locale === 'ar' ? 'مدة التركيب / الصيانة' : d.label_duration}
                      </label>
                      <input
                        value={form.duration}
                        onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder={locale === 'ar' ? 'مثال: 30 دقيقة' : d.placeholder_duration}
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Stock and Popularity Toggles */}
                  <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/20 border rounded-md">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.in_stock}
                        onChange={(e) => setForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                        className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
                      />
                      <span className="text-xs font-black text-foreground">
                        {locale === 'ar' ? 'متوفر في المخزون حالياً' : d.in_stock_checkbox}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_popular}
                        onChange={(e) => setForm(prev => ({ ...prev, is_popular: e.target.checked }))}
                        className="w-4 h-4 rounded text-primary focus:ring-primary/20 accent-primary"
                      />
                      <span className="text-xs font-black text-foreground">
                        {locale === 'ar' ? 'موديل مميز / الأكثر طلباً' : d.popular_checkbox}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. OPTIONAL ADVANCED OPTIONS (COLLAPSED ACCORDION) */}
                <div className="border rounded-md overflow-hidden bg-background">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Wrench size={14} className="text-primary" />
                      <span>{locale === 'ar' ? 'خيارات متقدمة إضافية (ترجمات، مواصفات، خيارات جودة متعددة)' : 'Gelişmiş Seçenekler (Çeviriler, Kalite Seçenekleri)'}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">
                      {showAdvancedOptions ? '▲ إخفاء' : '▼ عرض التفاصيل'}
                    </span>
                  </button>

                  {showAdvancedOptions && (
                    <div className="p-4 space-y-4 border-t animate-in fade-in duration-200">
                      {/* Multilingual Name Translations */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-foreground block">
                          {locale === 'ar' ? 'الترجمات المخصصة لاسم المنتج (اختياري - سيتم استخدام الاسم الرئيسي تلقائياً إذا تركت فارغة)' : 'Çok Dilli Başlıklar'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground block mb-0.5">عربي (AR)</span>
                            <input
                              value={form.service_name_ar}
                              onChange={(e) => setForm(prev => ({ ...prev, service_name_ar: e.target.value }))}
                              placeholder={form.model_name || "اسم المنتج بالعربي"}
                              className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground block mb-0.5">تركي (TR)</span>
                            <input
                              value={form.service_name_tr}
                              onChange={(e) => setForm(prev => ({ ...prev, service_name_tr: e.target.value }))}
                              placeholder={form.model_name || "Türkçe ürün adı"}
                              className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-muted-foreground block mb-0.5">إنجليزي (EN)</span>
                            <input
                              value={form.service_name_en}
                              onChange={(e) => setForm(prev => ({ ...prev, service_name_en: e.target.value }))}
                              placeholder={form.model_name || "English product name"}
                              className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Series & Specs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">
                            {locale === 'ar' ? 'اسم الفئة (اختياري)' : d.label_series}
                          </label>
                          <input
                            value={form.series}
                            onChange={(e) => setForm(prev => ({ ...prev, series: e.target.value }))}
                            placeholder={locale === 'ar' ? 'مثال: سلسلة iPhone 16' : d.placeholder_series}
                            className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">
                            {locale === 'ar' ? 'المواصفات المختصرة للكارت (اختياري)' : 'Kısa Özellikler'}
                          </label>
                          <input
                            value={form.specs_ar}
                            onChange={(e) => setForm(prev => ({ ...prev, specs_ar: e.target.value }))}
                            placeholder={locale === 'ar' ? 'مثال: جديد - 256 جيجا أو نخب أول A+' : 'Örn: Sıfır - 256 GB'}
                            className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                            dir="rtl"
                          />
                        </div>
                      </div>

                      {/* Quality Options Section */}
                      <div className="space-y-3 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-black uppercase tracking-wider">{d.quality_section_title}</h5>
                            <p className="text-[10px] text-muted-foreground">{d.quality_section_sub}</p>
                          </div>
                          <button
                            type="button"
                            onClick={handleAddQuality}
                            className="flex items-center gap-1 text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 border border-primary/20 cursor-pointer"
                          >
                            <Plus size={12} />
                            <span>{d.add_quality_btn}</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {form.quality_options.map((q, idx) => (
                            <div key={idx} className="p-3 bg-muted/20 rounded-md border space-y-2 shadow-xs">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">{d.label_quality_name_ar}</label>
                                  <input
                                    value={q.quality_ar || ''}
                                    onChange={(e) => handleUpdateQuality(idx, 'quality_ar', e.target.value)}
                                    placeholder={d.placeholder_quality_ar}
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                                    dir="rtl"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">{d.label_quality_name_tr}</label>
                                  <input
                                    value={q.quality_tr || ''}
                                    onChange={(e) => handleUpdateQuality(idx, 'quality_tr', e.target.value)}
                                    placeholder={d.placeholder_quality_tr}
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">{d.label_quality_name_en}</label>
                                  <input
                                    value={q.quality_en || ''}
                                    onChange={(e) => handleUpdateQuality(idx, 'quality_en', e.target.value)}
                                    placeholder={d.placeholder_quality_en}
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                                <div className="w-32">
                                  <input
                                    type="number"
                                    value={q.price}
                                    onChange={(e) => handleUpdateQuality(idx, 'price', parseFloat(e.target.value) || 0)}
                                    placeholder={d.placeholder_price}
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-black text-primary"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    value={q.badge || ''}
                                    onChange={(e) => handleUpdateQuality(idx, 'badge', e.target.value)}
                                    placeholder={d.placeholder_badge}
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-xs font-bold"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuality(idx)}
                                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                                  title={d.remove_quality}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {form.quality_options.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground italic py-1">
                              {d.empty_qualities}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-md border bg-background hover:bg-muted text-xs font-bold transition-colors cursor-pointer"
                  >
                    {d.cancel_btn}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={16} />
                    <span>{actionLoading ? (locale === 'ar' ? 'جاري الحفظ...' : 'Kaydediliyor...') : (editingItem ? d.save_edit_btn : d.save_add_btn)}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear All Confirmation Modal */}
      <AnimatePresence>
        {isClearAllModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearAllModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card rounded-md border p-6 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 size={26} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {d.clear_all_confirm_title}
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                {d.clear_all_confirm_desc.replace('{count}', items.length.toString())}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="px-5 py-2.5 rounded-md border text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer"
                >
                  {d.cancel_btn}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>{d.clear_all_confirm_btn}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Single Item Confirmation Modal */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setDeletingItem(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card rounded-md border p-6 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-xs">
                <Trash2 size={26} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {d.delete_confirm_title}
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                {d.delete_confirm_desc.replace('{model}', `${deletingItem.brand} ${deletingItem.model_name}`)}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-md border text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer"
                >
                  {d.cancel_btn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>{d.delete_confirm_btn}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seed Defaults Confirmation Modal */}
      <AnimatePresence>
        {isSeedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !actionLoading && setIsSeedModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card rounded-md border p-6 shadow-2xl text-center z-10"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-xs">
                <RefreshCw size={26} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">
                {d.seed_confirm_title}
              </h3>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                {d.seed_confirm_desc}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSeedModalOpen(false)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-md border text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer"
                >
                  {d.cancel_btn}
                </button>
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{d.seed_confirm_btn}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Adding New Main Category Card */}
      <AnimatePresence>
        {isNewCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-md border shadow-2xl overflow-hidden my-8"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                <h3 className="font-black text-base uppercase flex items-center gap-2">
                  <Plus size={18} className="text-primary" />
                  <span>{locale === 'ar' ? 'إضافة قسم رئيسي جديد للمتجر' : 'Yeni Ana Kategori Ekle'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Image Upload for New Category */}
                <div className="p-3.5 rounded-md border bg-muted/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-primary" />
                        <span>{locale === 'ar' ? 'صورة غلاف القسم' : 'Kategori Görseli'}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {locale === 'ar' ? 'ارفع صورة الغلاف للقسم مباشرة من جهازك' : 'Cihazınızdan görsel yükleyin'}
                      </span>
                    </div>

                    <input 
                      type="file"
                      ref={newCatFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleNewCatImageUpload(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => newCatFileInputRef.current?.click()}
                      disabled={uploadingNewCatImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                    >
                      <Upload size={13} className={cn(uploadingNewCatImage && "animate-spin")} />
                      <span>{uploadingNewCatImage ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع صورة من جهازك' : 'Görsel Yükle')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {newCat.image ? (
                      <div className="relative w-16 h-16 rounded-md border bg-black/40 overflow-hidden shrink-0">
                        <img 
                          src={newCat.image} 
                          alt="Category preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewCat(prev => ({ ...prev, image: '' }))}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md border border-dashed border-border/80 bg-background/50 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
                        <ImageIcon size={18} />
                        <span className="text-[8px] uppercase mt-1">صورة الغلاف</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        type="text"
                        value={newCat.image}
                        onChange={(e) => setNewCat(prev => ({ ...prev, image: e.target.value }))}
                        placeholder={locale === 'ar' ? 'أو ضع رابط صورة مباشر (URL)...' : 'https://...'}
                        className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Names */}
                <div>
                  <label className="text-xs font-black text-foreground block mb-1">
                    {locale === 'ar' ? 'اسم القسم بالعربي *' : 'Kategori Adı (Arapça) *'}
                  </label>
                  <input
                    type="text"
                    value={newCat.title_ar}
                    onChange={(e) => setNewCat(prev => ({ ...prev, title_ar: e.target.value }))}
                    placeholder={locale === 'ar' ? 'مثال: أجهزة الألعاب أو شاشات التلفزيون' : 'Örn: Oyun Konsolları'}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-md bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    dir="rtl"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      {locale === 'ar' ? 'الاسم بالتركي (اختياري)' : 'Türkçe Başlık'}
                    </label>
                    <input
                      type="text"
                      value={newCat.title_tr}
                      onChange={(e) => setNewCat(prev => ({ ...prev, title_tr: e.target.value }))}
                      placeholder={newCat.title_ar || "Örn: Tabletler"}
                      className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      {locale === 'ar' ? 'الاسم بالإنجليزي (اختياري)' : 'İngilizce Başlık'}
                    </label>
                    <input
                      type="text"
                      value={newCat.title_en}
                      onChange={(e) => setNewCat(prev => ({ ...prev, title_en: e.target.value }))}
                      placeholder={newCat.title_ar || "e.g. Tablets"}
                      className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Banner Section for New Category */}
                <div className="p-3.5 rounded-md border border-primary/30 bg-primary/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-primary" />
                        <span>{locale === 'ar' ? 'بانر القسم العريض (Hero Banner)' : 'Kategori Geniş Bannerı'}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {locale === 'ar' ? 'البانر الذي سيظهر في أعلى صفحة المتجر عند فتح هذا القسم' : 'Bu kategori açıldığında mağaza üstünde görünecek banner'}
                      </span>
                    </div>

                    <input 
                      type="file"
                      ref={newCatBannerFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleNewCatBannerImageUpload(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => newCatBannerFileInputRef.current?.click()}
                      disabled={uploadingNewCatBanner}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Upload size={13} className={cn(uploadingNewCatBanner && "animate-spin")} />
                      <span>{uploadingNewCatBanner ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع بانر للقسم' : 'Banner Yükle')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {newCat.banner_image ? (
                      <div className="relative w-28 h-16 rounded-md border bg-black/40 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src={newCat.banner_image} 
                          alt="Category banner preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewCat(prev => ({ ...prev, banner_image: '' }))}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-16 rounded-md border border-dashed border-primary/40 bg-background/50 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
                        <ImageIcon size={18} className="text-primary/60" />
                        <span className="text-[8px] uppercase mt-1">بانر القسم</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={newCat.banner_image}
                        onChange={(e) => setNewCat(prev => ({ ...prev, banner_image: e.target.value }))}
                        placeholder={locale === 'ar' ? 'أو ضع رابط صورة البانر (URL)...' : 'Banner Resim URL'}
                        className="w-full text-xs px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-mono"
                      />
                      <span className="text-[9px] text-muted-foreground block">
                        {locale === 'ar' ? 'إذا ترك فارغاً سيتم استخدام صورة غلاف القسم كبانر تلقائياً' : 'Boş bırakılırsa kapak görseli banner olarak kullanılır'}
                      </span>
                    </div>
                  </div>

                  {/* Banner Title & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-primary/20">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                        {locale === 'ar' ? 'عنوان البانر الترويجي (اختياري)' : 'Banner Başlığı (İsteğe Bağlı)'}
                      </label>
                      <input
                        type="text"
                        value={newCat.banner_title_ar}
                        onChange={(e) => setNewCat(prev => ({ ...prev, banner_title_ar: e.target.value }))}
                        placeholder={newCat.title_ar || "عنوان جذاب يظهر في البانر"}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                        {locale === 'ar' ? 'نص زر البانر CTA (اختياري)' : 'Banner Buton Metni'}
                      </label>
                      <input
                        type="text"
                        value={newCat.banner_cta_ar}
                        onChange={(e) => setNewCat(prev => ({ ...prev, banner_cta_ar: e.target.value }))}
                        placeholder={locale === 'ar' ? 'استعراض منتجات القسم' : 'Ürünleri İncele'}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    {locale === 'ar' ? 'معرّف القسم الإنجليزي (ID - اختياري، يُنشأ تلقائياً إذا تركته فارغاً)' : 'Kategori ID (İsteğe Bağlı)'}
                  </label>
                  <input
                    type="text"
                    value={newCat.id}
                    onChange={(e) => setNewCat(prev => ({ ...prev, id: e.target.value }))}
                    placeholder="e.g. gaming, monitor, tv"
                    className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    {locale === 'ar' ? 'وصف مختصر للقسم (اختياري)' : 'Kısa Açıklama (İsteğe Bağlı)'}
                  </label>
                  <input
                    type="text"
                    value={newCat.desc_ar}
                    onChange={(e) => setNewCat(prev => ({ ...prev, desc_ar: e.target.value }))}
                    placeholder={locale === 'ar' ? 'مثال: أحدث الأجهزة وقطع الغيار المضمونة' : 'Örn: Tüm modeller ve parçalar'}
                    className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground"
                    dir="rtl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsNewCatModalOpen(false)}
                    className="px-4 py-2 rounded-md border text-xs font-bold hover:bg-muted cursor-pointer"
                  >
                    {d.cancel_btn}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-5 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    {locale === 'ar' ? 'إضافة وتثبيت القسم' : 'Kategoriyi Kaydet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {isEditCatModalOpen && editingCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-xl rounded-md border shadow-2xl overflow-hidden my-8"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase text-foreground">
                      {locale === 'ar' ? `تعديل بيانات وبانر قسم (${editingCat.title_ar || editingCat.id})` : `Kategori Düzenle: ${editingCat.title_tr || editingCat.id}`}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {locale === 'ar' ? 'قم بتحديث الاسم والوصف وصور الغلاف والبانر الترويجي لهذا القسم' : 'Kategori başlığı, kart görseli ve bannerını güncelleyin'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditCatModalOpen(false);
                    setEditingCat(null);
                  }}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* 1. Category Card Thumbnail (Cover Image) */}
                <div className="p-3.5 rounded-md border bg-muted/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-primary" />
                        <span>{locale === 'ar' ? 'صورة كرت القسم (Thumbnail)' : 'Kart Görseli'}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {locale === 'ar' ? 'تظهر داخل بطاقة القسم في المتجر (تملأ البوكس بنسبة 100%)' : 'Mağazada kategori kartında görünen görsel'}
                      </span>
                    </div>

                    <input 
                      type="file"
                      ref={editCatFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditCatImageUpload(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => editCatFileInputRef.current?.click()}
                      disabled={uploadingEditCatImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                    >
                      <Upload size={13} className={cn(uploadingEditCatImage && "animate-spin")} />
                      <span>{uploadingEditCatImage ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع صورة من جهازك' : 'Görsel Yükle')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingCat.image ? (
                      <div className="relative w-20 h-20 rounded-md border bg-black/40 overflow-hidden shrink-0">
                        <img 
                          src={editingCat.image} 
                          alt="Category preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCat((prev: any) => ({ ...prev, image: '' }))}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-md border border-dashed border-border/80 bg-background/50 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
                        <ImageIcon size={20} />
                        <span className="text-[8px] uppercase mt-1">لا توجد صورة</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        type="text"
                        value={editingCat.image || ''}
                        onChange={(e) => setEditingCat((prev: any) => ({ ...prev, image: e.target.value }))}
                        placeholder={locale === 'ar' ? 'أو ضع رابط صورة مباشر (URL)...' : 'https://...'}
                        className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Category Names in 3 Languages */}
                <div>
                  <label className="text-xs font-black text-foreground block mb-1">
                    {locale === 'ar' ? 'اسم القسم بالعربي *' : 'Kategori Adı (Arapça) *'}
                  </label>
                  <input
                    type="text"
                    value={editingCat.title_ar || ''}
                    onChange={(e) => setEditingCat((prev: any) => ({ ...prev, title_ar: e.target.value }))}
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-md bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    dir="rtl"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      {locale === 'ar' ? 'الاسم بالتركي' : 'Türkçe Başlık'}
                    </label>
                    <input
                      type="text"
                      value={editingCat.title_tr || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, title_tr: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                      {locale === 'ar' ? 'الاسم بالإنجليزي' : 'İngilizce Başlık'}
                    </label>
                    <input
                      type="text"
                      value={editingCat.title_en || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, title_en: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground"
                    />
                  </div>
                </div>

                {/* 3. Category Description for the Card (Subtitle) */}
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">
                    {locale === 'ar' ? 'وصف كرت القسم بالعربي (يظهر أسفل الاسم في البطاقة)' : 'Kart Açıklaması (Arapça)'}
                  </label>
                  <input
                    type="text"
                    value={editingCat.desc_ar || ''}
                    onChange={(e) => setEditingCat((prev: any) => ({ ...prev, desc_ar: e.target.value }))}
                    placeholder={locale === 'ar' ? 'مثال: آيفون، سامسونج، شاومي والمزيد' : 'Örn: iPhone, Samsung ve Dahası'}
                    className="w-full text-xs px-3 py-2 rounded-md bg-background border border-border text-foreground"
                    dir="rtl"
                  />
                </div>

                {/* 4. Category Hero Banner Section */}
                <div className="p-3.5 rounded-md border border-primary/30 bg-primary/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-primary" />
                        <span>{locale === 'ar' ? 'بانر القسم العريض (Hero Banner)' : 'Kategori Geniş Bannerı'}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {locale === 'ar' ? 'البانر العريض في أعلى صفحة المتجر عند اختيار هذا القسم' : 'Kategori açıldığında mağaza üstünde görünen banner'}
                      </span>
                    </div>

                    <input 
                      type="file"
                      ref={editCatBannerFileInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditCatBannerUpload(file);
                      }}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => editCatBannerFileInputRef.current?.click()}
                      disabled={uploadingEditCatBanner}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Upload size={13} className={cn(uploadingEditCatBanner && "animate-spin")} />
                      <span>{uploadingEditCatBanner ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع بانر للقسم' : 'Banner Yükle')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingCat.banner_image ? (
                      <div className="relative w-28 h-16 rounded-md border bg-black/40 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img 
                          src={editingCat.banner_image} 
                          alt="Category banner preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingCat((prev: any) => ({ ...prev, banner_image: '' }))}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-28 h-16 rounded-md border border-dashed border-primary/40 bg-background/50 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
                        <ImageIcon size={18} className="text-primary/60" />
                        <span className="text-[8px] uppercase mt-1">بانر القسم</span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={editingCat.banner_image || ''}
                        onChange={(e) => setEditingCat((prev: any) => ({ ...prev, banner_image: e.target.value }))}
                        placeholder={locale === 'ar' ? 'أو ضع رابط صورة البانر (URL)...' : 'Banner Resim URL'}
                        className="w-full text-xs px-3 py-1.5 rounded-md bg-background border border-border text-foreground font-mono"
                      />
                    </div>
                  </div>

                  {/* Banner Title & CTA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-primary/20">
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                        {locale === 'ar' ? 'عنوان البانر الترويجي' : 'Banner Başlığı'}
                      </label>
                      <input
                        type="text"
                        value={editingCat.banner_title_ar || ''}
                        onChange={(e) => setEditingCat((prev: any) => ({ ...prev, banner_title_ar: e.target.value }))}
                        placeholder={editingCat.title_ar || "عنوان يظهر في البانر"}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                        {locale === 'ar' ? 'نص زر البانر CTA' : 'Banner Buton Metni'}
                      </label>
                      <input
                        type="text"
                        value={editingCat.banner_cta_ar || ''}
                        onChange={(e) => setEditingCat((prev: any) => ({ ...prev, banner_cta_ar: e.target.value }))}
                        placeholder={locale === 'ar' ? 'استعراض منتجات القسم' : 'Ürünleri İncele'}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                      {locale === 'ar' ? 'شرح ووصف البانر بالعربي' : 'Banner Açıklaması'}
                    </label>
                    <input
                      type="text"
                      value={editingCat.banner_desc_ar || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, banner_desc_ar: e.target.value }))}
                      placeholder={locale === 'ar' ? 'شرح جذاب يظهر داخل البانر' : 'Açıklama'}
                      className="w-full text-xs px-2.5 py-1.5 rounded-md bg-background border border-border text-foreground"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditCatModalOpen(false);
                      setEditingCat(null);
                    }}
                    className="px-4 py-2 rounded-md border text-xs font-bold hover:bg-muted cursor-pointer"
                  >
                    {d.cancel_btn}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedCategory}
                    className="flex items-center gap-1.5 px-6 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    <Check size={14} />
                    <span>{locale === 'ar' ? 'حفظ كافة التعديلات' : 'Değişiklikleri Kaydet'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

