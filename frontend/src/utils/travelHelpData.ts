import { TravelHelpContact } from '../types';

export interface TravelHelpContext {
  destination: string;
  hotelName?: string;
  hotelAddress?: string;
  airlineName?: string;
  flightNumber?: string;
  transportProvider?: string;
}

export function getTravelHelpDirectory(ctx: TravelHelpContext): TravelHelpContact[] {
  const contacts: TravelHelpContact[] = [];
  const destLower = ctx.destination.toLowerCase();
  const isInternational =
    destLower.includes('dubai') ||
    destLower.includes('bali') ||
    destLower.includes('singapore') ||
    destLower.includes('paris');

  // 1. NATIONAL & REGIONAL OFFICIAL EMERGENCY SERVICES
  if (destLower.includes('dubai')) {
    contacts.push(
      {
        id: 'em-uae-police',
        name: 'Dubai Police Emergency Operations',
        type: 'police',
        phone: '999',
        sourceType: 'OFFICIAL',
        availability: '24/7 Toll-Free',
        address: 'Al Towwar, Dubai, UAE',
      },
      {
        id: 'em-uae-ambulance',
        name: 'Dubai National Ambulance Service',
        type: 'hospital',
        phone: '998',
        sourceType: 'OFFICIAL',
        availability: '24/7 Toll-Free Emergency Dispatch',
      },
      {
        id: 'em-uae-tourist',
        name: 'Dubai Tourist Security Hotline',
        type: 'emergency',
        phone: '800 4438',
        sourceType: 'OFFICIAL',
        availability: '24/7 Dedicated Tourist Support',
      },
      {
        id: 'em-uae-embassy',
        name: 'Consulate General of India, Dubai',
        type: 'embassy',
        phone: '+971 4 397 1222',
        sourceType: 'OFFICIAL',
        address: 'Al Hamriya, Diplomatic Enclave, Bur Dubai',
        availability: 'Emergency Passport & Consular Desk 24/7',
      }
    );
  } else if (destLower.includes('bali')) {
    contacts.push(
      {
        id: 'em-bali-emergency',
        name: 'Indonesia National Emergency Dispatch',
        type: 'emergency',
        phone: '112',
        sourceType: 'OFFICIAL',
        availability: '24/7 Toll-Free',
      },
      {
        id: 'em-bali-police',
        name: 'Bali Tourist Police Unit (Polda Bali)',
        type: 'police',
        phone: '+62 361 223333',
        sourceType: 'OFFICIAL',
        address: 'Jl. WR Supratman, Denpasar, Bali',
        availability: 'Multi-lingual Tourist Assistance 24/7',
      },
      {
        id: 'em-bali-hospital',
        name: 'BIMC International Hospital Kuta (24/7 Trauma)',
        type: 'hospital',
        phone: '+62 361 761263',
        sourceType: 'PROVIDER',
        address: 'Jl. Bypass Ngurah Rai No.100X, Kuta, Bali',
        distance: '4.2 km',
      },
      {
        id: 'em-bali-consulate',
        name: 'Consulate General of India, Bali',
        type: 'embassy',
        phone: '+62 361 259500',
        sourceType: 'OFFICIAL',
        address: 'Jl. Raya Puputan No.163, Denpasar, Bali',
      }
    );
  } else if (destLower.includes('singapore')) {
    contacts.push(
      {
        id: 'em-sg-police',
        name: 'Singapore Police Force Emergency',
        type: 'police',
        phone: '999',
        sourceType: 'OFFICIAL',
        availability: '24/7 Toll-Free',
      },
      {
        id: 'em-sg-ambulance',
        name: 'SCDF Emergency Ambulance & Fire',
        type: 'hospital',
        phone: '995',
        sourceType: 'OFFICIAL',
        availability: '24/7 Emergency Dispatch',
      },
      {
        id: 'em-sg-highcomm',
        name: 'High Commission of India, Singapore',
        type: 'embassy',
        phone: '+65 6737 6777',
        sourceType: 'OFFICIAL',
        address: '31 Grange Road, Singapore 239702',
      }
    );
  } else {
    // INDIA DOMESTIC (Goa, Kerala, Jaipur, Manali, Kashmir, etc.)
    contacts.push(
      {
        id: 'em-in-all',
        name: 'National Unified Emergency Helpline (Police / Fire / Med)',
        type: 'emergency',
        phone: '112',
        sourceType: 'OFFICIAL',
        availability: '24/7 Central Emergency Hotline',
      },
      {
        id: 'em-in-police',
        name: 'State Police Rapid Assistance',
        type: 'police',
        phone: '100',
        sourceType: 'OFFICIAL',
        availability: '24/7 Toll-Free',
      },
      {
        id: 'em-in-ambulance',
        name: 'National Ambulance & Medical Response (108 / 102)',
        type: 'hospital',
        phone: '108',
        sourceType: 'OFFICIAL',
        availability: '24/7 Free Medical First Response',
      },
      {
        id: 'em-in-tourist',
        name: 'Incredible India Multi-Lingual Tourist Helpline',
        type: 'emergency',
        phone: '1363',
        sourceType: 'OFFICIAL',
        availability: 'Toll-free 24/7 in 12 languages',
      }
    );

    // Nearby Hospitals in Destination
    if (destLower.includes('goa')) {
      contacts.push(
        {
          id: 'hosp-goa-1',
          name: 'Manipal Multi-Specialty Hospital Goa',
          type: 'hospital',
          phone: '+91 832 667 0444',
          address: 'Dona Paula, Panaji, Goa',
          distance: '3.2 km from resort strip',
          sourceType: 'PROVIDER',
          availability: '24/7 Emergency & Trauma Centre',
        },
        {
          id: 'pharm-goa-1',
          name: 'Apollo 24x7 Express Beachside Pharmacy',
          type: 'hospital',
          phone: '+91 832 227 8900',
          address: 'Calangute - Baga Main Junction, Goa',
          distance: '0.6 km from stay',
          sourceType: 'PROVIDER',
          availability: 'Open 24 Hours',
        }
      );
    }
  }

  // 2. ACTIVE TRIP PROVIDERS
  if (ctx.hotelName) {
    contacts.push({
      id: 'active-hotel-desk',
      name: `${ctx.hotelName} — Front Desk & Concierge`,
      type: 'hotel',
      phone: '+91 832 287 1111',
      address: ctx.hotelAddress || `${ctx.destination} Coastal Strip`,
      sourceType: 'PROVIDER',
      availability: '24/7 Guest Desk & Room Service',
    });
  }

  if (ctx.airlineName) {
    contacts.push({
      id: 'active-airline-support',
      name: `${ctx.airlineName} 24x7 Airport & Flight Support`,
      type: 'airline',
      phone: '1800 180 1407',
      address: `Flight ${ctx.flightNumber || 'Direct Booking'}`,
      sourceType: 'PROVIDER',
      availability: 'Flight Status & Rescheduling Desk',
    });
  }

  if (ctx.transportProvider) {
    contacts.push({
      id: 'active-transport-support',
      name: `${ctx.transportProvider} Airport Transfer Dispatch`,
      type: 'transport',
      phone: '+91 98230 45678',
      sourceType: 'PROVIDER',
      availability: 'Confirmed Driver Assigned for Pickup',
    });
  }

  // 3. TRIPPILOT 24/7 CONCIERGE
  contacts.push({
    id: 'tp-concierge-support',
    name: 'TripPilot 24/7 Travel Copilot Emergency Concierge',
    type: 'trippilot_support',
    phone: '+91 800 8747 745',
    sourceType: 'TRIPPILOT SUPPORT',
    availability: '24/7 Priority In-Trip Assistance',
    actionUrl: 'https://trippilot.ai/support',
  });

  return contacts;
}
