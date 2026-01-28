import {defineType, defineField, defineArrayMember} from 'sanity'

export default defineType({
  name: 'leaseAgreement',
  title: 'Lease Agreement',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal name for this lease version',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
      description: 'When this lease version becomes effective',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'reservationType',
      title: 'Reservation Type',
      type: 'string',
      options: {
        list: [
          {title: 'Standard Reservation', value: 'standard'},
          {title: 'Advance Reservation', value: 'advance'},
          {title: 'All Types', value: 'all'},
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'headerText',
      title: 'Header Text',
      type: 'text',
      description: 'Text displayed at the top of the agreement',
    }),
    defineField({
      name: 'sections',
      title: 'Lease Sections',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'leaseSection',
          title: 'Lease Section',
          fields: [
            defineField({
              name: 'name',
              title: 'Section Name',
              type: 'string',
              description: 'Internal identifier (e.g., "occupancy", "cancellation")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              description: 'Display title (e.g., "OCCUPANCY LIMITS")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Section Content',
              type: 'blockContent',
              description: 'The terms for this section',
            }),
            defineField({
              name: 'requiresInitials',
              title: 'Requires Initials',
              type: 'boolean',
              description: 'Whether guest must initial this section',
              initialValue: true,
            }),
            defineField({
              name: 'isTextFragment',
              title: 'Is Text Fragment',
              type: 'boolean',
              description: 'If true, this is just text content without requiring acknowledgment',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              requiresInitials: 'requiresInitials',
            },
            prepare({title, requiresInitials}) {
              return {
                title,
                subtitle: requiresInitials ? 'Requires initials' : 'No initials required',
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'addendums',
      title: 'Addendums',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'addendum',
          title: 'Addendum',
          fields: [
            defineField({
              name: 'id',
              title: 'Addendum ID',
              type: 'string',
              description: 'Unique identifier (e.g., "pet-policy", "pool-rules")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Addendum Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Addendum Content',
              type: 'blockContent',
            }),
            defineField({
              name: 'required',
              title: 'Required',
              type: 'boolean',
              description: 'Is this addendum required for all bookings?',
              initialValue: false,
            }),
            defineField({
              name: 'appliesTo',
              title: 'Applies To',
              type: 'array',
              of: [{type: 'string'}],
              options: {
                list: [
                  {title: 'Pet Bookings', value: 'pets'},
                  {title: 'Pool Properties', value: 'pool'},
                  {title: 'Hot Tub Properties', value: 'hotTub'},
                  {title: 'Oceanfront Properties', value: 'oceanfront'},
                  {title: 'All Bookings', value: 'all'},
                ],
              },
            }),
          ],
          preview: {
            select: {
              title: 'title',
              required: 'required',
            },
            prepare({title, required}) {
              return {
                title,
                subtitle: required ? 'Required' : 'Optional',
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'consumerDisclosure',
      title: 'Consumer Disclosure',
      type: 'blockContent',
      description: 'Consumer disclosure text (required for advance reservations)',
    }),
    defineField({
      name: 'signatureText',
      title: 'Signature Section Text',
      type: 'text',
      description: 'Text displayed above the signature line',
      initialValue: 'By signing below, Tenant acknowledges having read this Agreement and agrees to all terms and conditions contained herein.',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Only one lease should be active at a time',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      effectiveDate: 'effectiveDate',
      isActive: 'isActive',
    },
    prepare({title, effectiveDate, isActive}) {
      return {
        title: `${title}${isActive ? ' (ACTIVE)' : ''}`,
        subtitle: effectiveDate ? `Effective: ${effectiveDate}` : 'No effective date set',
      }
    },
  },
  orderings: [
    {
      title: 'Effective Date, New',
      name: 'effectiveDateDesc',
      by: [{field: 'effectiveDate', direction: 'desc'}],
    },
  ],
})
