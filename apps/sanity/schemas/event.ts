import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
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
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          {title: 'Festival', value: 'festival'},
          {title: 'Concert', value: 'concert'},
          {title: 'Market', value: 'market'},
          {title: 'Sports', value: 'sports'},
          {title: 'Family', value: 'family'},
          {title: 'Art & Culture', value: 'art_culture'},
          {title: 'Food & Drink', value: 'food_drink'},
          {title: 'Nature', value: 'nature'},
          {title: 'Holiday', value: 'holiday'},
          {title: 'Community', value: 'community'},
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'isAllDay',
      title: 'All Day Event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isRecurring',
      title: 'Recurring Event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'recurringPattern',
      title: 'Recurring Pattern',
      type: 'string',
      hidden: ({document}) => !document?.isRecurring,
      options: {
        list: [
          {title: 'Daily', value: 'daily'},
          {title: 'Weekly', value: 'weekly'},
          {title: 'Monthly', value: 'monthly'},
          {title: 'Annually', value: 'annually'},
        ],
      },
    }),
    defineField({
      name: 'village',
      title: 'Village',
      type: 'reference',
      to: [{type: 'village'}],
    }),
    defineField({
      name: 'venue',
      title: 'Venue Name',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'location',
      title: 'Map Location',
      type: 'geopoint',
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Ticket URL',
      type: 'url',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'e.g., Free, $25, $10-$50',
    }),
    defineField({
      name: 'organizer',
      title: 'Organizer',
      type: 'string',
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'object',
      fields: [
        {name: 'phone', type: 'string', title: 'Phone'},
        {name: 'email', type: 'string', title: 'Email'},
        {name: 'website', type: 'url', title: 'Website'},
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured Event',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', title: 'SEO Title'},
        {name: 'description', type: 'text', title: 'SEO Description', rows: 2},
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'startDate',
      media: 'image',
    },
    prepare({title, date, media}) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Date (Upcoming)',
      name: 'dateAsc',
      by: [{field: 'startDate', direction: 'asc'}],
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [{field: 'featured', direction: 'desc'}, {field: 'startDate', direction: 'asc'}],
    },
  ],
})
