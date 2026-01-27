/**
 * GraphQL Schema for Surf or Sound
 *
 * Combines data from:
 * - Track PMS (properties, availability, rates)
 * - SQL Server (members, bookings, reviews)
 * - Sanity CMS (content, area guides)
 */

export const typeDefs = /* GraphQL */ `
  # ==========================================
  # PROPERTY TYPES (from Track PMS)
  # ==========================================

  type Property {
    id: ID!
    trackId: String!
    houseNumber: String
    slug: String!
    name: String!
    headline: String
    description: String

    # Specs
    bedrooms: Int!
    bathrooms: Float!
    sleeps: Int!

    # Location
    village: Village!
    latitude: Float
    longitude: Float
    streetAddress: String
    beachAccess: BeachAccess

    # Features
    petFriendly: Boolean!
    featured: Boolean!
    isNew: Boolean!
    amenities: [Amenity!]!

    # Media
    images: [PropertyImage!]!
    virtualTourUrl: String

    # Pricing (from Track rates API)
    baseRate: Float
    rates(checkIn: String, checkOut: String): PropertyRates

    # Availability (from Track)
    availability(startDate: String!, endDate: String!): [AvailabilityDay!]!

    # Reviews (from SQL Server)
    reviews(limit: Int): [Review!]!
    averageRating: Float
    reviewCount: Int

    # Related
    similarProperties(limit: Int): [Property!]!
  }

  type Village {
    name: String!
    slug: String!
    description: String
    image: String
    propertyCount: Int
  }

  type Amenity {
    id: ID!
    name: String!
    icon: String
    category: String
  }

  type PropertyImage {
    url: String!
    alt: String
    width: Int
    height: Int
  }

  enum BeachAccess {
    OCEANFRONT
    SEMI_OCEANFRONT
    SOUNDFRONT
    BETWEEN_HIGHWAYS
  }

  # ==========================================
  # RATES & AVAILABILITY (from Track PMS)
  # ==========================================

  type PropertyRates {
    baseRate: Float!
    weeklyRate: Float
    totalRate: Float
    taxes: Float
    fees: [Fee!]!
    specialRate: SpecialRate
    minimumStay: Int
  }

  type Fee {
    name: String!
    amount: Float!
    type: FeeType!
  }

  enum FeeType {
    FLAT
    PERCENTAGE
    PER_NIGHT
    PER_PERSON
  }

  type SpecialRate {
    name: String!
    discount: Float!
    discountType: String!
    originalRate: Float!
    specialRate: Float!
    validFrom: String!
    validTo: String!
  }

  type AvailabilityDay {
    date: String!
    available: Boolean!
    rate: Float
    minimumStay: Int
    checkInAllowed: Boolean!
    checkOutAllowed: Boolean!
  }

  # ==========================================
  # MEMBER/GUEST TYPES (from SQL Server)
  # ==========================================

  type Guest {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    phone: String
    loyaltyPoints: Int!
    memberSince: String!
    reservations: [Reservation!]!
    favorites: [Property!]!
  }

  type Reservation {
    id: ID!
    confirmationNumber: String!
    property: Property!
    checkIn: String!
    checkOut: String!
    guests: Int!
    totalAmount: Float!
    status: ReservationStatus!
    payments: [Payment!]!
    createdAt: String!
  }

  enum ReservationStatus {
    PENDING
    CONFIRMED
    CHECKED_IN
    CHECKED_OUT
    CANCELLED
  }

  type Payment {
    id: ID!
    amount: Float!
    method: String!
    status: String!
    processedAt: String
  }

  type Review {
    id: ID!
    guest: Guest
    rating: Float!
    title: String
    content: String!
    response: String
    createdAt: String!
    helpful: Int
  }

  # ==========================================
  # SEARCH & FILTERS
  # ==========================================

  input PropertySearchInput {
    query: String
    village: String
    checkIn: String
    checkOut: String
    guests: Int
    bedrooms: Int
    bedroomsMin: Int
    bedroomsMax: Int
    priceMin: Float
    priceMax: Float
    petFriendly: Boolean
    amenities: [String!]
    beachAccess: [BeachAccess!]
    sortBy: PropertySortBy
    sortOrder: SortOrder
  }

  enum PropertySortBy {
    PRICE
    BEDROOMS
    RATING
    NAME
    FEATURED
  }

  enum SortOrder {
    ASC
    DESC
  }

  type PropertySearchResult {
    properties: [Property!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    hasNextPage: Boolean!
    facets: SearchFacets
  }

  type SearchFacets {
    villages: [FacetCount!]!
    bedrooms: [FacetCount!]!
    amenities: [FacetCount!]!
    priceRanges: [PriceRangeFacet!]!
  }

  type FacetCount {
    value: String!
    count: Int!
  }

  type PriceRangeFacet {
    min: Float!
    max: Float!
    count: Int!
  }

  # ==========================================
  # QUERIES
  # ==========================================

  type Query {
    # Properties
    property(id: ID, slug: String, trackId: String): Property
    properties(
      page: Int
      pageSize: Int
      village: String
      featured: Boolean
      petFriendly: Boolean
    ): PropertySearchResult!
    searchProperties(input: PropertySearchInput!, page: Int, pageSize: Int): PropertySearchResult!
    featuredProperties(limit: Int): [Property!]!
    newProperties(limit: Int): [Property!]!
    similarProperties(propertyId: ID!, limit: Int): [Property!]!

    # Villages
    villages: [Village!]!
    village(slug: String!): Village

    # Availability & Rates
    propertyAvailability(propertyId: ID!, startDate: String!, endDate: String!): [AvailabilityDay!]!
    propertyRates(propertyId: ID!, checkIn: String!, checkOut: String!, guests: Int): PropertyRates

    # Guest/Member
    me: Guest
    guest(id: ID!): Guest

    # Reservations
    reservation(id: ID, confirmationNumber: String): Reservation
    myReservations: [Reservation!]!

    # Reviews
    propertyReviews(propertyId: ID!, limit: Int, offset: Int): [Review!]!
  }

  # ==========================================
  # MUTATIONS
  # ==========================================

  type Mutation {
    # Guest
    updateProfile(input: UpdateProfileInput!): Guest!
    addFavorite(propertyId: ID!): Guest!
    removeFavorite(propertyId: ID!): Guest!

    # Reservations
    createReservation(input: CreateReservationInput!): Reservation!
    cancelReservation(id: ID!): Reservation!

    # Reviews
    submitReview(input: SubmitReviewInput!): Review!
    markReviewHelpful(reviewId: ID!): Review!

    # Contact
    submitInquiry(input: InquiryInput!): Boolean!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
    email: String
  }

  input CreateReservationInput {
    propertyId: ID!
    checkIn: String!
    checkOut: String!
    guests: Int!
    addons: [String!]
    specialRequests: String
  }

  input SubmitReviewInput {
    propertyId: ID!
    reservationId: ID!
    rating: Float!
    title: String
    content: String!
  }

  input InquiryInput {
    propertyId: ID
    name: String!
    email: String!
    phone: String
    message: String!
    preferredContact: String
  }
`;
