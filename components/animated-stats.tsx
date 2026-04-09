'use client';

import { useInView, motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  
  // Extract number and suffix (e.g., "15K+" -> 15 and "K+")
  const match = value.match(/(\d+)(.*)/);
  const numericValue = match ? parseInt(match[1]) : 0;
  const suffix = match ? match[2] : '';

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    if (inView) {
      motionValue.set(numericValue);
    }
  }, [inView, motionValue, numericValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toString();
      }
    });
  }, [springValue]);

  return (
    <span className="flex items-baseline justify-center" dir="ltr">
      <span ref={ref}>0</span>
      <span>{suffix}</span>
    </span>
  );
}

export function AnimatedStats({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <section className="relative py-24 overflow-hidden border-y bg-background/40 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center space-y-4 group"
            >
              <div className="relative inline-block">
                <div className="text-5xl md:text-7xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                  <Counter value={stat.value} />
                </div>
                <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
              <div className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60 group-hover:text-foreground transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
