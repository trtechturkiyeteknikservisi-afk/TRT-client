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

  // Pagination states for high performance
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [form, setForm] = useState({
    brand: 'Apple',
    device_type: 'phone',
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

  // Available Branches (Categories)
  const availableBranches = useMemo(() => {
    const list: { slug: string; name_ar: string; name_tr: string; name_en: string; icon?: string }[] = [];
    const seen = new Set<string>();

    // 1. From system services
    systemServices.forEach(s => {
      const slug = (s.slug || '').toLowerCase().trim();
      if (slug && !seen.has(slug)) {
        seen.add(slug);
        list.push({
          slug,
          name_ar: s.title_ar || s.title || s.title_tr,
          name_tr: s.title_tr || s.title,
          name_en: s.title_en || s.title,
          icon: s.icon
        });
      }
    });

    // 2. From items (in case of previously saved custom branches)
    items.forEach(item => {
      const slug = (item.device_type || '').toLowerCase().trim();
      if (slug && !seen.has(slug)) {
        seen.add(slug);
        list.push({
          slug,
          name_ar: item.category_name_ar || item.category_name_tr || slug,
          name_tr: item.category_name_tr || item.category_name_ar || slug,
          name_en: item.category_name_en || item.category_name_tr || slug,
        });
      }
    });

    // 3. Fallback standard list
    const defaults = [
      { slug: 'phone', name_ar: 'صيانة الهواتف', name_tr: 'Telefon Tamiri', name_en: 'Phone Repair', icon: 'Smartphone' },
      { slug: 'laptop', name_ar: 'اللابتوب والكمبيوتر', name_tr: 'Laptop Tamiri', name_en: 'Laptop & PC Repair', icon: 'Laptop' },
      { slug: 'robot', name_ar: 'المكانس الروبوتية', name_tr: 'Robot Süpürge', name_en: 'Robot Vacuum', icon: 'Robot' },
      { slug: 'watch', name_ar: 'الساعات الفاخرة', name_tr: 'Akıllı Saat', name_en: 'Smart Watch', icon: 'Watch' },
      { slug: 'tablet', name_ar: 'التابلت والآيباد', name_tr: 'Tablet Tamiri', name_en: 'Tablet & iPad', icon: 'Tablet' },
      { slug: 'kulaklik', name_ar: 'السماعات', name_tr: 'Kulaklık', name_en: 'Headphones', icon: 'Headphones' },
    ];
    defaults.forEach(d => {
      if (!seen.has(d.slug)) {
        seen.add(d.slug);
        list.push(d);
      }
    });

    return list;
  }, [systemServices, items]);

  const getLocalizedBranchName = (item: PricingItem) => {
    const slug = (item.device_type || '').toLowerCase().trim();
    if (locale === 'ar') {
      if (item.category_name_ar) return item.category_name_ar;
      const found = availableBranches.find(b => b.slug === slug);
      if (found?.name_ar) return found.name_ar;
    } else if (locale === 'en') {
      if (item.category_name_en) return item.category_name_en;
      const found = availableBranches.find(b => b.slug === slug);
      if (found?.name_en) return found.name_en;
    } else {
      if (item.category_name_tr) return item.category_name_tr;
      const found = availableBranches.find(b => b.slug === slug);
      if (found?.name_tr) return found.name_tr;
    }
    const found = availableBranches.find(b => b.slug === slug);
    return found ? (locale === 'ar' ? found.name_ar : locale === 'en' ? found.name_en : found.name_tr) : slug;
  };

  useEffect(() => {
    fetchItems();
    fetchSystemServices();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBrand, selectedBranch, selectedService, pageSize]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsCustomBranch(false);
    setCustomBranch({ ar: '', tr: '', en: '' });

    const firstBranch = availableBranches[0] || { slug: 'phone', name_ar: 'صيانة الهواتف', name_tr: 'Telefon Tamiri', name_en: 'Phone Repair' };

    setForm({
      brand: 'Apple',
      device_type: firstBranch.slug,
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

    setForm({
      brand: item.brand,
      device_type: item.device_type || 'phone',
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
      toast.error(d.model_name_required);
      return;
    }

    const trName = (form.service_name_tr || '').trim();
    const arName = (form.service_name_ar || '').trim();
    const enName = (form.service_name_en || '').trim();

    if (!trName && !arName && !enName) {
      toast.error(
        locale === 'ar' 
          ? 'يرجى كتابة اسم الخدمة أو نوع القطعة / المنتج' 
          : locale === 'en' 
          ? 'Please enter the service or product name' 
          : 'Lütfen hizmet veya ürün adını giriniz'
      );
      return;
    }

    // Branch resolution
    let branchSlug = form.device_type;
    let branchNameAr = form.category_name_ar;
    let branchNameTr = form.category_name_tr;
    let branchNameEn = form.category_name_en;

    if (isCustomBranch) {
      const cAr = customBranch.ar.trim();
      const cTr = customBranch.tr.trim();
      const cEn = customBranch.en.trim();

      if (!cAr && !cTr && !cEn) {
        toast.error(d.branch_name_required);
        return;
      }

      branchNameAr = cAr || cTr || cEn;
      branchNameTr = cTr || cAr || cEn;
      branchNameEn = cEn || cTr || cAr;

      const baseForBranchSlug = cEn || cTr || cAr;
      branchSlug = baseForBranchSlug
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'branch';
    } else {
      const foundBranch = availableBranches.find(b => b.slug === branchSlug);
      if (foundBranch) {
        branchNameAr = foundBranch.name_ar;
        branchNameTr = foundBranch.name_tr;
        branchNameEn = foundBranch.name_en;
      }
    }

    // Auto-generate slug from whichever name is provided
    let slug = (form.service_slug || '').trim();
    if (!slug) {
      const baseForSlug = enName || trName || arName || 'service';
      slug = baseForSlug
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'service';
    }

    const payload = {
      ...form,
      device_type: branchSlug,
      category_name_ar: branchNameAr,
      category_name_tr: branchNameTr,
      category_name_en: branchNameEn,
      service_slug: slug,
      service_name_tr: trName || arName || enName || 'Ürün / Hizmet',
      service_name_en: enName || trName || arName || 'Product / Service',
      service_name_ar: arName || trName || enName || 'منتج / خدمة',
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

  const filteredItems = useMemo(() => {
    return items.filter(item => {
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
  }, [items, selectedBranch, selectedBrand, selectedService, search, locale, availableBranches]);

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
          {items.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-red-500/20 hover:border-red-500 transition-all cursor-pointer shadow-xs active:scale-95"
              title={d.clear_all_tooltip}
            >
              <Trash2 size={14} />
              <span>{d.clear_all_btn}</span>
            </button>
          )}

          <button
            onClick={() => setIsSeedModalOpen(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-muted/60 hover:bg-muted text-foreground px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer"
            title={d.load_defaults_tooltip}
          >
            <RefreshCw size={14} className={cn(actionLoading && "animate-spin")} />
            <span>{d.load_defaults}</span>
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>{d.add_new_model}</span>
          </button>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-md border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={d.search_placeholder}
              className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2 rounded-lg border bg-background text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
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
              className="px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
              className="px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="all">{d.all_brands} ({brands.length})</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
              className="px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
                              className="w-12 h-12 object-contain rounded-lg border bg-muted/40 p-0.5 shrink-0" 
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg border bg-muted/30 flex items-center justify-center shrink-0 text-muted-foreground/60">
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
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
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
                className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="First Page"
              >
                {locale === 'ar' ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
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
                            "w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer",
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
                className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title={d.next_page}
              >
                {locale === 'ar' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Last Page"
              >
                {locale === 'ar' ? <ChevronsLeft size={15} /> : <ChevronsRight size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>

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
                {/* 1. OPTIONAL DEVICE IMAGE UPLOAD SECTION */}
                <div className="p-4 rounded-md border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={15} className="text-primary" />
                        <span>{d.image_section_title}</span>
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{d.image_section_sub}</p>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all cursor-pointer border border-primary/20"
                    >
                      <Upload size={14} className={cn(uploadingImage && "animate-spin")} />
                      <span>{uploadingImage ? d.uploading_image : d.upload_image_btn}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {form.image_url ? (
                      <div className="relative w-16 h-16 rounded-lg border bg-background p-1 shrink-0 flex items-center justify-center group shadow-xs">
                        <img 
                          src={form.image_url} 
                          alt="Device preview" 
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
                      <div className="w-16 h-16 rounded-lg border border-dashed border-border/80 bg-background/50 flex flex-col items-center justify-center text-muted-foreground/60 shrink-0">
                        <Smartphone size={20} />
                        <span className="text-[8px] uppercase mt-1">Logo / Resim</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <input
                        value={form.image_url}
                        onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder={d.image_url_placeholder}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 1. Main Branch / Department (الفرع الرئيسي / القسم العام) */}
                <div className="p-3.5 bg-muted/20 border rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Layers size={14} />
                      <span>{d.label_main_branch}</span>
                    </label>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {locale === 'ar' ? 'حدد الفرع الرئيسي الذي تتبع له هذه الخدمة أو أنشئ فرعاً جديداً' : locale === 'en' ? 'Select main branch or add new' : 'Ana branşı seçin veya yeni ekleyin'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select
                        value={isCustomBranch ? 'custom_new' : form.device_type}
                        onChange={(e) => {
                          if (e.target.value === 'custom_new') {
                            setIsCustomBranch(true);
                          } else {
                            setIsCustomBranch(false);
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
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-md border bg-background text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      >
                        <optgroup label={locale === 'ar' ? 'الفروع والأقسام المتاحة' : locale === 'en' ? 'Available Branches' : 'Mevcut Branşlar'}>
                          {availableBranches.map((b) => {
                            const bName = locale === 'ar' ? b.name_ar : locale === 'en' ? b.name_en : b.name_tr;
                            return (
                              <option key={b.slug} value={b.slug}>
                                {bName}
                              </option>
                            );
                          })}
                        </optgroup>
                        <option value="custom_new" className="font-black text-primary">
                          {d.new_branch_option}
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setIsCustomBranch(!isCustomBranch)}
                        className={cn(
                          "px-3 py-2 rounded-md text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5",
                          isCustomBranch 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Plus size={14} />
                        <span>{locale === 'ar' ? 'فرع جديد' : locale === 'en' ? 'New Branch' : 'Yeni Branş'}</span>
                      </button>
                    </div>

                    {/* New Branch Custom Inputs */}
                    {isCustomBranch && (
                      <div className="p-3 bg-background border border-primary/30 rounded-md space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-primary flex items-center gap-1.5">
                            <Layers size={13} />
                            <span>{d.custom_branch_box_title}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {locale === 'ar' ? 'سيتم حفظ هذا الفرع تلقائياً' : locale === 'en' ? 'Will be saved automatically' : 'Otomatik kaydedilecek'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">{d.label_branch_ar}</label>
                            <input
                              value={customBranch.ar}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomBranch(prev => ({
                                  ...prev,
                                  ar: val,
                                  tr: prev.tr || val,
                                  en: prev.en || val
                                }));
                              }}
                              placeholder={d.placeholder_branch_ar}
                              className="w-full px-2.5 py-1.5 rounded-md border bg-muted/20 text-xs font-bold"
                              dir="rtl"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">{d.label_branch_tr}</label>
                            <input
                              value={customBranch.tr}
                              onChange={(e) => setCustomBranch(prev => ({ ...prev, tr: e.target.value }))}
                              placeholder={d.placeholder_branch_tr}
                              className="w-full px-2.5 py-1.5 rounded-md border bg-muted/20 text-xs font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground">{d.label_branch_en}</label>
                            <input
                              value={customBranch.en}
                              onChange={(e) => setCustomBranch(prev => ({ ...prev, en: e.target.value }))}
                              placeholder={d.placeholder_branch_en}
                              className="w-full px-2.5 py-1.5 rounded-md border bg-muted/20 text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Service / Operation Name Inputs (Free text - no select dropdown) */}
                <div className="p-3.5 bg-muted/20 border rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Wrench size={14} />
                      <span>{d.label_service_type}</span>
                    </label>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {locale === 'ar' ? 'اكتب اسم الخدمة أو نوع العطل/القطعة بحرية' : locale === 'en' ? 'Type service or operation name freely' : 'Hizmet veya işlem adını serbestçe yazın'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_service_ar}</label>
                      <input
                        value={form.service_name_ar}
                        onChange={(e) => setForm(prev => ({ ...prev, service_name_ar: e.target.value }))}
                        placeholder="مثال: تبديل الشاشة، تغيير بطارية..."
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_service_tr}</label>
                      <input
                        value={form.service_name_tr}
                        onChange={(e) => setForm(prev => ({ ...prev, service_name_tr: e.target.value }))}
                        placeholder="Örn: Ekran Değişimi, Batarya Değişimi..."
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_service_en}</label>
                      <input
                        value={form.service_name_en}
                        onChange={(e) => setForm(prev => ({ ...prev, service_name_en: e.target.value }))}
                        placeholder="e.g. Screen Replacement, Battery..."
                        className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Brand & Series & Model */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_brand}</label>
                    <input
                      value={form.brand}
                      onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder={d.placeholder_brand}
                      className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_series}</label>
                    <input
                      value={form.series}
                      onChange={(e) => setForm(prev => ({ ...prev, series: e.target.value }))}
                      placeholder={d.placeholder_series}
                      className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_model}</label>
                    <input
                      value={form.model_name}
                      onChange={(e) => setForm(prev => ({ ...prev, model_name: e.target.value }))}
                      placeholder={d.placeholder_model}
                      className="w-full px-3 py-2 rounded-md border bg-background text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {/* 4. Base Price & Warranty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_base_price}</label>
                    <input
                      type="number"
                      value={form.base_price}
                      onChange={(e) => setForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold text-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{d.label_warranty}</label>
                    <input
                      value={form.warranty}
                      onChange={(e) => setForm(prev => ({ ...prev, warranty: e.target.value }))}
                      placeholder={d.placeholder_warranty}
                      className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold"
                    />
                  </div>
                </div>

                {/* 5. Quality Options Section with Arabic, Turkish, and English fields */}
                <div className="space-y-3 p-4 bg-muted/20 rounded-md border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider">{d.quality_section_title}</h4>
                      <p className="text-[10px] text-muted-foreground">{d.quality_section_sub}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddQuality}
                      className="flex items-center gap-1 text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 border border-primary/20 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>{d.add_quality_btn}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {form.quality_options.map((q, idx) => (
                      <div key={idx} className="p-3 bg-background rounded-lg border space-y-2 shadow-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">{d.label_quality_name_ar}</label>
                            <input
                              value={q.quality_ar || ''}
                              onChange={(e) => handleUpdateQuality(idx, 'quality_ar', e.target.value)}
                              placeholder={d.placeholder_quality_ar}
                              className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-bold"
                              dir="rtl"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">{d.label_quality_name_tr}</label>
                            <input
                              value={q.quality_tr || ''}
                              onChange={(e) => handleUpdateQuality(idx, 'quality_tr', e.target.value)}
                              placeholder={d.placeholder_quality_tr}
                              className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">{d.label_quality_name_en}</label>
                            <input
                              value={q.quality_en || ''}
                              onChange={(e) => handleUpdateQuality(idx, 'quality_en', e.target.value)}
                              placeholder={d.placeholder_quality_en}
                              className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-bold"
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
                              className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-black text-primary"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              value={q.badge || ''}
                              onChange={(e) => handleUpdateQuality(idx, 'badge', e.target.value)}
                              placeholder={d.placeholder_badge}
                              className="w-full px-2.5 py-1.5 rounded-lg border bg-background text-xs font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuality(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title={d.remove_quality}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {form.quality_options.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground italic py-2">
                        {d.empty_qualities}
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. Popular & In Stock Switches */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={form.is_popular}
                      onChange={(e) => setForm(prev => ({ ...prev, is_popular: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span>{d.popular_checkbox}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={form.in_stock}
                      onChange={(e) => setForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span>{d.in_stock_checkbox}</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 cursor-pointer"
                  >
                    {d.cancel_btn}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Check size={16} />
                    <span>{editingItem ? d.save_edit_btn : d.save_add_btn}</span>
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
              className="relative w-full max-w-md bg-card rounded-lg border p-6 shadow-2xl text-center z-10"
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
                  className="px-5 py-2.5 rounded-lg border text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer"
                >
                  {d.cancel_btn}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
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
              className="relative w-full max-w-md bg-card rounded-xl border p-6 shadow-2xl text-center z-10"
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
                  className="px-5 py-2.5 rounded-lg border text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer"
                >
                  {d.cancel_btn}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
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
              className="relative w-full max-w-md bg-card rounded-xl border p-6 shadow-2xl text-center z-10"
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
                  className="px-5 py-2.5 rounded-lg border text-xs font-black uppercase hover:bg-muted transition-colors cursor-pointer"
                >
                  {d.cancel_btn}
                </button>
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{d.seed_confirm_btn}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
