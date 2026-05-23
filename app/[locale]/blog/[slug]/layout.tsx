import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string, locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  try {
    const res = await fetch(`${API_URL}/blogs/${slug}?locale=${locale}`, { cache: 'no-store' });
    if (res.ok) {
      const blog = await res.json();
      return {
        title: `${blog.title} | TRT`,
        description: blog.content ? blog.content.substring(0, 150) + '...' : '',
        keywords: `${blog.category || 'repair'}, TRT blog, ${blog.title.split(' ').join(', ')}`,
      };
    }
  } catch (error) {
    console.error("Failed to generate metadata for blog", error);
  }

  return {
    title: 'Blog | TRT',
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
