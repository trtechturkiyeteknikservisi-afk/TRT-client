import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'tr'],
  defaultLocale: 'tr',
  localeDetection: false
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
