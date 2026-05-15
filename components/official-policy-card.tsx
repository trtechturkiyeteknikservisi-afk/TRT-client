'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { FileText, Download, ExternalLink, ShieldCheck } from 'lucide-react';

interface OfficialPolicyCardProps {
  href: string;
  officialDocPath: string;
  title: string;
  desc: string;
  viewText: string;
  downloadText: string;
  footerNote: string;
}

export function OfficialPolicyCard({
  href,
  officialDocPath,
  title,
  desc,
  viewText,
  downloadText,
  footerNote
}: OfficialPolicyCardProps) {
  return (
    <Link 
      href={href}
      className="group relative bg-card border-2 border-red-500/10 rounded-xl p-8 transition-all hover:shadow-xl hover:shadow-red-500/5 flex flex-col items-center text-center space-y-6 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl -mr-12 -mt-12 group-hover:bg-red-500/10 transition-all"></div>
      
      <div className="w-20 h-20 bg-red-500/5 rounded-xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
        <div className="relative">
          <FileText size={48} strokeWidth={2.5} />
          <div className="absolute inset-0 flex items-center justify-center pt-2">
              <span className="text-[10px] font-black bg-red-600 text-white px-1 rounded-sm">PDF</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground font-bold leading-relaxed opacity-80">
          {desc}
        </p>
      </div>

      <div className="w-full flex flex-col gap-2">
        <div 
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary/10 text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 border border-primary/20"
        >
          <ExternalLink size={18} />
          {viewText}
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(officialDocPath, '_blank');
          }}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 z-20"
        >
          <Download size={18} />
          {downloadText}
        </button>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        <ShieldCheck size={14} className="text-red-500" />
        <span>{footerNote}</span>
      </div>
    </Link>
  );
}
