import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'promotion',
  title: 'Promotion',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'promotionType',
      title: 'Promotion Type',
      type: 'string',
      options: {
        list: [
          {title: 'Percentage Discount', value: 'percentage'},
          {title: 'Fixed Amount Off', value: 'fixed'},
          {title: 'Free Nights', value: 'free_nights'},
          {title: 'Early Bird', value: 'early_bird'},
          {title: 'Last Minute', value: 'last_minute'},
          {title: 'Loyalty Exclusive', value: 'loyalty'},
          {title: 'Bundle', value: 'bundle'},
          {title: 'Seasonal', value: 'seasonal'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Short attention-grabbing headline',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'image',
      title: 'Promo Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'discountValue',
      title: 'Discount Value',
      type: 'number',
      description: 'Percentage or dollar amount',
    }),
    defineField({
      name: 'promoCode',
      title: 'Promo Code',
      type: 'string',
      description: 'Leave blank if auto-applied',
    }),
    defineField({
      name: 'validFrom',
      title: 'Valid From',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'validUntil',
      title: 'Valid Until',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bookingWindow',
      title: 'Booking Window',
      type: 'object',
      description: 'When guests can book',
      fields: [
        {name: 'start', type: 'datetime', title: 'Start'},
        {name: 'end', type: 'datetime', title: 'End'},
      ],
    }),
    defineField({
      name: 'stayRequirements',
      title: 'Stay Requirements',
      type: 'object',
      fields: [
        {name: 'minNights', type: 'number', title: 'Minimum Nights'},
        {name: 'maxNights', type: 'number', title: 'Maximum Nights'},
      ],
    }),
    defineField({
      name: 'applicableProperties',
      title: 'Applicable Properties',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'property'}]}],
      description: 'Leave empty to apply to all properties',
    }),
    defineField({
      name: 'applicableVillages',
      title: 'Applicable Villages',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'village'}]}],
      description: 'Leave empty to apply to all villages',
    }),
    defineField({
      name: 'loyaltyTierRequired',
      title: 'Loyalty Tier Required',
      type: 'string',
      options: {
        list: [
          {title: 'None (All Guests)', value: 'none'},
          {title: 'Explorer+', value: 'explorer'},
          {title: 'Adventurer+', value: 'adventurer'},
          {title: 'Islander+', value: 'islander'},
          {title: 'Legend Only', value: 'legend'},
        ],
      },
    }),
    defineField({
      name: 'maxRedemptions',
      title: 'Max Redemptions',
      type: 'number',
      description: 'Total number of times this can be used',
    }),
    defineField({
      name: 'usageCount',
      title: 'Current Usage Count',
      type: 'number',
      initialValue: 0,
      readOnly: true,
    }),
    defineField({
      name: 'termsAndConditions',
      title: 'Terms & Conditions',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
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
      title: 'title',
      subtitle: 'headline',
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
      title: 'Valid Until',
      name: 'validUntilAsc',
      by: [{field: 'validUntil', direction: 'asc'}],
    },
  ],
})
