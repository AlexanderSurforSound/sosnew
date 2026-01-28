import property from './property'
import village from './village'
import amenity from './amenity'
import page from './page'
import blogPost from './blogPost'
import blockContent from './blockContent'
import localGuide from './localGuide'
import event from './event'
import promotion from './promotion'
import faq from './faq'
import experience from './experience'
import testimonial from './testimonial'
import alert from './alert'
import staffMember from './staffMember'
import partner from './partner'
import siteSettings from './siteSettings'
import charge from './charge'
import newsletter from './newsletter'

// Page-specific content
import homePage from './homePage'
import propertyManagementPage from './propertyManagementPage'
import aboutPage from './aboutPage'
import contactPage from './contactPage'
import legalPage from './legalPage'

// UI Settings
import propertyPageSettings from './propertyPageSettings'
import searchPageSettings from './searchPageSettings'
import uiStrings from './uiStrings'

export const schemaTypes = [
  // Core content
  property,
  village,
  amenity,
  page,
  blogPost,
  blockContent,

  // Local content
  localGuide,
  event,
  experience,

  // Marketing
  promotion,
  testimonial,
  alert,
  newsletter,

  // Site configuration
  siteSettings,
  faq,
  staffMember,
  partner,
  charge,

  // Page content (singleton documents)
  homePage,
  propertyManagementPage,
  aboutPage,
  contactPage,
  legalPage,

  // UI Settings (singleton documents)
  propertyPageSettings,
  searchPageSettings,
  uiStrings,
]
