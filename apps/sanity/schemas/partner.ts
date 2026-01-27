import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  description: 'Partner businesses and affiliations',
  fields: [
    defineField({
      name: 'name',
      title: 'Partner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
    }),
    defineField({
      name: 'type',
      title: 'Partner Type',
      type: 'string',
      options: {
        list: [
          {title: 'Affiliate', value: 'affiliate'},
          {title: 'Vendor', value: 'vendor'},
          {title: 'Sponsor', value: 'sponsor'},
          {title: 'Service Provider', value: 'service_provider'},
          {title: 'Local Business', value: 'local_business'},
          {title: 'Industry Association', value: 'association'},
        ],
      },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'specialOffer',
      title: 'Special Offer for Guests',
      type: 'text',
      rows: 2,
      description: 'Discount or special offer for Surf or Sound guests',
    }),
    defineField({
      name: 'promoCode',
      title: 'Promo Code',
      type: 'string',
    }),
    defineField({
      name: 'displayOnFooter',
      title: 'Display on Footer',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
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
      title: 'name',
      subtitle: 'type',
      media: 'logo',
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
