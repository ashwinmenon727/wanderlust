import type {
  Destination,
  TourPackage,
  Hotel,
  RoomType,
  Testimonial,
  InquiryInput,
  InquiryRecord,
  BookingAccommodationAllocation,
  BookingTransportAllocation,
  DashboardStats,
  AdminAuthResponse,
  EmailLogRecord,
} from '@shared/types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as unknown as { errors?: Array<{ field: string; message: string }> }).errors = data.errors;
    throw err;
  }
  return data;
}

export const api = {
  // Public Discoveries
  async getDestinations(params?: { continent?: string; region?: string; featured?: boolean; search?: string; sort?: string; includeArchived?: boolean }) {
    const query = new URLSearchParams();
    if (params?.continent) query.append('continent', params.continent);
    if (params?.region) query.append('region', params.region);
    if (params?.featured) query.append('featured', 'true');
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.includeArchived) query.append('includeArchived', 'true');
    const res = await fetch(`${API_BASE}/destinations?${query.toString()}`);
    return handleResponse<{ success: boolean; data: Destination[] }>(res);
  },

  async getDestinationBySlug(slug: string) {
    const res = await fetch(`${API_BASE}/destinations/${slug}`);
    return handleResponse<{ success: boolean; data: Destination & { packages: TourPackage[]; hotels: Hotel[] } }>(res);
  },

  async getPackages(params?: { category?: string; destinationId?: string; featured?: boolean; search?: string; sort?: string; maxPriceCents?: number; includeArchived?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.destinationId) query.append('destinationId', params.destinationId);
    if (params?.featured) query.append('featured', 'true');
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.maxPriceCents) query.append('maxPriceCents', String(params.maxPriceCents));
    if (params?.includeArchived) query.append('includeArchived', 'true');
    const res = await fetch(`${API_BASE}/packages?${query.toString()}`);
    return handleResponse<{ success: boolean; data: TourPackage[] }>(res);
  },

  async getPackageBySlug(slug: string) {
    const res = await fetch(`${API_BASE}/packages/${slug}`);
    return handleResponse<{ success: boolean; data: TourPackage & { destination: Destination; hotels?: any[] } }>(res);
  },

  // Hotels & Rooms
  async getHotels(params?: { destinationId?: string; search?: string; starRating?: number }) {
    const query = new URLSearchParams();
    if (params?.destinationId) query.append('destinationId', params.destinationId);
    if (params?.search) query.append('search', params.search);
    if (params?.starRating) query.append('starRating', String(params.starRating));
    const res = await fetch(`${API_BASE}/hotels?${query.toString()}`);
    return handleResponse<{ success: boolean; data: Hotel[] }>(res);
  },

  async getHotelBySlugOrId(idOrSlug: string) {
    const res = await fetch(`${API_BASE}/hotels/${idOrSlug}`);
    return handleResponse<{ success: boolean; data: Hotel }>(res);
  },

  async getTestimonials(featured?: boolean) {
    const res = await fetch(`${API_BASE}/testimonials${featured ? '?featured=true' : ''}`);
    return handleResponse<{ success: boolean; data: Testimonial[] }>(res);
  },

  // Booking Inquiries (Public)
  async submitInquiry(payload: InquiryInput) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{
      success: boolean;
      message: string;
      inquiry: {
        id: string;
        reference: string;
        customerName: string;
        destination?: { name: string; country: string } | null;
        package?: { title: string; priceCents?: number; price?: number } | null;
        departureDate: string;
        returnDate: string;
        adults: number;
        children: number;
        status: string;
        createdAt: string;
      };
    }>(res);
  },

  async getInquiryByReference(reference: string) {
    const res = await fetch(`${API_BASE}/inquiries/${reference}`);
    return handleResponse<{ success: boolean; inquiry: InquiryRecord }>(res);
  },

  // Admin Auth
  async adminLogin(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AdminAuthResponse>(res);
  },

  async getAdminMe(token: string) {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; admin: { id: string; email: string; name: string; role: string } }>(res);
  },

  // Admin Operations & Dashboard Stats
  async getAdminStats(token: string) {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; stats: DashboardStats }>(res);
  },

  async getAdminInquiries(token: string, params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const res = await fetch(`${API_BASE}/admin/inquiries?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{
      success: boolean;
      data: InquiryRecord[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(res);
  },

  async updateAdminInquiry(token: string, id: string, data: { status?: string; internalNotes?: string | null; followUpDate?: string | null }) {
    const res = await fetch(`${API_BASE}/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; data: InquiryRecord }>(res);
  },

  // Booking Workflow: Allocations & Atomic Confirmation
  async assignAccommodation(token: string, inquiryId: string, allocation: {
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
  }) {
    const res = await fetch(`${API_BASE}/admin/inquiries/${inquiryId}/assign-accommodation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(allocation),
    });
    return handleResponse<{ success: boolean; data: BookingAccommodationAllocation }>(res);
  },

  async assignTransport(token: string, inquiryId: string, transport: {
    transportType: string;
    pickupLocation: string;
    pickupDateTime: string;
    dropoffLocation: string;
    flightNumber?: string | null;
    provider?: string | null;
    meetingInstructions?: string | null;
    status: 'PENDING' | 'CONFIRMED';
  }) {
    const res = await fetch(`${API_BASE}/admin/inquiries/${inquiryId}/assign-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transport),
    });
    return handleResponse<{ success: boolean; data: BookingTransportAllocation }>(res);
  },

  async confirmBooking(token: string, inquiryId: string, payload: {
    totalPriceCents: number;
    currency: string;
    amountPaidCents: number;
    paymentStatus: string;
    paymentDueDate?: string | null;
    customerInstructions?: string | null;
    requireSupplierApproval?: boolean;
  }) {
    const res = await fetch(`${API_BASE}/admin/inquiries/${inquiryId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: InquiryRecord }>(res);
  },

  async updateInquiryStatus(token: string, inquiryId: string, payload: {
    status: string;
    cancellationReason?: string;
    internalNotes?: string;
    followUpDate?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/inquiries/${inquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: InquiryRecord }>(res);
  },

  async sendBookingReminder(token: string, inquiryId: string, type: 'PAYMENT_DUE' | 'PRE_TRIP') {
    const res = await fetch(`${API_BASE}/admin/inquiries/${inquiryId}/send-reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Hotel & Room Admin Management
  async createHotel(token: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: Hotel }>(res);
  },

  async updateHotel(token: string, id: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/hotels/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: Hotel }>(res);
  },

  async archiveHotel(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/hotels/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async createRoomType(token: string, hotelId: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/hotels/${hotelId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: RoomType }>(res);
  },

  async updateRoomType(token: string, roomId: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/rooms/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; data: RoomType }>(res);
  },

  async archiveRoomType(token: string, roomId: string) {
    const res = await fetch(`${API_BASE}/admin/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Package Admin Management & Itinerary Builder
  async getAdminPackages(token: string, params?: { status?: string; category?: string; search?: string; sort?: string }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set('status', params.status);
    if (params?.category) sp.set('category', params.category);
    if (params?.search) sp.set('search', params.search);
    if (params?.sort) sp.set('sort', params.sort);
    const query = sp.toString() ? `?${sp.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/packages${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; count: number; data: TourPackage[] }>(res);
  },

  async getAdminPackageById(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/packages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; data: TourPackage }>(res);
  },

  async createTourPackage(token: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: TourPackage }>(res);
  },

  async updateTourPackage(token: string, id: string, payload: any) {
    const res = await fetch(`${API_BASE}/admin/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: TourPackage }>(res);
  },

  async togglePublishPackage(token: string, id: string, isPublished: boolean) {
    const res = await fetch(`${API_BASE}/admin/packages/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isPublished }),
    });
    return handleResponse<{ success: boolean; message: string; data: TourPackage }>(res);
  },

  async toggleFeaturePackage(token: string, id: string, isFeatured: boolean) {
    const res = await fetch(`${API_BASE}/admin/packages/${id}/feature`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isFeatured }),
    });
    return handleResponse<{ success: boolean; message: string; data: TourPackage }>(res);
  },

  // Package Duplication & Archiving
  async duplicateTourPackage(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/packages/${id}/duplicate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string; data: TourPackage }>(res);
  },

  async archiveTourPackage(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/packages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string; archived?: boolean; data?: TourPackage }>(res);
  },

  async archiveDestination(token: string, id: string) {
    const res = await fetch(`${API_BASE}/admin/destinations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Exports & Notifications
  async exportInquiriesCsv(token: string, status?: string) {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/admin/inquiries-export${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to download CSV export');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wanderlust-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  async retryNotification(token: string, logId: string) {
    const res = await fetch(`${API_BASE}/admin/notifications/${logId}/retry`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; message: string; data: EmailLogRecord }>(res);
  },

  async getEmailLogs(token: string) {
    const res = await fetch(`${API_BASE}/admin/notifications/logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<{ success: boolean; data: EmailLogRecord[] }>(res);
  },
};
