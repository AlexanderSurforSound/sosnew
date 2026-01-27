import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'staffMember',
  title: 'Staff Member',
  type: 'document',
  description: 'Team directory',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
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
      name: 'jobTitle',
      title: 'Job Title',
      type: 'string',
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'Executive', value: 'executive'},
          {title: 'Reservations', value: 'reservations'},
          {title: 'Guest Services', value: 'guest_services'},
          {title: 'Property Management', value: 'property_management'},
          {title: 'Marketing', value: 'marketing'},
          {title: 'Maintenance', value: 'maintenance'},
          {title: 'Housekeeping', value: 'housekeeping'},
          {title: 'Owner Relations', value: 'owner_relations'},
          {title: 'Accounting', value: 'accounting'},
        ],
      },
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'blockContent',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        {name: 'facebook', type: 'string', title: 'Facebook Username'},
        {name: 'instagram', type: 'string', title: 'Instagram Username'},
        {name: 'twitter', type: 'string', title: 'Twitter/X Username'},
        {name: 'linkedin', type: 'string', title: 'LinkedIn Username'},
      ],
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
      subtitle: 'jobTitle',
      media: 'photo',
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Name',
      name: 'nameAsc',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
})
