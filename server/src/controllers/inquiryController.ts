import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  sendInquiryReceivedNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendAccommodationUpdatedNotification,
  sendPaymentReminderNotification,
  sendPreTripReminderNotification,
  InquiryWithFullDetails,
} from '../services/emailService.js';
import { logger } from '../utils/logger.js';

export const inquirySchema = z.object({
  customerName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please provide a valid email address'),
  phone: z.string().trim().min(7, 'Please provide a valid phone number with area code').max(25, 'Phone number is too long'),
  destinationId: z.string().optional().nullable(),
  packageId: z.string().optional().nullable(),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
  adults: z.number().int().min(1, 'At least 1 adult traveler is required').max(50, 'Max party size exceeded'),
  children: z.number().int().min(0, 'Children count cannot be negative').default(0),
  travelType: z.enum(['LUXURY', 'ADVENTURE', 'HONEYMOON', 'FAMILY', 'CULTURAL', 'SOLO', 'WELLNESS', 'WILDLIFE', 'CORPORATE', 'GROUP']),
  budget: z.string().min(1, 'Budget selection is required'),
  accommodationPref: z.enum(['FIVE_STAR_LUXURY', 'BOUTIQUE_HOTEL', 'ECO_LODGE', 'PRIVATE_VILLA', 'FOUR_STAR_PREMIUM', 'HERITAGE_PALACE']),
  additionalRequirements: z.string().max(2000, 'Additional requirements cannot exceed 2000 characters').optional().nullable(),
  preferredContact: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Privacy Policy to submit an inquiry',
  }),
}).refine(
  (data) => {
    const dep = new Date(data.departureDate);
    const ret = new Date(data.returnDate);
    return ret >= dep;
  },
  {
    message: 'Return date must be on or after departure date',
    path: ['returnDate'],
  }
);

function generateInquiryReference(): string {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
  return `WND-${year}-${randomChars}`;
}

