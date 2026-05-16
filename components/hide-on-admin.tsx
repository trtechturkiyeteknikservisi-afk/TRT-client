'use client';

import { usePathname } from 'next/navigation';

export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.includes('/trt-secure-panel-2026') || pathname?.includes('/verify')) return null;
  return <div className="contents">{children}</div>;
}
