"use client";

import { useEffect } from "react";

export function ClarityAnalytics() {
  useEffect(() => {
    const loadClarity = () => {
      if (document.querySelector('script[data-clarity="wt5p30d6wd"]')) {
        return;
      }

      let clarity: ClarityFunction;
      clarity = window.clarity || function (...args: unknown[]) {
        (clarity.q = clarity.q || []).push(args);
      };
      window.clarity = clarity;

      const script = document.createElement("script");
      script.dataset.clarity = "wt5p30d6wd";
      script.async = true;
      script.src = "https://www.clarity.ms/tag/wt5p30d6wd";
      document.head.appendChild(script);
    };

    const schedule = () => {
      const run = () => setTimeout(loadClarity, 8000);
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(run, { timeout: 5000 });
      } else {
        run();
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    const timer = window.setTimeout(() => undefined, 0);
    return () => {
      window.removeEventListener("load", schedule);
      clearTimeout(timer);
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

type ClarityFunction = ((...args: unknown[]) => void) & { q?: unknown[][] };
