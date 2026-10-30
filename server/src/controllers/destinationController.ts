import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const destinationSchema = z.object({
  name: z.string().min(2, 'Destination name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  country: z.string().min(2, 'Country is required'),
  continent: z.string().min(2, 'Continent is required'),
  region: z.string().default(''),
  tagline: z.string().min(5, 'Tagline is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  heroImage: z.string().url('Hero image must be a valid URL'),
  gallery: z.array(z.string().url()).min(1, 'At least one gallery image is required'),
  attractions: z.array(z.string()).default([]),
  recommendedDuration: z.string().default('5-7 Days'),
  bestTimeToVisit: z.string().min(2, 'Best time to visit is required'),
  language: z.string().min(2, 'Language is required'),
  currency: z.string().min(2, 'Currency is required'),
  rating: z.number().min(1).max(5).default(5),
  reviewsCount: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  startingPrice: z.number().positive().optional(),
  startingPriceCents: z.number().int().positive('Starting price in cents must be positive'),
  highlights: z.array(z.string()).min(1, 'At least one highlight is required'),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export async function getDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const { continent, region, featured, search, sort, includeArchived } = req.query;

    const where: Record<string, unknown> = {};

    if (includeArchived !== 'true') {
      where.isArchived = false;
      where.isPublished = true;
    }

    if (continent && continent !== 'ALL') {
      where.continent = String(continent);
    }

    if (region && region !== 'ALL') {
      where.region = { contains: String(region), mode: 'insensitive' };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { region: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { isFeatured: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { startingPriceCents: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { startingPriceCents: 'desc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const destinations = await prisma.destination.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { packages: true, hotels: true },
        },
      },
    });

    return res.json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDestinationBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        packages: {
          where: { isArchived: false, isPublished: true },
          take: 12,
        },
        hotels: {
          where: { isArchived: false, isPublished: true },
          include: {
            roomTypes: {
              where: { isArchived: false, isPublished: true },
            },
          },
        },
      },
    });

    if (!destination) {
      throw new AppError(`Destination '${slug}' not found`, 404);
    }

    return res.json({
      success: true,
      data: destination,
    });
  } catch (err) {
    next(err);
  }
}

export async function createDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = destinationSchema.parse(req.body);
    const existing = await prisma.destination.findUnique({ where: { slug: validated.slug } });
    if (existing) {
      throw new AppError(`A destination with slug '${validated.slug}' already exists`, 409);
    }

    const destination = await prisma.destination.create({
      data: {
        ...validated,
        startingPrice: validated.startingPrice || (validated.startingPriceCents / 100),
      },
    });

    return res.status(201).json({
      success: true,
      data: destination,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = destinationSchema.partial().parse(req.body);

    const updateData: Record<string, unknown> = { ...validated };
    if (validated.startingPriceCents && !validated.startingPrice) {
      updateData.startingPrice = validated.startingPriceCents / 100;
    }

    const updated = await prisma.destination.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const [packagesCount, hotelsCount, inquiriesCount] = await Promise.all([
      prisma.tourPackage.count({ where: { destinationId: id } }),
      prisma.hotel.count({ where: { destinationId: id } }),
      prisma.inquiry.count({ where: { destinationId: id } }),
    ]);

    if (packagesCount > 0 || hotelsCount > 0 || inquiriesCount > 0) {
      await prisma.destination.update({
        where: { id },
        data: { isArchived: true, isPublished: false },
      });
      return res.json({
        success: true,
        message: 'Destination safely archived to protect existing packages and bookings',
      });
    }

    await prisma.destination.delete({ where: { id } });
    return res.json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
