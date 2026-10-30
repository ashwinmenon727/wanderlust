import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { env } from '../config/env.js';
import { prisma } from '../prisma.js';

describe('Admin Package & Itinerary Management Integration Tests', () => {
  let adminToken = '';
  let testDestinationId = '';
  let createdPackageId = '';
  let createdPackageSlug = '';
  let duplicatedPackageId = '';
  let testInquiryId = '';

  beforeAll(async () => {
    // 1. Authenticate as Admin
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({
        email: env.INITIAL_ADMIN_EMAIL,
        password: env.INITIAL_ADMIN_PASSWORD,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    adminToken = loginRes.body.token;

    // 2. Fetch destination to link
    const destRes = await request(app).get('/api/destinations');
    expect(destRes.status).toBe(200);
    expect(destRes.body.data.length).toBeGreaterThan(0);
    testDestinationId = destRes.body.data[0].id;
  });

  describe('1. Role-Based Authorization & Security Controls', () => {
    it('should reject package creation when no token is supplied (401)', async () => {
      const res = await request(app)
        .post('/api/admin/packages')
        .send({
          title: 'Unauthorized Luxury Expedition',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject package updates when no token is supplied (401)', async () => {
      const res = await request(app)
        .put('/api/admin/packages/some-fake-id')
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject package duplication when no token is supplied (401)', async () => {
      const res = await request(app)
        .post('/api/admin/packages/some-fake-id/duplicate');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject package deletion/archival when no token is supplied (401)', async () => {
      const res = await request(app)
        .delete('/api/admin/packages/some-fake-id');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Package Creation with Atomic Multi-Day Itinerary', () => {
    it('should reject package with invalid itinerary day numbering (> durationDays)', async () => {
      const res = await request(app)
        .post('/api/admin/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Invalid Days Package',
          destinationId: testDestinationId,
          durationDays: 3,
          durationNights: 2,
          priceCents: 150000,
          currency: 'USD',
          pricingBasis: 'per_person',
          category: 'LUXURY',
          overview: 'Test overview.',
          heroImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
          includes: ['Private butler service'],
          itinerary: [
            { dayNumber: 1, title: 'Day 1', description: 'Desc 1', activities: [], mealsIncluded: 'Dinner' },
            { dayNumber: 5, title: 'Day 5 Out of Range', description: 'Desc 5', activities: [], mealsIncluded: 'Dinner' }, // 5 > 3
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Day number');
    });

    it('should reject package with duplicate day numbers', async () => {
      const res = await request(app)
        .post('/api/admin/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Duplicate Days Package',
          destinationId: testDestinationId,
          durationDays: 3,
          durationNights: 2,
          priceCents: 150000,
          currency: 'USD',
          pricingBasis: 'per_person',
          category: 'LUXURY',
          overview: 'Test overview.',
          heroImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
          includes: ['Private butler service'],
          itinerary: [
            { dayNumber: 1, title: 'First Day 1', description: 'Desc 1', activities: [], mealsIncluded: 'Dinner' },
            { dayNumber: 1, title: 'Second Day 1', description: 'Desc 1 duplicate', activities: [], mealsIncluded: 'Dinner' },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('duplicate');
    });

    it('should create a luxury package with 3 itinerary days in a single atomic transaction', async () => {
      const uniqueSuffix = Date.now();
      const payload = {
        title: `Royal Aegean Odyssey ${uniqueSuffix}`,
        slug: `royal-aegean-odyssey-${uniqueSuffix}`,
        destinationId: testDestinationId,
        category: 'LUXURY',
        durationDays: 3,
        durationNights: 2,
        priceCents: 385000, // $3,850 in minor units
        currency: 'USD',
        pricingBasis: 'per_person',
        isSamplePrice: true,
        difficulty: 'EASY',
        maxGroupSize: 8,
        overview: 'An unforgettable private voyage across secluded caldera coves and clifftop vineyards.',
        heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        ],
        includes: [
          'Dedicated 24/7 private concierge',
          'Chauffeured Mercedes Maybach transfers',
          'Private catamaran sunset cruise',
          'All gourmet breakfasts & sommelier dinners',
        ],
        excludes: [
          'International transatlantic flights',
          'Discretionary gratuities',
        ],
        transport: 'Private Helicopter & Riva Yacht',
        activities: ['Catamaran Sailing', 'Wine Tasting', 'Helicopter Flight'],
        cancellationPolicy: 'Complimentary cancellation up to 30 days prior to departure.',
        isFeatured: false,
        isPublished: false, // Initially unpublished draft
        seoTitle: 'Royal Aegean Odyssey | Wanderlust Luxury Travel',
        seoDescription: 'Experience the pinnacle of Mediterranean luxury with our private 3-day Aegean expedition.',
        itinerary: [
          {
            dayNumber: 1,
            title: 'Helicopter Arrival & Clifftop Welcome',
            description: 'Touch down at the private helipad and settle into your cliffside villa suite before sunset champagne.',
            locations: ['Athens Heliport', 'Oia Clifftop'],
            activities: ['Helicopter transfer', 'Sunset Champagne Reception'],
            mealsIncluded: 'Welcome Tasting Dinner',
            accommodation: 'Canaves Oia Epitome Luxury Suite',
          },
          {
            dayNumber: 2,
            title: 'Private Riva Catamaran & Hidden Volcanic Coves',
            description: 'Sail the sapphire waters of the caldera, swimming in secluded thermal springs and dining on fresh seafood.',
            locations: ['Ammoudi Bay', 'Palea Kameni', 'Red Beach'],
            activities: ['Catamaran Sailing', 'Snorkeling in Hot Springs', 'Private Chef Lunch'],
            mealsIncluded: 'Breakfast, Seafood Catamaran Lunch',
            accommodation: 'Canaves Oia Epitome Luxury Suite',
          },
          {
            dayNumber: 3,
            title: 'Ancient Vineyards & Farewell Gala Dinner',
            description: 'Private tour of 200-year-old volcanic vineyards followed by a 7-course Michelin-starred farewell gala.',
            locations: ['Megalochori Vineyards', 'Imerovigli Clifftop'],
            activities: ['Sommelier Cellar Tour', 'Gala Dinner'],
            mealsIncluded: 'Breakfast, 7-Course Gala Dinner with Wine Pairings',
            accommodation: 'Canaves Oia Epitome Luxury Suite',
          },
        ],
      };

      const res = await request(app)
        .post('/api/admin/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.priceCents).toBe(385000);
      expect(res.body.data.isSamplePrice).toBe(true);
      expect(res.body.data.isPublished).toBe(false);

      createdPackageId = res.body.data.id;
      createdPackageSlug = res.body.data.slug;

      // Verify DB relational entries
      const dbEntries = await prisma.itineraryEntry.findMany({
        where: { packageId: createdPackageId },
        orderBy: { dayNumber: 'asc' },
      });

      expect(dbEntries.length).toBe(3);
      expect(dbEntries[0].dayNumber).toBe(1);
      expect(dbEntries[0].title).toBe('Helicopter Arrival & Clifftop Welcome');
      expect(dbEntries[1].dayNumber).toBe(2);
      expect(dbEntries[2].dayNumber).toBe(3);
    });
  });

  describe('3. Public Access Guards for Unpublished Packages', () => {
    it('public GET /api/packages should NOT expose the unpublished draft package', async () => {
      const res = await request(app).get('/api/packages');
      expect(res.status).toBe(200);
      const found = res.body.data.find((p: any) => p.id === createdPackageId);
      expect(found).toBeUndefined();
    });

    it('public GET /api/packages/:slug should return 404 for unpublished package', async () => {
      const res = await request(app).get(`/api/packages/${createdPackageSlug}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('admin GET /api/admin/packages/:id should return the unpublished package with all itinerary entries', async () => {
      const res = await request(app)
        .get(`/api/admin/packages/${createdPackageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdPackageId);
      expect(res.body.data.itineraryEntries.length).toBe(3);
    });
  });

  describe('4. Publication and Featured Status Toggling', () => {
    it('should toggle publication status to published (PATCH /api/admin/packages/:id/publish)', async () => {
      const res = await request(app)
        .patch(`/api/admin/packages/${createdPackageId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);

      // Verify publicly accessible now
      const publicRes = await request(app).get(`/api/packages/${createdPackageSlug}`);
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.id).toBe(createdPackageId);
      expect(publicRes.body.data.itineraryEntries.length).toBe(3);
      expect(publicRes.body.data.priceCents).toBe(385000);
    });

    it('should toggle featured flag (PATCH /api/admin/packages/:id/feature)', async () => {
      const res = await request(app)
        .patch(`/api/admin/packages/${createdPackageId}/feature`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isFeatured: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isFeatured).toBe(true);
    });
  });

  describe('5. Itinerary Editing & Reordering in Atomic Transaction', () => {
    it('should update package and reorder itinerary days atomically', async () => {
      // Swap Day 1 and Day 2 order
      const updatePayload = {
        title: 'Royal Aegean Odyssey (Deluxe Edition)',
        priceCents: 420000, // Price updated to $4,200
        currency: 'USD',
        pricingBasis: 'per_person',
        isSamplePrice: false,
        durationDays: 3,
        durationNights: 2,
        itinerary: [
          {
            dayNumber: 1,
            title: 'Private Riva Catamaran & Caldera Swim (Now Day 1)',
            description: 'Begin directly with our private Riva yacht cruise around the caldera.',
            locations: ['Ammoudi Bay', 'Palea Kameni'],
            activities: ['Yacht Cruise', 'Volcanic Swim'],
            mealsIncluded: 'Welcome Seafood Lunch & Dinner',
            accommodation: 'Canaves Oia Epitome Luxury Suite',
          },
          {
            dayNumber: 2,
            title: 'Helicopter Aerial Tour & Clifftop Spa (Now Day 2)',
            description: 'Midday panoramic helicopter flight over the Aegean followed by clifftop massage.',
            locations: ['Santorini Clifftops'],
            activities: ['Scenic Flight', 'Spa Treatment'],
            mealsIncluded: 'Champagne Breakfast & Sunset Dinner',
            accommodation: 'Canaves Oia Epitome Luxury Suite',
          },
          {
            dayNumber: 3,
            title: 'Ancient Vineyards & Farewell Gala Dinner',
            description: 'Closing day with 200-year-old vineyard harvest tasting and Michelin gala.',
            locations: ['Megalochori Vineyards'],
            activities: ['Wine Tasting', 'Gala Dinner'],
            mealsIncluded: 'Breakfast & 7-Course Gala',
            accommodation: 'Canaves Oia Epitome Luxury Suite',
          },
        ],
      };

      const res = await request(app)
        .put(`/api/admin/packages/${createdPackageId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.priceCents).toBe(420000);
      expect(res.body.data.isSamplePrice).toBe(false);

      // Verify public page reflects the reordered itinerary immediately
      const publicRes = await request(app).get(`/api/packages/${createdPackageSlug}`);
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.title).toBe('Royal Aegean Odyssey (Deluxe Edition)');
      expect(publicRes.body.data.priceCents).toBe(420000);
      expect(publicRes.body.data.itineraryEntries[0].dayNumber).toBe(1);
      expect(publicRes.body.data.itineraryEntries[0].title).toContain('Now Day 1');
      expect(publicRes.body.data.itineraryEntries[1].dayNumber).toBe(2);
      expect(publicRes.body.data.itineraryEntries[1].title).toContain('Now Day 2');
    });
  });

  describe('6. Safe Duplication with Deep-Copied Itineraries', () => {
    it('should duplicate package creating an unpublished copy with unique ID and slug', async () => {
      const res = await request(app)
        .post(`/api/admin/packages/${createdPackageId}/duplicate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const copy = res.body.data;
      expect(copy.id).not.toBe(createdPackageId);
      expect(copy.slug).not.toBe(createdPackageSlug);
      expect(copy.slug).toContain('copy');
      expect(copy.title).toContain('(Copy)');
      expect(copy.isPublished).toBe(false); // Must be unpublished copy

      duplicatedPackageId = copy.id;

      // Verify copied itinerary entries in DB
      const copyEntries = await prisma.itineraryEntry.findMany({
        where: { packageId: duplicatedPackageId },
        orderBy: { dayNumber: 'asc' },
      });

      expect(copyEntries.length).toBe(3);
      expect(copyEntries[0].dayNumber).toBe(1);
      expect(copyEntries[1].dayNumber).toBe(2);
      expect(copyEntries[2].dayNumber).toBe(3);
      expect(copyEntries[0].title).toBe('Private Riva Catamaran & Caldera Swim (Now Day 1)');

      // Verify the duplicated package is NOT visible publicly
      const publicCopyRes = await request(app).get(`/api/packages/${copy.slug}`);
      expect(publicCopyRes.status).toBe(404);
    });
  });

  describe('7. Archiving & Existing Booking Preservation', () => {
    it('should soft-delete/archive a package referenced by an inquiry instead of hard deletion', async () => {
      // 1. Create a customer booking/inquiry referencing the created package
      const inqRes = await request(app)
        .post('/api/inquiries')
        .send({
          customerName: 'Lady Genevieve Astor',
          email: 'genevieve.astor@luxury-test.com',
          phone: '+1-555-0199',
          destinationId: testDestinationId,
          packageId: createdPackageId,
          departureDate: '2027-05-10',
          returnDate: '2027-05-13',
          adults: 2,
          children: 0,
          travelType: 'LUXURY',
          budget: '$10,000+',
          accommodationPref: 'FIVE_STAR_LUXURY',
          additionalRequirements: 'VIP private dock pickup required.',
          preferredContact: 'EMAIL',
          privacyConsent: true,
        });

      expect(inqRes.status).toBe(201);
      testInquiryId = inqRes.body.inquiry?.id || inqRes.body.data?.id;

      // 2. Call admin DELETE/archive on the package
      const delRes = await request(app)
        .delete(`/api/admin/packages/${createdPackageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
      expect(delRes.body.archived).toBe(true); // Soft-deleted

      // 3. Confirm package is archived in DB
      const pkgInDb = await prisma.tourPackage.findUnique({
        where: { id: createdPackageId },
      });
      expect(pkgInDb).not.toBeNull();
      expect(pkgInDb?.isArchived).toBe(true);
      expect(pkgInDb?.isPublished).toBe(false);

      // 4. Confirm the booking/inquiry still resolves and references the package intact
      const checkInqRes = await request(app)
        .get(`/api/admin/inquiries?search=genevieve.astor`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(checkInqRes.status).toBe(200);
      const matched = checkInqRes.body.data.find((i: any) => i.id === testInquiryId);
      expect(matched).toBeDefined();
      expect(matched.packageId).toBe(createdPackageId);
      expect(matched.package.title).toContain('Royal Aegean Odyssey');

      // 5. Confirm public endpoint now returns 404 for this archived package
      const publicArchivedRes = await request(app).get(`/api/packages/${createdPackageSlug}`);
      expect(publicArchivedRes.status).toBe(404);
    });
  });
});
