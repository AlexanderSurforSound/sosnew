import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowRight, Search, Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | Hatteras Island Travel Guide & Tips',
  description: 'Discover travel tips, local insights, and the latest news about Hatteras Island. Plan your perfect Outer Banks vacation with our expert guides.',
};

// Mock blog posts - would come from CMS
const blogPosts = [
  {
    id: '1',
    slug: 'best-beaches-hatteras-island',
    title: 'The 10 Best Beaches on Hatteras Island',
    excerpt: 'From secluded coves to family-friendly shores, discover the best beaches Hatteras Island has to offer. Each beach has its own unique character and charm.',
    featuredImage: '/images/blog/beaches.jpg',
    category: 'Travel Guide',
    author: { name: 'Sarah Mitchell', avatar: '/images/team/sarah.jpg' },
    publishedAt: '2024-01-15',
    readTime: 8,
    featured: true,
  },
  {
    id: '2',
    slug: 'fishing-guide-outer-banks',
    title: 'Ultimate Fishing Guide: Hatteras Island',
    excerpt: 'Known as the Blue Marlin Capital of the World, Hatteras offers world-class fishing year-round. Learn the best spots, seasons, and techniques.',
    featuredImage: '/images/blog/fishing.jpg',
    category: 'Activities',
    author: { name: 'Mike Thompson', avatar: '/images/team/mike.jpg' },
    publishedAt: '2024-01-10',
    readTime: 12,
    featured: true,
  },
  {
    id: '3',
    slug: 'cape-hatteras-lighthouse-history',
    title: 'The Fascinating History of Cape Hatteras Lighthouse',
    excerpt: 'Standing at 198 feet tall, the Cape Hatteras Lighthouse is an iconic symbol of the Outer Banks. Discover its rich history and plan your visit.',
    featuredImage: '/images/blog/lighthouse.jpg',
    category: 'History',
    author: { name: 'Emily Roberts', avatar: '/images/team/emily.jpg' },
    publishedAt: '2024-01-05',
    readTime: 6,
    featured: false,
  },
  {
    id: '4',
    slug: 'best-restaurants-hatteras',
    title: 'Where to Eat: Best Restaurants on Hatteras Island',
    excerpt: 'From fresh seafood shacks to fine dining, explore the culinary scene of Hatteras Island. Our local picks for every taste and budget.',
    featuredImage: '/images/blog/restaurants.jpg',
    category: 'Food & Dining',
    author: { name: 'Sarah Mitchell', avatar: '/images/team/sarah.jpg' },
    publishedAt: '2024-01-02',
    readTime: 10,
    featured: false,
  },
  {
    id: '5',
    slug: 'kiteboarding-beginners-guide',
    title: 'Kiteboarding on Hatteras: A Beginner\'s Guide',
    excerpt: 'Hatteras Island is a world-renowned kiteboarding destination. Learn everything you need to know to get started with this thrilling sport.',
    featuredImage: '/images/blog/kiteboarding.jpg',
    category: 'Activities',
    author: { name: 'Jake Wilson', avatar: '/images/team/jake.jpg' },
    publishedAt: '2023-12-28',
    readTime: 9,
    featured: false,
  },
  {
    id: '6',
    slug: 'wildlife-watching-hatteras',
    title: 'Wildlife Watching: Birds, Dolphins & More',
    excerpt: 'From migratory birds to playful dolphins, Hatteras Island is a paradise for wildlife enthusiasts. Plan your wildlife watching adventure.',
    featuredImage: '/images/blog/wildlife.jpg',
    category: 'Nature',
    author: { name: 'Emily Roberts', avatar: '/images/team/emily.jpg' },
    publishedAt: '2023-12-20',
    readTime: 7,
    featured: false,
  },
];

const categories = [
  'All',
  'Travel Guide',
  'Activities',
  'History',
  'Food & Dining',
  'Nature',
  'Events',
];

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Hatteras Island Blog
            </h1>
            <p className="text-xl text-ocean-100 mb-8">
              Travel tips, local insights, and everything you need to plan your perfect Outer Banks vacation.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-ocean-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b bg-white sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === 'All'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="relative h-64 bg-gradient-to-br from-ocean-400 to-ocean-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/30 text-6xl font-bold">{post.title.charAt(0)}</span>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-ocean-700">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-ocean-100 rounded-full flex items-center justify-center">
                        <span className="text-ocean-600 text-sm font-medium">
                          {post.author.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime} min
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Posts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
            <Link href="/blog/archive" className="text-ocean-600 font-medium hover:text-ocean-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Tag className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-ocean-600 uppercase tracking-wide">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2 group-hover:text-ocean-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.author.name}</span>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Get Hatteras Island Tips in Your Inbox
          </h2>
          <p className="text-ocean-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive travel tips, special offers, and the latest news from the Outer Banks.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-ocean-300 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-ocean-700 rounded-xl font-semibold hover:bg-ocean-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
