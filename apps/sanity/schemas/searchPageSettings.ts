import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'searchPageSettings',
  title: 'Search & Listings Page Settings',
  type: 'document',
  description: 'Labels and text for the property search and listings pages',
  groups: [
    {name: 'hero', title: 'Hero Section'},
    {name: 'filters', title: 'Filter Labels'},
    {name: 'results', title: 'Results'},
    {name: 'sorting', title: 'Sorting'},
  ],
  fields: [
    // Hero Section
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      group: 'hero',
      initialValue: 'Find Your Perfect Beach Home',
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'string',
      group: 'hero',
      initialValue: 'Search vacation rentals on Hatteras Island',
    }),
    defineField({
      name: 'aiSearchPlaceholder',
      title: 'AI Search Placeholder',
      type: 'string',
      group: 'hero',
      initialValue: 'Describe your perfect vacation...',
    }),

    // Filter Labels
    defineField({
      name: 'filterHeading',
      title: 'Filters Heading',
      type: 'string',
      group: 'filters',
      initialValue: 'Filters',
    }),
    defineField({
      name: 'filterVillage',
      title: 'Village Filter Label',
      type: 'string',
      group: 'filters',
      initialValue: 'Village',
    }),
    defineField({
      name: 'filterBedrooms',
      title: 'Bedrooms Filter Label',
      type: 'string',
      group: 'filters',
      initialValue: 'Bedrooms',
    }),
    defineField({
      name: 'filterBathrooms',
      title: 'Bathrooms Filter Label',
      type: 'string',
      group: 'filters',
      initialValue: 'Bathrooms',
    }),
    defineField({
      name: 'filterPrice',
      title: 'Price Filter Label',
      type: 'string',
      group: 'filters',
      initialValue: 'Price Range',
    }),
    defineField({
      name: 'filterAmenities',
      title: 'Amenities Filter Label',
      type: 'string',
      group: 'filters',
      initialValue: 'Amenities',
    }),
    defineField({
      name: 'filterPetFriendly',
      title: 'Pet Friendly Filter Label',
      type: 'string',
      group: 'filters',
      initialValue: 'Pet Friendly',
    }),
    defineField({
      name: 'filterClearAll',
      title: 'Clear All Filters',
      type: 'string',
      group: 'filters',
      initialValue: 'Clear all',
    }),
    defineField({
      name: 'filterApply',
      title: 'Apply Filters Button',
      type: 'string',
      group: 'filters',
      initialValue: 'Apply Filters',
    }),

    // Results
    defineField({
      name: 'resultsCount',
      title: 'Results Count Text',
      type: 'string',
      group: 'results',
      initialValue: '{count} properties found',
      description: 'Use {count} as placeholder for the number',
    }),
    defineField({
      name: 'resultsNoResults',
      title: 'No Results Text',
      type: 'string',
      group: 'results',
      initialValue: 'No properties found matching your criteria.',
    }),
    defineField({
      name: 'resultsLoading',
      title: 'Loading Text',
      type: 'string',
      group: 'results',
      initialValue: 'Loading properties...',
    }),
    defineField({
      name: 'viewModeGrid',
      title: 'Grid View Label',
      type: 'string',
      group: 'results',
      initialValue: 'Grid',
    }),
    defineField({
      name: 'viewModeMap',
      title: 'Map View Label',
      type: 'string',
      group: 'results',
      initialValue: 'Map',
    }),

    // Sorting
    defineField({
      name: 'sortLabel',
      title: 'Sort Label',
      type: 'string',
      group: 'sorting',
      initialValue: 'Sort by',
    }),
    defineField({
      name: 'sortOptions',
      title: 'Sort Options',
      type: 'array',
      group: 'sorting',
      of: [{
        type: 'object',
        fields: [
          {name: 'value', type: 'string', title: 'Value'},
          {name: 'label', type: 'string', title: 'Display Label'},
        ],
      }],
      initialValue: [
        {value: 'recommended', label: 'Recommended'},
        {value: 'price-low', label: 'Price: Low to High'},
        {value: 'price-high', label: 'Price: High to Low'},
        {value: 'bedrooms', label: 'Bedrooms'},
        {value: 'newest', label: 'Newest'},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Search Page Settings',
        subtitle: 'Labels for search and listings',
      }
    },
  },
})
