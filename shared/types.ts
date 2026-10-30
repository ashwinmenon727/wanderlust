export type InquiryStatus = 
  | 'NEW_INQUIRY' 
  | 'AWAITING_REVIEW' 
  | 'QUOTATION_SENT' 
  | 'AWAITING_CUSTOMER_APPROVAL' 
  | 'AWAITING_PAYMENT' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED'
  // Legacy support
  | 'PENDING' 
  | 'CONTACTED' 
  | 'IN_REVIEW' 
  | 'QUOTED';

export type TravelType = 
  | 'LUXURY' 
  | 'ADVENTURE' 
  | 'HONEYMOON' 
  | 'FAMILY' 
  | 'CULTURAL' 
  | 'SOLO' 
  | 'WELLNESS'
  | 'WILDLIFE'
  | 'CORPORATE'
  | 'GROUP';

export type AccommodationPref = 
  | 'FIVE_STAR_LUXURY' 
  | 'BOUTIQUE_HOTEL' 
  | 'ECO_LODGE' 
  | 'PRIVATE_VILLA' 
  | 'FOUR_STAR_PREMIUM'
  | 'HERITAGE_PALACE';

export type PreferredContact = 'EMAIL' | 'PHONE' | 'WHATSAPP';

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  continent: string;
  region: string;
  tagline: string;
  description: string;
  heroImage: string;
  gallery: string[];
  attractions: string[];
  recommendedDuration: string;
  bestTimeToVisit: string;
  language: string;
  currency: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  startingPrice: number; // legacy float
  startingPriceCents: number; // integer minor units
  highlights: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  hotels?: Hotel[];
  packages?: TourPackage[];
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  destinationId: string;
  destination?: Destination;
  name: string;
  slug: string;
  address: string;
  description: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  verifiedStarClass?: number | null; // Verified star class only (e.g. 3, 4, 5); null if unverified
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  mealPlans: string[];
  accessibilityInfo?: string | null;
  cancellationConditions?: string | null;
  isPublished: boolean;
  isArchived: boolean;
  photos: string[];
  roomTypes?: RoomType[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  hotelId: string;
  hotel?: Hotel;
  name: string;
  slug: string;
  description: string;
  maxOccupancy: number;
  bedConfiguration: string;
  amenities: string[];
  mealPlanOptions: string[];
  priceCents: number; // integer minor units
  currency: string;
  availabilityStatus: 'AVAILABLE' | 'ON_REQUEST' | 'SOLD_OUT';
  taxesFeesCents: number;
  cancellationConditions?: string | null;
  inventoryCount: number;
  isPublished: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryEntry {
  id?: string;
  packageId?: string;
  dayNumber: number;
  title: string;
  description: string;
  locations?: string[];
  activities: string[];
  mealsIncluded: string;
  accommodation?: string | null;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PackageDestination {
  id: string;
  packageId: string;
  destinationId: string;
  orderIndex: number;
  destination?: Destination;
}

export interface DayItinerary {
  day: number;
  title: string;
  description: string;
  locations?: string[];
  activities: string[];
  mealsIncluded: string;
  accommodation?: string;
}

export interface TourPackageHotel {
  id: string;
  packageId: string;
  hotelId: string;
  stageName?: string | null;
  nights: number;
  orderIndex: number;
  hotel?: Hotel;
}

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  destinationId: string;
  destination?: Destination;
  durationDays: number;
  durationNights: number;
  price: number; // legacy float
  priceCents: number; // integer minor units
  discountPrice?: number | null;
  discountPriceCents?: number | null;
  pricingBasis: string; // e.g., 'per_person', 'per_suite'
  currency: string;
  isSamplePrice: boolean; // explicitly marks sample prices
  category: TravelType;
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING';
  maxGroupSize: number;
  overview: string;
  itinerary: DayItinerary[];
  itineraryEntries?: ItineraryEntry[];
  packageDestinations?: PackageDestination[];
  includes: string[];
  excludes: string[];
  transport?: string | null;
  activities?: string[];
  heroImage: string;
  gallery: string[];
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  cancellationPolicy: string;
  rating: number;
  reviewsCount: number;
  departureDates: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  hotels?: TourPackageHotel[];
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  customerName: string;
  location: string;
  avatarUrl: string;
  rating: number;
  reviewText: string;
  tripTitle: string;
  tripDate: string;
  isFeatured: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface InquiryInput {
  customerName: string;
  email: string;
  phone: string;
  destinationId?: string;
  packageId?: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  travelType: TravelType;
  budget: string;
  accommodationPref: AccommodationPref;
  additionalRequirements?: string;
  preferredContact: PreferredContact;
  privacyConsent: boolean;
}

export interface BookingAccommodationAllocation {
  id: string;
  inquiryId: string;
  hotelId: string;
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomCount: number;
  occupancyPerRoom: number;
  mealPlan: string;
  specialRequests?: string | null;
  status: 'PENDING' | 'CONFIRMED';
  supplierConfirmationRef?: string | null;
  priceCents: number;
  hotel?: Hotel;
  roomType?: RoomType;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingTransportAllocation {
  id: string;
  inquiryId: string;
  transportType: string;
  pickupLocation: string;
  pickupDateTime: string;
  dropoffLocation: string;
  flightNumber?: string | null;
  provider?: string | null;
  meetingInstructions?: string | null;
  status: 'PENDING' | 'CONFIRMED';
  createdAt?: string;
  updatedAt?: string;
}

export interface InquiryRecord extends InquiryInput {
  id: string;
  reference: string;
  status: InquiryStatus;
  totalPriceCents?: number | null;
  currency: string;
  amountPaidCents: number;
  balanceCents?: number | null;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  paymentDueDate?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  customerInstructions?: string | null;
  internalNotes?: string | null;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
  destination?: Destination | null;
  package?: TourPackage | null;
  accommodationAllocations?: BookingAccommodationAllocation[];
  transportAllocations?: BookingTransportAllocation[];
  notificationLogs?: EmailLogRecord[];
}

export interface EmailLogRecord {
  id: string;
  inquiryId: string;
  recipientEmail: string;
  recipientType: 'ADMIN' | 'CUSTOMER';
  templateName: string;
  notificationType: string;
  idempotencyKey?: string | null;
  bookingReference?: string | null;
  htmlContent?: string | null;
  textContent?: string | null;
  status: 'SENT' | 'ACCEPTED' | 'FAILED' | 'PENDING';
  attempts: number;
  lastError?: string | null;
  lastAttemptAt?: string | null;
  deliveredAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminAuthResponse {
  token: string;
  admin: AdminUser;
}

export interface DashboardStats {
  totalInquiries: number;
  pendingInquiries: number;
  confirmedInquiries: number;
  totalDestinations: number;
  totalPackages: number;
  totalHotels: number;
  estimatedRevenueInterestCents: number;
  recentInquiries: InquiryRecord[];
}
