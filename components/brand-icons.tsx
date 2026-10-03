import React from 'react';

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AppleBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 170 170" fill="currentColor" {...props}>
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.33-6.42-9.79-11.45-20.94-15.09-33.45-3.64-12.51-5.46-24.3-5.46-35.37 0-14.36 3.65-26.25 10.96-35.68 7.31-9.43 16.5-14.24 27.56-14.44 5.34 0 11.07 1.41 17.18 4.23 6.11 2.82 10.14 4.3 12.1 4.43 1.52-.13 5.76-1.69 12.73-4.68 6.96-2.99 12.65-4.33 17.06-4.02 12.83.65 23.01 5.34 30.54 14.07-11.2 6.84-16.7 16.4-16.51 28.69.22 9.57 3.92 17.59 11.1 24.08 7.18 6.49 15.77 10.06 25.77 10.72-2.17 6.74-4.78 13.59-7.83 20.55zM119.22 33.15c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.94-10.75 19.92-13.08.76 4.35.65 8.79-.33 13.32-.98 4.53-2.93 8.87-5.85 13.02-2.93 4.15-6.52 7.42-10.78 9.8-4.26 2.39-8.49 3.73-12.7 4.02-.11-2.17.69-4.3 1.79-6.41z"/>
  </svg>
);

export const SamsungBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="-0.5px">SAMSUNG</text>
  </svg>
);

export const XiaomiBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF6900"/>
    <path d="M7 7h4v4h2V7h4v10h-3v-4h-2v4H7V7zm4 7h2v-2h-2v2z" fill="#FFF"/>
  </svg>
);

export const OppoBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5px" fill="#008060">oppo</text>
  </svg>
);

export const HuaweiBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2c-.5 2.5-2 5-4 6.5 1.5.5 3 0 4-1 1 1 2.5 1.5 4 1-2-1.5-3.5-4-4-6.5zm-5 6c-2 1.5-3.5 3.5-4 6 1.5-.2 2.8-1 3.5-2.2.4 1.2 1.3 2 2.5 2.5-.5-2-1-4.3-2-6.3zm10 0c-1 2-1.5 4.3-2 6.3 1.2-.5 2.1-1.3 2.5-2.5.7 1.2 2 2 3.5 2.2-.5-2.5-2-4.5-4-6zm-7.5 7c-1.5.8-2.5 2.2-3 3.8 1.2-.4 2.2-1.2 2.8-2.2.3.8.8 1.5 1.6 2-.2-1.2-.6-2.4-1.4-3.6zm5 0c-.8 1.2-1.2 2.4-1.4 3.6.8-.5 1.3-1.2 1.6-2 .6 1 1.6 1.8 2.8 2.2-.5-1.6-1.5-3-3-3.8z" fill="#CF0A2C"/>
  </svg>
);

export const OnePlusBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#F50514"/>
    <path d="M10 8h2v8h-2V8zm4 3h3v2h-3v-2zm-5-3H8v2h1V8z" fill="#FFF"/>
    <text x="11" y="14.5" textAnchor="middle" fontSize="8" fontWeight="900" fill="#FFF">1</text>
    <path d="M15 10v4m-2-2h4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const RealmeBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#FFC915"/>
    <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="900" fontFamily="sans-serif" fill="#000">R</text>
  </svg>
);

export const RoborockBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="10" fill="#E60012"/>
    <path d="M7 17l5-10 5 10-2-3-3 2-3-2-2 3z" fill="#FFF"/>
  </svg>
);

export const AsusBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 16" fill="currentColor" {...props}>
    <text x="16" y="12" textAnchor="middle" fontSize="9" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8px" fill="#00539B">ASUS</text>
  </svg>
);

export const LenovoBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 36 14" fill="currentColor" {...props}>
    <rect x="1" y="1" width="34" height="12" rx="2" fill="#E2231A"/>
    <text x="18" y="10" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" fill="#FFF" letterSpacing="0.3px">Lenovo</text>
  </svg>
);

export const HpBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="10" fill="#0096D6"/>
    <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" fill="#FFF">hp</text>
  </svg>
);

export const DellBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="10" fill="#007DB8"/>
    <text x="12" y="15" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" fill="#FFF" letterSpacing="-0.5px">DELL</text>
  </svg>
);

export const HonorBrandIcon = ({ size = 20, ...props }: BrandIconProps) => (
  <svg width={size} height={size} viewBox="0 0 30 14" fill="currentColor" {...props}>
    <text x="15" y="10.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.5px">HONOR</text>
  </svg>
);

export const BrandIcon = ({ brand, size = 18 }: { brand: string; size?: number | string }) => {
  const b = brand.toLowerCase().trim();
  if (b.includes('apple') || b.includes('iphone')) return <AppleBrandIcon size={size} />;
  if (b.includes('samsung')) return <SamsungBrandIcon size={size} />;
  if (b.includes('xiaomi') || b.includes('redmi') || b.includes('poco')) return <XiaomiBrandIcon size={size} />;
  if (b.includes('oppo')) return <OppoBrandIcon size={size} />;
  if (b.includes('huawei')) return <HuaweiBrandIcon size={size} />;
  if (b.includes('honor')) return <HonorBrandIcon size={size} />;
  if (b.includes('oneplus')) return <OnePlusBrandIcon size={size} />;
  if (b.includes('realme')) return <RealmeBrandIcon size={size} />;
  if (b.includes('roborock')) return <RoborockBrandIcon size={size} />;
  if (b.includes('asus')) return <AsusBrandIcon size={size} />;
  if (b.includes('lenovo')) return <LenovoBrandIcon size={size} />;
  if (b.includes('hp')) return <HpBrandIcon size={size} />;
  if (b.includes('dell')) return <DellBrandIcon size={size} />;
  return (
    <div 
      style={{ width: size, height: size }} 
      className="rounded-md bg-muted/80 flex items-center justify-center text-[10px] font-black uppercase text-foreground/80 shrink-0"
    >
      {brand.slice(0, 2)}
    </div>
  );
};
