import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const itineraryEntrySchema = z.object({
  id: z.string().optional(),
  dayNumber: z.number().int().min(1, 'Day number must be at least 1'),
  title: z.string().min(2, 'Day title must be at least 2 characters'),
  description: z.string().min(5, 'Day description must be at least 5 characters'),
  locations: z.array(z.string()).default([]),
  activities: z.array(z.string()).default([]),
  mealsIncluded: z.string().default('Breakfast'),
  accommodation: z.string().optional().nullable(),
  orderIndex: z.number().int().optional(),
});

export const packageSchema = z.object({
  title: z.string().min(3, 'Package title must be at least 3 characters'),
  slug: z.string().optional(),
  destinationId: z.string().min(1, 'Primary destination is required'),
  linkedDestinationIds: z.array(z.string()).default([]),
  durationDays: z.number().int().min(1, 'Duration must be at least 1 day'),
  durationNights: z.number().int().min(0, 'Duration nights cannot be negative'),
  price: z.number().positive().optional(),
  priceCents: z.number().int().positive('Price in cents must be greater than zero'),
  currency: z.string().default('USD'),
  discountPrice: z.number().positive().optional().nullable(),
  discountPriceCents: z.number().int().positive().optional().nullable(),
  pricingBasis: z.string().default('per_person'),
  isSamplePrice: z.boolean().default(true),
  category: z.string().min(2, 'Category is required'),
  difficulty: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).default('MODERATE'),
  maxGroupSize: z.number().int().min(1).default(12),
  overview: z.string().min(10, 'Overview must be at least 10 characters'),
  itineraryEntries: z.array(itineraryEntrySchema).optional(),
  itinerary: z.array(itineraryEntrySchema).optional(),
  includes: z.array(z.string()).min(1, 'Inclusions list is required'),
  excludes: z.array(z.string()).default([]),
  transport: z.string().optional().nullable(),
  activities: z.array(z.string()).default([]),
  heroImage: z.string().url('Hero image must be a valid URL'),
  gallery: z.array(z.string().url()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  cancellationPolicy: z.string().default('Free cancellation up to 30 days prior to departure.'),
  rating: z.number().min(1).max(5).default(5),
  reviewsCount: z.number().int().min(0).default(0),
  departureDates: z.array(z.string()).default([]),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  const entries = data.itineraryEntries || data.itinerary || [];
  if (entries.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one itinerary day is required',
      path: ['itineraryEntries'],
    });
    return;
  }
  // Validate that all day numbers are unique within the package
  const days = entries.map((e) => e.dayNumber);
  const daySet = new Set(days);
  if (daySet.size !== days.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Each itinerary entry must have a unique day number within the package (no duplicate day numbers)',
      path: ['itineraryEntries'],
    });
  }
  // Validate that day numbers are consistent with durationDays
  for (const e of entries) {
    if (e.dayNumber > data.durationDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Itinerary day ${e.dayNumber} exceeds the package duration of ${data.durationDays} days. Day number cannot exceed package duration.`,
        path: ['itineraryEntries'],
      });
    }
  }
});

export const updatePackageSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().optional(),
  destinationId: z.string().optional(),
  linkedDestinationIds: z.array(z.string()).optional(),
  durationDays: z.number().int().min(1).optional(),
  durationNights: z.number().int().min(0).optional(),
  price: z.number().positive().optional(),
  priceCents: z.number().int().positive().optional(),
  currency: z.string().optional(),
  discountPrice: z.number().positive().optional().nullable(),
  discountPriceCents: z.number().int().positive().optional().nullable(),
  pricingBasis: z.string().optional(),
  isSamplePrice: z.boolean().optional(),
  category: z.string().min(2).optional(),
  difficulty: z.enum(['EASY', 'MODERATE', 'CHALLENGING']).optional(),
  maxGroupSize: z.number().int().min(1).optional(),
  overview: z.string().min(10).optional(),
  itineraryEntries: z.array(itineraryEntrySchema).optional(),
  itinerary: z.array(itineraryEntrySchema).optional(),
  includes: z.array(z.string()).optional(),
  excludes: z.array(z.string()).optional(),
  transport: z.string().optional().nullable(),
  activities: z.array(z.string()).optional(),
  heroImage: z.string().url().optional(),
  gallery: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  cancellationPolicy: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),
  departureDates: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  const entries = data.itineraryEntries || data.itinerary;
  if (entries && entries.length > 0) {
    const days = entries.map((e) => e.dayNumber);
    const daySet = new Set(days);
    if (daySet.size !== days.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Each itinerary entry must have a unique day number within the package (no duplicate day numbers)',
        path: ['itineraryEntries'],
      });
    }
    if (data.durationDays) {
      for (const e of entries) {
        if (e.dayNumber > data.durationDays) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Itinerary day ${e.dayNumber} exceeds the package duration of ${data.durationDays} days. Day number cannot exceed package duration.`,
            path: ['itineraryEntries'],
          });
        }
      }
    }
  }
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * PUBLIC: List published, non-archived tour packages
 */
