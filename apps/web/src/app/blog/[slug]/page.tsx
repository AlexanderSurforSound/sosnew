import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Bookmark, ChevronRight } from 'lucide-react';

// Mock blog post data
const blogPosts: Record<string, {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  author: { name: string; bio: string; avatar: string };
  publishedAt: string;
  readTime: number;
  tags: string[];
}> = {
  'best-beaches-hatteras-island': {
    id: '1',
    slug: 'best-beaches-hatteras-island',
    title: 'The 10 Best Beaches on Hatteras Island',
    excerpt: 'From secluded coves to family-friendly shores, discover the best beaches Hatteras Island has to offer.',
    content: `
      <p class="lead">Hatteras Island stretches 50 miles along the Outer Banks of North Carolina, offering some of the most pristine and uncrowded beaches on the East Coast. Whether you're looking for world-class surfing, peaceful shell collecting, or the perfect spot for a family beach day, Hatteras has a beach for you.</p>

      <h2>1. Lighthouse Beach, Buxton</h2>
      <p>Located at the base of the iconic Cape Hatteras Lighthouse, this beach offers stunning views and excellent swimming conditions. The lighthouse provides a perfect backdrop for photos, and the beach is well-maintained with lifeguards during summer months.</p>
      <p>Best for: Photography, swimming, families</p>

      <h2>2. Canadian Hole, Buxton</h2>
      <p>This legendary spot on the sound side is considered one of the best windsurfing and kiteboarding locations in the world. The shallow, warm waters and consistent winds make it perfect for water sports enthusiasts of all levels.</p>
      <p>Best for: Windsurfing, kiteboarding, paddleboarding</p>

      <h2>3. Salvo Day Use Area</h2>
      <p>A quieter alternative to more popular beaches, Salvo offers excellent conditions for fishing and a peaceful atmosphere. The wide beach provides plenty of space even during peak season.</p>
      <p>Best for: Fishing, solitude, birdwatching</p>

      <h2>4. Rodanthe Pier Beach</h2>
      <p>The historic Rodanthe Pier is a hub of activity, offering fishing, surfing, and people-watching opportunities. The beach here has some of the best waves on the island.</p>
      <p>Best for: Surfing, pier fishing, sunset watching</p>

      <h2>5. Frisco Beach</h2>
      <p>Known for its excellent shelling, Frisco Beach is less developed and offers a more natural experience. The beach access near the old Frisco pier is particularly scenic.</p>
      <p>Best for: Shelling, nature walks, photography</p>

      <h2>Practical Tips</h2>
      <ul>
        <li>Always check weather and surf conditions before heading out</li>
        <li>Bring plenty of water and sun protection - shade is limited</li>
        <li>Respect wildlife, especially nesting sea turtles and shorebirds</li>
        <li>4WD beach access is available with a permit from the National Park Service</li>
        <li>Lifeguards are only present at select beaches during summer</li>
      </ul>

      <h2>Getting There</h2>
      <p>All beaches on Hatteras Island are free to access. Most have designated parking areas along NC Highway 12. For 4WD beach access, permits can be obtained at the National Park Service visitor centers.</p>
    `,
    featuredImage: '/images/blog/beaches.jpg',
    category: 'Travel Guide',
    author: {
      name: 'Sarah Mitchell',
      bio: 'Sarah has been exploring the Outer Banks for over 15 years and loves sharing her favorite hidden gems.',
      avatar: '/images/team/sarah.jpg',
    },
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['Beaches', 'Travel Tips', 'Outer Banks', 'Summer'],
  },
};

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts[params.slug];
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | Surf or Sound Blog`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  const relatedPosts = [
    { slug: 'fishing-guide-outer-banks', title: 'Ultimate Fishing Guide: Hatteras Island', category: 'Activities' },
    { slug: 'cape-hatteras-lighthouse-history', title: 'The Fascinating History of Cape Hatteras Lighthouse', category: 'History' },
    { slug: 'best-restaurants-hatteras', title: 'Where to Eat: Best Restaurants on Hatteras Island', category: 'Food & Dining' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-ocean-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-ocean-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{post.author.name.charAt(0)}</span>
              </div>
              <span>{post.author.name}</span>
            </div>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr,280px] gap-12">
          {/* Main Content */}
          <article>
            {/* Featured Image Placeholder */}
            <div className="relative h-64 md:h-96 bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-2xl mb-8 flex items-center justify-center">
              <span className="text-ocean-400 text-lg">Featured Image</span>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-ocean-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.toLowerCase()}`}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-ocean-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-ocean-600 text-xl font-bold">{post.author.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">About {post.author.name}</h3>
                  <p className="text-gray-600 mt-1">{post.author.bio}</p>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-8 h-fit">
            {/* Share */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Share this article</h3>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity">
                  <Twitter className="w-4 h-4" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Related Posts */}
            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Related Articles</h3>
              <div className="space-y-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="block group"
                  >
                    <span className="text-xs text-ocean-600 uppercase tracking-wide">{related.category}</span>
                    <h4 className="text-gray-900 font-medium group-hover:text-ocean-600 transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-ocean-500 to-ocean-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-2">Plan Your Trip</h3>
              <p className="text-ocean-100 text-sm mb-4">
                Ready to experience Hatteras Island? Browse our vacation rentals.
              </p>
              <Link
                href="/properties"
                className="flex items-center justify-center gap-2 w-full py-2 bg-white text-ocean-600 rounded-lg font-medium hover:bg-ocean-50 transition-colors"
              >
                View Properties
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