export async function createInquiry(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = inquirySchema.parse(req.body);

    // 1. Verify Destination if provided
    let destinationRecord = null;
    if (validated.destinationId && validated.destinationId.trim()) {
      destinationRecord = await prisma.destination.findUnique({
        where: { id: validated.destinationId },
      });
      if (!destinationRecord) {
        throw new AppError('The selected destination could not be found.', 404);
      }
    }

    // 2. Verify Package if provided
    let packageRecord = null;
    if (validated.packageId && validated.packageId.trim()) {
      packageRecord = await prisma.tourPackage.findUnique({
        where: { id: validated.packageId },
        include: { destination: true },
      });
      if (!packageRecord) {
        throw new AppError('The selected tour package could not be found.', 404);
      }
      if (!destinationRecord && packageRecord.destination) {
        destinationRecord = packageRecord.destination;
      }
    }

    // 3. Generate unique reference with collision check
    let reference = generateInquiryReference();
    let collision = await prisma.inquiry.findUnique({ where: { reference } });
    while (collision) {
      reference = generateInquiryReference();
      collision = await prisma.inquiry.findUnique({ where: { reference } });
    }

    // 4. Persist to Database with initial NEW_INQUIRY status
    const newInquiry = await prisma.inquiry.create({
      data: {
        reference,
        customerName: validated.customerName,
        email: validated.email,
        phone: validated.phone,
        destinationId: destinationRecord?.id ?? null,
        packageId: packageRecord?.id ?? null,
        departureDate: validated.departureDate,
        returnDate: validated.returnDate,
        adults: validated.adults,
        children: validated.children,
        travelType: validated.travelType,
        budget: validated.budget,
        accommodationPref: validated.accommodationPref,
        additionalRequirements: validated.additionalRequirements ?? null,
        preferredContact: validated.preferredContact,
        privacyConsent: validated.privacyConsent,
        status: 'NEW_INQUIRY',
      },
      include: {
        destination: true,
        package: true,
      },
    });

    logger.info(`Inquiry created successfully. Reference: ${reference}, ID: ${newInquiry.id}`);

    // 5. Send acknowledgment notification (strictly an inquiry receipt, NOT a booking confirmation!)
    sendInquiryReceivedNotification({
      id: newInquiry.id,
      reference: newInquiry.reference,
      customerName: newInquiry.customerName,
      email: newInquiry.email,
      phone: newInquiry.phone,
      departureDate: newInquiry.departureDate,
      returnDate: newInquiry.returnDate,
      adults: newInquiry.adults,
      children: newInquiry.children,
      travelType: newInquiry.travelType,
      budget: newInquiry.budget,
      accommodationPref: newInquiry.accommodationPref,
      additionalRequirements: newInquiry.additionalRequirements,
      preferredContact: newInquiry.preferredContact,
      status: newInquiry.status,
      createdAt: newInquiry.createdAt,
      destination: destinationRecord ? { name: destinationRecord.name, country: destinationRecord.country } : null,
      package: packageRecord ? {
        title: packageRecord.title,
        durationDays: packageRecord.durationDays,
        durationNights: packageRecord.durationNights,
        priceCents: packageRecord.priceCents,
        overview: packageRecord.overview,
        includes: packageRecord.includes,
        excludes: packageRecord.excludes,
      } : null,
    }).catch((err) => {
      logger.error(`Error in sendInquiryReceivedNotification for ${newInquiry.reference}:`, err);
    });

    // 6. Return response (never exposes sensitive tokens or internal notes)
    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. Our private concierge will be in touch with your bespoke itinerary.',
      inquiry: {
        id: newInquiry.id,
        reference: newInquiry.reference,
        customerName: newInquiry.customerName,
        destination: destinationRecord ? { name: destinationRecord.name, country: destinationRecord.country } : null,
        package: packageRecord ? { title: packageRecord.title, priceCents: packageRecord.priceCents } : null,
        departureDate: newInquiry.departureDate,
        returnDate: newInquiry.returnDate,
        adults: newInquiry.adults,
        children: newInquiry.children,
        status: newInquiry.status,
        createdAt: newInquiry.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getInquiryByReference(req: Request, res: Response, next: NextFunction) {
  try {
    const { reference } = req.params;
    if (!reference) {
      throw new AppError('Inquiry reference is required', 400);
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { reference },
      include: {
        destination: true,
        package: true,
        accommodationAllocations: {
          select: {
            checkInDate: true,
            checkOutDate: true,
            nights: true,
            roomCount: true,
            occupancyPerRoom: true,
            mealPlan: true,
            status: true,
            hotel: {
              select: { name: true, address: true, verifiedStarClass: true },
            },
            roomType: {
              select: { name: true, bedConfiguration: true },
            },
          },
        },
        transportAllocations: {
          select: {
            transportType: true,
            pickupLocation: true,
            pickupDateTime: true,
            dropoffLocation: true,
            status: true,
          },
        },
      },
    });

    if (!inquiry) {
      throw new AppError('Inquiry reference not found', 404);
    }

    return res.json({
      success: true,
      inquiry: {
        reference: inquiry.reference,
        customerName: inquiry.customerName,
        status: inquiry.status,
        destination: inquiry.destination ? { name: inquiry.destination.name, country: inquiry.destination.country } : null,
        package: inquiry.package ? { title: inquiry.package.title } : null,
        departureDate: inquiry.departureDate,
        returnDate: inquiry.returnDate,
        adults: inquiry.adults,
        children: inquiry.children,
        accommodations: inquiry.accommodationAllocations,
        transfers: inquiry.transportAllocations,
        createdAt: inquiry.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------
// ADMIN BOOKING WORKFLOW ENDPOINTS
// -------------------------------------------------------------

export const assignAccommodationSchema = z.object({
  hotelId: z.string().min(1, 'Hotel selection is required'),
  roomTypeId: z.string().min(1, 'Room type selection is required'),
  checkInDate: z.string().min(1, 'Check-in date is required'),
  checkOutDate: z.string().min(1, 'Check-out date is required'),
  nights: z.number().int().min(1, 'Nights must be at least 1'),
  roomCount: z.number().int().min(1, 'Must allocate at least 1 room').default(1),
  occupancyPerRoom: z.number().int().min(1, 'Occupancy per room must be at least 1').default(2),
  mealPlan: z.string().default('BED_AND_BREAKFAST'),
  specialRequests: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED']).default('PENDING'),
  supplierConfirmationRef: z.string().optional().nullable(),
  priceCents: z.number().int().min(0).default(0),
});

export async function assignAccommodation(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = assignAccommodationSchema.parse(req.body);

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: { accommodationAllocations: true },
    });
    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    const roomType = await prisma.roomType.findUnique({
      where: { id: validated.roomTypeId },
      include: { hotel: true },
    });
    if (!roomType || roomType.hotelId !== validated.hotelId) {
      throw new AppError('Selected room type does not belong to the selected hotel', 400);
    }

    // Validate Occupancy
    const totalAllocatedCapacity = validated.roomCount * roomType.maxOccupancy;
    const requiredPartySize = inquiry.adults + inquiry.children;
    if (validated.occupancyPerRoom > roomType.maxOccupancy) {
      throw new AppError(`Occupancy per room (${validated.occupancyPerRoom}) exceeds maximum allowable for ${roomType.name} (${roomType.maxOccupancy})`, 400);
    }

    // Check inventory if tracked
    if (roomType.inventoryCount < validated.roomCount) {
      throw new AppError(`Insufficient room inventory. Available: ${roomType.inventoryCount}, Requested: ${validated.roomCount}`, 400);
    }

    const allocation = await prisma.bookingAccommodationAllocation.create({
      data: {
        inquiryId: id,
        hotelId: validated.hotelId,
        roomTypeId: validated.roomTypeId,
        checkInDate: validated.checkInDate,
        checkOutDate: validated.checkOutDate,
        nights: validated.nights,
        roomCount: validated.roomCount,
        occupancyPerRoom: validated.occupancyPerRoom,
        mealPlan: validated.mealPlan,
        specialRequests: validated.specialRequests,
        status: validated.status,
        supplierConfirmationRef: validated.supplierConfirmationRef,
        priceCents: validated.priceCents || (roomType.priceCents * validated.nights * validated.roomCount),
      },
      include: {
        hotel: true,
        roomType: true,
      },
    });

    // If the booking is already confirmed, trigger accommodation updated email
    if (inquiry.status === 'CONFIRMED') {
      const fullBooking = await getFullInquiryDetails(id);
      if (fullBooking) {
        sendAccommodationUpdatedNotification(fullBooking, `Accommodation segment added for ${allocation.hotel.name}`).catch((err) => {
          logger.error('Failed to dispatch accommodation update notification:', err);
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: allocation,
    });
  } catch (err) {
    next(err);
  }
}

export const assignTransportSchema = z.object({
  transportType: z.string().default('AIRPORT_TRANSFER'),
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  pickupDateTime: z.string().min(2, 'Pickup date and time is required'),
  dropoffLocation: z.string().min(2, 'Dropoff location is required'),
  flightNumber: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  meetingInstructions: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED']).default('PENDING'),
});

export async function assignTransport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = assignTransportSchema.parse(req.body);

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }

    const allocation = await prisma.bookingTransportAllocation.create({
      data: {
        inquiryId: id,
        ...validated,
      },
    });

    return res.status(201).json({
      success: true,
      data: allocation,
    });
  } catch (err) {
    next(err);
  }
}

export const confirmBookingSchema = z.object({
  totalPriceCents: z.number().int().positive('Agreed total price in cents must be positive'),
  currency: z.string().default('USD'),
  amountPaidCents: z.number().int().min(0).default(0),
  paymentStatus: z.enum(['PENDING', 'PARTIAL', 'PAID']).default('PENDING'),
  paymentDueDate: z.string().optional().nullable(),
  customerInstructions: z.string().optional().nullable(),
  requireSupplierApproval: z.boolean().default(false),
});

export async function confirmBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = confirmBookingSchema.parse(req.body);

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        accommodationAllocations: { include: { hotel: true, roomType: true } },
        transportAllocations: true,
      },
    });

    if (!inquiry) {
      throw new AppError('Booking inquiry not found', 404);
    }

    if (inquiry.status === 'CONFIRMED') {
      throw new AppError('This booking has already been confirmed. Duplicate confirmations are blocked.', 409);
    }

    // Constraint: "Never mark a booking confirmed while required accommodation remains unconfirmed"
    if (!inquiry.accommodationAllocations || inquiry.accommodationAllocations.length === 0) {
      throw new AppError('Cannot confirm booking: At least one accommodation segment must be assigned and confirmed first.', 400);
    }

    const unconfirmedAccommodations = inquiry.accommodationAllocations.filter(a => a.status !== 'CONFIRMED');
    if (unconfirmedAccommodations.length > 0) {
      const hotelNames = unconfirmedAccommodations.map(a => a.hotel.name).join(', ');
      throw new AppError(`Cannot confirm booking while required accommodation remains pending: [${hotelNames}]. All segments must be marked CONFIRMED.`, 400);
    }

    // Constraint: If supplier approval required, check supplier references
    if (validated.requireSupplierApproval) {
      const missingSupplierRef = inquiry.accommodationAllocations.filter(a => !a.supplierConfirmationRef);
      if (missingSupplierRef.length > 0) {
        throw new AppError('Configured requirement: Supplier confirmation reference is missing on one or more accommodation segments.', 400);
      }
    }

    const balanceCents = validated.totalPriceCents - validated.amountPaidCents;

    // ATOMIC DATABASE TRANSACTION
    const confirmedBooking = await prisma.$transaction(async (tx) => {
      // 1. Transactionally decrement room inventory for tracked rooms
      for (const acc of inquiry.accommodationAllocations) {
        if (acc.roomType && acc.roomType.inventoryCount > 0) {
          await tx.roomType.update({
            where: { id: acc.roomTypeId },
            data: {
              inventoryCount: {
                decrement: Math.min(acc.roomCount, acc.roomType.inventoryCount),
              },
            },
          });
        }
      }

      // 2. Update booking record
      return await tx.inquiry.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          totalPriceCents: validated.totalPriceCents,
          currency: validated.currency,
          amountPaidCents: validated.amountPaidCents,
          balanceCents,
          paymentStatus: validated.paymentStatus,
          paymentDueDate: validated.paymentDueDate,
          customerInstructions: validated.customerInstructions,
        },
        include: {
          destination: true,
          package: true,
          accommodationAllocations: { include: { hotel: true, roomType: true } },
          transportAllocations: true,
        },
      });
    });

    logger.info(`Booking successfully confirmed: Reference ${confirmedBooking.reference}, ID: ${confirmedBooking.id}`);

    // Enqueue & Dispatch Confirmation Email (reliable outbox with idempotency)
    try {
      await sendBookingConfirmedNotification(confirmedBooking as unknown as InquiryWithFullDetails);
    } catch (err) {
      logger.error(`Failed to dispatch confirmation email for ${confirmedBooking.reference}:`, err);
    }

    return res.json({
      success: true,
      message: 'Booking confirmed and all allocations locked successfully.',
      data: confirmedBooking,
    });
  } catch (err) {
    next(err);
  }
}

