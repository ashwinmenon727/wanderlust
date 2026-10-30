import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { env } from '../config/env.js';

describe('Wanderlust Travel API Test Suite', () => {
  let adminToken = '';
  let createdInquiryRef = '';
  let sampleDestinationId = '';
  let samplePackageId = '';

  beforeAll(async () => {
    // Obtain valid admin token for protected route tests
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({
        email: env.INITIAL_ADMIN_EMAIL,
        password: env.INITIAL_ADMIN_PASSWORD,
      });

    if (loginRes.body.token) {
      adminToken = loginRes.body.token;
    }
  });

  describe('Health Check Endpoint', () => {
    it('GET /api/health should return 200 with healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toContain('Wanderlust');
    });
  });

  describe('Destinations & Packages Discovery', () => {
    it('GET /api/destinations should return array of luxury destinations', async () => {
      const res = await request(app).get('/api/destinations');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      sampleDestinationId = res.body.data[0].id;
    });

    it('GET /api/destinations/santorini-greece should return specific destination', async () => {
      const res = await request(app).get('/api/destinations/santorini-greece');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Santorini');
      expect(res.body.data.country).toBe('Greece');
    });

    it('GET /api/destinations/unknown-slug should return 404', async () => {
      const res = await request(app).get('/api/destinations/unknown-slug-xyz');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/packages should return tour packages', async () => {
      const res = await request(app).get('/api/packages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      samplePackageId = res.body.data[0].id;
    });

    it('GET /api/packages?category=HONEYMOON should filter packages by category', async () => {
      const res = await request(app).get('/api/packages?category=HONEYMOON');
      expect(res.status).toBe(200);
      res.body.data.forEach((pkg: { category: string }) => {
        expect(pkg.category).toBe('HONEYMOON');
      });
    });

    it('GET /api/testimonials should return approved customer reviews', async () => {
      const res = await request(app).get('/api/testimonials');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].rating).toBe(5);
    });
  });

  describe('Booking Inquiry Form Validation & Submission', () => {
    it('POST /api/inquiries should reject incomplete submission with 400', async () => {
      const res = await request(app).post('/api/inquiries').send({
        customerName: 'A', // too short
        email: 'invalid-email',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('POST /api/inquiries should reject if return date is before departure date', async () => {
      const res = await request(app).post('/api/inquiries').send({
        customerName: 'Lady Catherine',
        email: 'catherine@estate.com',
        phone: '+1 555 123 4567',
        departureDate: '2026-08-20',
        returnDate: '2026-08-10', // invalid: earlier than departure
        adults: 2,
        children: 0,
        travelType: 'LUXURY',
        budget: '$25,000+',
        accommodationPref: 'FIVE_STAR_LUXURY',
        preferredContact: 'EMAIL',
        privacyConsent: true,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/inquiries should reject if privacyConsent is false', async () => {
      const res = await request(app).post('/api/inquiries').send({
        customerName: 'Lord Byron',
        email: 'byron@poet.org',
        phone: '+44 20 7123 4567',
        departureDate: '2026-09-01',
        returnDate: '2026-09-10',
        adults: 2,
        children: 0,
        travelType: 'CULTURAL',
        budget: '$10,000 - $15,000',
        accommodationPref: 'BOUTIQUE_HOTEL',
        preferredContact: 'EMAIL',
        privacyConsent: false, // rejected!
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/inquiries should succeed on valid submission and persist reference', async () => {
      const res = await request(app).post('/api/inquiries').send({
        customerName: 'Countess Sophia Laurent',
        email: 'sophia.laurent@villas.mc',
        phone: '+377 98 98 00 00',
        destinationId: sampleDestinationId,
        packageId: samplePackageId,
        departureDate: '2026-09-15',
        returnDate: '2026-09-25',
        adults: 2,
        children: 1,
        travelType: 'LUXURY',
        budget: '$25,000+',
        accommodationPref: 'PRIVATE_VILLA',
        additionalRequirements: 'Private jet transfer from Nice Airport and yacht mooring reserved.',
        preferredContact: 'WHATSAPP',
        privacyConsent: true,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.inquiry).toBeDefined();
      expect(res.body.inquiry.reference).toMatch(/^WND-2026-[A-Z0-9]{5}$/);
      expect(res.body.inquiry.customerName).toBe('Countess Sophia Laurent');
      expect(['NEW_INQUIRY', 'PENDING']).toContain(res.body.inquiry.status);

      createdInquiryRef = res.body.inquiry.reference;
    });

    it('GET /api/inquiries/:reference should fetch existing inquiry by reference', async () => {
      const res = await request(app).get(`/api/inquiries/${createdInquiryRef}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.inquiry.customerName).toBe('Countess Sophia Laurent');
    });
  });

  describe('Admin Authentication & Protected Dashboard Management', () => {
    it('POST /api/admin/login should reject bad password with 401', async () => {
      const res = await request(app).post('/api/admin/login').send({
        email: env.INITIAL_ADMIN_EMAIL,
        password: 'CompletelyWrongPassword123!',
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/stats should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/admin/stats should succeed with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.totalInquiries).toBeGreaterThan(0);
      expect(res.body.stats.totalDestinations).toBeGreaterThan(0);
    });

    it('GET /api/admin/inquiries should return paginated inquiries with notification logs', async () => {
      const res = await request(app)
        .get('/api/admin/inquiries?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('PATCH /api/admin/inquiries/:id should update inquiry status and internal notes', async () => {
      const listRes = await request(app)
        .get('/api/admin/inquiries')
        .set('Authorization', `Bearer ${adminToken}`);

      const firstInquiry = listRes.body.data[0];

      const patchRes = await request(app)
        .patch(`/api/admin/inquiries/${firstInquiry.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'CONTACTED',
          internalNotes: 'VIP concierge reached out via WhatsApp. Requested private wine tasting.',
          followUpDate: '2026-11-01',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.status).toBe('CONTACTED');
      expect(patchRes.body.data.internalNotes).toContain('WhatsApp');
    });

    it('GET /api/admin/inquiries-export should stream CSV export', async () => {
      const res = await request(app)
        .get('/api/admin/inquiries-export')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Reference,CustomerName,Email');
    });
  });
});
