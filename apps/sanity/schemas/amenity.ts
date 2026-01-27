import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'amenity',
  title: 'Amenity',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Pool & Hot Tub', value: 'pool'},
          {title: 'Beach & Water', value: 'beach'},
          {title: 'Entertainment', value: 'entertainment'},
          {title: 'Kitchen', value: 'kitchen'},
          {title: 'Outdoor', value: 'outdoor'},
          {title: 'Accessibility', value: 'accessibility'},
          {title: 'Pet', value: 'pet'},
          {title: 'Parking', value: 'parking'},
          {title: 'Climate', value: 'climate'},
          {title: 'Safety', value: 'safety'},
          {title: 'Other', value: 'other'},
        ],
      },
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name (Lucide)',
      type: 'string',
      description: 'e.g., "waves", "thermometer", "wifi", "tv"',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'isFilterable',
      title: 'Show in Search Filters',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this amenity appears as a filter option on the search page',
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Order within category (lower = first)',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
    },
  },
  orderings: [
    {
      title: 'Category, then Name',
      name: 'categoryName',
      by: [
        {field: 'category', direction: 'asc'},
        {field: 'name', direction: 'asc'},
      ],
    },
  ],
})
