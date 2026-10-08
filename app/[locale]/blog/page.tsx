import React from 'react';
import { Link } from '@/i18n/routing';
import { Calendar, User, ArrowRight, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getTranslations,
  getFormatter,
  setRequestLocale,
} from 'next-intl/server';
import { cn } from '@/lib/utils';

type BlogItem = {
  id: number | string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  date: string;
  author?: string;
};

type FetchBlogsResult = {
  blogs: BlogItem[];
  total: number;
  totalPages: number;
  currentPage: number;
};

const ITEMS_PER_PAGE = 9;

const stripHtml = (html: string) => {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
};

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

async function fetchBlogs(
  locale: string,
  page: number = 1,
  limit: number = ITEMS_PER_PAGE
): Promise<FetchBlogsResult> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api';

  try {
    const res = await fetch(
      `${API_URL}/blogs?locale=${locale}&page=${page}&limit=${limit}`,
      {
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`Blogs request failed with status ${res.status}`);
    }

    const data = await res.json();

    let rawBlogs: BlogItem[] = [];
    let total = 0;
    let totalPages = 1;

    if (data && Array.isArray(data.blogs)) {
      rawBlogs = data.blogs;
      total = typeof data.total === 'number' ? data.total : data.blogs.length;
      totalPages = typeof data.totalPages === 'number' ? data.totalPages : Math.ceil(total / limit);
    } else if (Array.isArray(data)) {
      // Graceful fallback for non-paginated API response
      const filtered = data.filter(
        (b) =>
          b &&
          b.slug &&
          b.title &&
          !['test', 'fgrt'].includes(String(b.slug).toLowerCase())
      );
      total = filtered.length;
      totalPages = Math.max(1, Math.ceil(total / limit));
      const offset = (page - 1) * limit;
      rawBlogs = filtered.slice(offset, offset + limit);
    } else {
      throw new Error('Unexpected blogs response format');
    }

    const cleanBlogs = rawBlogs.filter(
      (blog) =>
        blog &&
        blog.slug &&
        blog.title &&
        !['test', 'fgrt'].includes(String(blog.slug).toLowerCase())
    );

    return {
      blogs: cleanBlogs,
      total,
      totalPages: Math.max(1, totalPages),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching blogs for server rendering', error);
    return {
      blogs: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawPage = parseInt(resolvedSearchParams?.page || '1', 10);
  const requestedPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  setRequestLocale(locale);

  const t = await getTranslations('Blog');
  const format = await getFormatter();

  const { blogs, total, totalPages, currentPage } = await fetchBlogs(
    locale,
    requestedPage,
    ITEMS_PER_PAGE
  );

  const startCount = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endCount = Math.min(currentPage * ITEMS_PER_PAGE, total);

  const getPageUrl = (p: number) => {
    return p <= 1 ? '/blog' : `/blog?page=${p}`;
  };

  return (
    <main className="min-h-screen bg-background">
      <section id="blogs-grid" className="pt-8 md:pt-12 pb-24 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex p-3 bg-primary/10 rounded-xl text-primary mb-6">
              <Newspaper size={32} />
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-foreground uppercase">
              {t('title')}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              {t('desc')}
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-border/50">
              <p className="text-muted-foreground font-bold">
                {t('no_blogs')}
              </p>
            </div>
          ) : (
            <>
              {/* Blog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog, index) => (
                  <Link
                    key={`${blog.id}-${index}`}
                    href={`/blog/${blog.slug}`}
                    className="block h-full cursor-pointer group"
                  >
                    <article className="bg-card rounded-xl border border-border/50 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full hover:border-primary/40">
                      <div className="relative w-full aspect-video overflow-hidden bg-muted/40">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading={index < 3 ? 'eager' : 'lazy'}
                            decoding="async"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
                            <Newspaper size={48} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex flex-col flex-grow">
                        <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs font-bold text-muted-foreground/70 mb-5 uppercase tracking-widest">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Calendar
                              size={14}
                              className="text-primary shrink-0"
                            />
                            <span>
                              {format.dateTime(
                                new Date(blog.date || Date.now()),
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                }
                              )}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <User
                              size={14}
                              className="text-primary shrink-0"
                            />
                            <span>
                              {blog.author || 'TRT Team'}
                            </span>
                          </div>
                        </div>

                        <h2 className="text-2xl font-black mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight tracking-tight">
                          {blog.title}
                        </h2>

                        <p className="text-muted-foreground mb-8 line-clamp-3 leading-relaxed font-medium flex-grow">
                          {stripHtml(blog.excerpt || blog.content)}
                        </p>

                        <div className="inline-flex items-center text-primary font-black uppercase tracking-widest group/btn group-hover:gap-4 transition-all">
                          <span>{t('read_more')}</span>
                          <ArrowRight
                            size={20}
                            className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                          />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="mt-16 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Results Count Summary */}
                  <div className="text-xs sm:text-sm font-bold text-muted-foreground">
                    {locale === 'ar' ? (
                      <span>
                        عرض <span className="text-foreground font-black">{startCount}</span> - <span className="text-foreground font-black">{endCount}</span> من أصل <span className="text-primary font-black">{total}</span> مقال
                      </span>
                    ) : locale === 'en' ? (
                      <span>
                        Showing <span className="text-foreground font-black">{startCount}</span> - <span className="text-foreground font-black">{endCount}</span> of <span className="text-primary font-black">{total}</span> articles
                      </span>
                    ) : (
                      <span>
                        <span className="text-primary font-black">{total}</span> makaleden <span className="text-foreground font-black">{startCount}</span> - <span className="text-foreground font-black">{endCount}</span> arası gösteriliyor
                      </span>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Previous Button */}
                    {currentPage <= 1 ? (
                      <span
                        aria-disabled="true"
                        className="px-3.5 py-2.5 rounded-lg text-xs font-black flex items-center gap-1.5 border border-border/40 text-muted-foreground/40 bg-muted/20 cursor-not-allowed select-none"
                      >
                        <ChevronLeft size={16} className="rtl:rotate-180" />
                        <span className="hidden sm:inline">{t('prev')}</span>
                      </span>
                    ) : (
                      <Link
                        href={getPageUrl(currentPage - 1)}
                        className="px-3.5 py-2.5 rounded-lg text-xs font-black flex items-center gap-1.5 border border-border text-foreground hover:border-primary/60 hover:text-primary bg-card transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <ChevronLeft size={16} className="rtl:rotate-180" />
                        <span className="hidden sm:inline">{t('prev')}</span>
                      </Link>
                    )}

                    {/* Page Numbers */}
                    {getPageNumbers(currentPage, totalPages).map((pNum, idx) => {
                      if (pNum === '...') {
                        return (
                          <span
                            key={`dots-${idx}`}
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xs text-muted-foreground font-bold select-none"
                          >
                            ...
                          </span>
                        );
                      }

                      const isCurrent = currentPage === pNum;

                      return isCurrent ? (
                        <span
                          key={`page-${pNum}`}
                          aria-current="page"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-black flex items-center justify-center bg-primary text-primary-foreground border border-primary shadow-md shadow-primary/25 scale-105 select-none"
                        >
                          {pNum}
                        </span>
                      ) : (
                        <Link
                          key={`page-${pNum}`}
                          href={getPageUrl(pNum as number)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs font-black flex items-center justify-center bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer active:scale-95 shadow-xs"
                        >
                          {pNum}
                        </Link>
                      );
                    })}

                    {/* Next Button */}
                    {currentPage >= totalPages ? (
                      <span
                        aria-disabled="true"
                        className="px-3.5 py-2.5 rounded-lg text-xs font-black flex items-center gap-1.5 border border-border/40 text-muted-foreground/40 bg-muted/20 cursor-not-allowed select-none"
                      >
                        <span className="hidden sm:inline">{t('next')}</span>
                        <ChevronRight size={16} className="rtl:rotate-180" />
                      </span>
                    ) : (
                      <Link
                        href={getPageUrl(currentPage + 1)}
                        className="px-3.5 py-2.5 rounded-lg text-xs font-black flex items-center gap-1.5 border border-border text-foreground hover:border-primary/60 hover:text-primary bg-card transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <span className="hidden sm:inline">{t('next')}</span>
                        <ChevronRight size={16} className="rtl:rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
