import { Router } from 'express';
import * as destinationController from '../controllers/destinationController.js';
import * as packageController from '../controllers/packageController.js';
import * as hotelController from '../controllers/hotelController.js';
import * as testimonialController from '../controllers/testimonialController.js';
import * as inquiryController from '../controllers/inquiryController.js';
import * as adminController from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { inquiryLimiter, authLimiter } from '../middleware/rateLimiter.js';

export const apiRouter = Router();

// -------------------------------------------------------------
// PUBLIC DISCOVERY ROUTES
// -------------------------------------------------------------
apiRouter.get('/destinations', destinationController.getDestinations);
apiRouter.get('/destinations/:slug', destinationController.getDestinationBySlug);

apiRouter.get('/packages', packageController.getTourPackages);
apiRouter.get('/packages/:slug', packageController.getTourPackageBySlug);

apiRouter.get('/hotels', hotelController.getHotels);
apiRouter.get('/hotels/:idOrSlug', hotelController.getHotelBySlugOrId);

apiRouter.get('/testimonials', testimonialController.getTestimonials);

// Public Inquiry Routes
apiRouter.post('/inquiries', inquiryLimiter, inquiryController.createInquiry);
apiRouter.get('/inquiries/:reference', inquiryController.getInquiryByReference);

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------
apiRouter.post('/admin/login', authLimiter, adminController.login);

// -------------------------------------------------------------
// PROTECTED ADMIN DASHBOARD & BOOKING WORKFLOW ROUTES
// -------------------------------------------------------------
apiRouter.get('/admin/me', requireAuth, adminController.getMe);
apiRouter.get('/admin/stats', requireAuth, adminController.getDashboardStats);
apiRouter.get('/admin/inquiries', requireAuth, adminController.getInquiries);
apiRouter.patch('/admin/inquiries/:id', requireAuth, adminController.updateInquiry);
apiRouter.patch('/admin/inquiries/:id/status', requireAuth, inquiryController.updateInquiryStatus);
apiRouter.get('/admin/inquiries-export', requireAuth, adminController.exportInquiriesCsv);

// Booking Allocations & Atomic Confirmation
apiRouter.post('/admin/inquiries/:id/assign-accommodation', requireAuth, inquiryController.assignAccommodation);
apiRouter.post('/admin/inquiries/:id/assign-transport', requireAuth, inquiryController.assignTransport);
apiRouter.post('/admin/inquiries/:id/confirm', requireAuth, inquiryController.confirmBooking);
apiRouter.post('/admin/inquiries/:id/send-reminder', requireAuth, inquiryController.sendBookingReminder);

// Email Reliability & Notification Outbox Logs
apiRouter.post('/admin/notifications/:logId/retry', requireAuth, adminController.retryNotification);
apiRouter.get('/admin/notifications/logs', requireAuth, adminController.getEmailLogs);

// Admin Destination Management
apiRouter.post('/admin/destinations', requireAuth, destinationController.createDestination);
apiRouter.patch('/admin/destinations/:id', requireAuth, destinationController.updateDestination);
apiRouter.delete('/admin/destinations/:id', requireAuth, destinationController.deleteDestination);

// Admin Package Management & Safe Duplication
apiRouter.get('/admin/packages', requireAuth, packageController.getAdminTourPackages);
apiRouter.get('/admin/packages/:id', requireAuth, packageController.getAdminTourPackageById);
apiRouter.post('/admin/packages', requireAuth, packageController.createTourPackage);
apiRouter.post('/admin/packages/:id/duplicate', requireAuth, packageController.duplicateTourPackage);
apiRouter.patch('/admin/packages/:id', requireAuth, packageController.updateTourPackage);
apiRouter.put('/admin/packages/:id', requireAuth, packageController.updateTourPackage);
apiRouter.patch('/admin/packages/:id/publish', requireAuth, packageController.togglePublishPackage);
apiRouter.patch('/admin/packages/:id/feature', requireAuth, packageController.toggleFeaturePackage);
apiRouter.delete('/admin/packages/:id', requireAuth, packageController.deleteTourPackage);

// Admin Hotel & Room Management
apiRouter.post('/admin/hotels', requireAuth, hotelController.createHotel);
apiRouter.patch('/admin/hotels/:id', requireAuth, hotelController.updateHotel);
apiRouter.delete('/admin/hotels/:id', requireAuth, hotelController.archiveHotel);
apiRouter.post('/admin/hotels/:hotelId/rooms', requireAuth, hotelController.createRoomType);
apiRouter.patch('/admin/rooms/:roomId', requireAuth, hotelController.updateRoomType);
apiRouter.delete('/admin/rooms/:roomId', requireAuth, hotelController.archiveRoomType);

// Admin Testimonial Management
apiRouter.post('/admin/testimonials', requireAuth, testimonialController.createTestimonial);
apiRouter.patch('/admin/testimonials/:id', requireAuth, testimonialController.updateTestimonial);
apiRouter.delete('/admin/testimonials/:id', requireAuth, testimonialController.deleteTestimonial);
