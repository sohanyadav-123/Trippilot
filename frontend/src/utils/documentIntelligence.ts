import { DocumentCheckItem } from '../types';

export interface DocumentContext {
  destination: string;
  isInternational: boolean;
  hasFlightBooking?: boolean;
  hasHotelBooking?: boolean;
  hasTransportBooking?: boolean;
  hasActivityBooking?: boolean;
}

export function generateSmartDocumentChecklist(ctx: DocumentContext): DocumentCheckItem[] {
  const items: DocumentCheckItem[] = [];

  // 1. PRIMARY IDENTITY & BORDER ENTRY
  if (ctx.isInternational) {
    items.push({
      id: 'doc-passport',
      title: 'Valid International Passport (6+ Months Remaining)',
      category: 'Identities',
      sourceType: 'OFFICIAL REQUIREMENT',
      required: true,
      completed: true,
      note: 'Immigration mandates at least 6 months validity from departure date.',
    });

    items.push({
      id: 'doc-visa',
      title: `Entry Visa / Tourist eVisa for ${ctx.destination}`,
      category: 'Visa & Entry',
      sourceType: 'OFFICIAL REQUIREMENT',
      required: true,
      completed: false,
      note: 'Verify official embassy/consulate eVisa portal or on-arrival eligibility.',
    });

    items.push({
      id: 'doc-insurance',
      title: 'Comprehensive International Travel & Medical Insurance',
      category: 'Insurance',
      sourceType: 'TRIPPILOT RECOMMENDATION',
      required: false,
      completed: false,
      note: 'Covers overseas medical emergencies, flight delays, and baggage loss.',
    });
  } else {
    items.push({
      id: 'doc-govt-id',
      title: 'Government Photo ID (Aadhar / PAN / Driving License)',
      category: 'Identities',
      sourceType: 'OFFICIAL REQUIREMENT',
      required: true,
      completed: true,
      note: 'Original government-issued photo ID required at airport security & hotel check-in.',
    });

    items.push({
      id: 'doc-domestic-insurance',
      title: 'Domestic Travel Trip Insurance',
      category: 'Insurance',
      sourceType: 'TRIPPILOT RECOMMENDATION',
      required: false,
      completed: false,
      note: 'Recommended for luggage loss and flight rescheduling protection.',
    });
  }

  // 2. TICKETS & BOOKING CONFIRMATIONS
  items.push({
    id: 'doc-flight-ticket',
    title: 'Flight / Train Boarding E-Ticket with QR Code',
    category: 'Tickets',
    sourceType: 'OFFICIAL REQUIREMENT',
    required: true,
    completed: ctx.hasFlightBooking ? true : false,
    note: 'Digital e-ticket on smartphone or printed boarding pass.',
    actionLink: '/flights',
  });

  items.push({
    id: 'doc-hotel-voucher',
    title: 'Hotel Booking Confirmation Voucher',
    category: 'Vouchers',
    sourceType: 'TRIPPILOT RECOMMENDATION',
    required: true,
    completed: ctx.hasHotelBooking ? true : false,
    note: 'Shows booking reference code and room tariff breakdown.',
    actionLink: '/hotels',
  });

  if (ctx.hasTransportBooking) {
    items.push({
      id: 'doc-transfer-voucher',
      title: 'Airport Transfer / Rental Car Reservation Slip',
      category: 'Tickets',
      sourceType: 'TRIPPILOT RECOMMENDATION',
      required: false,
      completed: true,
      note: 'Driver contact details and pickup terminal instructions.',
    });
  }

  if (ctx.hasActivityBooking) {
    items.push({
      id: 'doc-activity-pass',
      title: 'Guided Excursion & Activity Entry Passes',
      category: 'Tickets',
      sourceType: 'TRIPPILOT RECOMMENDATION',
      required: false,
      completed: true,
      note: 'QR entry codes for water sports, fort tours, or experiences.',
    });
  }

  // 3. MEDICAL & EMERGENCY CONTACTS
  items.push({
    id: 'doc-emergency-contacts',
    title: 'Emergency Medical Contacts & Doctor Prescriptions',
    category: 'Medical',
    sourceType: 'TRIPPILOT RECOMMENDATION',
    required: true,
    completed: true,
    note: 'Carry doctor prescription slips for any restricted prescription medicines.',
  });

  return items;
}
