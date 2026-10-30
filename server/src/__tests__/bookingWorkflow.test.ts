import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { env } from '../config/env.js';
import { prisma } from '../prisma.js';

describe('Booking Workflow, Hotel Allocations & Email Reliability Integration Tests', () => {
  let adminToken = '';
  let testDestinationId = '';
  let testPackageId = '';
  let testHotelId = '';
  let testRoomTypeId = '';
  let testInquiryId = '';
  let testInquiryRef = '';
  let testAllocationId = '';

  beforeAll(async () => {
    // 1. Authenticate admin
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({
        email: env.INITIAL_ADMIN_EMAIL,
        password: env.INITIAL_ADMIN_PASSWORD,
      });

    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.token;

    // 2. Fetch destination & package
    const destRes = await request(app).get('/api/destinations');
    expect(destRes.body.data.length).toBeGreaterThan(0);
    testDestinationId = destRes.body.data[0].id;

    const pkgRes = await request(app).get('/api/packages');
    expect(pkgRes.body.data.length).toBeGreaterThan(0);
    testPackageId = pkgRes.body.data[0].id;
  });

  describe('1. Hotel & Room Management with Minor-Unit Pricing', () => {
    it('should create a luxury hotel linked to destination with verified star rating', async () => {
      const res = await request(app)
        .post('/api/admin/hotels')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'The Grand St. Regis Test Villa',
          slug: `test-hotel-${Date.now()}`,
          destinationId: testDestinationId,
          address: '1 Royal Palm Avenue',
          description: 'An exclusive oceanfront sanctuary with private butler service.',
          verifiedStarClass: 5,
          amenities: ['Private Beach', 'Michelin Dining', 'Infinity Pool', 'Spa'],
          checkInTime: '15:00',
          checkOutTime: '11:00',
          mealPlans: ['All-Inclusive', 'Full Board', 'Breakfast Included'],
          photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('The Grand St. Regis Test Villa');
      expect(res.body.data.verifiedStarClass).toBe(5);
      testHotelId = res.body.data.id;
    });

    it('should create a room type with integer minor units (priceCents) and inventory', async () => {
      const res = await request(app)
        .post(`/api/admin/hotels/${testHotelId}/rooms`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Presidential Lagoon Suite',
          slug: `presidential-lagoon-${Date.now()}`,
          description: 'Sprawling overwater villa with heated private plunge pool.',
          maxOccupancy: 3,
          bedConfiguration: '1 King Bed + 1 Daybed',
          amenities: ['Private Deck', 'Butler Service', 'Jacuzzi'],
          mealPlanOptions: ['All-Inclusive'],
          priceCents: 185000, // $1,850.00 in integer cents
          currency: 'USD',
          taxesFeesCents: 25000, // $250.00
          inventoryCount: 4,
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.priceCents).toBe(185000);
      expect(Number.isInteger(res.body.data.priceCents)).toBe(true);
      expect(res.body.data.maxOccupancy).toBe(3);
      testRoomTypeId = res.body.data.id;
    });
  });

  describe('2. Inquiry Submission & Receipt Acknowledgment Email', () => {
    it('should submit inquiry, set NEW_INQUIRY status, and log acknowledgment email outbox', async () => {
      const res = await request(app)
        .post('/api/inquiries')
        .send({
          customerName: 'Archduke Leopold Von Habsburg',
          email: 'leopold@habsburg-dynasty.at',
          phone: '+43 1 534 100',
          destinationId: testDestinationId,
          packageId: testPackageId,
          departureDate: '2026-11-15',
          returnDate: '2026-11-25',
          adults: 2,
          children: 0,
          travelType: 'LUXURY',
          budget: '$25,000+',
          accommodationPref: 'FIVE_STAR_LUXURY',
          additionalRequirements: 'Private airport escort and champagne greeting.',
          preferredContact: 'EMAIL',
          privacyConsent: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.inquiry.reference).toBeDefined();
      expect(res.body.inquiry.status).toBe('NEW_INQUIRY');

      testInquiryId = res.body.inquiry.id;
      testInquiryRef = res.body.inquiry.reference;

      // Verify email outbox log entry was created
      const outboxEntry = await prisma.emailNotificationLog.findFirst({
        where: {
          recipientEmail: 'leopold@habsburg-dynasty.at',
          templateName: 'customer_inquiry_received',
        },
      });

      expect(outboxEntry).toBeDefined();
      expect(outboxEntry?.idempotencyKey).toBeDefined();
      // Verify content states clearly this is an acknowledgment and NOT a confirmed booking
      expect(outboxEntry?.htmlContent).toContain('Inquiry Acknowledgment');
      expect(outboxEntry?.htmlContent).toContain('not a confirmed booking');
      expect(outboxEntry?.htmlContent).toContain('No accommodation');
      expect(outboxEntry?.textContent).toContain('INQUIRY ACKNOWLEDGMENT');
    });
  });

  describe('3. Accommodation Allocation & Occupancy Validation', () => {
    it('should reject allocation if room capacity is insufficient for guests per room', async () => {
      const res = await request(app)
        .post(`/api/admin/inquiries/${testInquiryId}/assign-accommodation`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hotelId: testHotelId,
          roomTypeId: testRoomTypeId,
          checkInDate: '2026-11-15',
          checkOutDate: '2026-11-20',
          nights: 5,
          roomCount: 1,
          occupancyPerRoom: 6, // Exceeds maxOccupancy=3!
          mealPlan: 'All-Inclusive',
          status: 'PENDING',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds maximum allowable');
    });

    it('should assign valid accommodation segment with PENDING status', async () => {
      const res = await request(app)
        .post(`/api/admin/inquiries/${testInquiryId}/assign-accommodation`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          hotelId: testHotelId,
          roomTypeId: testRoomTypeId,
          checkInDate: '2026-11-15',
          checkOutDate: '2026-11-20',
          nights: 5,
          roomCount: 1,
          occupancyPerRoom: 2,
          mealPlan: 'All-Inclusive',
          specialRequests: 'High floor, early check-in if possible',
          status: 'PENDING',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomCount).toBe(1);
      expect(res.body.data.status).toBe('PENDING');
      testAllocationId = res.body.data.id;
    });
  });

  describe('4. Booking Confirmation Atomic Workflow & Guards', () => {
    it('should block confirmation when required accommodation remains PENDING', async () => {
      const res = await request(app)
        .post(`/api/admin/inquiries/${testInquiryId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          totalPriceCents: 1450000,
          currency: 'USD',
          amountPaidCents: 500000,
          customerInstructions: 'Please present your voucher at the private VIP reception.',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('remains pending');
    });

    it('should confirm booking atomically when accommodation is confirmed and inventory decremented', async () => {
      // 1. Mark accommodation allocation as CONFIRMED with a verified supplier reference
      await prisma.bookingAccommodationAllocation.update({
        where: { id: testAllocationId },
        data: {
          status: 'CONFIRMED',
          supplierConfirmationRef: 'CONF-STR-2026-991',
        },
      });

      // 2. Trigger confirmation
      const res = await request(app)
        .post(`/api/admin/inquiries/${testInquiryId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          totalPriceCents: 1450000, // $14,500.00
          currency: 'USD',
          amountPaidCents: 500000, // $5,000.00 deposit
          paymentDueDate: '2026-11-01',
          customerInstructions: 'Please present your voucher at the private VIP reception.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CONFIRMED');
      expect(res.body.data.confirmedAt).toBeDefined();
      expect(res.body.data.balanceCents).toBe(950000); // 1,450,000 - 500,000

      // 3. Verify confirmation email logged in outbox
      const confirmLog = await prisma.emailNotificationLog.findFirst({
        where: {
          recipientEmail: 'leopold@habsburg-dynasty.at',
          templateName: 'booking_confirmed',
        },
      });

      expect(confirmLog).toBeDefined();
      expect(confirmLog?.htmlContent).toContain('Booking Confirmed');
      expect(confirmLog?.htmlContent).toContain('The Grand St. Regis Test Villa');
      expect(confirmLog?.htmlContent).toContain('CONF-STR-2026-991');
      expect(confirmLog?.htmlContent).toContain('9,500.00'); // balance
    });

    it('should block duplicate confirmation requests on an already confirmed booking', async () => {
      const res = await request(app)
        .post(`/api/admin/inquiries/${testInquiryId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          totalPriceCents: 1450000,
        });

      expect([400, 409]).toContain(res.status);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been confirmed');
    });
  });

  describe('5. Email Reliability, Idempotency & Manual Retry Engine', () => {
    it('should enforce idempotency keys on email logs and support manual retry', async () => {
      // Find confirmation log
      const log = await prisma.emailNotificationLog.findFirst({
        where: {
          recipientEmail: 'leopold@habsburg-dynasty.at',
          templateName: 'booking_confirmed',
        },
      });

      expect(log).toBeDefined();
      expect(log?.idempotencyKey).toBeDefined();

      // Retry the notification
      const retryRes = await request(app)
        .post(`/api/admin/notifications/${log!.id}/retry`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(retryRes.status).toBe(200);
      expect(retryRes.body.success).toBe(true);
      expect(retryRes.body.data.attempts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('6. Catalog Safe Duplication & Soft-Delete Archival Integrity', () => {
    let duplicatedPkgId = '';

    it('should duplicate a tour package safely with unique slug', async () => {
      const res = await request(app)
        .post(`/api/admin/packages/${testPackageId}/duplicate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('(Copy)');
      expect(res.body.data.slug).not.toBe(testPackageId);
      duplicatedPkgId = res.body.data.id;
    });

    it('should soft-delete/archive a package when referenced by inquiries without data loss', async () => {
      // testPackageId is linked to testInquiryId
      const deleteRes = await request(app)
        .delete(`/api/admin/packages/${testPackageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.archived).toBe(true);

      // Verify the package still exists in database with isArchived = true
      const archivedPkg = await prisma.tourPackage.findUnique({
        where: { id: testPackageId },
      });
      expect(archivedPkg).toBeDefined();
      expect(archivedPkg?.isArchived).toBe(true);

      // Verify existing inquiry and booking remains completely intact
      const existingInquiry = await prisma.inquiry.findUnique({
        where: { id: testInquiryId },
        include: { package: true, accommodationAllocations: true },
      });
      expect(existingInquiry).toBeDefined();
      expect(existingInquiry?.packageId).toBe(testPackageId);
      expect(existingInquiry?.accommodationAllocations.length).toBeGreaterThan(0);
    });

    it('clean up duplicated test package', async () => {
      if (duplicatedPkgId) {
        await prisma.tourPackage.delete({ where: { id: duplicatedPkgId } });
      }
    });
  });
});
