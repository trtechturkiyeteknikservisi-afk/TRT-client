"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export function ClarityAnalytics() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        Clarity.init("wt5p30d6wdd");
      } catch (e) {
        console.error("Clarity initialization failed:", e);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}