export async function getTourPackages(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, destinationId, featured, search, sort, maxPriceCents } = req.query;

    const where: Record<string, unknown> = {
      isArchived: false,
      isPublished: true,
    };

    if (category && category !== 'ALL') {
      where.category = String(category);
    }

    if (destinationId && typeof destinationId === 'string') {
      where.OR = [
        { destinationId },
        { packageDestinations: { some: { destinationId } } },
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (maxPriceCents && !isNaN(Number(maxPriceCents))) {
      where.priceCents = { lte: Number(maxPriceCents) };
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } },
        { destination: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { isFeatured: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { priceCents: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { priceCents: 'desc' };
    } else if (sort === 'duration') {
      orderBy = { durationDays: 'asc' };
    }

    const packages = await prisma.tourPackage.findMany({
      where,
      orderBy,
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            country: true,
            slug: true,
          },
        },
        packageDestinations: {
          include: {
            destination: {
              select: { id: true, name: true, country: true, slug: true },
            },
          },
        },
        itineraryEntries: {
          orderBy: { dayNumber: 'asc' },
        },
        hotels: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                verifiedStarClass: true,
                amenities: true,
                photos: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUBLIC: Get published tour package by slug. Returns 404 if unpublished or archived.
 */
export async function getTourPackageBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const pkg = await prisma.tourPackage.findUnique({
      where: { slug },
      include: {
        destination: true,
        packageDestinations: {
          include: { destination: true },
        },
        itineraryEntries: {
          orderBy: { dayNumber: 'asc' },
        },
        hotels: {
          include: {
            hotel: {
              include: {
                roomTypes: {
                  where: { isArchived: false, isPublished: true },
                },
              },
            },
          },
        },
      },
    });

    // Public constraint: Unpublished or archived packages return a not-found response publicly
    if (!pkg || pkg.isArchived || !pkg.isPublished) {
      throw new AppError(`Tour package '${slug}' not found`, 404);
    }

    return res.json({
      success: true,
      data: pkg,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: List all packages with full status, category, search, and sorting
 */
export async function getAdminTourPackages(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, category, search, sort } = req.query;

    const where: Record<string, unknown> = {};

    if (status === 'PUBLISHED') {
      where.isPublished = true;
      where.isArchived = false;
    } else if (status === 'UNPUBLISHED') {
      where.isPublished = false;
      where.isArchived = false;
    } else if (status === 'ARCHIVED') {
      where.isArchived = true;
    } else if (status === 'FEATURED') {
      where.isFeatured = true;
      where.isArchived = false;
    } else {
      // Default: exclude archived unless specifically requested
      where.isArchived = false;
    }

    if (category && category !== 'ALL') {
      where.category = String(category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { overview: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'title') {
      orderBy = { title: 'asc' };
    } else if (sort === 'price_asc') {
      orderBy = { priceCents: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { priceCents: 'desc' };
    } else if (sort === 'duration') {
      orderBy = { durationDays: 'asc' };
    }

    const packages = await prisma.tourPackage.findMany({
      where,
      orderBy,
      include: {
        destination: { select: { id: true, name: true, country: true } },
        packageDestinations: { include: { destination: true } },
        itineraryEntries: { orderBy: { dayNumber: 'asc' } },
        _count: { select: { inquiries: true, hotels: true } },
      },
    });

    return res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Get single package by ID for editor
 */
export async function getAdminTourPackageById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const pkg = await prisma.tourPackage.findUnique({
      where: { id },
      include: {
        destination: true,
        packageDestinations: { include: { destination: true } },
        itineraryEntries: { orderBy: { dayNumber: 'asc' } },
        hotels: { include: { hotel: true } },
      },
    });

    if (!pkg) {
      throw new AppError('Tour package not found', 404);
    }

    return res.json({
      success: true,
      data: pkg,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Create new tour package with day-by-day itinerary in a single atomic transaction
 */
export async function createTourPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = packageSchema.parse(req.body);

    const destination = await prisma.destination.findUnique({
      where: { id: validated.destinationId },
    });
    if (!destination) {
      throw new AppError('Primary destination not found', 404);
    }

    // Auto-generate slug if not provided, or normalize
    let finalSlug = validated.slug ? generateSlug(validated.slug) : generateSlug(validated.title);
    if (!finalSlug) {
      finalSlug = `tour-${Date.now()}`;
    }

    // Ensure slug uniqueness
    const existingSlug = await prisma.tourPackage.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const rawEntries = validated.itineraryEntries || validated.itinerary || [];

    // Prepare JSON itinerary representation for backwards compatibility
    const jsonItinerary = rawEntries.map((e) => ({
      day: e.dayNumber,
      title: e.title,
      description: e.description,
      locations: e.locations || [],
      activities: e.activities,
      mealsIncluded: e.mealsIncluded,
      accommodation: e.accommodation || undefined,
    }));

    // SINGLE ATOMIC TRANSACTION
    const created = await prisma.$transaction(async (tx) => {
      // 1. Create TourPackage
      const pkg = await tx.tourPackage.create({
        data: {
          title: validated.title,
          slug: finalSlug,
          destinationId: validated.destinationId,
          durationDays: validated.durationDays,
          durationNights: validated.durationNights,
          price: validated.price || (validated.priceCents / 100),
          priceCents: validated.priceCents,
          currency: validated.currency || 'USD',
          discountPrice: validated.discountPrice || (validated.discountPriceCents ? validated.discountPriceCents / 100 : null),
          discountPriceCents: validated.discountPriceCents || null,
          pricingBasis: validated.pricingBasis,
          isSamplePrice: validated.isSamplePrice,
          category: validated.category,
          difficulty: validated.difficulty,
          maxGroupSize: validated.maxGroupSize,
          overview: validated.overview,
          itinerary: jsonItinerary as any,
          includes: validated.includes,
          excludes: validated.excludes,
          transport: validated.transport || null,
          activities: validated.activities || [],
          heroImage: validated.heroImage,
          gallery: validated.gallery,
          isFeatured: validated.isFeatured,
          isPublished: validated.isPublished,
          isArchived: false,
          cancellationPolicy: validated.cancellationPolicy,
          departureDates: validated.departureDates,
          seoTitle: validated.seoTitle || null,
          seoDescription: validated.seoDescription || null,
        },
      });

      // 2. Create Itinerary Entries
      for (const entry of rawEntries) {
        await tx.itineraryEntry.create({
          data: {
            packageId: pkg.id,
            dayNumber: entry.dayNumber,
            title: entry.title,
            description: entry.description,
            locations: entry.locations || [],
            activities: entry.activities || [],
            mealsIncluded: entry.mealsIncluded,
            accommodation: entry.accommodation || null,
            orderIndex: entry.orderIndex || entry.dayNumber,
          },
        });
      }

      // 3. Create Linked Destinations (if any)
      if (validated.linkedDestinationIds && validated.linkedDestinationIds.length > 0) {
        for (let i = 0; i < validated.linkedDestinationIds.length; i++) {
          const dId = validated.linkedDestinationIds[i];
          if (dId !== validated.destinationId) {
            await tx.packageDestination.create({
              data: {
                packageId: pkg.id,
                destinationId: dId,
                orderIndex: i + 1,
              },
            });
          }
        }
      }

      return pkg;
    });

    // Fetch complete package with entries
    const fullPkg = await prisma.tourPackage.findUnique({
      where: { id: created.id },
      include: {
        destination: true,
        packageDestinations: { include: { destination: true } },
        itineraryEntries: { orderBy: { dayNumber: 'asc' } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Expedition tour package created successfully',
      data: fullPkg,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Update tour package and its itinerary entries in a single atomic transaction
 */
export async function updateTourPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updatePackageSchema.parse(req.body);

    const existingPkg = await prisma.tourPackage.findUnique({ where: { id } });
    if (!existingPkg) {
      throw new AppError('Tour package not found', 404);
    }

    // Slug check if slug is modified
    let finalSlug = validated.slug ? generateSlug(validated.slug) : existingPkg.slug;
    if (finalSlug !== existingPkg.slug) {
      const slugConflict = await prisma.tourPackage.findUnique({ where: { slug: finalSlug } });
      if (slugConflict && slugConflict.id !== id) {
        throw new AppError(`Slug '${finalSlug}' is already in use by another package`, 409);
      }
    }

    const rawEntries = validated.itineraryEntries || validated.itinerary || [];

    const jsonItinerary = rawEntries.length > 0 ? rawEntries.map((e) => ({
      day: e.dayNumber,
      title: e.title,
      description: e.description,
      locations: e.locations || [],
      activities: e.activities,
      mealsIncluded: e.mealsIncluded,
      accommodation: e.accommodation || undefined,
    })) : existingPkg.itinerary;

    // SINGLE ATOMIC TRANSACTION
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update TourPackage fields
      const pkg = await tx.tourPackage.update({
        where: { id },
        data: {
          title: validated.title ?? existingPkg.title,
          slug: finalSlug,
          destinationId: validated.destinationId ?? existingPkg.destinationId,
          durationDays: validated.durationDays ?? existingPkg.durationDays,
          durationNights: validated.durationNights ?? existingPkg.durationNights,
          price: validated.price ?? (validated.priceCents ? validated.priceCents / 100 : existingPkg.price),
          priceCents: validated.priceCents ?? existingPkg.priceCents,
          currency: validated.currency ?? existingPkg.currency ?? 'USD',
          discountPrice: validated.discountPrice !== undefined ? validated.discountPrice : (validated.discountPriceCents !== undefined ? (validated.discountPriceCents ? validated.discountPriceCents / 100 : null) : existingPkg.discountPrice),
          discountPriceCents: validated.discountPriceCents !== undefined ? validated.discountPriceCents : existingPkg.discountPriceCents,
          pricingBasis: validated.pricingBasis ?? existingPkg.pricingBasis,
          isSamplePrice: validated.isSamplePrice !== undefined ? validated.isSamplePrice : existingPkg.isSamplePrice,
          category: validated.category ?? existingPkg.category,
          difficulty: validated.difficulty ?? existingPkg.difficulty,
          maxGroupSize: validated.maxGroupSize ?? existingPkg.maxGroupSize,
          overview: validated.overview ?? existingPkg.overview,
          itinerary: jsonItinerary as any,
          includes: validated.includes ?? existingPkg.includes,
          excludes: validated.excludes ?? existingPkg.excludes,
          transport: validated.transport !== undefined ? validated.transport : existingPkg.transport,
          activities: validated.activities ?? existingPkg.activities,
          heroImage: validated.heroImage ?? existingPkg.heroImage,
          gallery: validated.gallery ?? existingPkg.gallery,
          isFeatured: validated.isFeatured !== undefined ? validated.isFeatured : existingPkg.isFeatured,
          isPublished: validated.isPublished !== undefined ? validated.isPublished : existingPkg.isPublished,
          cancellationPolicy: validated.cancellationPolicy ?? existingPkg.cancellationPolicy,
          departureDates: validated.departureDates ?? existingPkg.departureDates,
          seoTitle: validated.seoTitle !== undefined ? validated.seoTitle : existingPkg.seoTitle,
          seoDescription: validated.seoDescription !== undefined ? validated.seoDescription : existingPkg.seoDescription,
        },
      });

      // 2. Re-synchronize Itinerary Entries: delete existing and insert new order
      if (rawEntries.length > 0) {
        await tx.itineraryEntry.deleteMany({ where: { packageId: id } });
        for (const entry of rawEntries) {
          await tx.itineraryEntry.create({
            data: {
              packageId: id,
              dayNumber: entry.dayNumber,
              title: entry.title,
              description: entry.description,
              locations: entry.locations || [],
              activities: entry.activities || [],
              mealsIncluded: entry.mealsIncluded,
              accommodation: entry.accommodation || null,
              orderIndex: entry.orderIndex || entry.dayNumber,
            },
          });
        }
      }

      // 3. Re-synchronize Linked Destinations
      if (validated.linkedDestinationIds) {
        await tx.packageDestination.deleteMany({ where: { packageId: id } });
        for (let i = 0; i < validated.linkedDestinationIds.length; i++) {
          const dId = validated.linkedDestinationIds[i];
          if (dId !== validated.destinationId) {
            await tx.packageDestination.create({
              data: {
                packageId: id,
                destinationId: dId,
                orderIndex: i + 1,
              },
            });
          }
        }
      }

      return pkg;
    });

    const fullUpdated = await prisma.tourPackage.findUnique({
      where: { id: updated.id },
      include: {
        destination: true,
        packageDestinations: { include: { destination: true } },
        itineraryEntries: { orderBy: { dayNumber: 'asc' } },
      },
    });

    return res.json({
      success: true,
      message: 'Package and itinerary updated successfully',
      data: fullUpdated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Toggle package publication status (publish / unpublish)
 */
export async function togglePublishPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== 'boolean') {
      throw new AppError('isPublished boolean flag is required', 400);
    }

    const updated = await prisma.tourPackage.update({
      where: { id },
      data: { isPublished },
    });

    return res.json({
      success: true,
      message: isPublished ? 'Package published to public catalog' : 'Package unpublished (draft)',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Toggle package featured status
 */
export async function toggleFeaturePackage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (typeof isFeatured !== 'boolean') {
      throw new AppError('isFeatured boolean flag is required', 400);
    }

    const updated = await prisma.tourPackage.update({
      where: { id },
      data: { isFeatured },
    });

    return res.json({
      success: true,
      message: isFeatured ? 'Package marked as featured' : 'Package unfeatured',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Duplicate package safely.
 * Creates an UNPUBLISHED copy with unique ID, unique slug, and deep-copied itinerary.
 */
export async function duplicateTourPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const sourcePkg = await prisma.tourPackage.findUnique({
      where: { id },
      include: {
        itineraryEntries: { orderBy: { dayNumber: 'asc' } },
        packageDestinations: true,
        hotels: true,
      },
    });

    if (!sourcePkg) {
      throw new AppError('Source tour package not found to duplicate', 404);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newSlug = `${sourcePkg.slug}-copy-${randomSuffix}`;
    const newTitle = `${sourcePkg.title} (Copy)`;

    // Single atomic transaction for duplication
    const duplicated = await prisma.$transaction(async (tx) => {
      // 1. Create duplicate package marked as UNPUBLISHED
      const pkg = await tx.tourPackage.create({
        data: {
          title: newTitle,
          slug: newSlug,
          destinationId: sourcePkg.destinationId,
          durationDays: sourcePkg.durationDays,
          durationNights: sourcePkg.durationNights,
          price: sourcePkg.price,
          priceCents: sourcePkg.priceCents,
          currency: sourcePkg.currency || 'USD',
          discountPrice: sourcePkg.discountPrice,
          discountPriceCents: sourcePkg.discountPriceCents,
          pricingBasis: sourcePkg.pricingBasis,
          isSamplePrice: sourcePkg.isSamplePrice,
          category: sourcePkg.category,
          difficulty: sourcePkg.difficulty,
          maxGroupSize: sourcePkg.maxGroupSize,
          overview: sourcePkg.overview,
          itinerary: sourcePkg.itinerary as any,
          includes: sourcePkg.includes,
          excludes: sourcePkg.excludes,
          transport: sourcePkg.transport,
          activities: sourcePkg.activities,
          heroImage: sourcePkg.heroImage,
          gallery: sourcePkg.gallery,
          isFeatured: false,
          isPublished: false, // Requirement: unpublished copy
          isArchived: false,
          cancellationPolicy: sourcePkg.cancellationPolicy,
          departureDates: sourcePkg.departureDates,
          seoTitle: sourcePkg.seoTitle,
          seoDescription: sourcePkg.seoDescription,
        },
      });

      // 2. Duplicate itinerary entries
      if (sourcePkg.itineraryEntries && sourcePkg.itineraryEntries.length > 0) {
        for (const entry of sourcePkg.itineraryEntries) {
          await tx.itineraryEntry.create({
            data: {
              packageId: pkg.id,
              dayNumber: entry.dayNumber,
              title: entry.title,
              description: entry.description,
              locations: entry.locations,
              activities: entry.activities,
              mealsIncluded: entry.mealsIncluded,
              accommodation: entry.accommodation,
              orderIndex: entry.orderIndex,
            },
          });
        }
      }

      // 3. Duplicate linked destinations
      if (sourcePkg.packageDestinations && sourcePkg.packageDestinations.length > 0) {
        for (const pd of sourcePkg.packageDestinations) {
          await tx.packageDestination.create({
            data: {
              packageId: pkg.id,
              destinationId: pd.destinationId,
              orderIndex: pd.orderIndex,
            },
          });
        }
      }

      // 4. Duplicate hotel assignments
      if (sourcePkg.hotels && sourcePkg.hotels.length > 0) {
        for (const h of sourcePkg.hotels) {
          await tx.tourPackageHotel.create({
            data: {
              packageId: pkg.id,
              hotelId: h.hotelId,
              stageName: h.stageName,
              nights: h.nights,
              orderIndex: h.orderIndex,
            },
          });
        }
      }

      return pkg;
    });

    const fullDuplicated = await prisma.tourPackage.findUnique({
      where: { id: duplicated.id },
      include: {
        destination: true,
        packageDestinations: { include: { destination: true } },
        itineraryEntries: { orderBy: { dayNumber: 'asc' } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Package duplicated successfully as draft',
      data: fullDuplicated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ADMIN: Delete or archive package.
 * Soft-deletes (archives) if referenced by existing bookings to preserve booking history.
 */
export async function deleteTourPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if package is referenced by any bookings or inquiries
    const inquiriesCount = await prisma.inquiry.count({
      where: { packageId: id },
    });

    if (inquiriesCount > 0) {
      // Soft delete: archive so existing bookings stay intact!
      const archived = await prisma.tourPackage.update({
        where: { id },
        data: { isArchived: true, isPublished: false },
      });
      return res.json({
        success: true,
        message: 'Package safely archived to preserve existing booking history',
        archived: true,
        data: archived,
      });
    }

    // Also soft-delete by default or hard-delete if no references exist
    await prisma.itineraryEntry.deleteMany({ where: { packageId: id } });
    await prisma.packageDestination.deleteMany({ where: { packageId: id } });
    await prisma.tourPackageHotel.deleteMany({ where: { packageId: id } });
    await prisma.tourPackage.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Package deleted successfully',
      archived: false,
    });
  } catch (err) {
    next(err);
  }
}
