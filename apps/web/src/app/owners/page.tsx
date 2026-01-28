import { Metadata } from 'next';
import { getPropertyManagementPage } from '@/lib/sanity';
import OwnersPageClient from './OwnersPageClient';

// Default content (used if CMS content not available)
const defaultContent = {
  heroTagline: 'Property Management',
  heroHeading: 'Locally Owned. Island Focused. Since 1978.',
  heroText: "We've been managing vacation rentals on Hatteras Island for over four decades. Our team lives here, works here, and knows what it takes to care for your property.",
  heroPrimaryButton: { text: 'Get Started', url: '#contact-form' },
  heroSecondaryButton: { text: 'Call 800.237.1138', url: 'tel:800-237-1138' },
  stats: [
    { value: '625+', label: 'Properties Managed' },
    { value: '1978', label: 'Established' },
    { value: '7', label: 'Villages Served' },
    { value: '3', label: 'Island Offices' },
  ],
  benefitsSectionHeading: 'Full-Service Property Management',
  benefitsSectionSubheading: 'We handle every aspect of vacation rental management so you can enjoy ownership without the hassle.',
  benefits: [
    {
      icon: 'Home',
      title: 'Local Expertise',
      description: 'We live and work on Hatteras Island. Our team knows every village, every street, and what makes each property unique.',
    },
    {
      icon: 'Users',
      title: 'Dedicated Guest Services',
      description: 'Three office locations across the island with staff available daily 8:30am-5pm for guest support and property needs.',
    },
    {
      icon: 'Wrench',
      title: 'On-Island Maintenance',
      description: 'Local maintenance team handles routine upkeep, emergency repairs, and coordinates with trusted island vendors.',
    },
    {
      icon: 'DollarSign',
      title: 'Revenue Management',
      description: 'Strategic pricing based on seasonal demand, local events, and market conditions to optimize your rental income.',
    },
    {
      icon: 'ClipboardCheck',
      title: 'Hassle-Free Operations',
      description: "We coordinate housekeeping, handle guest communications, and manage the day-to-day so you don't have to.",
    },
    {
      icon: 'TrendingUp',
      title: 'Owner Portal Access',
      description: 'View your bookings, statements, and property updates online anytime through our owner portal.',
    },
  ],
  servicesSectionHeading: 'Choose Your Level of Service',
  serviceTiers: [
    {
      name: 'Full Service Management',
      description: 'Everything you need, handled by us',
      popular: true,
      features: [
        'Strategic pricing optimization',
        'Professional photography & marketing',
        'Guest booking & communication',
        'Housekeeping coordination',
        'Maintenance & repairs',
        'Owner portal access',
        'Monthly financial reporting',
        'Linen program available',
      ],
    },
  ],
  contactHeading: "Let's Discuss Your Property",
  contactText: 'Fill out the form and our owner services team will contact you within 24 hours to discuss how we can help maximize your rental income.',
  contactPhone: '800.237.1138',
  contactEmail: 'owners@surforsound.com',
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPropertyManagementPage().catch(() => null);

  return {
    title: content?.seo?.title || 'Property Management',
    description: content?.seo?.description || 'Partner with Hatteras Island\'s premier vacation rental company. Full-service property management since 1978.',
  };
}

export default async function OwnersPage() {
  // Fetch content from Sanity, fall back to defaults
  const cmsContent = await getPropertyManagementPage().catch(() => null);
  const content = cmsContent ? { ...defaultContent, ...cmsContent } : defaultContent;

  return <OwnersPageClient content={content} />;
}
