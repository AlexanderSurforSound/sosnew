import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'guestName',
      title: 'Guest Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'guestLocation',
      title: 'Guest Location',
      type: 'string',
      description: 'e.g., Richmond, VA',
    }),
    defineField({
      name: 'guestImage',
      title: 'Guest Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: 'property',
      title: 'Property Stayed',
      type: 'reference',
      to: [{type: 'property'}],
    }),
    defineField({
      name: 'stayDate',
      title: 'Stay Date',
      type: 'date',
    }),
    defineField({
      name: 'tripType',
      title: 'Trip Type',
      type: 'string',
      options: {
        list: [
          {title: 'Family Vacation', value: 'family'},
          {title: 'Romantic Getaway', value: 'romantic'},
          {title: 'Friends Trip', value: 'friends'},
          {title: 'Solo Adventure', value: 'solo'},
          {title: 'Anniversary', value: 'anniversary'},
          {title: 'Reunion', value: 'reunion'},
        ],
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'displayOnHomepage',
      title: 'Display on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'guestName',
      subtitle: 'quote',
      media: 'guestImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle?.slice(0, 50) + '...',
        media,
      }
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
