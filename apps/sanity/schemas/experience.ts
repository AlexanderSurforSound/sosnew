import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  description: 'Bookable experiences and tours',
  fields: [
    defineField({
      name: 'title',
      title: 'Experience Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Water Sports', value: 'water_sports'},
          {title: 'Fishing', value: 'fishing'},
          {title: 'Tours', value: 'tours'},
          {title: 'Wildlife', value: 'wildlife'},
          {title: 'Food & Drink', value: 'food_drink'},
          {title: 'Wellness', value: 'wellness'},
          {title: 'Adventure', value: 'adventure'},
          {title: 'Family', value: 'family'},
          {title: 'Photography', value: 'photography'},
          {title: 'Classes', value: 'classes'},
        ],
      },
      validation: (Rule) => Rule.required(),
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
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(6),
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
          ],
        },
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'object',
      fields: [
        {name: 'hours', type: 'number', title: 'Hours'},
        {name: 'minutes', type: 'number', title: 'Minutes'},
      ],
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'object',
      fields: [
        {name: 'amount', type: 'number', title: 'Amount'},
        {name: 'unit', type: 'string', title: 'Unit', options: {
          list: [
            {title: 'Per Person', value: 'person'},
            {title: 'Per Group', value: 'group'},
            {title: 'Per Hour', value: 'hour'},
          ],
        }},
      ],
    }),
    defineField({
      name: 'groupSize',
      title: 'Group Size',
      type: 'object',
      fields: [
        {name: 'min', type: 'number', title: 'Minimum'},
        {name: 'max', type: 'number', title: 'Maximum'},
      ],
    }),
    defineField({
      name: 'ageRequirement',
      title: 'Age Requirement',
      type: 'string',
      description: 'e.g., All ages, 8+, 18+',
    }),
    defineField({
      name: 'whatToBring',
      title: 'What to Bring',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'included',
      title: "What's Included",
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'notIncluded',
      title: 'Not Included',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'village',
      title: 'Village',
      type: 'reference',
      to: [{type: 'village'}],
    }),
    defineField({
      name: 'meetingPoint',
      title: 'Meeting Point',
      type: 'object',
      fields: [
        {name: 'address', type: 'text', title: 'Address'},
        {name: 'instructions', type: 'text', title: 'Instructions'},
        {name: 'location', type: 'geopoint', title: 'Map Location'},
      ],
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'object',
      fields: [
        {name: 'name', type: 'string', title: 'Name'},
        {name: 'phone', type: 'string', title: 'Phone'},
        {name: 'website', type: 'url', title: 'Website'},
      ],
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking URL',
      type: 'url',
    }),
    defineField({
      name: 'cancellationPolicy',
      title: 'Cancellation Policy',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
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
      title: 'title',
      subtitle: 'category',
      media: 'image',
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [{field: 'featured', direction: 'desc'}],
    },
  ],
})
