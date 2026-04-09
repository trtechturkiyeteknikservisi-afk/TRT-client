'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { Globe, MessageCircle, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const socialLinks = [
  { icon: Globe, href: '#', label: 'Website' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp' },
  { icon: Share2, href: '#', label: 'Social' },
];

export function Footer() {
  const t = useTranslations('Footer');
  const footerLinks = [
    {
      title: t('services'),
      links: [
        { name: t('phone_repair'), href: '/services/phone' },
        { name: t('laptop_repair'), href: '/services/laptop' },
        { name: t('tablet_repair'), href: '/services/tablet' },
        { name: t('robot_repair'), href: '/services/robot' },
        { name: t('watch_repair'), href: '/services/watch' },
      ],
    },
    {
      title: t('company'),
      links: [
        { name: t('works'), href: '/portfolio' },
        { name: t('blog'), href: '/blog' },
        { name: t('contact'), href: '#contact' },
      ],
    },
    {
      title: t('support'),
      links: [
        { name: t('merchants'), href: '#', soon: true },
        { name: t('track_shipment'), href: '#', soon: true },
        { name: t('faqs'), href: '#faqs' },
        // { name: t('sitemap'), href: '/sitemap.xml' },
      ],
    },
  ];

  return (
    <footer className="bg-card pt-32 pb-16 relative overflow-hidden border-t-4 border-primary">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-primary/5 blur-[120px] -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 group-hover:rotate-12 transition-transform">
                <span className="text-primary-foreground font-black text-2xl">T</span>
              </div>
              <span className="text-3xl font-black tracking-tighter text-foreground uppercase tracking-widest">TRT <span className="text-primary">Service</span></span>
            </Link>
            <p className="text-lg text-muted-foreground leading-relaxed font-semibold">
              {t('description')}
            </p>
            {/* <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-4 rounded-[1.25rem] bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:-translate-y-1 transition-all duration-300 ring-1 ring-border/50 shadow-sm"
                  aria-label={social.label}
                >
                  <social.icon size={22} />
                </a>
              ))}
            </div> */}
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-6">
              <h4 className="text-lg font-bold text-foreground">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span>{link.name}</span>
                      {link.soon && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter border border-primary/20">
                          {t('coming_soon')}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t pt-12 text-center text-muted-foreground">
          <p>{t('copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
