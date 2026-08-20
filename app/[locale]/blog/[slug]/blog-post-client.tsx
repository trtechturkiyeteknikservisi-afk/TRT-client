'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations, useFormatter } from 'next-intl';

export interface BlogPostData {
  id?: number | string;
  slug?: string;
  title: string;
  content: string;
  date: string;
  updatedAt?: string;
  author?: string;
  image?: string;
  description?: string;
}

const cleanBlogContent = (html: string) => {
  if (typeof window === 'undefined' || !html) return html || '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const isColorLight = (colorStr: string): boolean => {
      const color = colorStr.trim().toLowerCase();

      if (!color) return false;

      const lightNames = [
        'white',
        'yellow',
        'lightyellow',
        'lightgray',
        'lightgrey',
        'azure',
        'aliceblue',
        'ghostwhite',
        'honeydew',
        'ivory',
        'beige',
        'lightcyan',
        'lightgreen',
        'lightblue',
        'lightpink',
        'lightsalmon',
        'lavender',
        'floralwhite',
      ];

      if (lightNames.includes(color)) return true;

      const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);

      if (hexMatch) {
        const hex = hexMatch[1];

        let r = 0;
        let g = 0;
        let b = 0;

        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 220;
      }

      const rgbMatch = color.match(
        /^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\)$/
      );

      if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10);
        const g = parseInt(rgbMatch[2], 10);
        const b = parseInt(rgbMatch[3], 10);

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        return brightness > 220;
      }

      return false;
    };

    const traverse = (
      element: HTMLElement,
      isInsideQuickAnswer: boolean
    ) => {
      const isQuickAnswer = element.classList.contains('quick-answer');
      const currentIsQuickAnswer =
        isInsideQuickAnswer || isQuickAnswer;

      if (element.hasAttribute('color')) {
        const fontColor = element.getAttribute('color');

        if (fontColor && !element.style.color) {
          element.style.color = fontColor;
        }

        element.removeAttribute('color');
      }

      element.style.removeProperty('position');
      element.style.removeProperty('transform');
      element.style.removeProperty('top');
      element.style.removeProperty('bottom');
      element.style.removeProperty('left');
      element.style.removeProperty('right');
      element.style.removeProperty('font-size');
      element.style.removeProperty('font-family');
      element.style.removeProperty('line-height');
      element.style.removeProperty('min-width');
      element.style.removeProperty('min-height');

      const marginTop = element.style.marginTop;

      if (
        marginTop &&
        (marginTop.startsWith('-') || parseInt(marginTop) > 50)
      ) {
        element.style.removeProperty('margin-top');
      }

      const marginBottom = element.style.marginBottom;

      if (
        marginBottom &&
        (marginBottom.startsWith('-') ||
          parseInt(marginBottom) > 50)
      ) {
        element.style.removeProperty('margin-bottom');
      }

      const tagName = element.tagName.toLowerCase();

      if (
        tagName !== 'table' &&
        tagName !== 'iframe' &&
        tagName !== 'video' &&
        tagName !== 'td' &&
        tagName !== 'th'
      ) {
        if (
          element.style.width &&
          !element.style.width.endsWith('%')
        ) {
          element.style.removeProperty('width');
        }

        if (
          element.style.height &&
          !element.style.height.endsWith('%')
        ) {
          element.style.removeProperty('height');
        }
      }

      if (!currentIsQuickAnswer) {
        const bg =
          element.style.backgroundColor ||
          element.style.background;

        if (bg && isColorLight(bg)) {
          if (
            [
              'span',
              'p',
              'strong',
              'em',
              'b',
              'i',
              'font',
            ].includes(tagName)
          ) {
            element.style.removeProperty('background-color');
            element.style.removeProperty('background');
          }
        }
      } else {
        element.style.color = '#ffffff';
      }

      for (let i = 0; i < element.children.length; i++) {
        traverse(
          element.children[i] as HTMLElement,
          currentIsQuickAnswer
        );
      }
    };

    traverse(doc.body, false);

    return doc.body.innerHTML;
  } catch (error) {
    console.error(
      'Error parsing/cleaning blog content',
      error
    );

    return html;
  }
};

export default function BlogPostClient({
  blog,
}: {
  blog: BlogPostData;
}) {
  const t = useTranslations('Blog');
  const format = useFormatter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const author = blog.author || 'TRT Team';

  return (
    <main className="min-h-screen bg-background">
      <section className="pt-20 pb-12 bg-muted/20 border-b border-border/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-8 tracking-tight text-foreground uppercase leading-[1.2]"
          >
            {blog.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />

              <span>
                {format.dateTime(new Date(blog.date), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <span>{author}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>5 Min Read</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors mb-10 uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>{t('title') || 'Back to Blog'}</span>
          </Link>

          {blog.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-full overflow-hidden rounded-2xl border border-border shadow-xl mb-12 bg-muted/10"
            >
              <img
                src={blog.image}
                className="w-full h-auto block"
                alt={blog.title}
              />
            </motion.div>
          )}

          <article className="max-w-none">
            <div className="blog-article-card bg-white text-black rounded-2xl p-6 md:p-10 shadow-xl border border-gray-200/80 my-8">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{
                  __html: mounted
                    ? cleanBlogContent(blog.content)
                    : blog.content,
                }}
              />
            </div>
          </article>

          <div className="mt-20 pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User size={24} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Written By
                </p>

                <p className="font-bold text-foreground">
                  {author}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/#contact"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
              >
                {t('repair_now') || 'Repair Now'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
