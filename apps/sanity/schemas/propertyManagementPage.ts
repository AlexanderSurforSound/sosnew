import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'propertyManagementPage',
  title: 'Property Management Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'benefits', title: 'Benefits'},
    {name: 'services', title: 'Service Tiers'},
    {name: 'contact', title: 'Contact Section'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // Hero Section
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
      group: 'hero',
      description: 'Small text above the heading',
    }),
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
      rows: 3,
    }),
    defineField({
      name: 'heroPrimaryButton',
      title: 'Primary Button',
      type: 'object',
      group: 'hero',
      fields: [
        {name: 'text', type: 'string', title: 'Button Text'},
        {name: 'url', type: 'string', title: 'URL'},
      ],
    }),
    defineField({
      name: 'heroSecondaryButton',
      title: 'Secondary Button',
      type: 'object',
      group: 'hero',
      fields: [
        {name: 'text', type: 'string', title: 'Button Text'},
        {name: 'url', type: 'string', title: 'URL (or phone number)'},
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      group: 'hero',
      of: [{
        type: 'object',
        fields: [
          {name: 'value', type: 'string', title: 'Value'},
          {name: 'label', type: 'string', title: 'Label'},
        ],
      }],
    }),

    // Benefits Section
    defineField({
      name: 'benefitsSectionHeading',
      title: 'Benefits Section Heading',
      type: 'string',
      group: 'benefits',
    }),
    defineField({
      name: 'benefitsSectionSubheading',
      title: 'Benefits Section Subheading',
      type: 'text',
      group: 'benefits',
      rows: 2,
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      group: 'benefits',
      of: [{
        type: 'object',
        fields: [
          {name: 'icon', type: 'string', title: 'Icon Name', description: 'Lucide icon name'},
          {name: 'title', type: 'string', title: 'Title'},
          {name: 'description', type: 'text', title: 'Description', rows: 2},
        ],
      }],
    }),

    // Service Tiers
    defineField({
      name: 'servicesSectionHeading',
      title: 'Services Section Heading',
      type: 'string',
      group: 'services',
    }),
    defineField({
      name: 'serviceTiers',
      title: 'Service Tiers',
      type: 'array',
      group: 'services',
      of: [{
        type: 'object',
        fields: [
          {name: 'name', type: 'string', title: 'Tier Name'},
          {name: 'description', type: 'string', title: 'Short Description'},
          {name: 'popular', type: 'boolean', title: 'Most Popular?'},
          {name: 'features', type: 'array', title: 'Features', of: [{type: 'string'}]},
        ],
      }],
    }),

    // Contact Section
    defineField({
      name: 'contactHeading',
      title: 'Contact Section Heading',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactText',
      title: 'Contact Section Text',
      type: 'text',
      group: 'contact',
      rows: 3,
    }),
    defineField({
      name: 'contactPhone',
      title: 'Phone Number',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email Address',
      type: 'string',
      group: 'contact',
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
        title: 'Property Management Page',
        subtitle: 'Owner services landing page',
      }
    },
  },
})
