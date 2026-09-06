import { PackingItem, PackingCategory } from '../types';

export interface PackingContext {
  destination: string;
  durationDays: number;
  weatherCondition?: string; // e.g. "Sunny", "Rain", "Snow", "Cool"
  isRainy?: boolean;
  isCold?: boolean;
  isSnow?: boolean;
  isHighUV?: boolean;
  activities: string[]; // e.g. ['beach', 'hiking', 'watersports', 'dining', 'city_tour']
  travelStyle: string;
  travellers: number;
  sharedMembers?: { name: string }[];
}

export function generateSmartPackingList(ctx: PackingContext): PackingItem[] {
  const items: PackingItem[] = [];
  let idCounter = 1;

  const addItem = (
    name: string,
    category: PackingCategory,
    essential: boolean,
    reason?: string,
    quantity?: number,
    assignedTo?: string
  ) => {
    items.push({
      id: `pack-${idCounter++}`,
      name,
      category,
      essential,
      checked: false,
      reason,
      quantity,
      assignedTo: assignedTo || 'Shared Gear',
    });
  };

  // 1. CORE ESSENTIALS (Duration-Aware)
  const isShortTrip = ctx.durationDays <= 3;
  const isLongTrip = ctx.durationDays >= 7;
  const clothMultiplier = isShortTrip ? 2 : isLongTrip ? 6 : 4;

  addItem(`Breathable Cotton Tops / Shirts (${clothMultiplier} sets)`, 'Clothing', true, 'Duration-matched daily wear', clothMultiplier);
  addItem(`Comfortable Bottoms / Trousers / Shorts (${Math.max(2, Math.floor(clothMultiplier / 2))} pairs)`, 'Clothing', true, 'Daily clothing', Math.max(2, Math.floor(clothMultiplier / 2)));
  addItem(`Undergarments & Socks (${clothMultiplier + 1} pairs)`, 'Clothing', true, 'Essential clothing', clothMultiplier + 1);
  addItem('Sleepwear / Lounge Wear', 'Clothing', true, 'Comfortable nightwear', isShortTrip ? 1 : 2);

  // 2. TOILETRIES & PERSONAL CARE
  addItem('Toothbrush, Travel Toothpaste & Floss', 'Toiletries', true, 'Core daily hygiene');
  addItem('Travel-Sized Shampoo, Body Wash & Moisturizer', 'Toiletries', true, 'Personal grooming');
  addItem('Personal Medications & First Aid Essentials', 'Health & Personal Care', true, 'Medical safety');
  addItem('Hand Sanitizer & Disinfectant Wet Wipes', 'Health & Personal Care', false, 'Hygiene on the go');

  // 3. ELECTRONICS
  addItem('Smartphone & Fast Charging Cables', 'Electronics', true, 'Essential communications');
  addItem('High-Capacity Power Bank (10,000+ mAh)', 'Electronics', true, 'Back-up battery for navigation');
  if (ctx.travelStyle === 'luxury' || ctx.travelStyle === 'balanced') {
    addItem('Noise-Canceling Earphones / AirPods', 'Electronics', false, 'Transit relaxation');
  }

  // 4. WEATHER-AWARE GEAR
  const destLower = ctx.destination.toLowerCase();
  const weatherLower = (ctx.weatherCondition || '').toLowerCase();
  const isRain = ctx.isRainy || weatherLower.includes('rain') || weatherLower.includes('monsoon');
  const isCold = ctx.isCold || weatherLower.includes('cool') || weatherLower.includes('cold') || destLower.includes('manali') || destLower.includes('kashmir');
  const isSnow = ctx.isSnow || weatherLower.includes('snow');
  const isSunny = !isCold && !isSnow;

  if (isRain) {
    addItem('Compact Lightweight Rain Jacket / Windbreaker', 'Weather Gear', true, 'Monsoon & rainfall protection');
    addItem('Travel Umbrella & Waterproof Bag Cover', 'Weather Gear', true, 'Weather protection');
  }

  if (isCold || isSnow) {
    addItem('Thermal Base Layers & Warm Fleece Pullover', 'Clothing', true, 'Himalayan cold weather insulation');
    addItem('Heavy Down Jacket / Winter Coat', 'Weather Gear', true, 'Sub-zero mountain protection');
    addItem('Woolen Beanie Cap, Scarf & Thermal Gloves', 'Weather Gear', true, 'Cold wind protection');
    addItem('Insulated Winter Snow / Trekking Boots', 'Footwear', true, 'Grip & warmth for snowy terrain');
  }

  if (isSunny) {
    addItem('Broad Spectrum Sunscreen (SPF 50+ PA+++)', 'Sun & Rain', true, 'UV sun protection');
    addItem('Polarized UV Sunglasses', 'Sun & Rain', true, 'Eye UV protection');
    addItem('Breathable Sun Hat / Cap', 'Sun & Rain', false, 'Sun protection during daytime walks');
  }

  // 5. ACTIVITY-AWARE GEAR
  const acts = ctx.activities.map((a) => a.toLowerCase());
  const isBeach = acts.some((a) => a.includes('beach') || a.includes('coast')) || destLower.includes('goa') || destLower.includes('gokarna') || destLower.includes('bali');
  const isWater = acts.some((a) => a.includes('water') || a.includes('scuba') || a.includes('kayak') || a.includes('surf') || a.includes('cruise'));
  const isHiking = acts.some((a) => a.includes('hike') || a.includes('trek') || a.includes('mountain') || a.includes('trail'));
  const isDining = acts.some((a) => a.includes('dinner') || a.includes('dining') || a.includes('lounge') || a.includes('fine'));

  if (isBeach || isWater) {
    addItem('Swimwear / Board Shorts / Rashguard (2 pairs)', 'Swim & Water', true, 'Beach & water activities', 2);
    addItem('Quick-Dry Microfiber Beach Towel', 'Swim & Water', false, 'Beach relaxation');
    addItem('IPX8 Waterproof Floating Phone Pouch', 'Electronics', true, 'Protects electronics around water');
    addItem('Slip-Resistant Water Shoes / Beach Slides', 'Footwear', true, 'Rocky shores & sandy walks');
  }

  if (isHiking) {
    addItem('Sturdy Trekking / Trail Walking Shoes with Ankle Support', 'Hiking & Gear', true, 'Trail safety & foot comfort');
    addItem('Moisture-Wicking Athletic Socks & Hiking Pants', 'Clothing', true, 'Trail comfort & insect protection');
    addItem('Compact Daypack (15-20L) & Refillable Water Bottle', 'Travel Accessories', true, 'Day hike hydration & gear carrying');
  }

  if (isDining) {
    addItem('Smart Casual / Evening Dinner Outfit', 'Clothing', false, 'Fine dining & lounge dress codes', 1);
    addItem('Casual Dress Shoes / Loafers', 'Footwear', false, 'Evening dinners');
  }

  // 6. GENERAL TRAVEL ACCESSORIES
  addItem('Reusable Water Bottle / Flask', 'Travel Accessories', false, 'Hydration on the move');
  addItem('Travel Laundry Bag for used clothes', 'Travel Accessories', false, 'Luggage organization');

  return items;
}
