import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import PropertyDetailClient from './PropertyDetailClient';

// Incremental Static Regeneration: rebuild property pages hourly
export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await api.getProperty(params.slug).catch(() => null);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  return {
    title: property.seo?.title || property.name,
    description:
      property.seo?.description ||
      property.headline ||
      `${property.bedrooms} bedroom vacation rental in ${property.village?.name || 'Hatteras Island'}`,
    openGraph: {
      title: property.name,
      description: property.headline,
      images: property.images.slice(0, 4).map((img) => ({
        url: img.url,
        alt: img.alt || property.name,
      })),
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await api.getProperty(params.slug).catch(() => null);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}

// Pre-generate static params for properties at build time
// Uses a large page size to reduce API calls; fallback handled by ISR
export async function generateStaticParams() {
  try {
    const result = await api.getProperties({ page: 1, pageSize: 1000 });
    return result.items.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
