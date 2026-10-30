import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const hotelSchema = z.object({
  destinationId: z.string().min(1, 'Destination is required'),
  name: z.string().trim().min(2, 'Hotel name must be at least 2 characters'),
  slug: z.string().trim().min(2, 'Slug is required'),
  address: z.string().min(5, 'Address is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  verifiedStarClass: z.number().int().min(1).max(5).optional().nullable(),
  amenities: z.array(z.string()).default([]),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('11:00'),
  mealPlans: z.array(z.string()).default(['BED_AND_BREAKFAST']),
  accessibilityInfo: z.string().optional().nullable(),
  cancellationConditions: z.string().optional().nullable(),
  photos: z.array(z.string().url()).default([]),
  isPublished: z.boolean().default(true),
});

export const roomTypeSchema = z.object({
  name: z.string().trim().min(2, 'Room type name is required'),
  slug: z.string().trim().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  maxOccupancy: z.number().int().min(1).default(2),
  bedConfiguration: z.string().min(2, 'Bed configuration is required'),
  amenities: z.array(z.string()).default([]),
  mealPlanOptions: z.array(z.string()).default(['BED_AND_BREAKFAST']),
  priceCents: z.number().int().positive('Price in cents must be positive'),
  currency: z.string().default('USD'),
  availabilityStatus: z.enum(['AVAILABLE', 'ON_REQUEST', 'SOLD_OUT']).default('AVAILABLE'),
  taxesFeesCents: z.number().int().min(0).default(0),
  cancellationConditions: z.string().optional().nullable(),
  inventoryCount: z.number().int().min(0).default(5),
  isPublished: z.boolean().default(true),
});

export async function getHotels(req: Request, res: Response, next: NextFunction) {
  try {
    const { destinationId, search, starRating, publishedOnly } = req.query;

    const where: Record<string, unknown> = {
      isArchived: false,
    };

    if (publishedOnly === 'true') {
      where.isPublished = true;
    }

    if (destinationId && typeof destinationId === 'string') {
      where.destinationId = destinationId;
    }

    if (starRating && !isNaN(Number(starRating))) {
      where.verifiedStarClass = Number(starRating);
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            country: true,
            slug: true,
          },
        },
        roomTypes: {
          where: { isArchived: false },
          orderBy: { priceCents: 'asc' },
        },
      },
    });

    return res.json({
      success: true,
      count: hotels.length,
      data: hotels,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHotelBySlugOrId(req: Request, res: Response, next: NextFunction) {
  try {
    const { idOrSlug } = req.params;

    const hotel = await prisma.hotel.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isArchived: false,
      },
      include: {
        destination: true,
        roomTypes: {
          where: { isArchived: false },
          orderBy: { priceCents: 'asc' },
        },
      },
    });

    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }

    return res.json({
      success: true,
      data: hotel,
    });
  } catch (err) {
    next(err);
  }
}

export async function createHotel(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = hotelSchema.parse(req.body);

    const destination = await prisma.destination.findUnique({
      where: { id: validated.destinationId },
    });
    if (!destination) {
      throw new AppError('Destination not found', 404);
    }

    const existingSlug = await prisma.hotel.findUnique({
      where: { slug: validated.slug },
    });
    if (existingSlug) {
      throw new AppError(`Hotel slug '${validated.slug}' already exists`, 409);
    }

    const hotel = await prisma.hotel.create({
      data: validated,
      include: { destination: true, roomTypes: true },
    });

    return res.status(201).json({
      success: true,
      data: hotel,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateHotel(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = hotelSchema.partial().parse(req.body);

    const updated = await prisma.hotel.update({
      where: { id },
      data: validated,
      include: { destination: true, roomTypes: true },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function archiveHotel(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if referenced by active allocations or packages
    const allocationsCount = await prisma.bookingAccommodationAllocation.count({
      where: { hotelId: id },
    });
    const packageLinksCount = await prisma.tourPackageHotel.count({
      where: { hotelId: id },
    });

    if (allocationsCount > 0 || packageLinksCount > 0) {
      // Soft-delete to keep existing bookings and packages completely intact!
      await prisma.hotel.update({
        where: { id },
        data: { isArchived: true, isPublished: false },
      });
      return res.json({
        success: true,
        message: 'Hotel safely archived to protect existing booking records',
      });
    }

    // If completely unreferenced, can delete
    await prisma.hotel.delete({ where: { id } });
    return res.json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function createRoomType(req: Request, res: Response, next: NextFunction) {
  try {
    const { hotelId } = req.params;
    const validated = roomTypeSchema.parse(req.body);

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      throw new AppError('Hotel not found', 404);
    }

    const existing = await prisma.roomType.findUnique({
      where: {
        hotelId_slug: {
          hotelId,
          slug: validated.slug,
        },
      },
    });
    if (existing) {
      throw new AppError(`Room type slug '${validated.slug}' already exists for this hotel`, 409);
    }

    const roomType = await prisma.roomType.create({
      data: {
        ...validated,
        hotelId,
      },
    });

    return res.status(201).json({
      success: true,
      data: roomType,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateRoomType(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;
    const validated = roomTypeSchema.partial().parse(req.body);

    const updated = await prisma.roomType.update({
      where: { id: roomId },
      data: validated,
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function archiveRoomType(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId } = req.params;

    const allocationsCount = await prisma.bookingAccommodationAllocation.count({
      where: { roomTypeId: roomId },
    });

    if (allocationsCount > 0) {
      await prisma.roomType.update({
        where: { id: roomId },
        data: { isArchived: true, isPublished: false },
      });
      return res.json({
        success: true,
        message: 'Room type safely archived to preserve existing booking allocations',
      });
    }

    await prisma.roomType.delete({ where: { id: roomId } });
    return res.json({
      success: true,
      message: 'Room type deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
