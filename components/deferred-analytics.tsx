'use client';

import { useEffect } from 'react';

const GA_ID = 'G-FGGRX4K06C';
const CLARITY_ID = 'wt5p30d6wd';

export function DeferredAnalytics() {
  useEffect(() => {
    let loaded = false;

    const loadAnalytics = () => {
      if (loaded) return;
      loaded = true;

      if (!document.querySelector(`script[data-gtag="${GA_ID}"]`)) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function (...args: unknown[]) {
          window.dataLayer?.push(args);
        };

        const ga = document.createElement('script');
        ga.async = true;
        ga.dataset.gtag = GA_ID;
        ga.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(ga);

        window.gtag('js', new Date());
        window.gtag('config', GA_ID);
      }

      if (!document.querySelector(`script[data-clarity="${CLARITY_ID}"]`)) {
        let clarity: ClarityFunction;
        clarity = window.clarity || function (...args: unknown[]) {
          (clarity.q = clarity.q || []).push(args);
        };
        window.clarity = clarity;

        const script = document.createElement('script');
        script.async = true;
        script.dataset.clarity = CLARITY_ID;
        script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
        document.head.appendChild(script);
      }
    };

    const timeout = window.setTimeout(loadAnalytics, 30000);
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, loadAnalytics, { once: true, passive: true }));

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, loadAnalytics));
    };
  }, []);

  return null;
}

type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFunction;
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}
