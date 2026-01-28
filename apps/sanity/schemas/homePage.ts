import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'stats', title: 'Stats Bar'},
    {name: 'features', title: 'Why Choose Us'},
    {name: 'villages', title: 'Villages Section'},
    {name: 'cta', title: 'Call to Action'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // Hero Section
    defineField({
      name: 'heroTexts',
      title: 'Rotating Hero Headlines',
      type: 'array',
      group: 'hero',
      of: [{
        type: 'object',
        fields: [
          {name: 'main', type: 'string', title: 'Main Text'},
          {name: 'accent', type: 'string', title: 'Accent Text (italic)'},
        ],
      }],
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
      group: 'hero',
      description: 'Smaller text below subtitle',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Hero Background Video',
      type: 'file',
      group: 'hero',
      options: {accept: 'video/*'},
    }),
    defineField({
      name: 'heroPoster',
      title: 'Hero Poster Image (fallback)',
      type: 'image',
      group: 'hero',
      options: {hotspot: true},
    }),
    defineField({
      name: 'searchHelperText',
      title: 'Search Helper Text',
      type: 'string',
      group: 'hero',
      description: 'Text below the search bar (e.g., "3-night minimum stay")',
    }),

    // Stats Bar
    defineField({
      name: 'stats',
      title: 'Stats Bar',
      type: 'array',
      group: 'stats',
      of: [{
        type: 'object',
        fields: [
          {name: 'value', type: 'string', title: 'Value'},
          {name: 'label', type: 'string', title: 'Label'},
        ],
      }],
    }),

    // Why Choose Us / Features
    defineField({
      name: 'featuresHeading',
      title: 'Features Section Heading',
      type: 'string',
      group: 'features',
    }),
    defineField({
      name: 'featuresSubheading',
      title: 'Features Section Subheading',
      type: 'string',
      group: 'features',
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      group: 'features',
      of: [{
        type: 'object',
        fields: [
          {name: 'icon', type: 'string', title: 'Icon Name', description: 'Lucide icon name (e.g., "Star", "Phone", "Users")'},
          {name: 'title', type: 'string', title: 'Title'},
          {name: 'description', type: 'text', title: 'Description', rows: 2},
        ],
      }],
    }),

    // Villages Section
    defineField({
      name: 'villagesSectionHeading',
      title: 'Villages Section Heading',
      type: 'string',
      group: 'villages',
    }),
    defineField({
      name: 'villagesSectionSubheading',
      title: 'Villages Section Subheading',
      type: 'text',
      group: 'villages',
      rows: 2,
    }),

    // CTA Section
    defineField({
      name: 'ctaHeading',
      title: 'CTA Heading',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'text',
      group: 'cta',
      rows: 2,
    }),
    defineField({
      name: 'ctaPrimaryButton',
      title: 'Primary Button',
      type: 'object',
      group: 'cta',
      fields: [
        {name: 'text', type: 'string', title: 'Button Text'},
        {name: 'url', type: 'string', title: 'URL'},
      ],
    }),
    defineField({
      name: 'ctaSecondaryButton',
      title: 'Secondary Button',
      type: 'object',
      group: 'cta',
      fields: [
        {name: 'text', type: 'string', title: 'Button Text'},
        {name: 'url', type: 'string', title: 'URL'},
      ],
    }),
    defineField({
      name: 'ctaFooterText',
      title: 'CTA Footer Text',
      type: 'string',
      group: 'cta',
      description: 'Small text below buttons (e.g., phone number)',
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
        {name: 'ogImage', type: 'image', title: 'Social Share Image'},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Home Page',
        subtitle: 'Main landing page content',
      }
    },
  },
})
