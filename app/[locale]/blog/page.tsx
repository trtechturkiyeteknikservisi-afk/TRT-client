import React from 'react';
import { Link } from '@/i18n/routing';
import { Calendar, User, ArrowRight, Newspaper } from 'lucide-react';
import {
  getTranslations,
  getFormatter,
  setRequestLocale,
} from 'next-intl/server';

type BlogItem = {
  id: number | string;
  slug: string;
  title: string;
  content: string;
  image?: string;
  date: string;
  author?: string;
};

const stripHtml = (html: string) => {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
};

async function fetchBlogs(locale: string): Promise<BlogItem[]> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000/api';

  try {
    const res = await fetch(
      `${API_URL}/blogs?locale=${locale}`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Blogs request failed with status ${res.status}`
      );
    }

    const data = await res.json();

    let blogs: BlogItem[];

    if (data && Array.isArray(data.blogs)) {
      blogs = data.blogs;
    } else if (Array.isArray(data)) {
      blogs = data;
    } else {
      throw new Error('Unexpected blogs response format');
    }

    return blogs.filter(
      (blog) =>
        blog &&
        blog.slug &&
        blog.title &&
        !['test', 'fgrt'].includes(
          blog.slug.toLowerCase()
        )
    );
  } catch (error) {
    console.error(
      'Error fetching blogs for server rendering',
      error
    );

    throw error;
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Blog');
  const format = await getFormatter();

  const blogs = await fetchBlogs(locale);

  return (
    <main className="min-h-screen bg-background">
      <section className="pt-8 md:pt-12 pb-24 bg-muted/30">
        <div className="container mx-auto px-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <Link
                  key={`${blog.id}-${index}`}
                  href={`/blog/${blog.slug}`}
                  className="block h-full cursor-pointer group"
                >
                  <article className="bg-card rounded-xl border border-border/50 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full">
                    <div className="relative w-full aspect-video overflow-hidden">
                      {blog.image && (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading={
                            index < 3 ? 'eager' : 'lazy'
                          }
                        />
                      )}
                    </div>

                    <div className="p-10 flex flex-col flex-grow">
                      <div className="flex items-center space-x-4 text-xs font-bold text-muted-foreground/60 mb-6 uppercase tracking-widest">
                        <div className="flex items-center space-x-2">
                          <Calendar
                            size={14}
                            className="text-primary"
                          />

                          <span>
                            {format.dateTime(
                              new Date(blog.date),
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <User
                            size={14}
                            className="text-primary"
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
                        {stripHtml(blog.content)}
                      </p>

                      <div className="inline-flex items-center text-primary font-black uppercase tracking-widest group/btn group-hover:gap-4 transition-all">
                        <span>{t('read_more')}</span>

                        <ArrowRight
                          size={20}
                          className="ml-2 transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
