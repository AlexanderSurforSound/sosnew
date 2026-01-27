import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'village',
  title: 'Village',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Village Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
      description: 'Name to be displayed (if different from Village Name)',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pmsId',
      title: 'PMS ID',
      type: 'string',
      description: 'Track PMS village identifier',
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
      description: 'Brief description for cards and previews',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery Images',
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
      name: 'highlights',
      title: 'Village Highlights',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Key features of this village (e.g., "Closest to Lighthouse", "Watersports hub")',
    }),
    defineField({
      name: 'attractions',
      title: 'Local Attractions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', type: 'string', title: 'Name'},
            {name: 'description', type: 'text', title: 'Description'},
            {name: 'type', type: 'string', title: 'Type', options: {
              list: ['beach', 'restaurant', 'activity', 'shopping', 'landmark', 'nature'],
            }},
          ],
        },
      ],
    }),
    defineField({
      name: 'location',
      title: 'Map Location',
      type: 'geopoint',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which villages appear (lower = first)',
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
      subtitle: 'shortDescription',
      media: 'heroImage',
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
})
