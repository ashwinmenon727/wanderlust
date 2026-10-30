import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const testimonialSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  avatarUrl: z.string().url('Avatar must be a valid URL'),
  rating: z.number().int().min(1).max(5).default(5),
  reviewText: z.string().min(10, 'Review must be at least 10 characters'),
  tripTitle: z.string().min(3, 'Trip title is required'),
  tripDate: z.string().min(3, 'Trip date is required'),
  isFeatured: z.boolean().default(true),
  isApproved: z.boolean().default(true),
});

export async function getTestimonials(req: Request, res: Response, next: NextFunction) {
  try {
    const { featured } = req.query;
    const where: Record<string, unknown> = { isApproved: true };

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (err) {
    next(err);
  }
}

export async function createTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = testimonialSchema.parse(req.body);
    const item = await prisma.testimonial.create({
      data: validated,
    });
    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = testimonialSchema.partial().parse(req.body);
    const updated = await prisma.testimonial.update({
      where: { id },
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

export async function deleteTestimonial(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    return res.json({
      success: true,
      message: 'Testimonial deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
