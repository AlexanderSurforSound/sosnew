import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'propertyPageSettings',
  title: 'Property Page Settings',
  type: 'document',
  description: 'Labels,headings, and text for property detail pages',
  groups: [
    {name: 'breadcrumb', title: 'Breadcrumb'},
    {name: 'stats', title: 'Property Stats'},
    {name: 'tabs', title: 'Tab Labels'},
    {name: 'sections', title: 'Section Headings'},
    {name: 'buttons', title: 'Buttons & Actions'},
    {name: 'booking', title: 'Booking Widget'},
    {name: 'misc', title: 'Miscellaneous'},
  ],
  fields: [
    // Breadcrumb
    defineField({
      name: 'breadcrumbHome',
      title: 'Breadcrumb: Home Link',
      type: 'string',
      group: 'breadcrumb',
      initialValue: 'Vacation Rentals',
    }),

    // Property Stats Labels
    defineField({
      name: 'labelBedrooms',
      title: 'Bedrooms Label',
      type: 'string',
      group: 'stats',
      initialValue: 'Bedrooms',
    }),
    defineField({
      name: 'labelBathrooms',
      title: 'Bathrooms Label',
      type: 'string',
      group: 'stats',
      initialValue: 'Bathrooms',
    }),
    defineField({
      name: 'labelGuests',
      title: 'Guests Label',
      type: 'string',
      group: 'stats',
      initialValue: 'Guests',
    }),
    defineField({
      name: 'labelPetFriendly',
      title: 'Pet Friendly Label',
      type: 'string',
      group: 'stats',
      initialValue: 'Pet Friendly',
    }),

    // Tab Labels
    defineField({
      name: 'tabOverview',
      title: 'Overview Tab',
      type: 'string',
      group: 'tabs',
      initialValue: 'Overview',
    }),
    defineField({
      name: 'tabReviews',
      title: 'Reviews Tab',
      type: 'string',
      group: 'tabs',
      initialValue: 'Reviews',
    }),
    defineField({
      name: 'tabLocation',
      title: 'Location Tab',
      type: 'string',
      group: 'tabs',
      initialValue: 'Location',
    }),

    // Section Headings
    defineField({
      name: 'headingHighlights',
      title: 'Highlights Section Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'Property Highlights',
    }),
    defineField({
      name: 'headingAbout',
      title: 'About Section Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'About This Property',
    }),
    defineField({
      name: 'headingVirtualTour',
      title: 'Virtual Tour Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'Virtual Tour',
    }),
    defineField({
      name: 'headingAmenities',
      title: 'Amenities Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'Amenities',
    }),
    defineField({
      name: 'headingHouseRules',
      title: 'House Rules Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'House Rules',
    }),
    defineField({
      name: 'headingLocation',
      title: 'Location Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'Location',
    }),
    defineField({
      name: 'headingSimilar',
      title: 'Similar Properties Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'Similar Properties',
    }),
    defineField({
      name: 'headingFloorPlan',
      title: 'Floor Plan Heading',
      type: 'string',
      group: 'sections',
      initialValue: 'Floor Plan',
    }),

    // Buttons & Actions
    defineField({
      name: 'buttonCompare',
      title: 'Compare Button',
      type: 'string',
      group: 'buttons',
      initialValue: 'Compare',
    }),
    defineField({
      name: 'buttonInCompare',
      title: 'In Compare Button',
      type: 'string',
      group: 'buttons',
      initialValue: 'In Compare',
    }),
    defineField({
      name: 'buttonWriteReview',
      title: 'Write Review Button',
      type: 'string',
      group: 'buttons',
      initialValue: 'Write a Review',
    }),
    defineField({
      name: 'buttonBookNow',
      title: 'Book Now Button',
      type: 'string',
      group: 'buttons',
      initialValue: 'Book Now',
    }),
    defineField({
      name: 'buttonCheckAvailability',
      title: 'Check Availability Button',
      type: 'string',
      group: 'buttons',
      initialValue: 'Check Availability',
    }),

    // Booking Widget
    defineField({
      name: 'bookingCheckIn',
      title: 'Check-in Label',
      type: 'string',
      group: 'booking',
      initialValue: 'Check-in',
    }),
    defineField({
      name: 'bookingCheckOut',
      title: 'Check-out Label',
      type: 'string',
      group: 'booking',
      initialValue: 'Check-out',
    }),
    defineField({
      name: 'bookingGuestsLabel',
      title: 'Guests Label',
      type: 'string',
      group: 'booking',
      initialValue: 'Guests',
    }),
    defineField({
      name: 'bookingPricePrefix',
      title: 'Price Prefix',
      type: 'string',
      group: 'booking',
      initialValue: 'From',
    }),
    defineField({
      name: 'bookingPriceSuffix',
      title: 'Price Suffix',
      type: 'string',
      group: 'booking',
      initialValue: '/night',
    }),
    defineField({
      name: 'bookingMinNightsText',
      title: 'Minimum Nights Text',
      type: 'string',
      group: 'booking',
      initialValue: '{n}-night minimum',
      description: 'Use {n} as placeholder for the number',
    }),

    // Misc
    defineField({
      name: 'locationPlaceholder',
      title: 'Location Map Placeholder',
      type: 'string',
      group: 'misc',
      initialValue: 'Interactive map',
    }),
    defineField({
      name: 'noReviewsText',
      title: 'No Reviews Text',
      type: 'string',
      group: 'misc',
      initialValue: 'No reviews yet. Be the first to review this property!',
    }),
    defineField({
      name: 'propertyNotFoundTitle',
      title: 'Property Not Found Title',
      type: 'string',
      group: 'misc',
      initialValue: 'Property Not Found',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Property Page Settings',
        subtitle: 'Labels and text for property pages',
      }
    },
  },
})
