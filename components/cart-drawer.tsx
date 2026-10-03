'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, 
  Truck, CheckCircle, Phone, MapPin, User, Send, CreditCard 
} from 'lucide-react';
import { useStore, CartItem } from './store-context';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartCount, 
    cartTotal,
    isOrderModalOpen,
    setIsOrderModalOpen
  } = useStore();

  const locale = useLocale();

  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    address: '',
    paymentMethod: 'kapida', // 'kapida' | 'havale' | 'kart'
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val) + ' TL';
  };

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    const phone = '908508401505';
    let text = `*TR TECH - Yeni Sipariş Talebi*%0A%0A`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. *${item.title}*${item.quality ? ` (${item.quality})` : ''}%0A`;
      text += `   Adet: ${item.quantity} | Fiyat: ${formatPrice(item.price * item.quantity)}%0A`;
    });
    text += `%0A*Toplam Tutar:* ${formatPrice(cartTotal)}%0A`;
    text += `*Kargo:* Ücretsiz%0A%0A`;
    text += `Merhaba, yukarıdaki ürünleri sipariş etmek istiyorum. Yardımcı olabilir misiniz?`;

    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleFormCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.fullName.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      toast.error(
        locale === 'ar' 
          ? 'يرجى إكمال جميع الحقول الإلزامية (الاسم، الهاتف، العنوان)' 
          : 'Lütfen zorunlu alanları doldurun (İsim, Telefon, Adres)'
      );
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsOrderModalOpen(false);
      clearCart();
      toast.success(
        locale === 'ar'
          ? 'تم استلام طلبكم بنجاح! سيتواصل معكم فريقنا لتأكيد الشحن.'
          : 'Siparişiniz başarıyla alındı! Ekibimiz kargo onayı için sizinle iletişime geçecektir.',
        { duration: 5000 }
      );
    }, 1200);
  };

  return (
    <>
      {/* 1. Slide-Over Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#0F0F12] border-l border-zinc-800 text-white h-full flex flex-col shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#141418]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#E11D48]/10 text-[#E11D48] flex items-center justify-center border border-[#E11D48]/20">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight">
                      {locale === 'ar' ? 'سلة المشتريات' : locale === 'en' ? 'Shopping Cart' : 'Sepetim'}
                    </h2>
                    <p className="text-[11px] text-zinc-400 font-bold">
                      {cartCount} {locale === 'ar' ? 'منتج مضاف' : locale === 'en' ? 'items' : 'ürün'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Free Shipping Alert Banner */}
              <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <Truck size={15} className="shrink-0" />
                <span>
                  {locale === 'ar'
                    ? '🎉 شحن مجاني وسريع لكافة مدن تركيا!'
                    : '🎉 Tüm Türkiye’ye Hızlı ve Ücretsiz Kargo!'}
                </span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                      <ShoppingBag size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-300">
                        {locale === 'ar' ? 'سلتك فارغة حالياً' : locale === 'en' ? 'Your cart is empty' : 'Sepetiniz henüz boş'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                        {locale === 'ar'
                          ? 'استكشف أحدث الأجهزة وقطع الغيار الأصلية وأضفها إلى السلة'
                          : 'Cihazlar, yedek parçalar ve aksesuarları keşfedip sepetinize ekleyebilirsiniz.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={`${item.id}-${item.quality || ''}-${idx}`}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex gap-3 items-center group hover:border-zinc-700 transition-all"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-black border border-zinc-800 shrink-0 overflow-hidden relative flex items-center justify-center p-1">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ShoppingBag size={20} className="text-zinc-600" />
                        )}
                        {item.badge && (
                          <span className="absolute top-1 left-1 text-[8px] font-extrabold uppercase px-1 py-0.2 bg-[#E11D48] text-white rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Info & Title */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-zinc-100 truncate leading-snug">
                          {item.title}
                        </h4>
                        {item.quality && (
                          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                            {locale === 'ar' ? 'الدرجة:' : 'Kalite:'}{' '}
                            <span className="text-[#E11D48] font-black">{item.quality}</span>
                          </p>
                        )}
                        <p className="text-xs font-extrabold text-white mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity & Delete */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeFromCart(item.id, item.quality)}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-800 rounded-md px-1 py-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quality, -1)}
                            className="w-5 h-5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-black px-1 min-w-[14px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quality, 1)}
                            className="w-5 h-5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Summary & Checkout */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#141418] space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Ara Toplam'}</span>
                      <span className="font-bold text-white">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>{locale === 'ar' ? 'الشحن' : 'Kargo'}</span>
                      <span className="font-bold text-emerald-400">
                        {locale === 'ar' ? 'مجاني' : 'Ücretsiz'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-2 border-t border-zinc-800 text-white">
                      <span>{locale === 'ar' ? 'المبلغ الإجمالي' : 'Toplam Tutar'}</span>
                      <span className="text-base text-[#E11D48]">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {/* WhatsApp Quick Order Button */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 active:scale-[0.98] cursor-pointer"
                  >
                    <span>💬</span>
                    <span>
                      {locale === 'ar' ? 'الطلب السريع عبر واتساب' : 'WhatsApp ile Hızlı Sipariş'}
                    </span>
                  </button>

                  {/* Standard Direct Checkout Button */}
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsOrderModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950/40 active:scale-[0.98] cursor-pointer"
                  >
                    <CreditCard size={14} />
                    <span>
                      {locale === 'ar' ? 'متابعة الشراء وإنهاء الطلب' : 'Siparişi Tamamla'}
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Direct Checkout Modal Form */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOrderModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-white z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E11D48]/10 text-[#E11D48] flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black">
                      {locale === 'ar' ? 'إتمام طلب الشراء' : 'Siparişi Tamamla'}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {locale === 'ar' ? 'أدخل بيانات التوصيل وسنتواصل معك فوراً' : 'Kargo ve iletişim bilgilerinizi giriniz'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOrderModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Order Items Preview */}
              <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-1.5">
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                  {locale === 'ar' ? 'ملخص الطلب' : 'Sipariş Özeti'} ({cartCount}{' '}
                  {locale === 'ar' ? 'منتج' : 'Ürün'})
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {cart.map((c, i) => (
                    <div key={i} className="flex justify-between text-xs text-zinc-300">
                      <span className="truncate max-w-[260px]">
                        {c.quantity}x {c.title}
                      </span>
                      <span className="font-extrabold text-white">
                        {formatPrice(c.price * c.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-black text-[#E11D48]">
                  <span>{locale === 'ar' ? 'الإجمالي المطلوب' : 'Toplam'}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleFormCheckoutSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">
                      {locale === 'ar' ? 'الاسم واللقب *' : 'Ad Soyad *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={checkoutForm.fullName}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, fullName: e.target.value })
                        }
                        placeholder={locale === 'ar' ? 'محمد علي' : 'Ahmet Yılmaz'}
                        className="w-full px-3 py-2 pl-8 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 focus:border-[#E11D48] outline-hidden font-bold"
                      />
                      <User size={13} className="absolute left-2.5 top-3 text-zinc-500" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold block">
                      {locale === 'ar' ? 'رقم الهاتف *' : 'Telefon Numarası *'}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                        }
                        placeholder="05XX XXX XX XX"
                        className="w-full px-3 py-2 pl-8 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 focus:border-[#E11D48] outline-hidden font-bold"
                      />
                      <Phone size={13} className="absolute left-2.5 top-3 text-zinc-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">
                    {locale === 'ar' ? 'المدينة / المحافظة *' : 'İl / İlçe *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={checkoutForm.city}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, city: e.target.value })
                      }
                      placeholder={locale === 'ar' ? 'إسطنبول / الفاتح' : 'Bursa / Osmangazi veya İstanbul'}
                      className="w-full px-3 py-2 pl-8 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 focus:border-[#E11D48] outline-hidden font-bold"
                    />
                    <MapPin size={13} className="absolute left-2.5 top-3 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">
                    {locale === 'ar' ? 'العنوان التفصيلي للتسليم *' : 'Açık Teslimat Adresi *'}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={checkoutForm.address}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, address: e.target.value })
                    }
                    placeholder={locale === 'ar' ? 'الحي، الشارع، رقم البناء والشقة...' : 'Mahalle, Sokak, Bina No, Daire...'}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 focus:border-[#E11D48] outline-hidden font-bold"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-bold block">
                    {locale === 'ar' ? 'طريقة الدفع المفضلة' : 'Ödeme Seçeneği'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'kapida', label: locale === 'ar' ? 'عند الاستلام' : 'Kapıda Ödeme' },
                      { id: 'havale', label: locale === 'ar' ? 'حوالة بنكية' : 'Havale / EFT' },
                      { id: 'kart', label: locale === 'ar' ? 'بطاقة بنكية' : 'Kredi Kartı' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: m.id })}
                        className={cn(
                          "py-2 px-2 rounded-lg text-center font-black border transition-all cursor-pointer text-[11px]",
                          checkoutForm.paymentMethod === m.id
                            ? "bg-[#E11D48]/15 border-[#E11D48] text-white"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 rounded-xl bg-[#E11D48] hover:bg-[#be123c] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-950/40 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <span>{locale === 'ar' ? 'جاري تأكيد الطلب...' : 'Sipariş Kaydediliyor...'}</span>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      <span>{locale === 'ar' ? 'تأكيد وإرسال الطلب' : 'Siparişi Onayla'}</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
