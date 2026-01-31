/**
 * Reviews Store
 *
 * In-memory store for reviews (replace with database in production)
 */

export interface Review {
  id: string;
  propertyId: string;
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  content: string;
  ownerResponse?: string;
  ownerResponseDate?: string;
  stayDate: string;
  tripType?: string;
  isVerified: boolean;
  helpfulCount: number;
  helpfulVoters: string[]; // Session IDs that voted helpful
  createdAt: string;
  guest: {
    firstName: string;
    lastInitial?: string;
    location?: string;
  };
}

export interface CreateReviewRequest {
  propertyId: string;
  reservationId?: string;
  overallRating: number;
  cleanlinessRating?: number;
  accuracyRating?: number;
  communicationRating?: number;
  locationRating?: number;
  valueRating?: number;
  title?: string;
  content: string;
  stayDate: string;
  tripType?: string;
  guestName?: string;
  guestLocation?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  averageCleanliness?: number;
  averageAccuracy?: number;
  averageCommunication?: number;
  averageLocation?: number;
  averageValue?: number;
  ratingDistribution: Record<number, number>;
}

// Sample reviews for demo
const sampleReviews: Review[] = [
  {
    id: 'review_1',
    propertyId: 'salvocean-138-138',
    overallRating: 5,
    cleanlinessRating: 5,
    accuracyRating: 5,
    communicationRating: 5,
    locationRating: 5,
    valueRating: 5,
    title: 'Perfect Beach Getaway!',
    content: 'We had an absolutely wonderful stay at this property. The oceanfront views were breathtaking, and the house was immaculate. Everything we needed was provided. The location in Salvo is perfect - quiet but still close to restaurants in Avon. We will definitely be back!',
    stayDate: '2024-07-15',
    tripType: 'Family',
    isVerified: true,
    helpfulCount: 12,
    helpfulVoters: [],
    createdAt: '2024-07-22T10:00:00Z',
    guest: {
      firstName: 'Jennifer',
      lastInitial: 'M',
      location: 'Raleigh, NC',
    },
  },
  {
    id: 'review_2',
    propertyId: 'salvocean-138-138',
    overallRating: 5,
    cleanlinessRating: 5,
    accuracyRating: 4,
    communicationRating: 5,
    locationRating: 5,
    valueRating: 4,
    title: 'Great house, amazing views',
    content: 'This was our third year staying at this property and it never disappoints. The private beach access is wonderful, and the kids love the game room. The only minor issue was the WiFi was a bit slow, but honestly we were there to unplug anyway!',
    ownerResponse: 'Thank you so much for returning year after year! We\'ve upgraded the WiFi since your stay and hope to see you again soon!',
    ownerResponseDate: '2024-06-20T14:00:00Z',
    stayDate: '2024-06-10',
    tripType: 'Family',
    isVerified: true,
    helpfulCount: 8,
    helpfulVoters: [],
    createdAt: '2024-06-18T09:00:00Z',
    guest: {
      firstName: 'Michael',
      lastInitial: 'T',
      location: 'Charlotte, NC',
    },
  },
  {
    id: 'review_3',
    propertyId: 'moonglade-1-1',
    overallRating: 4,
    cleanlinessRating: 5,
    accuracyRating: 4,
    communicationRating: 5,
    locationRating: 4,
    valueRating: 4,
    title: 'Cozy and comfortable',
    content: 'Nice property for a couples getaway. Very clean and well-maintained. The hot tub was a nice touch. Would have liked to be a bit closer to the beach, but the short walk was worth it. Staff was very responsive when we had questions.',
    stayDate: '2024-05-20',
    tripType: 'Couples',
    isVerified: true,
    helpfulCount: 5,
    helpfulVoters: [],
    createdAt: '2024-05-28T11:00:00Z',
    guest: {
      firstName: 'Sarah',
      lastInitial: 'K',
      location: 'Richmond, VA',
    },
  },
];

class ReviewStore {
  private reviews: Map<string, Review> = new Map();

  constructor() {
    // Initialize with sample reviews
    sampleReviews.forEach(review => {
      this.reviews.set(review.id, review);
    });
  }

  getReviewsForProperty(propertyId: string, page = 1, pageSize = 10): {
    reviews: Review[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    const propertyReviews = Array.from(this.reviews.values())
      .filter(r => r.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = propertyReviews.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const reviews = propertyReviews.slice(start, start + pageSize);

    return { reviews, total, page, pageSize, totalPages };
  }

  getStatsForProperty(propertyId: string): ReviewStats {
    const propertyReviews = Array.from(this.reviews.values())
      .filter(r => r.propertyId === propertyId);

    if (propertyReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    propertyReviews.forEach(r => {
      ratingDistribution[r.overallRating] = (ratingDistribution[r.overallRating] || 0) + 1;
    });

    return {
      averageRating: Math.round(avg(propertyReviews.map(r => r.overallRating)) * 10) / 10,
      totalReviews: propertyReviews.length,
      averageCleanliness: Math.round(avg(propertyReviews.filter(r => r.cleanlinessRating).map(r => r.cleanlinessRating!)) * 10) / 10 || undefined,
      averageAccuracy: Math.round(avg(propertyReviews.filter(r => r.accuracyRating).map(r => r.accuracyRating!)) * 10) / 10 || undefined,
      averageCommunication: Math.round(avg(propertyReviews.filter(r => r.communicationRating).map(r => r.communicationRating!)) * 10) / 10 || undefined,
      averageLocation: Math.round(avg(propertyReviews.filter(r => r.locationRating).map(r => r.locationRating!)) * 10) / 10 || undefined,
      averageValue: Math.round(avg(propertyReviews.filter(r => r.valueRating).map(r => r.valueRating!)) * 10) / 10 || undefined,
      ratingDistribution,
    };
  }

  createReview(request: CreateReviewRequest): Review {
    const id = `review_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Extract guest info from name
    const nameParts = (request.guestName || 'Guest').split(' ');
    const firstName = nameParts[0];
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : undefined;

    const review: Review = {
      id,
      propertyId: request.propertyId,
      overallRating: request.overallRating,
      cleanlinessRating: request.cleanlinessRating,
      accuracyRating: request.accuracyRating,
      communicationRating: request.communicationRating,
      locationRating: request.locationRating,
      valueRating: request.valueRating,
      title: request.title,
      content: request.content,
      stayDate: request.stayDate,
      tripType: request.tripType,
      isVerified: !!request.reservationId, // Verified if linked to a reservation
      helpfulCount: 0,
      helpfulVoters: [],
      createdAt: new Date().toISOString(),
      guest: {
        firstName,
        lastInitial,
        location: request.guestLocation,
      },
    };

    this.reviews.set(id, review);
    return review;
  }

  markHelpful(reviewId: string, sessionId: string): boolean {
    const review = this.reviews.get(reviewId);
    if (!review) return false;

    // Check if already voted
    if (review.helpfulVoters.includes(sessionId)) {
      return false;
    }

    review.helpfulVoters.push(sessionId);
    review.helpfulCount++;
    return true;
  }

  getReview(reviewId: string): Review | undefined {
    return this.reviews.get(reviewId);
  }
}

export const reviewStore = new ReviewStore();
