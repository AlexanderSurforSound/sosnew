import HomePageClient from './HomePageClient';
import * as Track from '@/graphql/services/track';

// Cache for nodes
let nodesCache: Map<number, any> | null = null;

async function getNodesMap(): Promise<Map<number, any>> {
  if (nodesCache) return nodesCache;
  const nodes = await Track.getNodes();
  nodesCache = new Map(nodes.map((n) => [n.id, n]));
  return nodesCache;
}

async function getFeaturedProperties() {
  try {
    const { units } = await Track.getUnits(1, 5);
    const nodesMap = await getNodesMap();

    const properties = [];
    for (const unit of units) {
      const images = await Track.getUnitImages(unit.id, 5);
      const property = Track.mapTrackUnitToProperty(unit, nodesMap.get(unit.nodeId), images);
      properties.push(property);
    }

    return properties;
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return <HomePageClient featuredProperties={featuredProperties} />;
}
