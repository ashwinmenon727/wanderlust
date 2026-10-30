import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { stringify } from 'csv-stringify';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { retryEmailLog } from '../services/emailService.js';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    return res.json({
      success: true,
      admin: req.admin,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const [totalInquiries, pendingInquiries, confirmedInquiries, totalDestinations, totalPackages, totalHotels, recentInquiries] =
      await Promise.all([
        prisma.inquiry.count(),
        prisma.inquiry.count({ where: { status: { in: ['NEW_INQUIRY', 'AWAITING_REVIEW', 'QUOTATION_SENT', 'AWAITING_CUSTOMER_APPROVAL', 'AWAITING_PAYMENT', 'PENDING', 'IN_REVIEW'] } } }),
        prisma.inquiry.count({ where: { status: 'CONFIRMED' } }),
        prisma.destination.count({ where: { isArchived: false } }),
        prisma.tourPackage.count({ where: { isArchived: false } }),
        prisma.hotel.count({ where: { isArchived: false } }),
        prisma.inquiry.findMany({
          take: 7,
          orderBy: { createdAt: 'desc' },
          include: {
            destination: { select: { name: true, country: true } },
            package: { select: { title: true, priceCents: true, price: true } },
            accommodationAllocations: { include: { hotel: true, roomType: true } },
            transportAllocations: true,
            notificationLogs: true,
          },
        }),
      ]);

    const estimatedRevenueInterestCents = recentInquiries.reduce((acc, curr) => {
      return acc + (curr.totalPriceCents || (curr.package?.priceCents || 0) * (curr.adults || 1));
    }, 0);

    return res.json({
      success: true,
      stats: {
        totalInquiries,
        pendingInquiries,
        confirmedInquiries,
        totalDestinations,
        totalPackages,
        totalHotels,
        estimatedRevenueInterestCents,
        recentInquiries,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getInquiries(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, search, page = '1', limit = '15', travelType } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const take = Math.min(100, Math.max(1, parseInt(String(limit), 10)));
    const skip = (pageNum - 1) * take;

    const where: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    if (travelType && travelType !== 'ALL') {
      where.travelType = String(travelType);
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, inquiries] = await Promise.all([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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
          notificationLogs: {
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
      data: inquiries,
    });
  } catch (err) {
    next(err);
  }
}

const updateInquirySchema = z.object({
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
    'PENDING',
    'CONTACTED',
    'IN_REVIEW',
    'QUOTED',
  ]).optional(),
  internalNotes: z.string().nullable().optional(),
  followUpDate: z.string().nullable().optional(),
});

export async function updateInquiry(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateInquirySchema.parse(req.body);

    const updated = await prisma.inquiry.update({
      where: { id },
      data: validated,
      include: {
        destination: true,
        package: true,
        notificationLogs: true,
      },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function exportInquiriesCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        destination: true,
        package: true,
      },
    });

    const rows = inquiries.map((i) => ({
      Reference: i.reference,
      CustomerName: i.customerName,
      Email: i.email,
      Phone: i.phone,
      Destination: i.destination ? `${i.destination.name}, ${i.destination.country}` : 'Custom',
      Package: i.package ? i.package.title : 'Custom',
      DepartureDate: i.departureDate,
      ReturnDate: i.returnDate,
      Adults: i.adults,
      Children: i.children,
      TravelType: i.travelType,
      Budget: i.budget,
      Accommodation: i.accommodationPref,
      PreferredContact: i.preferredContact,
      Status: i.status,
      FollowUpDate: i.followUpDate || '',
      Notes: i.internalNotes || '',
      CreatedAt: i.createdAt.toISOString(),
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="wanderlust-inquiries-${Date.now()}.csv"`);

    stringify(rows, { header: true }).pipe(res);
  } catch (err) {
    next(err);
  }
}

export async function retryNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { logId } = req.params;
    const result = await retryEmailLog(logId);
    return res.json({
      success: true,
      message: 'Email notification retry initiated',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getEmailLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const logs = await prisma.emailNotificationLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        inquiry: {
          select: { reference: true, customerName: true },
        },
      },
    });

    return res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
}
