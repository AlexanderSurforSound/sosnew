import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'contact', title: 'Contact Info'},
    {name: 'faq', title: 'FAQ Section'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroText',
      title: 'Hero Text',
      type: 'text',
      group: 'hero',
      rows: 2,
    }),

    // Contact Methods
    defineField({
      name: 'emergencyPhone',
      title: 'Emergency Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'emergencyNote',
      title: 'Emergency Note',
      type: 'string',
      group: 'contact',
      description: 'e.g., "24/7 for property emergencies"',
    }),
    defineField({
      name: 'mainPhone',
      title: 'Main Phone',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'supportEmail',
      title: 'Support Email',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactMethods',
      title: 'Contact Methods',
      type: 'array',
      group: 'contact',
      of: [{
        type: 'object',
        fields: [
          {name: 'icon', type: 'string', title: 'Icon Name'},
          {name: 'title', type: 'string', title: 'Title'},
          {name: 'description', type: 'string', title: 'Description'},
          {name: 'action', type: 'string', title: 'Action Text'},
          {name: 'url', type: 'string', title: 'Action URL'},
        ],
      }],
    }),
    defineField({
      name: 'offices',
      title: 'Office Locations',
      type: 'array',
      group: 'contact',
      of: [{
        type: 'object',
        fields: [
          {name: 'name', type: 'string', title: 'Office Name'},
          {name: 'address', type: 'text', title: 'Address', rows: 2},
          {name: 'phone', type: 'string', title: 'Phone'},
        ],
      }],
    }),

    // FAQ
    defineField({
      name: 'faqHeading',
      title: 'FAQ Section Heading',
      type: 'string',
      group: 'faq',
    }),
    defineField({
      name: 'showFaqs',
      title: 'Show FAQs',
      type: 'boolean',
      group: 'faq',
      description: 'Display FAQs from the FAQ collection',
    }),
    defineField({
      name: 'faqCategories',
      title: 'FAQ Categories to Show',
      type: 'array',
      group: 'faq',
      of: [{type: 'string'}],
      description: 'Leave empty to show all',
    }),

    // SEO
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        {name: 'title', type: 'string', title: 'SEO Title'},
        {name: 'description', type: 'text', title: 'Meta Description', rows: 2},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Contact Page',
        subtitle: 'Contact information page',
      }
    },
  },
})
