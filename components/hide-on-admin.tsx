'use client';

import { usePathname } from 'next/navigation';

export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.includes('/admin')) return null;
  return <>{children}</>;
}
