import { Resend } from 'resend';
import { prisma } from '../prisma.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// HTML Escaping Utility to prevent HTML/XSS injection in email clients
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatMinorUnit(cents: number | null | undefined, currency = 'USD'): string {
  if (cents === null || cents === undefined) return 'N/A';
  const amount = (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${amount}`;
}

export interface InquiryWithFullDetails {
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  travelType: string;
  budget: string;
  accommodationPref: string;
  additionalRequirements?: string | null;
  preferredContact: string;
  status: string;
  totalPriceCents?: number | null;
  currency?: string;
  amountPaidCents?: number;
  balanceCents?: number | null;
  paymentStatus?: string;
  paymentDueDate?: string | null;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  customerInstructions?: string | null;
  createdAt: Date;
  destination?: { name: string; country: string } | null;
  package?: {
    title: string;
    durationDays: number;
    durationNights: number;
    priceCents: number;
    overview: string;
    itinerary?: any;
    includes: string[];
    excludes: string[];
  } | null;
  accommodationAllocations?: Array<{
    hotel: {
      name: string;
      address: string;
      contactPhone?: string | null;
      contactEmail?: string | null;
      amenities: string[];
    };
    roomType: {
      name: string;
      bedConfiguration: string;
      amenities: string[];
    };
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    roomCount: number;
    occupancyPerRoom: number;
    mealPlan: string;
    specialRequests?: string | null;
    status: string;
    supplierConfirmationRef?: string | null;
    priceCents: number;
  }>;
  transportAllocations?: Array<{
    transportType: string;
    pickupLocation: string;
    pickupDateTime: string;
    dropoffLocation: string;
    flightNumber?: string | null;
    provider?: string | null;
    meetingInstructions?: string | null;
    status: string;
  }>;
}

// 1. Inquiry Received Acknowledgment (Customer & Admin)
export async function sendInquiryReceivedNotification(inquiry: InquiryWithFullDetails): Promise<void> {
  const adminEmail = env.ADMIN_NOTIFICATION_EMAIL;
  const customerEmail = inquiry.email;
  const dashboardLink = `${env.CORS_ORIGIN}/admin/inquiries?search=${encodeURIComponent(inquiry.reference)}`;

  const safeCustomerName = escapeHtml(inquiry.customerName);
  const safeReference = escapeHtml(inquiry.reference);
  const safeDestination = inquiry.destination ? `${escapeHtml(inquiry.destination.name)}, ${escapeHtml(inquiry.destination.country)}` : 'Custom / Unspecified';
  const safePackage = inquiry.package ? escapeHtml(inquiry.package.title) : 'Custom Bespoke Itinerary';
  const safeDates = `${escapeHtml(inquiry.departureDate)} to ${escapeHtml(inquiry.returnDate)}`;
  const safeParty = `${inquiry.adults} Adults${inquiry.children > 0 ? `, ${inquiry.children} Children` : ''}`;
  const safeAccommodation = escapeHtml(inquiry.accommodationPref);
  const safeNotes = escapeHtml(inquiry.additionalRequirements || 'None specified');

  // Customer Acknowledgment
  const customerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Travel Inquiry Acknowledgment</title>
      <style>
        body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; }
        .container { max-width: 640px; margin: 30px auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
        .header { background: #0A192F; padding: 32px 24px; text-align: center; }
        .brand-title { color: #F8FAFC; font-size: 26px; font-weight: 700; letter-spacing: 2px; margin: 0; text-transform: uppercase; }
        .brand-tag { color: #F59E0B; font-size: 11px; letter-spacing: 3px; margin-top: 6px; text-transform: uppercase; font-weight: 600; }
        .body { padding: 36px 32px; line-height: 1.6; }
        .greeting { font-size: 20px; font-weight: 700; color: #0A192F; margin-top: 0; }
        .disclaimer-box { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }
        .disclaimer-title { color: #B45309; font-weight: 700; margin: 0 0 4px; font-size: 14px; text-transform: uppercase; }
        .disclaimer-text { color: #92400E; margin: 0; font-size: 14px; line-height: 1.5; }
        .summary-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin: 24px 0; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EDF2F7; font-size: 14px; }
        .summary-row:last-child { border-bottom: none; }
        .label { color: #64748B; font-weight: 600; }
        .value { color: #0F172A; font-weight: 500; text-align: right; }
        .steps-box { margin: 28px 0; }
        .step-item { margin-bottom: 14px; padding-left: 8px; }
        .footer { background: #0A192F; padding: 24px 32px; color: #94A3B8; font-size: 12px; text-align: center; line-height: 1.6; }
        .footer a { color: #2DD4BF; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-title">WANDERLUST</h1>
          <div class="brand-tag">Luxury Travel Concierge</div>
        </div>
        <div class="body">
          <h2 class="greeting">Dear ${safeCustomerName},</h2>
          <p>Thank you for contacting Wanderlust Luxury Travel. We have received your journey inquiry, and our destination concierge team is actively reviewing your requirements.</p>
          
          <div class="disclaimer-box">
            <div class="disclaimer-title">Important Notice: Inquiry Acknowledgment Only</div>
            <p class="disclaimer-text">
              Please note that this message is an official acknowledgment of receipt, <strong>not a confirmed booking</strong>. No accommodation, private flights, transport, or bespoke services have been reserved or charged. All arrangements remain provisional and subject to mutual final agreement.
            </p>
          </div>

          <div class="summary-card">
            <h3 style="margin: 0 0 12px; color: #0D9488; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Requested Journey Details</h3>
            <div class="summary-row"><span class="label">Inquiry Reference:</span><span class="value" style="font-family: monospace; font-weight: bold; color: #0D9488;">${safeReference}</span></div>
            <div class="summary-row"><span class="label">Destination:</span><span class="value">${safeDestination}</span></div>
            <div class="summary-row"><span class="label">Tour Package:</span><span class="value">${safePackage}</span></div>
            <div class="summary-row"><span class="label">Requested Dates:</span><span class="value">${safeDates}</span></div>
            <div class="summary-row"><span class="label">Travelers:</span><span class="value">${safeParty}</span></div>
            <div class="summary-row"><span class="label">Accommodation Style:</span><span class="value">${safeAccommodation}</span></div>
            ${inquiry.additionalRequirements ? `<div class="summary-row"><span class="label">Special Notes:</span><span class="value">${safeNotes}</span></div>` : ''}
          </div>

          <div class="steps-box">
            <h3 style="color: #0A192F; font-size: 16px; margin-bottom: 12px;">What Happens Next?</h3>
            <div class="step-item"><strong>1. Expert Review:</strong> A dedicated private destination specialist reviews preferred property availability and local guides.</div>
            <div class="step-item"><strong>2. Tailored Quotation:</strong> Within 24 business hours, we will deliver an initial tailored itinerary with clear itemized pricing.</div>
            <div class="step-item"><strong>3. Consultation & Confirmation:</strong> We refine all elements to perfection prior to securing your formal booking.</div>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #475569;">
            If you have immediate questions, contact our concierge desk directly at <a href="mailto:concierge@wanderlust-travel.com" style="color: #0D9488;">concierge@wanderlust-travel.com</a> or phone <strong>+1 (800) 555-WNDR</strong>.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Wanderlust Luxury Travel Inc. All rights reserved.</p>
          <p>Confidential & Proprietary. Sent to ${escapeHtml(customerEmail)}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const customerText = `
WANDERLUST LUXURY TRAVEL - INQUIRY ACKNOWLEDGMENT
Reference: ${inquiry.reference}

Dear ${inquiry.customerName},

Thank you for your inquiry with Wanderlust Luxury Travel. We have received your request and our specialist concierge team is reviewing it.

IMPORTANT NOTICE:
This is an acknowledgment of receipt only, NOT a confirmed booking. No accommodation, flights, or services have been reserved or charged.

REQUESTED DETAILS:
- Reference: ${inquiry.reference}
- Destination: ${inquiry.destination ? `${inquiry.destination.name}, ${inquiry.destination.country}` : 'Custom'}
- Package: ${inquiry.package ? inquiry.package.title : 'Bespoke Private Itinerary'}
- Dates: ${inquiry.departureDate} to ${inquiry.returnDate}
- Travelers: ${inquiry.adults} Adults${inquiry.children > 0 ? `, ${inquiry.children} Children` : ''}
- Accommodation: ${inquiry.accommodationPref}
${inquiry.additionalRequirements ? `- Special Notes: ${inquiry.additionalRequirements}\n` : ''}
NEXT STEPS:
1. Destination Expert Review
2. Tailored Quotation delivered within 24 business hours via ${inquiry.preferredContact.toLowerCase()}
3. Final refinement & formal confirmation upon agreement

Assistance: concierge@wanderlust-travel.com | +1 (800) 555-WNDR
  `.trim();

  // Enqueue customer email
  await dispatchEmailWithLog({
    inquiryId: inquiry.id,
    bookingReference: inquiry.reference,
    recipientEmail: customerEmail,
    recipientType: 'CUSTOMER',
    templateName: 'customer_inquiry_received',
    notificationType: 'INQUIRY_RECEIVED',
    idempotencyKey: `inquiry-received-${inquiry.id}`,
    subject: `[Received] Journey Inquiry ${inquiry.reference} - Wanderlust Luxury Travel`,
    html: customerHtml,
    text: customerText,
  });

  // Admin Notification
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; background: #0A192F; color: #FFFFFF; padding: 24px; border-radius: 8px;">
      <h2 style="color: #F59E0B; margin-top: 0;">New Luxury Inquiry: ${safeReference}</h2>
      <p><strong>Customer:</strong> ${safeCustomerName} (${escapeHtml(inquiry.email)})</p>
      <p><strong>Destination:</strong> ${safeDestination}</p>
      <p><strong>Package:</strong> ${safePackage}</p>
      <p><strong>Dates:</strong> ${safeDates}</p>
      <p><strong>Party:</strong> ${safeParty}</p>
      <div style="margin-top: 20px;">
        <a href="${dashboardLink}" style="background: #0D9488; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Open in Admin Dashboard</a>
      </div>
    </div>
  `;

  await dispatchEmailWithLog({
    inquiryId: inquiry.id,
    bookingReference: inquiry.reference,
    recipientEmail: adminEmail,
    recipientType: 'ADMIN',
    templateName: 'admin_inquiry_alert',
    notificationType: 'INQUIRY_RECEIVED',
    idempotencyKey: `admin-inquiry-alert-${inquiry.id}`,
    subject: `🚨 [New Inquiry] ${inquiry.reference} - ${inquiry.customerName}`,
    html: adminHtml,
    text: `New Inquiry: ${inquiry.reference} by ${inquiry.customerName} (${inquiry.email}). Destination: ${safeDestination}. Dashboard: ${dashboardLink}`,
  });
}

// 2. Booking Confirmed Notification (Admin Confirmation Only!)
export async function sendBookingConfirmedNotification(booking: InquiryWithFullDetails): Promise<void> {
  const customerEmail = booking.email;
  const safeCustomerName = escapeHtml(booking.customerName);
  const safeReference = escapeHtml(booking.reference);
  const safeDestination = booking.destination ? `${escapeHtml(booking.destination.name)}, ${escapeHtml(booking.destination.country)}` : 'Bespoke Destination';
  const safePackage = booking.package ? escapeHtml(booking.package.title) : 'Bespoke Luxury Voyage';
  const safeDates = `${escapeHtml(booking.departureDate)} to ${escapeHtml(booking.returnDate)}`;
  const confirmedDateStr = booking.confirmedAt ? new Date(booking.confirmedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US');

  // Accommodation segments HTML
  let accommodationsHtml = '';
  let accommodationsText = '';
  const totalRooms = booking.accommodationAllocations?.reduce((acc, curr) => acc + curr.roomCount, 0) || 1;

  if (booking.accommodationAllocations && booking.accommodationAllocations.length > 0) {
    booking.accommodationAllocations.forEach((acc, index) => {
      const hotel = acc.hotel;
      const room = acc.roomType;
      const supplierRefText = acc.supplierConfirmationRef ? escapeHtml(acc.supplierConfirmationRef) : 'Pending Confirmation';

      accommodationsHtml += `
        <div style="background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; padding: 18px; margin-bottom: 16px; border-left: 4px solid #0D9488;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h4 style="margin: 0; color: #0A192F; font-size: 16px;">Segment ${index + 1}: ${escapeHtml(hotel.name)}</h4>
            <span style="font-size: 12px; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: ${acc.status === 'CONFIRMED' ? '#DCFCE7; color: #166534;' : '#FEF3C7; color: #92400E;'}">
              ${acc.status}
            </span>
          </div>
          <p style="margin: 4px 0 10px; color: #64748B; font-size: 13px;">${escapeHtml(hotel.address)}</p>
          ${hotel.contactPhone ? `<p style="margin: 2px 0; font-size: 13px; color: #475569;"><strong>Hotel Contact:</strong> ${escapeHtml(hotel.contactPhone)}</p>` : ''}
          
          <div style="background: #F8FAFC; padding: 12px; border-radius: 4px; margin-top: 10px; font-size: 13px; line-height: 1.6;">
            <div><strong>Room Type:</strong> ${escapeHtml(room.name)} (${escapeHtml(room.bedConfiguration)})</div>
            <div><strong>Rooms & Occupancy:</strong> ${acc.roomCount} room(s), ${acc.occupancyPerRoom} guest(s) per room</div>
            <div><strong>Check-In / Out:</strong> ${escapeHtml(acc.checkInDate)} to ${escapeHtml(acc.checkOutDate)} (${acc.nights} nights)</div>
            <div><strong>Meal Plan:</strong> ${escapeHtml(acc.mealPlan.replace(/_/g, ' '))}</div>
            <div><strong>Supplier Ref:</strong> <span style="font-family: monospace;">${supplierRefText}</span></div>
            ${acc.specialRequests ? `<div><strong>Special Requests:</strong> ${escapeHtml(acc.specialRequests)}</div>` : ''}
            ${room.amenities && room.amenities.length > 0 ? `<div><strong>Room Amenities:</strong> ${room.amenities.map(a => escapeHtml(a)).join(', ')}</div>` : ''}
          </div>
        </div>
      `;

      accommodationsText += `
SEGMENT ${index + 1}: ${hotel.name} [Status: ${acc.status}]
Address: ${hotel.address}
${hotel.contactPhone ? `Contact: ${hotel.contactPhone}\n` : ''}- Room Type: ${room.name} (${room.bedConfiguration})
- Stay: ${acc.checkInDate} to ${acc.checkOutDate} (${acc.nights} nights)
- Quantity: ${acc.roomCount} room(s), ${acc.occupancyPerRoom} guests/room
- Meal Plan: ${acc.mealPlan.replace(/_/g, ' ')}
- Supplier Ref: ${acc.supplierConfirmationRef || 'Pending Confirmation'}
${acc.specialRequests ? `- Requests: ${acc.specialRequests}\n` : ''}
      `;
    });
  } else {
    accommodationsHtml = '<p style="color: #64748B; font-style: italic;">No specific hotel segments recorded.</p>';
    accommodationsText = 'No specific hotel segments recorded.\n';
  }

  // Transport details HTML
  let transportHtml = '';
  let transportText = '';
  if (booking.transportAllocations && booking.transportAllocations.length > 0) {
    booking.transportAllocations.forEach((tr, index) => {
      transportHtml += `
        <div style="background: #F1F5F9; border-radius: 6px; padding: 14px; margin-bottom: 12px; font-size: 13px;">
          <div><strong>Transfer ${index + 1} (${escapeHtml(tr.transportType)}):</strong> [${tr.status}]</div>
          <div>Pickup: ${escapeHtml(tr.pickupLocation)} at ${escapeHtml(tr.pickupDateTime)}</div>
          <div>Drop-off: ${escapeHtml(tr.dropoffLocation)}</div>
          ${tr.flightNumber ? `<div>Flight Number: <strong>${escapeHtml(tr.flightNumber)}</strong></div>` : ''}
          ${tr.provider ? `<div>Provider: ${escapeHtml(tr.provider)}</div>` : ''}
          ${tr.meetingInstructions ? `<div>Meeting Instructions: ${escapeHtml(tr.meetingInstructions)}</div>` : ''}
        </div>
      `;
      transportText += `
TRANSFER ${index + 1}: ${tr.transportType} [${tr.status}]
- Pickup: ${tr.pickupLocation} at ${tr.pickupDateTime}
- Drop-off: ${tr.dropoffLocation}
${tr.flightNumber ? `- Flight: ${tr.flightNumber}\n` : ''}${tr.provider ? `- Provider: ${tr.provider}\n` : ''}${tr.meetingInstructions ? `- Instructions: ${tr.meetingInstructions}\n` : ''}
      `;
    });
  }

  // Verified Payment summary from stored records only
  const currency = booking.currency || 'USD';
  const totalFormatted = formatMinorUnit(booking.totalPriceCents, currency);
  const paidFormatted = formatMinorUnit(booking.amountPaidCents || 0, currency);
  const balanceCents = (booking.totalPriceCents || 0) - (booking.amountPaidCents || 0);
  const balanceFormatted = formatMinorUnit(balanceCents, currency);

  const paymentHtml = `
    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <h4 style="margin: 0 0 12px; color: #0A192F; font-size: 14px; text-transform: uppercase;">Verified Payment Summary</h4>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
        <span style="color: #64748B;">Total Agreed Price:</span>
        <strong style="color: #0A192F;">${totalFormatted}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px;">
        <span style="color: #64748B;">Recorded Amount Paid:</span>
        <strong style="color: #166534;">${paidFormatted}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; border-top: 1px solid #CBD5E1; margin-top: 6px; padding-top: 6px;">
        <span style="color: #64748B;">Outstanding Balance:</span>
        <strong style="color: #B45309;">${balanceFormatted}</strong>
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #64748B;">
        Status: <strong style="color: #0A192F;">${escapeHtml(booking.paymentStatus || 'PENDING')}</strong>
        ${booking.paymentDueDate ? ` | Due Date: <strong>${escapeHtml(booking.paymentDueDate)}</strong>` : ''}
      </div>
    </div>
  `;

  const paymentText = `
VERIFIED PAYMENT STATUS:
- Total Price: ${totalFormatted}
- Amount Paid: ${paidFormatted}
- Outstanding Balance: ${balanceFormatted}
- Payment Status: ${booking.paymentStatus || 'PENDING'}
${booking.paymentDueDate ? `- Due Date: ${booking.paymentDueDate}\n` : ''}
  `;

  // Itinerary and Inclusions HTML
  let itineraryHtml = '';
  let itineraryText = '';
  if (booking.package?.itinerary && Array.isArray(booking.package.itinerary)) {
    itineraryHtml = `
      <div style="margin: 20px 0;">
        <h4 style="color: #0A192F; margin-bottom: 8px; text-transform: uppercase; font-size: 14px;">Itinerary Overview</h4>
        <div style="font-size: 13px; line-height: 1.6; color: #334155;">
          ${booking.package.itinerary.map((day: any) => `
            <div style="margin-bottom: 8px;">
              <strong>Day ${day.day}: ${escapeHtml(day.title)}</strong> - ${escapeHtml(day.description)}
            </div>
          `).join('')}
        </div>
      </div>
    `;
    itineraryText = '\nITINERARY OVERVIEW:\n' + booking.package.itinerary.map((d: any) => `Day ${d.day}: ${d.title}\n${d.description}`).join('\n\n') + '\n';
  }

  let inclusionsHtml = '';
  if (booking.package?.includes && booking.package.includes.length > 0) {
    inclusionsHtml = `
      <div style="margin: 16px 0; font-size: 13px; line-height: 1.5;">
        <strong style="color: #0D9488;">Package Inclusions:</strong>
        <ul style="margin: 6px 0 0; padding-left: 20px; color: #334155;">
          ${booking.package.includes.map(inc => `<li>${escapeHtml(inc)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  let instructionsHtml = '';
  if (booking.customerInstructions) {
    instructionsHtml = `
      <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 14px; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #1E3A8A;">
        <strong>Traveler Instructions & Concierge Notes:</strong>
        <p style="margin: 4px 0 0;">${escapeHtml(booking.customerInstructions)}</p>
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - ${safeReference}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; }
        .container { max-width: 660px; margin: 30px auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; }
        .header { background: #0A192F; padding: 32px 24px; text-align: center; }
        .brand-title { color: #F8FAFC; font-size: 26px; font-weight: 700; letter-spacing: 2px; margin: 0; }
        .brand-tag { color: #F59E0B; font-size: 11px; letter-spacing: 3px; margin-top: 6px; text-transform: uppercase; font-weight: 600; }
        .body { padding: 36px 32px; line-height: 1.6; }
        .badge { background: #DCFCE7; color: #166534; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; }
        .footer { background: #0A192F; padding: 24px 32px; color: #94A3B8; font-size: 12px; text-align: center; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-title">WANDERLUST</h1>
          <div class="brand-tag">Luxury Travel Concierge</div>
        </div>
        <div class="body">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <span class="badge">Booking Confirmed</span>
            <span style="font-size: 13px; color: #64748B;">Date: ${confirmedDateStr}</span>
          </div>

          <h2 style="color: #0A192F; margin-top: 0; font-size: 22px;">Dear ${safeCustomerName},</h2>
          <p style="color: #334155;">We are delighted to formally confirm your luxury journey with Wanderlust. All accommodations, requested transfers, and private arrangements have been verified as detailed below.</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Booking Reference:</span>
              <strong style="font-family: monospace; font-size: 15px; color: #0D9488;">${safeReference}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Destination:</span>
              <strong>${safeDestination}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Tour Package:</span>
              <strong>${safePackage}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Travel Dates:</span>
              <strong>${safeDates}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Party & Rooms:</span>
              <strong>${booking.adults} Adults${booking.children > 0 ? `, ${booking.children} Children` : ''} (${totalRooms} total rooms)</strong>
            </div>
          </div>

          <h3 style="color: #0A192F; font-size: 16px; margin: 28px 0 12px; text-transform: uppercase;">Confirmed Accommodations</h3>
          ${accommodationsHtml}

          ${transportHtml ? `
            <h3 style="color: #0A192F; font-size: 16px; margin: 28px 0 12px; text-transform: uppercase;">Transfers & Transport</h3>
            ${transportHtml}
          ` : ''}

          ${paymentHtml}

          ${instructionsHtml}

          ${itineraryHtml}

          ${inclusionsHtml}

          <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 32px; font-size: 13px; color: #64748B;">
            <p><strong>Emergency 24/7 Client Desk:</strong> concierge@wanderlust-travel.com | +1 (800) 555-WNDR</p>
            <p>Please review all details carefully. We look forward to creating an unforgettable journey.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Wanderlust Luxury Travel Inc. All rights reserved.</p>
          <p>Confidential & Proprietary. Sent to ${escapeHtml(customerEmail)}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
WANDERLUST LUXURY TRAVEL - OFFICIAL BOOKING CONFIRMATION
Booking Reference: ${booking.reference}
Confirmation Date: ${confirmedDateStr}

Dear ${booking.customerName},

We are thrilled to confirm your journey with Wanderlust.

BOOKING SUMMARY:
- Reference: ${booking.reference}
- Destination: ${safeDestination}
- Package: ${safePackage}
- Dates: ${booking.departureDate} to ${booking.returnDate}
- Guests: ${booking.adults} Adults${booking.children > 0 ? `, ${booking.children} Children` : ''}
- Total Rooms: ${totalRooms}

ACCOMMODATIONS:
${accommodationsText}

${transportText ? `TRANSFERS & TRANSPORT:\n${transportText}\n` : ''}
${paymentText}
${booking.customerInstructions ? `TRAVELER INSTRUCTIONS:\n${booking.customerInstructions}\n\n` : ''}
${itineraryText}
24/7 CONCIERGE DESK:
concierge@wanderlust-travel.com | +1 (800) 555-WNDR
  `.trim();

  await dispatchEmailWithLog({
    inquiryId: booking.id,
    bookingReference: booking.reference,
    recipientEmail: customerEmail,
    recipientType: 'CUSTOMER',
    templateName: 'booking_confirmed',
    notificationType: 'BOOKING_CONFIRMED',
    idempotencyKey: `booking-confirmed-${booking.id}-${booking.confirmedAt?.getTime() || Date.now()}`,
    subject: `🌟 Booking Confirmed: ${booking.reference} - Wanderlust Luxury Travel`,
    html,
    text,
  });
}

// 3. Configurable Updates: Accommodation Updated
export async function sendAccommodationUpdatedNotification(booking: InquiryWithFullDetails, note?: string): Promise<void> {
  const customerEmail = booking.email;
  const safeReference = escapeHtml(booking.reference);
  const safeCustomerName = escapeHtml(booking.customerName);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <h2 style="color: #0A192F;">Accommodation Schedule Updated: ${safeReference}</h2>
      <p>Dear ${safeCustomerName},</p>
      <p>Your accommodation itinerary has been updated by your concierge.</p>
      ${note ? `<div style="background: #F1F5F9; padding: 12px; border-left: 4px solid #0D9488; margin: 16px 0;"><strong>Update Note:</strong> ${escapeHtml(note)}</div>` : ''}
      <p>Please contact concierge@wanderlust-travel.com for any questions.</p>
    </div>
  `;

  await dispatchEmailWithLog({
    inquiryId: booking.id,
    bookingReference: booking.reference,
    recipientEmail: customerEmail,
    recipientType: 'CUSTOMER',
    templateName: 'accommodation_updated',
    notificationType: 'ACCOMMODATION_UPDATED',
    idempotencyKey: `acc-updated-${booking.id}-${Date.now()}`,
    subject: `🛎️ Accommodation Schedule Updated (${booking.reference}) - Wanderlust`,
    html,
    text: `Accommodation itinerary updated for booking ${booking.reference}.\n${note ? `Note: ${note}\n` : ''}Contact concierge@wanderlust-travel.com.`,
  });
}

// 4. Configurable Updates: Booking Cancelled
export async function sendBookingCancelledNotification(booking: InquiryWithFullDetails, reason?: string): Promise<void> {
  const customerEmail = booking.email;
  const safeReference = escapeHtml(booking.reference);
  const safeCustomerName = escapeHtml(booking.customerName);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <h2 style="color: #B91C1C;">Booking Cancellation Notice: ${safeReference}</h2>
      <p>Dear ${safeCustomerName},</p>
      <p>This email confirms that booking reference <strong>${safeReference}</strong> has been cancelled in accordance with our cancellation terms.</p>
      ${reason ? `<div style="background: #FEF2F2; padding: 12px; border-left: 4px solid #EF4444; margin: 16px 0;"><strong>Reason:</strong> ${escapeHtml(reason)}</div>` : ''}
      <p>Our finance team will process any applicable refunds according to the package cancellation policy.</p>
    </div>
  `;

  await dispatchEmailWithLog({
    inquiryId: booking.id,
    bookingReference: booking.reference,
    recipientEmail: customerEmail,
    recipientType: 'CUSTOMER',
    templateName: 'booking_cancelled',
    notificationType: 'BOOKING_CANCELLED',
    idempotencyKey: `booking-cancelled-${booking.id}`,
    subject: `Notice: Booking Cancelled (${booking.reference}) - Wanderlust`,
    html,
    text: `Notice: Booking ${booking.reference} has been cancelled.\n${reason ? `Reason: ${reason}\n` : ''}`,
  });
}

// 5. Configurable Updates: Payment Reminder
export async function sendPaymentReminderNotification(booking: InquiryWithFullDetails): Promise<void> {
  const customerEmail = booking.email;
  const safeReference = escapeHtml(booking.reference);
  const safeCustomerName = escapeHtml(booking.customerName);
  const currency = booking.currency || 'USD';
  const balanceFormatted = formatMinorUnit(booking.balanceCents, currency);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <h2 style="color: #0A192F;">Payment Reminder: Booking ${safeReference}</h2>
      <p>Dear ${safeCustomerName},</p>
      <p>This is a friendly reminder that an outstanding balance of <strong>${balanceFormatted}</strong> is due for your upcoming voyage.</p>
      ${booking.paymentDueDate ? `<p><strong>Due Date:</strong> ${escapeHtml(booking.paymentDueDate)}</p>` : ''}
      <p>To settle your balance securely or review your payment terms, please reach out to our concierge team.</p>
    </div>
  `;

  await dispatchEmailWithLog({
    inquiryId: booking.id,
    bookingReference: booking.reference,
    recipientEmail: customerEmail,
    recipientType: 'CUSTOMER',
    templateName: 'payment_reminder',
    notificationType: 'REMINDER_PAYMENT_DUE',
    idempotencyKey: `payment-reminder-${booking.id}-${Date.now()}`,
    subject: `💳 Payment Reminder: Outstanding Balance (${booking.reference}) - Wanderlust`,
    html,
    text: `Payment Reminder for booking ${booking.reference}. Outstanding Balance: ${balanceFormatted}. Due Date: ${booking.paymentDueDate || 'As agreed'}.`,
  });
}

// 6. Pre-Trip Reminder
export async function sendPreTripReminderNotification(booking: InquiryWithFullDetails): Promise<void> {
  const customerEmail = booking.email;
  const safeReference = escapeHtml(booking.reference);
  const safeCustomerName = escapeHtml(booking.customerName);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 8px;">
      <h2 style="color: #0A192F;">Your Journey Begins Soon: ${safeReference}</h2>
      <p>Dear ${safeCustomerName},</p>
      <p>Your upcoming voyage is approaching! Please ensure your passports are valid for at least six months from departure date.</p>
      <p>Your private chauffeur and guides have been briefed. If you need special dining reservations, please contact us.</p>
    </div>
  `;

  await dispatchEmailWithLog({
    inquiryId: booking.id,
    bookingReference: booking.reference,
    recipientEmail: customerEmail,
    recipientType: 'CUSTOMER',
    templateName: 'pre_trip_reminder',
    notificationType: 'REMINDER_PRE_TRIP',
    idempotencyKey: `pre-trip-${booking.id}-${Date.now()}`,
    subject: `✈️ Your Journey Awaits: Departure Notice (${booking.reference}) - Wanderlust`,
    html,
    text: `Your journey ${booking.reference} begins soon! Please verify travel documents and contact concierge@wanderlust-travel.com for final requests.`,
  });
}

// Email Dispatch and Outbox Reliability Engine
export interface DispatchOptions {
  inquiryId: string;
  bookingReference?: string;
  recipientEmail: string;
  recipientType: 'ADMIN' | 'CUSTOMER';
  templateName: string;
  notificationType: string;
  idempotencyKey?: string;
  subject: string;
  html: string;
  text?: string;
  existingLogId?: string;
}

export async function dispatchEmailWithLog(options: DispatchOptions): Promise<void> {
  const {
    inquiryId,
    bookingReference,
    recipientEmail,
    recipientType,
    templateName,
    notificationType,
    idempotencyKey,
    subject,
    html,
    text,
    existingLogId,
  } = options;

  let logRecord;
  if (existingLogId) {
    logRecord = await prisma.emailNotificationLog.findUnique({ where: { id: existingLogId } });
  } else if (idempotencyKey) {
    const existingLog = await prisma.emailNotificationLog.findUnique({
      where: { idempotencyKey },
    });
    if (existingLog) {
      if (existingLog.status === 'SENT' || existingLog.status === 'ACCEPTED') {
        logger.info(`Duplicate email dispatch blocked by idempotency key: ${idempotencyKey}`);
        return;
      }
      logRecord = existingLog;
    }
  }

  if (!logRecord) {
    logRecord = await prisma.emailNotificationLog.create({
      data: {
        inquiryId,
        bookingReference,
        recipientEmail,
        recipientType,
        templateName,
        notificationType,
        idempotencyKey,
        htmlContent: html,
        textContent: text || '',
        status: 'PENDING',
        attempts: 1,
        lastAttemptAt: new Date(),
      },
    });
  } else {
    logRecord = await prisma.emailNotificationLog.update({
      where: { id: logRecord.id },
      data: {
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
      },
    });
  }

  try {
    if (resend) {
      const response = await resend.emails.send({
        from: env.FROM_EMAIL,
        to: recipientEmail,
        subject,
        html,
        text,
        headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      await prisma.emailNotificationLog.update({
        where: { id: logRecord.id },
        data: {
          status: 'ACCEPTED',
          deliveredAt: new Date(),
          sentAt: new Date(),
          lastError: null,
        },
      });

      logger.info(`Transactional email accepted by Resend provider: ${recipientEmail} [${notificationType}] Log: ${logRecord.id}`);
    } else {
      // In development / demo when live Resend credentials are not configured:
      logger.info(`[Email Outbox Simulation] Message accepted for dispatch: ${templateName} to ${recipientEmail}`);
      await prisma.emailNotificationLog.update({
        where: { id: logRecord.id },
        data: {
          status: 'ACCEPTED',
          sentAt: new Date(),
          deliveredAt: new Date(),
          lastError: null,
        },
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown email sending failure';
    logger.error(`Failed to dispatch email to ${recipientEmail}:`, err);

    await prisma.emailNotificationLog.update({
      where: { id: logRecord.id },
      data: {
        status: 'FAILED',
        lastError: errorMsg,
      },
    });
  }
}

// Safe Manual Retry from Admin Dashboard
export async function retryEmailLog(logId: string) {
  const log = await prisma.emailNotificationLog.findUnique({
    where: { id: logId },
    include: {
      inquiry: {
        include: {
          destination: true,
          package: true,
          accommodationAllocations: { include: { hotel: true, roomType: true } },
          transportAllocations: true,
        },
      },
    },
  });

  if (!log) {
    throw new Error('Email notification log not found');
  }

  if (!log.inquiry) {
    throw new Error('Associated inquiry record not found');
  }

  const inquiry = log.inquiry as unknown as InquiryWithFullDetails;

  if (log.notificationType === 'BOOKING_CONFIRMED') {
    await sendBookingConfirmedNotification(inquiry);
  } else if (log.notificationType === 'INQUIRY_RECEIVED') {
    await sendInquiryReceivedNotification(inquiry);
  } else {
    // Retry using saved HTML and Text content
    await dispatchEmailWithLog({
      inquiryId: log.inquiryId,
      bookingReference: log.bookingReference || undefined,
      recipientEmail: log.recipientEmail,
      recipientType: log.recipientType as 'ADMIN' | 'CUSTOMER',
      templateName: log.templateName,
      notificationType: log.notificationType,
      subject: `[Retry] Notification for ${inquiry.reference}`,
      html: log.htmlContent || `<p>Retry notification for ${inquiry.reference}</p>`,
      text: log.textContent || `Retry notification for ${inquiry.reference}`,
      existingLogId: log.id,
    });
  }

  return await prisma.emailNotificationLog.findUnique({ where: { id: logId } });
}
