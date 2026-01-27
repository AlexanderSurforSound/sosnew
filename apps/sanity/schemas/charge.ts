import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'charge',
  title: 'Charge/Fee',
  type: 'document',
  description: 'Additional charges and fees',
  fields: [
    defineField({
      name: 'name',
      title: 'Charge Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Charge Code',
      type: 'string',
      description: 'Internal code for this charge',
    }),
    defineField({
      name: 'chargeType',
      title: 'Charge Type',
      type: 'string',
      options: {
        list: [
          {title: 'Mandatory Fee', value: 'mandatory'},
          {title: 'Optional Add-on', value: 'optional'},
          {title: 'Service Fee', value: 'service'},
          {title: 'Tax', value: 'tax'},
          {title: 'Deposit', value: 'deposit'},
          {title: 'Pet Fee', value: 'pet'},
          {title: 'Cleaning Fee', value: 'cleaning'},
          {title: 'Linen Package', value: 'linen'},
          {title: 'Travel Insurance', value: 'insurance'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      description: 'Brief description for checkout display',
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        {name: 'amount', type: 'number', title: 'Amount'},
        {name: 'unit', type: 'string', title: 'Unit', options: {
          list: [
            {title: 'Flat Fee', value: 'flat'},
            {title: 'Per Night', value: 'per_night'},
            {title: 'Per Stay', value: 'per_stay'},
            {title: 'Per Person', value: 'per_person'},
            {title: 'Per Pet', value: 'per_pet'},
            {title: 'Percentage', value: 'percentage'},
          ],
        }},
        {name: 'maxAmount', type: 'number', title: 'Max Amount (for capped fees)'},
      ],
    }),
    defineField({
      name: 'applicability',
      title: 'Applicability',
      type: 'object',
      fields: [
        {name: 'allProperties', type: 'boolean', title: 'Applies to All Properties'},
        {name: 'specificProperties', type: 'array', of: [{type: 'reference', to: [{type: 'property'}]}], title: 'Specific Properties'},
        {name: 'propertyTags', type: 'array', of: [{type: 'string'}], title: 'Property Tags', description: 'Apply to properties with these tags'},
      ],
    }),
    defineField({
      name: 'displayOnCheckout',
      title: 'Display on Checkout',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isRefundable',
      title: 'Refundable',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isTaxable',
      title: 'Taxable',
      type: 'boolean',
      initialValue: true,
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
      subtitle: 'chargeType',
    },
    prepare({title, subtitle}) {
      const typeLabels: Record<string, string> = {
        mandatory: 'Mandatory Fee',
        optional: 'Optional Add-on',
        service: 'Service Fee',
        tax: 'Tax',
        deposit: 'Deposit',
        pet: 'Pet Fee',
        cleaning: 'Cleaning Fee',
        linen: 'Linen Package',
        insurance: 'Travel Insurance',
      }
      return {
        title,
        subtitle: typeLabels[subtitle] || subtitle,
      }
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
