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
import dynamic from 'next/dynamic';
import { STORE_CATEGORIES } from '@/lib/store-data';

const JoditEditor = dynamic(() => import('@/components/JoditEditor'), { ssr: false });

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
  max_price?: number;
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
  description_tr?: string;
  description_en?: string;
  description_ar?: string;
  image_url?: string;
  images?: string[];
  show_badge?: boolean;
  badge_text_tr?: string;
  badge_text_en?: string;
  badge_text_ar?: string;
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
    th_qualities: "الصور والمواصفات",
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
    image_section_title: "صور المنتج (يمكن إضافة أكثر من صورة)",
    image_section_sub: "ارفع صور المنتج من جهازك أو أضف روابط خارجية مباشرة. الصورة الأولى هي الغلاف الرئيسي.",
    upload_image_btn: "رفع صور من الجهاز",
    uploading_image: "جاري رفع الصور...",
    remove_image: "إزالة الصورة",
    image_url_placeholder: "الصق رابط صورة مباشرة هنا (URL)...",
    add_image_link_btn: "+ إضافة الرابط",
    main_image_badge: "الصورة الرئيسية",
    set_as_main_btn: "تعيين كرئيسية",
    no_images_yet: "لم يتم رفع أي صور بعد. ستظهر صورة افتراضية للمنتج.",
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
    specs_section_title: "المواصفات الفنية للمنتج",
    specs_section_sub: "اكتب المواصفات الفنية للمنتج ليتم عرضها بشكل احترافي للزبون في صفحة المنتج",
    label_specs_ar: "المواصفات (عربي)",
    label_specs_tr: "المواصفات (تركي)",
    label_specs_en: "المواصفات (إنجليزي)",
    placeholder_specs_ar: "مثال: المعالج: A18 Pro | الشاشة: 6.9 بوصة Super Retina XDR OLED | الذاكرة: 256GB | الكاميرا: 48MP",
    placeholder_specs_tr: "Örn: İşlemci: A18 Pro | Ekran: 6.9 inç OLED | Hafıza: 256 GB | Kamera: 48MP",
    placeholder_specs_en: "e.g. Processor: A18 Pro | Display: 6.9\" OLED | Storage: 256GB | Camera: 48MP",
    desc_section_title: "شرح وتفاصيل المنتج (الوصف الشامل)",
    desc_section_sub: "اكتب شرحاً تفصيلياً يوضح ميزات المنتج، حالته، وفائدته للمستخدم",
    label_desc_ar: "شرح وتفاصيل المنتج (عربي)",
    label_desc_tr: "شرح وتفاصيل المنتج (تركي)",
    label_desc_en: "شرح وتفاصيل المنتج (إنجليزي)",
    placeholder_desc_ar: "اكتب تفاصيل وشرح المنتج هنا...",
    placeholder_desc_tr: "Ürün detaylı açıklamasını buraya yazın...",
    placeholder_desc_en: "Write detailed product description here...",
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
    th_qualities: "Photos & Specs",
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
    image_section_title: "Product Photos (Multiple Photos Supported)",
    image_section_sub: "Upload product photos from your device or paste direct URLs. The first image will be the main cover.",
    upload_image_btn: "Upload Photos from Device",
    uploading_image: "Uploading images...",
    remove_image: "Remove Photo",
    image_url_placeholder: "Paste direct image URL here...",
    add_image_link_btn: "+ Add Link",
    main_image_badge: "Main Cover",
    set_as_main_btn: "Set as Main",
    no_images_yet: "No images added yet. A default image will be shown on the website.",
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
    specs_section_title: "Technical Specifications",
    specs_section_sub: "Enter the technical specifications of the product to display on the product page",
    label_specs_ar: "Specifications (AR)",
    label_specs_tr: "Specifications (TR)",
    label_specs_en: "Specifications (EN)",
    placeholder_specs_ar: "e.g. Chip: A18 Pro | Display: 6.9\" OLED | Storage: 256GB | Camera: 48MP",
    placeholder_specs_tr: "Örn: İşlemci: A18 Pro | Ekran: 6.9 inç OLED | Hafıza: 256 GB | Kamera: 48MP",
    placeholder_specs_en: "e.g. Processor: A18 Pro | Display: 6.9\" OLED | Storage: 256GB | Camera: 48MP",
    desc_section_title: "Product Description & Details",
    desc_section_sub: "Write a comprehensive description explaining product features, condition, warranty and benefits",
    label_desc_ar: "Description (AR)",
    label_desc_tr: "Description (TR)",
    label_desc_en: "Description (EN)",
    placeholder_desc_ar: "Write product description here...",
    placeholder_desc_tr: "Ürün açıklamasını buraya yazın...",
    placeholder_desc_en: "Write detailed product description here...",
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
    th_qualities: "Görseller & Özellikler",
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
    image_section_title: "Ürün Fotoğrafları (Çoklu Fotoğraf Desteği)",
    image_section_sub: "Cihazınızdan ürün fotoğraflarını yükleyin veya doğrudan URL bağlantısı ekleyin. İlk görsel ana kapaktır.",
    upload_image_btn: "Cihazdan Fotoğraf Yükle",
    uploading_image: "Fotoğraflar yükleniyor...",
    remove_image: "Görseli Kaldır",
    image_url_placeholder: "Doğrudan görsel bağlantısını (URL) buraya yapıştırın...",
    add_image_link_btn: "+ Bağlantı Ekle",
    main_image_badge: "Ana Görsel",
    set_as_main_btn: "Ana Görsel Yap",
    no_images_yet: "Henüz görsel eklenmedi. Sitede varsayılan görsel gösterilecektir.",
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
    specs_section_title: "Teknik Özellikler",
    specs_section_sub: "Müşteriye ürün sayfasında gösterilecek teknik özellikleri giriniz",
    label_specs_ar: "Özellikler (AR)",
    label_specs_tr: "Özellikler (TR)",
    label_specs_en: "Özellikler (EN)",
    placeholder_specs_ar: "مثال: المعالج: A18 Pro | الشاشة: 6.9 بوصة OLED | الذاكرة: 256GB | الكاميرا: 48MP",
    placeholder_specs_tr: "Örn: İşlemci: A18 Pro | Ekran: 6.9 inç OLED | Hafıza: 256 GB | Kamera: 48MP",
    placeholder_specs_en: "e.g. Processor: A18 Pro | Display: 6.9\" OLED | Storage: 256GB | Camera: 48MP",
    desc_section_title: "Ürün Açıklaması ve Detayları",
    desc_section_sub: "Ürün avantajlarını, durumunu ve garantisini anlatan kapsamlı açıklama yazın",
    label_desc_ar: "Açıklama (AR)",
    label_desc_tr: "Açıklama (TR)",
    label_desc_en: "Açıklama (EN)",
    placeholder_desc_ar: "اكتب تفاصيل وشرح المنتج هنا...",
    placeholder_desc_tr: "Ürün detaylı açıklamasını buraya yazın...",
    placeholder_desc_en: "Write detailed product description here...",
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
  const [newCatTab, setNewCatTab] = useState<'ar' | 'tr' | 'en'>('ar');
  const [editCatTab, setEditCatTab] = useState<'ar' | 'tr' | 'en'>('ar');
  const [productTab, setProductTab] = useState<'ar' | 'tr' | 'en'>('ar');
  const [newCat, setNewCat] = useState({
    id: '',
    title_ar: '',
    title_tr: '',
    title_en: '',
    desc_ar: '',
    desc_tr: '',
    desc_en: '',
    specs_ar: '',
    specs_tr: '',
    specs_en: '',
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
    description_tr: '',
    description_en: '',
    description_ar: '',
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
    max_price: 0,
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
    images: [] as string[],
    quality_options: [] as QualityOption[],
    show_badge: true,
    badge_text_ar: 'أصلي',
    badge_text_tr: 'Orijinal',
    badge_text_en: 'Original'
  });
  const [manualImageUrl, setManualImageUrl] = useState('');

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
      specs_ar: c.specs_ar || '',
      specs_tr: c.specs_tr || '',
      specs_en: c.specs_en || '',
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
      description_tr: '',
      description_en: '',
      description_ar: '',
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
      max_price: 0,
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
      images: [],
      quality_options: [],
      show_badge: true,
      badge_text_ar: 'أصلي',
      badge_text_tr: 'Orijinal',
      badge_text_en: 'Original'
    });
    setManualImageUrl('');
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

    const existingImages: string[] = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image_url ? [item.image_url] : []);

    setForm({
      brand: item.brand,
      device_type: item.device_type || 'phone',
      item_type: item.item_type || 'yedek_parca',
      part_type: item.part_type || 'ekran',
      specs_tr: item.specs_tr || '',
      specs_en: item.specs_en || '',
      specs_ar: item.specs_ar || '',
      description_tr: item.description_tr || item.notes_tr || '',
      description_en: item.description_en || item.notes_en || '',
      description_ar: item.description_ar || item.notes_ar || '',
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
      max_price: item.max_price || 0,
      currency: item.currency,
      duration: item.duration,
      warranty: item.warranty,
      is_popular: item.is_popular,
      in_stock: item.in_stock,
      sort_order: item.sort_order,
      notes_tr: item.notes_tr || '',
      notes_en: item.notes_en || '',
      notes_ar: item.notes_ar || '',
      image_url: existingImages[0] || item.image_url || '',
      images: existingImages,
      quality_options: [],
      show_badge: item.show_badge !== false && (item as any).show_badge !== 0,
      badge_text_ar: item.badge_text_ar ?? 'أصلي',
      badge_text_tr: item.badge_text_tr ?? 'Orijinal',
      badge_text_en: item.badge_text_en ?? 'Original'
    });
    setManualImageUrl('');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const token = localStorage.getItem('token');
    setUploadingImage(true);
    try {
      let uploadedUrls: string[] = [];

      // Try batch upload endpoint if multiple
      if (files.length > 1) {
        try {
          const batchData = new FormData();
          files.forEach(f => batchData.append('images', f));
          const res = await axios.post<{ urls: string[] }>(`${API_BASE}/upload/multiple`, batchData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          if (Array.isArray(res.data?.urls) && res.data.urls.length > 0) {
            uploadedUrls = res.data.urls;
          }
        } catch (mErr) {
          console.warn('Batch upload failed, falling back to individual uploads', mErr);
        }
      }

      // Individual upload fallback
      if (uploadedUrls.length === 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('image', file);
          const res = await axios.post<{ url: string }>(`${API_BASE}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          if (res.data?.url) {
            uploadedUrls.push(res.data.url);
          }
        }
      }

      if (uploadedUrls.length > 0) {
        setForm(prev => {
          const updated = [...(prev.images || []), ...uploadedUrls];
          return {
            ...prev,
            images: updated,
            image_url: updated[0] || prev.image_url || ''
          };
        });
        toast.success(
          locale === 'ar' 
            ? `تم رفع ${uploadedUrls.length} صورة بنجاح!` 
            : locale === 'en' 
              ? `${uploadedUrls.length} image(s) uploaded successfully!` 
              : `${uploadedUrls.length} resim başarıyla yüklendi!`
        );
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(locale === 'ar' ? 'فشل رفع الصور' : locale === 'en' ? 'Upload failed' : 'Resim yükleme başarısız');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) return;
    const url = manualImageUrl.trim();
    setForm(prev => {
      const updated = [...(prev.images || []), url];
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || url
      };
    });
    setManualImageUrl('');
    toast.success(locale === 'ar' ? 'تمت إضافة رابط الصورة بنجاح' : locale === 'en' ? 'Image link added' : 'Resim bağlantısı eklendi');
  };

  const handleRemoveImageAtIndex = (idx: number) => {
    setForm(prev => {
      const updated = [...(prev.images || [])];
      updated.splice(idx, 1);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || ''
      };
    });
  };

  const handleSetMainCoverImage = (idx: number) => {
    setForm(prev => {
      const updated = [...(prev.images || [])];
      const [chosen] = updated.splice(idx, 1);
      if (chosen) {
        updated.unshift(chosen);
      }
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || ''
      };
    });
    toast.success(locale === 'ar' ? 'تم تعيين هذه الصورة كغلاف رئيسي' : locale === 'en' ? 'Set as main cover image' : 'Ana görsel olarak ayarlandı');
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

    const determinedItemType = form.item_type || (branchSlug === 'aksesuar' ? 'aksesuar' : branchSlug === 'yedek_parca' ? 'yedek_parca' : 'cihaz');

    const payload = {
      ...form,
      item_type: determinedItemType,
      part_type: form.part_type || 'ekran',
      max_price: form.max_price && form.max_price > 0 ? form.max_price : null,
      specs_ar: form.specs_ar || '',
      specs_tr: form.specs_tr || '',
      specs_en: form.specs_en || '',
      description_ar: form.description_ar || form.specs_ar || '',
      description_tr: form.description_tr || form.specs_tr || '',
      description_en: form.description_en || form.specs_en || '',
      show_badge: form.show_badge ?? true,
      badge_text_ar: form.badge_text_ar || '',
      badge_text_tr: form.badge_text_tr || '',
      badge_text_en: form.badge_text_en || '',
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
    const catBanner = (newCat.banner_image || newCat.image || '').trim() || '/images/phones-banner.jpg';
    const catDescAr = newCat.desc_ar.trim();
    const catDescTr = newCat.desc_tr.trim() || catDescAr;
    const catDescEn = newCat.desc_en.trim() || catDescAr;

    const newItem = {
      id: idClean,
      title_ar: arTitle,
      title_tr: newCat.title_tr.trim() || arTitle,
      title_en: newCat.title_en.trim() || arTitle,
      desc_ar: catDescAr,
      desc_tr: catDescTr,
      desc_en: catDescEn,
      specs_ar: newCat.specs_ar || '',
      specs_tr: newCat.specs_tr || '',
      specs_en: newCat.specs_en || '',
      image: catBanner,
      banner_image: catBanner,
      banner_title_ar: newCat.banner_title_ar || '',
      banner_title_tr: newCat.banner_title_tr || '',
      banner_title_en: newCat.banner_title_en || '',
      banner_desc_ar: newCat.banner_desc_ar || '',
      banner_desc_tr: newCat.banner_desc_tr || '',
      banner_desc_en: newCat.banner_desc_en || '',
      banner_cta_ar: newCat.banner_cta_ar || '',
      banner_cta_tr: newCat.banner_cta_tr || '',
      banner_cta_en: newCat.banner_cta_en || '',
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
      specs_ar: '',
      specs_tr: '',
      specs_en: '',
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
      specs_ar: cat.specs_ar || '',
      specs_tr: cat.specs_tr || '',
      specs_en: cat.specs_en || '',
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
    setEditCatTab('ar');
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

    const catBanner = (editingCat.banner_image || editingCat.image || '').trim() || '/images/phones-banner.jpg';
    const catDescAr = (editingCat.desc_ar || '').trim();
    const catDescTr = (editingCat.desc_tr || '').trim() || catDescAr;
    const catDescEn = (editingCat.desc_en || '').trim() || catDescAr;

    const updatedCat = {
      ...editingCat,
      title_ar: arTitle,
      title_tr: editingCat.title_tr?.trim() || arTitle,
      title_en: editingCat.title_en?.trim() || arTitle,
      desc_ar: catDescAr,
      desc_tr: catDescTr,
      desc_en: catDescEn,
      specs_ar: editingCat.specs_ar || '',
      specs_tr: editingCat.specs_tr || '',
      specs_en: editingCat.specs_en || '',
      image: catBanner,
      banner_image: catBanner,
      banner_title_ar: editingCat.banner_title_ar || '',
      banner_title_tr: editingCat.banner_title_tr || '',
      banner_title_en: editingCat.banner_title_en || '',
      banner_desc_ar: editingCat.banner_desc_ar || '',
      banner_desc_tr: editingCat.banner_desc_tr || '',
      banner_desc_en: editingCat.banner_desc_en || '',
      banner_cta_ar: editingCat.banner_cta_ar || '',
      banner_cta_tr: editingCat.banner_cta_tr || '',
      banner_cta_en: editingCat.banner_cta_en || '',
    };

    const updatedList = categoryCards.map(c => c.id === editingCat.id ? updatedCat : c);
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
                              {item.show_badge !== false && (item.badge_text_ar || item.badge_text_tr || item.badge_text_en) && (
                                <span className="text-[9px] bg-linear-to-r from-rose-600 to-[#E11D48] text-white border border-rose-500/30 px-1.5 py-0.5 rounded font-black uppercase shrink-0 shadow-2xs flex items-center">
                                  <span>{locale === 'ar' ? (item.badge_text_ar || item.badge_text_tr) : locale === 'en' ? (item.badge_text_en || item.badge_text_tr) : (item.badge_text_tr || item.badge_text_ar)}</span>
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
                        <span className="font-black text-sm text-primary whitespace-nowrap">
                          {item.max_price && item.max_price > item.base_price
                            ? `${item.base_price.toLocaleString('tr-TR')} - ${item.max_price.toLocaleString('tr-TR')} ${item.currency}`
                            : `${item.base_price.toLocaleString('tr-TR')} ${item.currency}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-[240px]">
                          {/* Photo count indicator */}
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                              <ImageIcon size={11} />
                              <span>
                                {item.images && item.images.length > 0
                                  ? `${item.images.length} ${locale === 'ar' ? 'صور' : locale === 'en' ? 'Photos' : 'Görsel'}`
                                  : item.image_url 
                                    ? `1 ${locale === 'ar' ? 'صورة' : locale === 'en' ? 'Photo' : 'Görsel'}`
                                    : (locale === 'ar' ? 'بدون صور' : 'Görselsiz')}
                              </span>
                            </span>
                          </div>

                          {/* Specs text preview */}
                          {(item.specs_ar || item.specs_tr || item.specs_en) ? (
                            <p 
                              className="text-[10px] text-muted-foreground font-medium truncate line-clamp-1"
                              title={locale === 'ar' ? (item.specs_ar || item.specs_tr || '') : locale === 'en' ? (item.specs_en || item.specs_tr || '') : (item.specs_tr || item.specs_ar || '')}
                            >
                              {locale === 'ar' ? (item.specs_ar || item.specs_tr) : locale === 'en' ? (item.specs_en || item.specs_tr) : (item.specs_tr || item.specs_ar)}
                            </p>
                          ) : (item.description_ar || item.description_tr || item.description_en) ? (
                            <p 
                              className="text-[10px] text-muted-foreground/70 italic truncate line-clamp-1"
                              title={locale === 'ar' ? (item.description_ar || item.description_tr || '') : (item.description_tr || item.description_ar || '')}
                            >
                              {locale === 'ar' ? (item.description_ar || item.description_tr) : (item.description_tr || item.description_ar)}
                            </p>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/50 italic">
                              {locale === 'ar' ? 'لا توجد مواصفات' : locale === 'en' ? 'No specs' : 'Özellik yok'}
                            </span>
                          )}
                        </div>
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
      {/* Modal for Add / Edit Product */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-card w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-6"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              {/* Clean Modal Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b bg-muted/10">
                <div>
                  <h3 className="font-black text-lg text-foreground tracking-tight">
                    {editingItem 
                      ? (locale === 'ar' ? 'تعديل بيانات المنتج' : d.modal_edit_title) 
                      : (locale === 'ar' ? 'إضافة منتج جديد' : d.modal_add_title)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {editingItem 
                      ? (locale === 'ar' ? 'قم بتحديث أسعار ومعلومات ومواصفات المنتج' : 'Ürün fiyat ve bilgilerini güncelleyin') 
                      : (locale === 'ar' ? 'أدخل تفاصيل ومواصفات وأسعار المنتج الجديد' : 'Yeni ürünün detaylarını ve fiyatlarını girin')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-7 space-y-6 max-h-[82vh] overflow-y-auto">
                {/* 1. BASIC DETAILS & PRICING */}
                <div className="rounded-xl border border-border/70 bg-muted/10 p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    {locale === 'ar' ? 'البيانات الأساسية والأسعار' : 'Temel Bilgiler ve Fiyatlar'}
                  </h4>

                  {/* Product Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-foreground block">
                      {locale === 'ar' ? 'اسم المنتج أو الموديل *' : d.label_model}
                    </label>
                    <input
                      value={form.model_name}
                      onChange={(e) => setForm(prev => ({ ...prev, model_name: e.target.value }))}
                      placeholder={locale === 'ar' ? 'مثال: iPhone 16 Pro Max 256GB أو شاشة سامسونج S24 أصلية' : d.placeholder_model}
                      className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm font-bold focus:border-primary outline-hidden shadow-xs"
                      required
                    />
                  </div>

                  {/* Category & Brand */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Dropdown with [+ قسم جديد] */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-foreground">
                          {locale === 'ar' ? 'قسم المتجر *' : d.label_main_branch}
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsNewCatModalOpen(true)}
                          className="text-xs text-primary hover:underline font-bold cursor-pointer"
                        >
                          {locale === 'ar' ? '+ قسم جديد' : '+ Yeni Kategori'}
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
                        className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary cursor-pointer shadow-xs"
                      >
                        {availableBranches.map((b) => (
                          <option key={b.slug} value={b.slug}>
                            {locale === 'ar' ? b.name_ar : locale === 'en' ? b.name_en : b.name_tr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Brand Input & Quick Suggestions */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        {locale === 'ar' ? 'الماركة / الشركة *' : d.label_brand}
                      </label>
                      <input
                        value={form.brand}
                        onChange={(e) => setForm(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder={locale === 'ar' ? 'مثال: Apple, Samsung, Xiaomi' : d.placeholder_brand}
                        className="w-full px-3.5 py-2.5 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                        required
                      />
                      {/* Subtle Quick Brand Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {['Apple', 'Samsung', 'Xiaomi', 'Dyson', 'Roborock', 'Huawei', 'Asus', 'HP'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setForm(prev => ({ ...prev, brand: b }))}
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer",
                              form.brand.toLowerCase() === b.toLowerCase()
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Duration Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        {locale === 'ar' ? 'السعر الأساسي (من) ₺ *' : 'Temel Fiyat ₺ *'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={form.base_price}
                          onChange={(e) => setForm(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-black text-primary outline-hidden focus:border-primary shadow-xs"
                          required
                        />
                        <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ₺
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        {locale === 'ar' ? 'السعر حتى (إلى) ₺' : 'Maksimum Fiyat ₺'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={form.max_price || ''}
                          onChange={(e) => setForm(prev => ({ ...prev, max_price: parseFloat(e.target.value) || 0 }))}
                          placeholder={locale === 'ar' ? 'اختياري' : 'İsteğe bağlı'}
                          className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-black text-primary outline-hidden focus:border-primary shadow-xs"
                        />
                        <span className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                          ₺
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        {locale === 'ar' ? 'مدة الضمان' : d.label_warranty}
                      </label>
                      <input
                        value={form.warranty}
                        onChange={(e) => setForm(prev => ({ ...prev, warranty: e.target.value }))}
                        placeholder={locale === 'ar' ? 'مثال: ضمان 6 أشهر' : d.placeholder_warranty}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        {locale === 'ar' ? 'مدة التركيب / الشحن' : d.label_duration}
                      </label>
                      <input
                        value={form.duration}
                        onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder={locale === 'ar' ? 'مثال: 30 دقيقة' : d.placeholder_duration}
                        className="w-full px-3 py-2 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Stock & Popular Toggles */}
                  <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/60">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.in_stock}
                        onChange={(e) => setForm(prev => ({ ...prev, in_stock: e.target.checked }))}
                        className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
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
                        className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                      />
                      <span className="text-xs font-black text-foreground">
                        {locale === 'ar' ? 'موديل مميز / الأكثر طلباً' : d.popular_checkbox}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 2. PRODUCT IMAGES UPLOAD */}
                <div className="rounded-xl border border-border/70 bg-muted/10 p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                        <span>{locale === 'ar' ? 'صور المنتج' : d.image_section_title}</span>
                        {form.images && form.images.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {form.images.length}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {locale === 'ar' ? 'الصورة الأولى ستكون الغلاف الرئيسي المعروض على الكارد' : d.image_section_sub}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-black transition-all cursor-pointer shadow-xs hover:bg-primary/90 disabled:opacity-50"
                      >
                        {uploadingImage ? (locale === 'ar' ? 'جاري الرفع...' : d.uploading_image) : (locale === 'ar' ? 'رفع صور من الجهاز' : d.upload_image_btn)}
                      </button>
                    </div>
                  </div>

                  {/* Manual URL Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddManualImage();
                        }
                      }}
                      placeholder={locale === 'ar' ? 'أو ألصق رابط صورة مباشر (URL)...' : d.image_url_placeholder}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background text-xs font-medium outline-hidden focus:border-primary shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      disabled={!manualImageUrl.trim()}
                      className="px-4 py-2 rounded-lg bg-background hover:bg-muted text-foreground border text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                    >
                      {locale === 'ar' ? 'إضافة الرابط' : d.add_image_link_btn}
                    </button>
                  </div>

                  {/* Images Thumbnails Grid */}
                  {form.images && form.images.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {form.images.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "relative group rounded-lg border overflow-hidden bg-background aspect-square flex items-center justify-center p-1 transition-all shadow-xs",
                            idx === 0 ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-foreground/30"
                          )}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Product ${idx + 1}`} 
                            className="w-full h-full object-contain"
                          />

                          {/* Cover badge */}
                          {idx === 0 && (
                            <span className="absolute top-1 start-1 bg-primary text-primary-foreground text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs z-10">
                              {locale === 'ar' ? 'الغلاف' : d.main_image_badge}
                            </span>
                          )}

                          {/* Hover Controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetMainCoverImage(idx)}
                                className="w-full text-[9px] font-black bg-primary text-primary-foreground py-1 px-1.5 rounded hover:bg-primary/90 transition-colors shadow-xs text-center cursor-pointer"
                              >
                                {locale === 'ar' ? 'تعيين كغلاف' : d.set_as_main_btn}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageAtIndex(idx)}
                              className="w-full text-[9px] font-black bg-red-600 text-white py-1 px-1.5 rounded hover:bg-red-700 transition-colors shadow-xs text-center cursor-pointer"
                            >
                              {locale === 'ar' ? 'حذف' : 'Sil'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center rounded-lg border border-dashed border-border text-muted-foreground text-xs font-semibold">
                      {locale === 'ar' ? 'لم يتم إضافة صور للمنتج بعد' : d.no_images_yet}
                    </div>
                  )}
                </div>

                {/* 3. CARD BADGE (OPTIONAL - CLEAN WITHOUT STARS OR ICONS) */}
                <div className="rounded-xl border border-border/70 bg-muted/10 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                        {locale === 'ar' ? 'شارة التمييز على صورة المنتج (Badge)' : 'Ürün Kartı Rozeti'}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {locale === 'ar' ? 'شارة تظهر على زاوية صورة المنتج (مثال: أصلي، وكالة، جديد)' : 'Ürün görseli üzerindeki rozet metni'}
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-background px-3 py-1.5 rounded-lg border text-xs font-bold shadow-xs">
                      <input
                        type="checkbox"
                        checked={form.show_badge}
                        onChange={(e) => setForm(prev => ({ ...prev, show_badge: e.target.checked }))}
                        className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                      />
                      <span>
                        {locale === 'ar' ? 'تفعيل الشارة' : 'Rozeti Göster'}
                      </span>
                    </label>
                  </div>

                  {form.show_badge && (
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black text-muted-foreground uppercase">
                          {locale === 'ar' ? 'نماذج جاهزة:' : 'Şablonlar:'}
                        </span>
                        {[
                          { ar: 'أصلي', tr: 'Orijinal', en: 'Original' },
                          { ar: 'وكالة', tr: 'Servis', en: 'Official' },
                          { ar: 'جديد', tr: 'Yeni', en: 'New' },
                          { ar: 'الأكثر طلباً', tr: 'Popüler', en: 'Popular' },
                          { ar: 'خصم خاص', tr: 'İndirim', en: 'Sale' },
                          { ar: 'OEM', tr: 'OEM', en: 'OEM' }
                        ].map(preset => (
                          <button
                            key={preset.tr}
                            type="button"
                            onClick={() => setForm(prev => ({
                              ...prev,
                              badge_text_ar: preset.ar,
                              badge_text_tr: preset.tr,
                              badge_text_en: preset.en,
                            }))}
                            className="text-[10px] font-bold px-2 py-0.5 rounded border bg-background hover:bg-muted text-foreground transition-all cursor-pointer"
                          >
                            {locale === 'ar' ? preset.ar : locale === 'en' ? preset.en : preset.tr}
                          </button>
                        ))}
                      </div>

                      {/* 3 Language Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground block">
                            {locale === 'ar' ? 'نص الشارة (عربي)' : 'Arapça Rozet'}
                          </label>
                          <input
                            value={form.badge_text_ar}
                            onChange={(e) => setForm(prev => ({ ...prev, badge_text_ar: e.target.value }))}
                            placeholder="مثال: أصلي، جديد..."
                            className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                            dir="rtl"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground block">
                            {locale === 'ar' ? 'نص الشارة (تركي)' : 'Türkçe Rozet'}
                          </label>
                          <input
                            value={form.badge_text_tr}
                            onChange={(e) => setForm(prev => ({ ...prev, badge_text_tr: e.target.value }))}
                            placeholder="Örn: Orijinal, Yeni..."
                            className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-foreground block">
                            {locale === 'ar' ? 'نص الشارة (إنجليزي)' : 'İngilizce Rozet'}
                          </label>
                          <input
                            value={form.badge_text_en}
                            onChange={(e) => setForm(prev => ({ ...prev, badge_text_en: e.target.value }))}
                            placeholder="e.g. Original, New..."
                            className="w-full px-3 py-1.5 rounded-lg border bg-background text-xs font-bold outline-hidden focus:border-primary shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Live Badge Preview (NO STARS!) */}
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground text-[11px]">
                          {locale === 'ar' ? 'معاينة الشارة:' : 'Önizleme:'}
                        </span>
                        <span className="bg-linear-to-r from-rose-600 to-[#E11D48] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs border border-white/20 select-none">
                          {(locale === 'ar' ? form.badge_text_ar : locale === 'en' ? form.badge_text_en : form.badge_text_tr) || 'Orijinal'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. DESCRIPTION & SPECIFICATIONS */}
                <div className="rounded-xl border border-border/70 bg-muted/10 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                      {locale === 'ar' ? 'الوصف والمواصفات الفنية' : 'Açıklama ve Teknik Özellikler'}
                    </h4>
                  </div>

                  {/* Language Tabs */}
                  <div className="flex border-b border-border/60 pb-px gap-2">
                    <button
                      type="button"
                      onClick={() => setProductTab('ar')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                        productTab === 'ar'
                          ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-sm">🇸🇦</span>
                      <span>العربية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductTab('tr')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                        productTab === 'tr'
                          ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-sm">🇹🇷</span>
                      <span>Türkçe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductTab('en')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                        productTab === 'en'
                          ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-sm">🇺🇸</span>
                      <span>English</span>
                    </button>
                  </div>

                  {/* Arabic Tab */}
                  <div className={cn("space-y-4", productTab === 'ar' ? "block" : "hidden")} dir="rtl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        وصف وشرح المنتج (عربي)
                      </label>
                      <textarea
                        rows={3}
                        value={form.description_ar}
                        onChange={(e) => setForm(prev => ({ ...prev, description_ar: e.target.value }))}
                        placeholder="اكتب شرحاً تفصيلياً يوضح ميزات وحالة المنتج والضمان باللغة العربية..."
                        className="w-full p-3 rounded-lg border bg-background text-xs font-medium focus:border-primary outline-hidden resize-none leading-relaxed"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        المواصفات الفنية للمنتج (معالج، شاشة، ذاكرة، بطارية...)
                      </label>
                      <JoditEditor
                        value={form.specs_ar}
                        onChange={(val) => setForm(prev => ({ ...prev, specs_ar: val }))}
                        placeholder="اكتب مواصفات وتفاصيل المنتج باللغة العربية..."
                        direction="rtl"
                        language="ar"
                        height={220}
                      />
                    </div>
                  </div>

                  {/* Turkish Tab */}
                  <div className={cn("space-y-4", productTab === 'tr' ? "block" : "hidden")} dir="ltr">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        Ürün Açıklaması ve Detayları (Türkçe)
                      </label>
                      <textarea
                        rows={3}
                        value={form.description_tr}
                        onChange={(e) => setForm(prev => ({ ...prev, description_tr: e.target.value }))}
                        placeholder="Ürün özelliklerini ve avantajlarını anlatan Türkçe açıklama..."
                        className="w-full p-3 rounded-lg border bg-background text-xs font-medium focus:border-primary outline-hidden resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        Teknik Özellikler (Türkçe)
                      </label>
                      <JoditEditor
                        value={form.specs_tr}
                        onChange={(val) => setForm(prev => ({ ...prev, specs_tr: val }))}
                        placeholder="İşlemci, ekran, hafıza gibi teknik özellikleri yazın..."
                        direction="ltr"
                        language="tr"
                        height={220}
                      />
                    </div>
                  </div>

                  {/* English Tab */}
                  <div className={cn("space-y-4", productTab === 'en' ? "block" : "hidden")} dir="ltr">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        Product Description & Details (English)
                      </label>
                      <textarea
                        rows={3}
                        value={form.description_en}
                        onChange={(e) => setForm(prev => ({ ...prev, description_en: e.target.value }))}
                        placeholder="Write comprehensive product description in English..."
                        className="w-full p-3 rounded-lg border bg-background text-xs font-medium focus:border-primary outline-hidden resize-none leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-foreground block">
                        Technical Specifications (English)
                      </label>
                      <JoditEditor
                        value={form.specs_en}
                        onChange={(val) => setForm(prev => ({ ...prev, specs_en: val }))}
                        placeholder="Write detailed product specifications in English..."
                        direction="ltr"
                        language="en"
                        height={220}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg border bg-background hover:bg-muted text-xs font-bold transition-colors cursor-pointer"
                  >
                    {locale === 'ar' ? 'إلغاء' : d.cancel_btn}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-7 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading 
                      ? (locale === 'ar' ? 'جاري الحفظ...' : 'Kaydediliyor...') 
                      : (editingItem ? (locale === 'ar' ? 'حفظ التعديلات' : d.save_edit_btn) : (locale === 'ar' ? 'إضافة المنتج' : d.save_add_btn))}
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

      {/* Modal for Adding New Main Category */}
      <AnimatePresence>
        {isNewCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-6"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                <div>
                  <h3 className="font-black text-base uppercase text-foreground">
                    {locale === 'ar' ? 'إضافة قسم جديد للمتجر' : 'Yeni Kategori Ekle'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {locale === 'ar' ? 'أدخل اسم ووصف وبانر القسم الجديد' : 'Yeni kategorinin adını, açıklamasını ve görselini girin'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Language Tabs Selection */}
                <div className="flex border-b border-border/50 pb-px gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCatTab('ar')}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                      newCatTab === 'ar' 
                        ? "border-primary text-primary bg-primary/5 rounded-t-md" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇸🇦</span>
                    <span>العربية</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatTab('tr')}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                      newCatTab === 'tr' 
                        ? "border-primary text-primary bg-primary/5 rounded-t-md" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇹🇷</span>
                    <span>Türkçe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCatTab('en')}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                      newCatTab === 'en' 
                        ? "border-primary text-primary bg-primary/5 rounded-t-md" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>

                {/* Arabic Tab Content */}
                <div className={cn("space-y-4", newCatTab === 'ar' ? "block" : "hidden")} dir="rtl">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      اسم القسم (عربي) *
                    </label>
                    <input
                      type="text"
                      value={newCat.title_ar}
                      onChange={(e) => setNewCat(prev => ({ ...prev, title_ar: e.target.value }))}
                      placeholder="مثال: الهواتف، اللابتوب، الشاشات..."
                      className="w-full text-sm font-bold px-3.5 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                      dir="rtl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      وصف القسم (عربي)
                    </label>
                    <textarea
                      rows={4}
                      value={newCat.desc_ar}
                      onChange={(e) => setNewCat(prev => ({ ...prev, desc_ar: e.target.value }))}
                      placeholder="اكتب وصفاً وشرحاً شاملاً لمحتويات وخدمات هذا القسم..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden resize-none leading-relaxed"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Turkish Tab Content */}
                <div className={cn("space-y-4", newCatTab === 'tr' ? "block" : "hidden")} dir="ltr">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Kategori Adı (Türkçe) *
                    </label>
                    <input
                      type="text"
                      value={newCat.title_tr}
                      onChange={(e) => setNewCat(prev => ({ ...prev, title_tr: e.target.value }))}
                      placeholder="Örn: Telefonlar, Laptoplar, Ekranlar..."
                      className="w-full text-sm font-bold px-3.5 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Kategori Açıklaması (Türkçe)
                    </label>
                    <textarea
                      rows={4}
                      value={newCat.desc_tr}
                      onChange={(e) => setNewCat(prev => ({ ...prev, desc_tr: e.target.value }))}
                      placeholder="Kategori hakkında kapsamlı açıklama..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* English Tab Content */}
                <div className={cn("space-y-4", newCatTab === 'en' ? "block" : "hidden")} dir="ltr">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Category Name (English) *
                    </label>
                    <input
                      type="text"
                      value={newCat.title_en}
                      onChange={(e) => setNewCat(prev => ({ ...prev, title_en: e.target.value }))}
                      placeholder="e.g. Phones, Laptops, Screens..."
                      className="w-full text-sm font-bold px-3.5 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Category Description (English)
                    </label>
                    <textarea
                      rows={4}
                      value={newCat.desc_en}
                      onChange={(e) => setNewCat(prev => ({ ...prev, desc_en: e.target.value }))}
                      placeholder="Detailed category description in English..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Optional Category ID / Slug */}
                <div>
                  <label className="text-xs font-black text-foreground block mb-1">
                    {locale === 'ar' ? 'معرّف القسم في الرابط (Slug إنجليزي اختياري)' : 'Kategori Bağlantı Kodu (Slug - İsteğe Bağlı)'}
                  </label>
                  <input
                    type="text"
                    value={newCat.id}
                    onChange={(e) => setNewCat(prev => ({ ...prev, id: e.target.value }))}
                    placeholder={locale === 'ar' ? 'اتركه فارغاً للتوليد التلقائي (مثال: phones, laptops)' : 'Otomatik için boş bırakın (örn: phones)'}
                    className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    dir="ltr"
                  />
                </div>

                {/* Category Banner & Image */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <ImageIcon size={15} className="text-primary" />
                      <span>{locale === 'ar' ? 'بانر وصورة القسم' : 'Kategori Banner ve Görseli'}</span>
                    </label>

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
                      <span>{uploadingNewCatBanner ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع بانر من الجهاز' : 'Banner Yükle')}</span>
                    </button>
                  </div>

                  {/* Banner Preview Area */}
                  {newCat.banner_image || newCat.image ? (
                    <div className="relative w-full h-36 rounded-lg border border-border bg-black/40 overflow-hidden group">
                      <img 
                        src={newCat.banner_image || newCat.image} 
                        alt="Category banner preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewCat(prev => ({ ...prev, banner_image: '', image: '' }))}
                        className="absolute top-2 end-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                        title={locale === 'ar' ? 'إزالة الصورة' : 'Kaldır'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => newCatBannerFileInputRef.current?.click()}
                      className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground transition-colors cursor-pointer"
                    >
                      <ImageIcon size={24} className="text-muted-foreground/60 mb-1" />
                      <span className="text-xs font-bold">{locale === 'ar' ? 'اضغط لرفع صورة البانر' : 'Banner görseli yüklemek için tıklayın'}</span>
                    </div>
                  )}

                  {/* Direct URL input */}
                  <div>
                    <input
                      type="text"
                      value={newCat.banner_image || newCat.image || ''}
                      onChange={(e) => setNewCat(prev => ({ ...prev, banner_image: e.target.value, image: e.target.value }))}
                      placeholder={locale === 'ar' ? 'أو ضع رابط صورة البانر مباشرة (URL)...' : 'https://...'}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsNewCatModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg border text-xs font-bold hover:bg-muted cursor-pointer transition-colors"
                  >
                    {d.cancel_btn}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    {locale === 'ar' ? 'إضافة وتثبيت القسم' : 'Kategoriyi Ekle ve Kaydet'}
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
              className="bg-card w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-6"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
                <div>
                  <h3 className="font-black text-base uppercase text-foreground">
                    {locale === 'ar' ? `تعديل قسم (${editingCat.title_ar || editingCat.id})` : `Kategori Düzenle: ${editingCat.title_tr || editingCat.id}`}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {locale === 'ar' ? 'تعديل اسم ووصف وصورة القسم' : 'Kategori adı, açıklaması ve görselini düzenleyin'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditCatModalOpen(false);
                    setEditingCat(null);
                  }}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Language Tabs Selection */}
                <div className="flex border-b border-border/50 pb-px gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCatTab('ar')}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                      editCatTab === 'ar' 
                        ? "border-primary text-primary bg-primary/5 rounded-t-md" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇸🇦</span>
                    <span>العربية</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCatTab('tr')}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                      editCatTab === 'tr' 
                        ? "border-primary text-primary bg-primary/5 rounded-t-md" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇹🇷</span>
                    <span>Türkçe</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCatTab('en')}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                      editCatTab === 'en' 
                        ? "border-primary text-primary bg-primary/5 rounded-t-md" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-sm">🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>

                {/* Arabic Tab Content */}
                <div className={cn("space-y-4", editCatTab === 'ar' ? "block" : "hidden")} dir="rtl">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      اسم القسم (عربي) *
                    </label>
                    <input
                      type="text"
                      value={editingCat.title_ar || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, title_ar: e.target.value }))}
                      className="w-full text-sm font-bold px-3.5 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                      dir="rtl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      وصف القسم (عربي)
                    </label>
                    <textarea
                      rows={4}
                      value={editingCat.desc_ar || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, desc_ar: e.target.value }))}
                      placeholder="اكتب وصفاً وشرحاً شاملاً لمحتويات هذا القسم..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden resize-none leading-relaxed"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Turkish Tab Content */}
                <div className={cn("space-y-4", editCatTab === 'tr' ? "block" : "hidden")} dir="ltr">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Kategori Adı (Türkçe) *
                    </label>
                    <input
                      type="text"
                      value={editingCat.title_tr || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, title_tr: e.target.value }))}
                      className="w-full text-sm font-bold px-3.5 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Kategori Açıklaması (Türkçe)
                    </label>
                    <textarea
                      rows={4}
                      value={editingCat.desc_tr || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, desc_tr: e.target.value }))}
                      placeholder="Kategori hakkında detaylı açıklama..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* English Tab Content */}
                <div className={cn("space-y-4", editCatTab === 'en' ? "block" : "hidden")} dir="ltr">
                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Category Name (English) *
                    </label>
                    <input
                      type="text"
                      value={editingCat.title_en || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, title_en: e.target.value }))}
                      className="w-full text-sm font-bold px-3.5 py-2 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-foreground block mb-1.5">
                      Category Description (English)
                    </label>
                    <textarea
                      rows={4}
                      value={editingCat.desc_en || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, desc_en: e.target.value }))}
                      placeholder="Comprehensive category description in English..."
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-lg bg-background border border-border text-foreground focus:border-primary outline-hidden resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Banner & Image Upload */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <ImageIcon size={15} className="text-primary" />
                      <span>{locale === 'ar' ? 'بانر وصورة القسم' : 'Kategori Banner ve Görseli'}</span>
                    </label>

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
                      <span>{uploadingEditCatBanner ? (locale === 'ar' ? 'جاري الرفع...' : 'Yükleniyor...') : (locale === 'ar' ? 'رفع بانر من الجهاز' : 'Banner Yükle')}</span>
                    </button>
                  </div>

                  {/* Banner Preview Area */}
                  {editingCat.banner_image || editingCat.image ? (
                    <div className="relative w-full h-36 rounded-lg border border-border bg-black/40 overflow-hidden group">
                      <img 
                        src={editingCat.banner_image || editingCat.image} 
                        alt="Category banner preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCat((prev: any) => ({ ...prev, banner_image: '', image: '' }))}
                        className="absolute top-2 end-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
                        title={locale === 'ar' ? 'إزالة الصورة' : 'Kaldır'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => editCatBannerFileInputRef.current?.click()}
                      className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 flex flex-col items-center justify-center text-muted-foreground transition-colors cursor-pointer"
                    >
                      <ImageIcon size={24} className="text-muted-foreground/60 mb-1" />
                      <span className="text-xs font-bold">{locale === 'ar' ? 'اضغط لرفع صورة البانر' : 'Banner görseli yüklemek için tıklayın'}</span>
                    </div>
                  )}

                  {/* Direct URL input */}
                  <div>
                    <input
                      type="text"
                      value={editingCat.banner_image || editingCat.image || ''}
                      onChange={(e) => setEditingCat((prev: any) => ({ ...prev, banner_image: e.target.value, image: e.target.value }))}
                      placeholder={locale === 'ar' ? 'أو ضع رابط صورة البانر مباشرة (URL)...' : 'https://...'}
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg bg-background border border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditCatModalOpen(false);
                      setEditingCat(null);
                    }}
                    className="px-4 py-2.5 rounded-lg border text-xs font-bold hover:bg-muted cursor-pointer transition-colors"
                  >
                    {d.cancel_btn}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedCategory}
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    {locale === 'ar' ? 'حفظ التعديلات' : 'Değişiklikleri Kaydet'}
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

