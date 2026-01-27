import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import PropertyDetailClient from './PropertyDetailClient';

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
