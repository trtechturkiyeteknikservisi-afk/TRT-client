'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import axios from 'axios';
import { useTranslations } from 'next-intl';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const mockReviews = [
  { id: 1, customerName: 'Ahmet Yılmaz', rating: 5, comment: 'Excellent service! My iPhone 13 screen was replaced in 30 minutes. Highly recommended.', date: '2024-03-25' },
  { id: 2, customerName: 'Zeynep Kaya', rating: 5, comment: 'Very professional team. They fixed my MacBook Pro battery issue perfectly.', date: '2024-03-20' },
  { id: 3, customerName: 'Mehmet Demir', rating: 4, comment: 'Fast and reliable service for my Xiaomi robot vacuum. Fair pricing too.', date: '2024-03-15' },
  { id: 4, customerName: 'Elif Şahin', rating: 5, comment: 'Fixed my vintage watch with care. Hard to find such skilled artisans these days.', date: '2024-03-10' }
];

export function Reviews() {
  const t = useTranslations('Reviews');
  const [reviews, setReviews] = useState(mockReviews);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${API_URL}/content/reviews`);
        const data = response.data as any[];
        if (data.length > 0) {
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews', error);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/content/reviews', form);
      setSubmitted(true);
      setForm({ customerName: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review', error);
    } finally {
      setLoading(false);
    }
  };

  const ReviewCard = ({ review, index }: { review: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-card p-8 rounded-3xl border shadow-sm relative h-full mb-10"
    >
      <div className="absolute top-6 right-8 text-primary/10">
        <Quote size={40} />
      </div>
      <div className="flex space-x-1 mb-4 text-yellow-500">
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
        "{review.comment}"
      </p>
      <div>
        <p className="font-bold text-foreground">{review.customerName}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          {new Date(review.date).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-7xl">
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">{t('title')}</h2>
          <p className="text-lg text-muted-foreground">
            {t('desc')}
          </p>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform"
          >
            {t('add_review')}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmitReview} className="mb-10 bg-card border p-6 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <input
              value={form.customerName}
              onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
              required
              placeholder={t('name_placeholder')}
              className="px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              className="px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              {loading ? t('sending') : t('submit')}
            </button>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder={t('comment_placeholder')}
              className="md:col-span-3 px-4 py-3 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
            {submitted && <p className="md:col-span-3 text-green-600 font-bold">{t('submitted_message')}</p>}
          </form>
        )}

        {reviews.length > 4 ? (
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
