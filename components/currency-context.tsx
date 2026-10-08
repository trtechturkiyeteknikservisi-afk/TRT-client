'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useSettings } from './settings-provider';
import { DollarSign, Coins, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CurrencyCode = 'TRY' | 'USD' | 'SYP';

interface CurrencyContextType {
  currentCurrency: CurrencyCode;
  currencySymbol: string;
  currencyLabel: string;
  selectedArabicCurrency: CurrencyCode;
  setSelectedArabicCurrency: (curr: CurrencyCode) => void;
  usdTryRate: number;
  trySypRate: number;
  usdSypRate: number;
  convertPrice: (priceInTry: number, targetCurrency?: CurrencyCode) => number;
  formatPrice: (valInTry: number, maxValInTry?: number, targetCurrency?: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const { settings } = useSettings();

  // Parse exchange rates from settings with reliable fallbacks
  const usdTryRate = useMemo(() => {
    const parsed = parseFloat(settings.exchange_rate_usd_try || '');
    return parsed && parsed > 0 ? parsed : 38.5;
  }, [settings.exchange_rate_usd_try]);

  const trySypRate = useMemo(() => {
    const parsed = parseFloat(settings.exchange_rate_try_syp || '');
    if (parsed && parsed > 0) return parsed;
    const usdSyp = parseFloat(settings.exchange_rate_usd_syp || '');
    if (usdSyp && usdSyp > 0 && usdTryRate > 0) {
      return Math.round(usdSyp / usdTryRate);
    }
    return 390;
  }, [settings.exchange_rate_try_syp, settings.exchange_rate_usd_syp, usdTryRate]);

  const usdSypRate = useMemo(() => {
    const parsed = parseFloat(settings.exchange_rate_usd_syp || '');
    if (parsed && parsed > 0) return parsed;
    return Math.round(usdTryRate * trySypRate);
  }, [settings.exchange_rate_usd_syp, usdTryRate, trySypRate]);

  // Active currency is strictly determined by language:
  // - English (en) -> USD ($)
  // - Turkish (tr) -> TRY (₺)
  // - Arabic  (ar) -> Configured Arabic currency in admin settings (defaults to SYP)
  const currentCurrency: CurrencyCode = useMemo(() => {
    if (locale === 'en') return 'USD';
    if (locale === 'tr') return 'TRY';
    if (locale === 'ar') {
      const configured = settings.arabic_currency as CurrencyCode;
      if (configured && ['TRY', 'USD', 'SYP'].includes(configured)) {
        return configured;
      }
      return 'SYP';
    }
    return 'TRY';
  }, [locale, settings.arabic_currency]);

  const selectedArabicCurrency = currentCurrency;
  const setSelectedArabicCurrency = (_curr: CurrencyCode) => {};

  const currencySymbol = useMemo(() => {
    switch (currentCurrency) {
      case 'USD': return '$';
      case 'SYP': return locale === 'ar' ? 'ل.س' : 'SYP';
      case 'TRY':
      default: return '₺';
    }
  }, [currentCurrency, locale]);

  const currencyLabel = useMemo(() => {
    switch (currentCurrency) {
      case 'USD':
        return locale === 'ar' ? 'دولار أمريكي' : locale === 'en' ? 'US Dollar' : 'Amerikan Doları';
      case 'SYP':
        return locale === 'ar' ? 'ليرة سورية' : locale === 'en' ? 'Syrian Pound' : 'Suriye Lirası';
      case 'TRY':
      default:
        return locale === 'ar' ? 'ليرة تركية' : locale === 'en' ? 'Turkish Lira' : 'Türk Lirası';
    }
  }, [currentCurrency, locale]);

  const convertPrice = (priceInTry: number, targetCurrency?: CurrencyCode): number => {
    const target = targetCurrency || currentCurrency;
    if (!priceInTry || isNaN(priceInTry)) return 0;

    switch (target) {
      case 'USD': {
        const converted = priceInTry / usdTryRate;
        return converted;
      }
      case 'SYP': {
        return Math.round(priceInTry * trySypRate);
      }
      case 'TRY':
      default:
        return priceInTry;
    }
  };

  const formatPrice = (valInTry: number, maxValInTry?: number, targetCurrency?: CurrencyCode): string => {
    const target = targetCurrency || currentCurrency;
    if (valInTry === undefined || valInTry === null || isNaN(valInTry)) return '0 ' + currencySymbol;

    const formatSingle = (val: number) => {
      const converted = convertPrice(val, target);

      if (target === 'USD') {
        const formatted = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: converted % 1 === 0 ? 0 : 2,
          maximumFractionDigits: 2
        }).format(converted);
        return `$${formatted}`;
      }

      if (target === 'SYP') {
        const formatted = new Intl.NumberFormat('ar-SY', {
          maximumFractionDigits: 0
        }).format(converted);
        return `${formatted} ${locale === 'ar' ? 'ل.س' : 'SYP'}`;
      }

      // Default TRY
      const formatted = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 0
      }).format(converted);
      return `${formatted} ₺`;
    };

    if (maxValInTry && maxValInTry > valInTry) {
      const minStr = formatSingle(valInTry);
      const maxStr = formatSingle(maxValInTry);
      return `${minStr} - ${maxStr}`;
    }

    return formatSingle(valInTry);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencySymbol,
        currencyLabel,
        selectedArabicCurrency,
        setSelectedArabicCurrency,
        usdTryRate,
        trySypRate,
        usdSypRate,
        convertPrice,
        formatPrice
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

/**
 * Legacy Arabic Currency Selector
 * Currency is now strictly bound to language and admin settings (no frontend toggle).
 */
export function ArabicCurrencySelector({ className }: { className?: string }) {
  return null;
}
