import { setRequestLocale } from 'next-intl/server';
import OurWorksClient from './our-works-client';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

async function getPortfolio(locale: string) {
  try {
    const response = await fetch(
      `${API_URL}/content/portfolio?locale=${locale}`,
      {
        next: {
          revalidate: 300,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Portfolio request failed: ${response.status}`
      );
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(
      'Failed to fetch portfolio server-side:',
      error
    );

    return [];
  }
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const initialWorks = await getPortfolio(locale);

  return (
    <OurWorksClient initialWorks={initialWorks} />
  );
}
