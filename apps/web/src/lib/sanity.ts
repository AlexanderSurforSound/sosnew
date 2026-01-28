import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'wymhjmyo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// Fetch home page content
export async function getHomePage() {
  return sanityClient.fetch(`*[_type == "homePage"][0]`)
}

// Fetch property management page content
export async function getPropertyManagementPage() {
  return sanityClient.fetch(`*[_type == "propertyManagementPage"][0]`)
}

// Fetch about page content
export async function getAboutPage() {
  return sanityClient.fetch(`*[_type == "aboutPage"][0]`)
}

// Fetch contact page content
export async function getContactPage() {
  return sanityClient.fetch(`*[_type == "contactPage"][0]`)
}

// Fetch legal page by slug
export async function getLegalPage(slug: string) {
  return sanityClient.fetch(
    `*[_type == "legalPage" && slug.current == $slug][0]`,
    { slug }
  )
}

// Fetch site settings
export async function getSiteSettings() {
  return sanityClient.fetch(`*[_type == "siteSettings"][0]`)
}

// Fetch FAQs
export async function getFAQs(category?: string) {
  if (category) {
    return sanityClient.fetch(
      `*[_type == "faq" && category == $category] | order(order asc)`,
      { category }
    )
  }
  return sanityClient.fetch(`*[_type == "faq"] | order(order asc)`)
}

// Fetch staff members
export async function getStaffMembers() {
  return sanityClient.fetch(`*[_type == "staffMember"] | order(order asc)`)
}

// Fetch testimonials
export async function getTestimonials(limit?: number) {
  const query = limit
    ? `*[_type == "testimonial"] | order(_createdAt desc)[0...${limit}]`
    : `*[_type == "testimonial"] | order(_createdAt desc)`
  return sanityClient.fetch(query)
}

// Fetch villages
export async function getVillages() {
  return sanityClient.fetch(`*[_type == "village"] | order(order asc)`)
}

// Fetch property page settings (labels, headings)
export async function getPropertyPageSettings() {
  return sanityClient.fetch(`*[_type == "propertyPageSettings"][0]`)
}

// Fetch search page settings
export async function getSearchPageSettings() {
  return sanityClient.fetch(`*[_type == "searchPageSettings"][0]`)
}

// Fetch UI strings (common text)
export async function getUIStrings() {
  return sanityClient.fetch(`*[_type == "uiStrings"][0]`)
}

// Fetch all page settings at once (for layout/providers)
export async function getAllSettings() {
  return sanityClient.fetch(`{
    "siteSettings": *[_type == "siteSettings"][0],
    "uiStrings": *[_type == "uiStrings"][0],
    "propertyPageSettings": *[_type == "propertyPageSettings"][0],
    "searchPageSettings": *[_type == "searchPageSettings"][0]
  }`)
}

// Fetch the active lease agreement
export async function getActiveLeaseAgreement(reservationType: 'standard' | 'advance' | 'all' = 'all') {
  return sanityClient.fetch(
    `*[_type == "leaseAgreement" && isActive == true && (reservationType == $reservationType || reservationType == "all")] | order(effectiveDate desc)[0]{
      _id,
      title,
      effectiveDate,
      reservationType,
      headerText,
      sections[]{
        name,
        title,
        content,
        requiresInitials,
        isTextFragment
      },
      addendums[]{
        id,
        title,
        content,
        required,
        appliesTo
      },
      consumerDisclosure,
      signatureText
    }`,
    { reservationType }
  )
}

// Fetch lease by effective date (for historical lookups)
export async function getLeaseByDate(date: string) {
  return sanityClient.fetch(
    `*[_type == "leaseAgreement" && effectiveDate <= $date] | order(effectiveDate desc)[0]{
      _id,
      title,
      effectiveDate,
      reservationType,
      headerText,
      sections[]{
        name,
        title,
        content,
        requiresInitials,
        isTextFragment
      },
      addendums[]{
        id,
        title,
        content,
        required,
        appliesTo
      },
      consumerDisclosure,
      signatureText
    }`,
    { date }
  )
}
