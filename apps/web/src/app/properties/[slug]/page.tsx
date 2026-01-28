import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import * as Track from '@/graphql/services/track';
import PropertyDetailClient from './PropertyDetailClient';

interface PageProps {
  params: { slug: string };
}

// Helper to find property by slug from Track API
async function getPropertyBySlug(slug: string) {
  try {
    const { units } = await Track.getUnits(1, 1000); // Get all units
    const nodes = await Track.getNodes();
    const nodesMap = new Map(nodes.map((n) => [n.id, n]));

    for (const unit of units) {
      const images = await Track.getUnitImages(unit.id, 10);
      const property = Track.mapTrackUnitToProperty(unit, nodesMap.get(unit.nodeId), images);
      if (property.slug === slug) {
        return property;
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch property:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getPropertyBySlug(params.slug);

  if (!property) {
    return { title: 'Property Not Found' };
  }

  return {
    title: property.name,
    description:
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
  const property = await getPropertyBySlug(params.slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
