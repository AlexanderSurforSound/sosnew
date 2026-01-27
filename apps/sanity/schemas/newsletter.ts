import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'document',
  description: 'Email newsletter content',
  fields: [
    defineField({
      name: 'title',
      title: 'Newsletter Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
    }),
    defineField({
      name: 'subject',
      title: 'Email Subject',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'preheader',
      title: 'Preheader Text',
      type: 'string',
      description: 'Preview text shown in email clients',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
    defineField({
      name: 'featuredProperties',
      title: 'Featured Properties',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'property'}]}],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'promotions',
      title: 'Promotions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'promotion'}]}],
    }),
    defineField({
      name: 'callToAction',
      title: 'Call to Action',
      type: 'object',
      fields: [
        {name: 'text', type: 'string', title: 'Button Text'},
        {name: 'url', type: 'string', title: 'Button URL'},
      ],
    }),
    defineField({
      name: 'audience',
      title: 'Target Audience',
      type: 'string',
      options: {
        list: [
          {title: 'All Subscribers', value: 'all'},
          {title: 'Past Guests', value: 'past_guests'},
          {title: 'Loyalty Members', value: 'loyalty'},
          {title: 'Property Owners', value: 'owners'},
          {title: 'Newsletter Only', value: 'newsletter_only'},
        ],
      },
    }),
    defineField({
      name: 'scheduledDate',
      title: 'Scheduled Send Date',
      type: 'datetime',
    }),
    defineField({
      name: 'sentDate',
      title: 'Sent Date',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Scheduled', value: 'scheduled'},
          {title: 'Sent', value: 'sent'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      initialValue: 'draft',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'status',
      media: 'heroImage',
    },
    prepare({title, subtitle, media}) {
      const statusIcons: Record<string, string> = {
        draft: 'Draft',
        scheduled: 'Scheduled',
        sent: 'Sent',
        archived: 'Archived',
      }
      return {
        title,
        subtitle: statusIcons[subtitle] || subtitle,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Scheduled Date',
      name: 'scheduledDesc',
      by: [{field: 'scheduledDate', direction: 'desc'}],
    },
    {
      title: 'Recently Sent',
      name: 'sentDesc',
      by: [{field: 'sentDate', direction: 'desc'}],
    },
  ],
})
