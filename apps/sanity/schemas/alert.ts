import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'alert',
  title: 'Site Alert',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Alert Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alertType',
      title: 'Alert Type',
      type: 'string',
      options: {
        list: [
          {title: 'Info', value: 'info'},
          {title: 'Warning', value: 'warning'},
          {title: 'Error', value: 'error'},
          {title: 'Success', value: 'success'},
          {title: 'Promotion', value: 'promotion'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkText',
      title: 'Link Text',
      type: 'string',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'string',
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'showOnPages',
      title: 'Show on Pages',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'All Pages', value: 'all'},
          {title: 'Homepage', value: 'home'},
          {title: 'Properties', value: 'properties'},
          {title: 'Booking', value: 'booking'},
          {title: 'Account', value: 'account'},
        ],
      },
    }),
    defineField({
      name: 'isDismissible',
      title: 'Can be Dismissed',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      description: 'Higher number = higher priority',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'alertType',
    },
    prepare({title, subtitle}) {
      const icons: Record<string, string> = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🚨',
        success: '✅',
        promotion: '🎉',
      }
      return {
        title: `${icons[subtitle] || ''} ${title}`,
        subtitle: subtitle,
      }
    },
  },
  orderings: [
    {
      title: 'Priority',
      name: 'priorityDesc',
      by: [{field: 'priority', direction: 'desc'}],
    },
  ],
})
