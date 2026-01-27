import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Booking & Reservations', value: 'booking'},
          {title: 'Check-in & Check-out', value: 'checkin'},
          {title: 'Payments & Cancellations', value: 'payments'},
          {title: 'Property Amenities', value: 'amenities'},
          {title: 'Pets', value: 'pets'},
          {title: 'Area & Activities', value: 'area'},
          {title: 'Smart Home & Technology', value: 'technology'},
          {title: 'Loyalty Program', value: 'loyalty'},
          {title: 'Safety & Emergencies', value: 'safety'},
          {title: 'General', value: 'general'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'keywords',
      title: 'Search Keywords',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Keywords to help guests find this FAQ',
    }),
    defineField({
      name: 'relatedFaqs',
      title: 'Related FAQs',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'faq'}]}],
    }),
    defineField({
      name: 'helpfulCount',
      title: 'Helpful Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order within the category',
    }),
    defineField({
      name: 'isPopular',
      title: 'Popular FAQ',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'category',
    },
  },
  orderings: [
    {
      title: 'Category, then Order',
      name: 'categoryOrder',
      by: [{field: 'category', direction: 'asc'}, {field: 'order', direction: 'asc'}],
    },
    {
      title: 'Most Helpful',
      name: 'helpfulDesc',
      by: [{field: 'helpfulCount', direction: 'desc'}],
    },
  ],
})
