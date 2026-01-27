import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    defineField({
      name: 'trackId',
      title: 'Track Property ID',
      type: 'string',
      description: 'The unique identifier from Track PMS',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'houseNumber',
      title: 'House Number',
      type: 'string',
      description: 'SoS House Number for legacy compatibility',
    }),
    defineField({
      name: 'name',
      title: 'Property Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Marketing Headline',
      type: 'string',
      description: 'Short catchy description for property cards (max 100 chars)',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'highlights',
      title: 'Property Highlights',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(6),
      description: 'Key selling points (e.g., "Steps from the beach", "Private heated pool")',
    }),
    defineField({
      name: 'village',
      title: 'Village',
      type: 'reference',
      to: [{type: 'village'}],
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', type: 'string', title: 'Alt Text'},
            {name: 'caption', type: 'string', title: 'Caption'},
            {name: 'isPrimary', type: 'boolean', title: 'Primary Image'},
          ],
        },
      ],
    }),
    defineField({
      name: 'virtualTourUrl',
      title: 'Virtual Tour URL (Matterport)',
      type: 'url',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Property Video URL',
      type: 'url',
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'amenity'}]}],
    }),
    defineField({
      name: 'houseRules',
      title: 'House Rules',
      type: 'blockContent',
    }),
    defineField({
      name: 'checkInInstructions',
      title: 'Check-In Instructions',
      type: 'blockContent',
      description: 'Instructions sent to guests before arrival',
    }),
    defineField({
      name: 'parkingInstructions',
      title: 'Parking Instructions',
      type: 'text',
    }),
    defineField({
      name: 'wifiName',
      title: 'WiFi Network Name',
      type: 'string',
    }),
    defineField({
      name: 'wifiPassword',
      title: 'WiFi Password',
      type: 'string',
    }),
    defineField({
      name: 'localTips',
      title: 'Local Tips & Recommendations',
      type: 'blockContent',
      description: 'Insider tips about the area, nearby restaurants, activities, etc.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle to make the property visible in search',
      initialValue: true,
    }),
    defineField({
      name: 'isNew',
      title: 'New Property',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'disableReviews',
      title: 'Disable Reviews',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Tags for filtering (e.g., "Featured", "Pet Friendly", "Oceanfront")',
    }),
    defineField({
      name: 'youtubeVideoKeys',
      title: 'YouTube Video Keys',
      type: 'array',
      of: [{type: 'string'}],
      description: 'YouTube video IDs (e.g., l9kn0RqmTMk from youtube.com/watch?v=l9kn0RqmTMk)',
    }),
    defineField({
      name: 'floorPlans',
      title: 'Floor Plans',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'level', type: 'string', title: 'Level Name'},
            {name: 'image', type: 'image', title: 'Floor Plan Image', options: {hotspot: true}},
            {name: 'bedrooms', type: 'array', of: [{
              type: 'object',
              fields: [
                {name: 'name', type: 'string', title: 'Room Name'},
                {name: 'bedType', type: 'string', title: 'Bed Type'},
                {name: 'hasPrivateBath', type: 'boolean', title: 'Has Private Bath'},
              ],
            }], title: 'Bedrooms'},
          ],
        },
      ],
    }),
    defineField({
      name: 'weeklyRates',
      title: 'Weekly Reference Rates',
      type: 'array',
      description: 'Reference rates by season (actual rates come from Track)',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'season', type: 'string', title: 'Season'},
            {name: 'minRate', type: 'number', title: 'Min Weekly Rate'},
            {name: 'maxRate', type: 'number', title: 'Max Weekly Rate'},
          ],
        },
      ],
    }),
    defineField({
      name: 'specials',
      title: 'Special Rates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'Special Name'},
            {name: 'discount', type: 'string', title: 'Discount'},
            {name: 'validFrom', type: 'date', title: 'Valid From'},
            {name: 'validUntil', type: 'date', title: 'Valid Until'},
            {name: 'description', type: 'text', title: 'Description'},
          ],
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', title: 'SEO Title'},
        {name: 'description', type: 'text', title: 'SEO Description', rows: 2},
        {name: 'keywords', type: 'array', of: [{type: 'string'}], title: 'Keywords'},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'trackId',
      media: 'images.0',
    },
  },
  orderings: [
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [{field: 'featured', direction: 'desc'}],
    },
  ],
})
