import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'localGuide',
  title: 'Local Guide',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Restaurant', value: 'restaurant'},
          {title: 'Activity', value: 'activity'},
          {title: 'Attraction', value: 'attraction'},
          {title: 'Shopping', value: 'shopping'},
          {title: 'Service', value: 'service'},
          {title: 'Beach Access', value: 'beach_access'},
          {title: 'Nature', value: 'nature'},
          {title: 'Nightlife', value: 'nightlife'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      description: 'e.g., Seafood, Mexican, Water Sports, etc.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'alt', type: 'string', title: 'Alt Text'},
            {name: 'caption', type: 'string', title: 'Caption'},
          ],
        },
      ],
    }),
    defineField({
      name: 'village',
      title: 'Village',
      type: 'reference',
      to: [{type: 'village'}],
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        {name: 'street', type: 'string', title: 'Street'},
        {name: 'city', type: 'string', title: 'City'},
        {name: 'zip', type: 'string', title: 'ZIP Code'},
      ],
    }),
    defineField({
      name: 'location',
      title: 'Map Location',
      type: 'geopoint',
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {name: 'phone', type: 'string', title: 'Phone'},
        {name: 'website', type: 'url', title: 'Website'},
        {name: 'email', type: 'string', title: 'Email'},
      ],
    }),
    defineField({
      name: 'hours',
      title: 'Hours of Operation',
      type: 'text',
      rows: 3,
      description: 'e.g., Mon-Sat: 11am-9pm, Sun: Closed',
    }),
    defineField({
      name: 'priceRange',
      title: 'Price Range',
      type: 'string',
      options: {
        list: [
          {title: '$', value: '$'},
          {title: '$$', value: '$$'},
          {title: '$$$', value: '$$$'},
          {title: '$$$$', value: '$$$$'},
          {title: 'Free', value: 'free'},
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'e.g., family-friendly, romantic, outdoor, waterfront',
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'staffPick',
      title: 'Staff Pick',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', title: 'SEO Title'},
        {name: 'description', type: 'text', title: 'SEO Description', rows: 2},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
    {
      title: 'Category',
      name: 'categoryAsc',
      by: [{field: 'category', direction: 'asc'}],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [{field: 'featured', direction: 'desc'}],
    },
  ],
})
