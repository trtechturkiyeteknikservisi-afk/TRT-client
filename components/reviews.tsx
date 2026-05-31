'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';
import { cn } from '@/lib/utils';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { KVKKCheckbox } from './kvkk-checkbox';

interface ReviewItem {
  id: number | string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

const mockReviews: ReviewItem[] = [
  { id: 1, customerName: 'Ahmet Yılmaz', rating: 5, comment: 'Excellent service! My iPhone 13 screen was replaced in 30 minutes. Highly recommended.', date: '2024-03-25' },
  { id: 2, customerName: 'Zeynep Kaya', rating: 5, comment: 'Very professional team. They fixed my MacBook Pro battery issue perfectly.', date: '2024-03-20' },
  { id: 3, customerName: 'Mehmet Demir', rating: 4, comment: 'Fast and reliable service for my Xiaomi robot vacuum. Fair pricing too.', date: '2024-03-15' },
  { id: 4, customerName: 'Elif Şahin', rating: 5, comment: 'Fixed my vintage watch with care. Hard to find such skilled artisans these days.', date: '2024-03-10' }
];

export function Reviews() {
  const t = useTranslations('Reviews');
  const format = useFormatter();
  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${API_URL}/content/reviews`);
        if (!response.ok) {
          throw new Error(`Reviews request failed: ${response.status}`);
        }
        const data = await response.json() as ReviewItem[];
        if (data.length > 0) {
          setReviews(data);
        }
      } catch (error) {
        console.warn('Error fetching reviews', error);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!kvkkAccepted) return;

    setLoading(true);
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${API_URL}/content/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) {
          throw new Error(`Review request failed: ${response.status}`);
        }
      setSubmitted(true);
      setForm({ customerName: '', rating: 5, comment: '' });
      setKvkkAccepted(false);
    } catch (error) {
      console.error('Error submitting review', error);
    } finally {
      setLoading(false);
    }
  };

  const ReviewCard = ({ review, index }: { review: ReviewItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-card p-8 rounded-xl border shadow-sm relative h-full mb-10"
    >
      <div className="absolute top-6 right-8 text-primary/10">
        <Quote size={40} />
      </div>
      <div className="flex justify-center space-x-1 mb-4 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < review.rating ? 'currentColor' : 'none'}
            className={i < review.rating ? '' : 'text-gray-300'}
          />
        ))}
      </div>
      <p className="text-muted-foreground mb-6 line-clamp-4 leading-relaxed italic">
        &quot;{review.comment}&quot;
      </p>
      <div>
        <p className="font-bold text-foreground">{review.customerName}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {format.dateTime(new Date(review.date), {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section style={{ overflowAnchor: 'none' }} className="py-12 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-7xl">
        <div className="max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground">
            {t('desc')}
          </p>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform cursor-pointer"
          >
            {t('add_review')}
          </button>
        </div>

        {showForm && (
          <div className="mb-10 bg-card border p-6 rounded-xl text-left max-w-2xl mx-auto">
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <input
                  value={form.customerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                  required
                  placeholder={t('name_placeholder')}
                  className="px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 h-[50px] font-bold text-sm"
                />
                
                <div className="flex flex-col gap-1 px-4 py-2 rounded-xl border bg-background focus-within:ring-2 focus-within:ring-primary/20 justify-center h-[50px]">
                  {/* <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 mb-0.5">
                    {t('rating') || 'Rating'}
                  </span> */}
                  <div 
                    role="radiogroup" 
                    aria-label="Rating" 
                    className="flex items-center justify-center gap-1.5"
                  >
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isHighlighted = hoverRating !== null 
                        ? starValue <= hoverRating 
                        : starValue <= form.rating;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          role="radio"
                          aria-checked={form.rating === starValue}
                          aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                          onClick={() => setForm((prev) => ({ ...prev, rating: starValue }))}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="text-yellow-500 hover:scale-110 active:scale-95 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-0.5"
                        >
                          <Star
                            size={20}
                            fill={isHighlighted ? 'currentColor' : 'none'}
                            className={cn(
                              "transition-all duration-150",
                              isHighlighted ? "scale-110 drop-shadow-[0_0_4px_rgba(234,179,8,0.3)]" : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <textarea
                value={form.comment}
                onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder={t('comment_placeholder')}
                className="w-full px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                rows={3}
              />

              <KVKKCheckbox accepted={kvkkAccepted} onChange={setKvkkAccepted} />

              <button
                type="submit"
                disabled={loading || !kvkkAccepted}
                className="w-full px-4 py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-xs"
              >
                {loading ? t('sending') : t('submit')}
              </button>

              {submitted && <p className="text-green-600 font-bold text-center mt-2">{t('submitted_message')}</p>}
            </form>
          </div>
        )}

        {reviews.length > 3 ? (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-12"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={review.id}>
                <ReviewCard review={review} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
