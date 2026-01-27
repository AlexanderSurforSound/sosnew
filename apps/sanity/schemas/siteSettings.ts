import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  description: 'Global site configuration',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'Surf or Sound Realty',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
    }),
    defineField({
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {name: 'phoneNumber', type: 'string', title: 'Phone Number'},
        {name: 'reservationsEmail', type: 'string', title: 'Reservations Email'},
        {name: 'generalEmail', type: 'string', title: 'General Email'},
        {name: 'address', type: 'text', title: 'Address', rows: 3},
        {name: 'openingHours', type: 'text', title: 'Opening Hours', rows: 3},
      ],
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'platform', type: 'string', title: 'Platform', options: {
              list: [
                {title: 'Facebook', value: 'facebook'},
                {title: 'Instagram', value: 'instagram'},
                {title: 'Twitter/X', value: 'twitter'},
                {title: 'YouTube', value: 'youtube'},
                {title: 'Pinterest', value: 'pinterest'},
                {title: 'TikTok', value: 'tiktok'},
                {title: 'LinkedIn', value: 'linkedin'},
              ],
            }},
            {name: 'url', type: 'url', title: 'URL'},
            {name: 'username', type: 'string', title: 'Username/Handle'},
          ],
        },
      ],
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'object',
      fields: [
        {name: 'title', type: 'string', title: 'Default Title'},
        {name: 'titleSuffix', type: 'string', title: 'Title Suffix', description: 'Appended to page titles (e.g., "| Surf or Sound")'},
        {name: 'description', type: 'text', title: 'Default Meta Description', rows: 2},
        {name: 'ogImage', type: 'image', title: 'Default OG Image'},
      ],
    }),
    defineField({
      name: 'bookingDefaults',
      title: 'Booking Defaults',
      type: 'object',
      fields: [
        {name: 'daysInAdvance', type: 'number', title: 'Days in Advance', description: 'Default check-in date offset for new visitors'},
        {name: 'defaultStayLength', type: 'number', title: 'Default Stay Length (days)'},
        {name: 'minStayNights', type: 'number', title: 'Minimum Stay (nights)'},
      ],
    }),
    defineField({
      name: 'footerLinks',
      title: 'Quick Links (Footer)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label'},
            {name: 'url', type: 'string', title: 'URL'},
          ],
        },
      ],
    }),
    defineField({
      name: 'bottomLinks',
      title: 'Bottom Links (Footer)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', type: 'string', title: 'Label'},
            {name: 'url', type: 'string', title: 'URL'},
          ],
        },
      ],
    }),
    defineField({
      name: 'analytics',
      title: 'Analytics & Tracking',
      type: 'object',
      fields: [
        {name: 'googleAnalyticsId', type: 'string', title: 'Google Analytics ID'},
        {name: 'googleTagManagerId', type: 'string', title: 'Google Tag Manager ID'},
        {name: 'facebookPixelId', type: 'string', title: 'Facebook Pixel ID'},
        {name: 'headerScripts', type: 'text', title: 'Header Scripts', rows: 5, description: 'Custom scripts to add to <head>'},
        {name: 'bodyScripts', type: 'text', title: 'Body Scripts', rows: 5, description: 'Custom scripts to add before </body>'},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Global configuration',
      }
    },
  },
})
