'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[99] w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-primary text-white shadow-lg hover:bg-primary/90 transition-all hover:-translate-y-1 focus:outline-none ring-4 ring-primary/20 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 md:w-6 md:h-6" strokeWidth={3} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