export const updateStatusSchema = z.object({
  status: z.enum([
    'NEW_INQUIRY',
    'AWAITING_REVIEW',
    'QUOTATION_SENT',
    'AWAITING_CUSTOMER_APPROVAL',
    'AWAITING_PAYMENT',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    // legacy support
    'PENDING',
    'CONTACTED',
    'IN_REVIEW',
    'QUOTED',
  ]),
  cancellationReason: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

export async function updateInquiryStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateStatusSchema.parse(req.body);

    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Inquiry not found', 404);
    }

    // Guard: Confirmation MUST go through the atomic confirmBooking endpoint
    if (validated.status === 'CONFIRMED' && existing.status !== 'CONFIRMED') {
      throw new AppError('Confirming a booking requires setting verified accommodation allocations and pricing. Please use the Confirm Booking action.', 400);
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status: validated.status,
        internalNotes: validated.internalNotes !== undefined ? validated.internalNotes : existing.internalNotes,
        followUpDate: validated.followUpDate !== undefined ? validated.followUpDate : existing.followUpDate,
        cancelledAt: validated.status === 'CANCELLED' ? new Date() : existing.cancelledAt,
      },
      include: {
        destination: true,
        package: true,
        accommodationAllocations: { include: { hotel: true, roomType: true } },
        transportAllocations: true,
      },
    });

    // If cancelled, send cancellation notification
    if (validated.status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      sendBookingCancelledNotification(updated as unknown as InquiryWithFullDetails, validated.cancellationReason || undefined).catch((err) => {
        logger.error(`Failed to send cancellation email for ${updated.reference}:`, err);
      });
    }

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function sendBookingReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'PAYMENT_DUE' or 'PRE_TRIP'

    const fullBooking = await getFullInquiryDetails(id);
    if (!fullBooking) {
      throw new AppError('Booking record not found', 404);
    }

    if (type === 'PAYMENT_DUE') {
      await sendPaymentReminderNotification(fullBooking);
    } else if (type === 'PRE_TRIP') {
      await sendPreTripReminderNotification(fullBooking);
    } else {
      throw new AppError('Invalid reminder type. Supported: PAYMENT_DUE, PRE_TRIP', 400);
    }

    return res.json({
      success: true,
      message: `${type} reminder dispatched successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

async function getFullInquiryDetails(id: string): Promise<InquiryWithFullDetails | null> {
  const record = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      destination: true,
      package: true,
      accommodationAllocations: {
        include: {
          hotel: true,
          roomType: true,
        },
      },
      transportAllocations: true,
    },
  });

  return record as unknown as InquiryWithFullDetails | null;
}
