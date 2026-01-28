import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'story', title: 'Our Story'},
    {name: 'values', title: 'Our Values'},
    {name: 'team', title: 'Team Section'},
    {name: 'offices', title: 'Offices'},
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
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'hero',
      options: {hotspot: true},
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

    // Our Story
    defineField({
      name: 'storyHeading',
      title: 'Story Section Heading',
      type: 'string',
      group: 'story',
    }),
    defineField({
      name: 'storyContent',
      title: 'Story Content',
      type: 'blockContent',
      group: 'story',
    }),
    defineField({
      name: 'storyImage',
      title: 'Story Image',
      type: 'image',
      group: 'story',
      options: {hotspot: true},
    }),

    // Values
    defineField({
      name: 'valuesHeading',
      title: 'Values Section Heading',
      type: 'string',
      group: 'values',
    }),
    defineField({
      name: 'values',
      title: 'Our Values',
      type: 'array',
      group: 'values',
      of: [{
        type: 'object',
        fields: [
          {name: 'icon', type: 'string', title: 'Icon Name'},
          {name: 'title', type: 'string', title: 'Title'},
          {name: 'description', type: 'text', title: 'Description', rows: 2},
        ],
      }],
    }),

    // Team
    defineField({
      name: 'teamHeading',
      title: 'Team Section Heading',
      type: 'string',
      group: 'team',
    }),
    defineField({
      name: 'teamSubheading',
      title: 'Team Section Subheading',
      type: 'text',
      group: 'team',
      rows: 2,
    }),
    defineField({
      name: 'showTeamMembers',
      title: 'Show Team Members',
      type: 'boolean',
      group: 'team',
      description: 'Display staff members from the Staff Members collection',
    }),

    // Offices
    defineField({
      name: 'officesHeading',
      title: 'Offices Section Heading',
      type: 'string',
      group: 'offices',
    }),
    defineField({
      name: 'offices',
      title: 'Office Locations',
      type: 'array',
      group: 'offices',
      of: [{
        type: 'object',
        fields: [
          {name: 'name', type: 'string', title: 'Office Name'},
          {name: 'address', type: 'text', title: 'Address', rows: 2},
          {name: 'phone', type: 'string', title: 'Phone'},
          {name: 'hours', type: 'string', title: 'Hours'},
          {name: 'image', type: 'image', title: 'Office Image', options: {hotspot: true}},
        ],
      }],
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
        title: 'About Page',
        subtitle: 'Company information page',
      }
    },
  },
})
