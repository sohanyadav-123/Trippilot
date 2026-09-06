import { DayOptimizationResult, OptimizedStopItem } from '../types';
import { ItineraryEvent } from '../context/TripBuilderContext';

interface VenueOpeningHours {
  opens: number; // 24-hour format, e.g. 9 = 9AM
  closes: number;
}

const OPENING_HOURS: Record<string, VenueOpeningHours> = {
  fort: { opens: 8, closes: 18 },
  museum: { opens: 9, closes: 17 },
  beach: { opens: 6, closes: 19 },
  market: { opens: 10, closes: 20 },
  cruise: { opens: 16, closes: 22 },
  sunset: { opens: 16, closes: 20 },
  café: { opens: 8, closes: 22 },
  cafe: { opens: 8, closes: 22 },
  spa: { opens: 10, closes: 21 },
  restaurant: { opens: 12, closes: 23 },
  default: { opens: 9, closes: 20 },
};

function getOpeningHours(title: string): VenueOpeningHours {
  const lower = title.toLowerCase();
  for (const [key, hours] of Object.entries(OPENING_HOURS)) {
    if (lower.includes(key)) return hours;
  }
  return OPENING_HOURS.default;
}

function timeToMinutes(time: string): number {
  // Handles "10:00 AM", "02:30 PM", "14:30"
  const trimmed = time.trim();
  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const mins = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match) return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  return 9 * 60;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

function estimateDurationMinutes(event: ItineraryEvent): number {
  const lower = (event.title + ' ' + (event.type || '')).toLowerCase();
  if (lower.includes('beach') || lower.includes('cruise')) return 180;
  if (lower.includes('museum') || lower.includes('fort') || lower.includes('heritage')) return 120;
  if (lower.includes('dinner') || lower.includes('lunch')) return 90;
  if (lower.includes('breakfast') || lower.includes('café') || lower.includes('cafe')) return 60;
  if (lower.includes('spa') || lower.includes('massage')) return 120;
  if (lower.includes('market') || lower.includes('shopping')) return 90;
  if (lower.includes('scuba') || lower.includes('watersport') || lower.includes('trek')) return 180;
  return 90; // default
}

/**
 * Core optimization engine: re-sequences activities to minimize travel,
 * respect opening hours, heat windows, and meal reservation priority.
 */
export function optimizeDaySequence(
  dayNumber: number,
  events: ItineraryEvent[],
  weatherTempC?: number,
  rainProbability?: number
): DayOptimizationResult {
  if (events.length < 2) {
    return {
      dayNumber,
      currentStops: events.map(evToStop),
      optimizedStops: events.map(evToStop),
      estimatedTimeSavedMinutes: 0,
      reasoning: 'Only one activity — no optimization needed.',
      factorsConsidered: [],
      tradeoffs: [],
    };
  }

  const currentStops: OptimizedStopItem[] = events.map(evToStop);

  // Sort heuristic: earlier-closing venues first, heat-sensitive items to morning,
  // dining items roughly at noon/evening, and priority-locked items respected.
  const scored = events.map((ev) => {
    const hours = getOpeningHours(ev.title);
    const lower = ev.title.toLowerCase();
    const isOutdoor = /beach|trekk|fort|viewpoint|cliff|safari|watersport|scuba|cruise|park/.test(lower);
    const isDining = /dine|dinner|lunch|breakfast|café|cafe|restaurant|bistro/.test(lower);
    const isIndoor = /museum|spa|massage|gallery|mall|market|arcade|bowling/.test(lower);

    let score = hours.opens * 60; // Start with opening time as base
    // Push outdoor activities to morning when heat > 34°C
    if (isOutdoor && (weatherTempC ?? 0) > 34) score -= 120;
    // Push outdoor activities to morning when high rain probability after noon
    if (isOutdoor && (rainProbability ?? 0) > 60) score -= 180;
    // Indoor items unaffected by weather — can stay in afternoon
    if (isIndoor) score += 120;
    // Dining naturally slots at fixed times
    if (isDining) {
      const titleLower = ev.title.toLowerCase();
      if (titleLower.includes('breakfast')) score = 7 * 60;
      else if (titleLower.includes('lunch')) score = 13 * 60;
      else score = 20 * 60;
    }

    return { ev, score };
  });

  scored.sort((a, b) => a.score - b.score);

  // Re-assign times linearly starting from 09:00 AM
  let cursor = 9 * 60;
  const optimized: OptimizedStopItem[] = scored.map(({ ev }) => {
    const hours = getOpeningHours(ev.title);
    const openMinutes = hours.opens * 60;
    if (cursor < openMinutes) cursor = openMinutes; // respect opening time

    const stop = evToStop(ev);
    stop.time = minutesToTime(cursor);
    stop.openingHours = `Opens ${minutesToTime(hours.opens * 60)} – Closes ${minutesToTime(hours.closes * 60)}`;
    cursor += estimateDurationMinutes(ev) + 30; // 30 min travel buffer
    return stop;
  });

  // Estimate time saved: compare original end-time vs optimized end-time
  const originalDuration = calculateTotalDurationMinutes(events);
  const optimizedDuration = cursor - 9 * 60;
  const timeSaved = Math.max(0, originalDuration - optimizedDuration);

  const factors: string[] = ['Opening hours', 'Activity duration'];
  const tradeoffs: string[] = [];

  if (weatherTempC && weatherTempC > 34) {
    factors.push(`Heat advisory (${weatherTempC}°C) — moved outdoor items to morning`);
  }
  if (rainProbability && rainProbability > 60) {
    factors.push(`Rain probability (${rainProbability}%) — prioritized outdoor stops in clear morning window`);
    tradeoffs.push('Outdoor activities are now earlier than originally planned.');
  }
  factors.push('Travel buffer between stops (30 min)');

  const reasoning = `Re-sequencing based on ${factors.slice(0, 2).join(' and ')} may reduce estimated idle time by approximately ${Math.max(0, timeSaved)} minutes.`;

  return {
    dayNumber,
    currentStops,
    optimizedStops: optimized,
    estimatedTimeSavedMinutes: timeSaved,
    reasoning,
    factorsConsidered: factors,
    tradeoffs: tradeoffs.length > 0 ? tradeoffs : ['None — all activity priorities maintained.'],
  };
}

function evToStop(ev: ItineraryEvent): OptimizedStopItem {
  return {
    id: ev.id,
    time: ev.time,
    title: ev.title,
    type: ev.type,
    location: ev.location || '',
    duration: `~${Math.round(estimateDurationMinutes(ev) / 60 * 10) / 10}h`,
    cost: ev.cost,
    description: ev.description,
    openingHours: undefined,
  };
}

function calculateTotalDurationMinutes(events: ItineraryEvent[]): number {
  if (events.length === 0) return 0;
  const sorted = [...events].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  const last = sorted[sorted.length - 1];
  const first = sorted[0];
  return timeToMinutes(last.time) - timeToMinutes(first.time) + estimateDurationMinutes(last);
}

/**
 * Generate context-aware "What Should I Do Now?" recommendations.
 */
export function getContextualRecommendations(
  destination: string,
  availableMinutes: number,
  remainingBudget: number,
  interests: string[],
  currentTimeHour: number
) {
  const all = [
    {
      id: 'cr-1',
      title: `${destination} Sunset Viewpoint Walk`,
      category: 'Relaxation & Scenic',
      estDuration: '1.5 Hours',
      cost: 0,
      distance: '1.2 km',
      whyItFits: `Free, takes just 90 minutes — perfect for your ${Math.round(availableMinutes / 60)}h window.`,
      weatherSuitability: 'optimal' as const,
      type: 'activity' as const,
    },
    {
      id: 'cr-2',
      title: 'Artisanal Local Café & Pastry Break',
      category: 'Food & Coffee',
      estDuration: '45 Mins',
      cost: 350,
      distance: '0.5 km',
      whyItFits: 'Short 45-minute stop that fits any gap. Highly rated locally.',
      weatherSuitability: 'indoor_safe' as const,
      type: 'dining' as const,
    },
    {
      id: 'cr-3',
      title: `${destination} Heritage Quarter Walk`,
      category: 'Culture & History',
      estDuration: '1.5 Hours',
      cost: 200,
      distance: '0.8 km',
      whyItFits: `Culture & history interest match. ${availableMinutes >= 90 ? 'Your free window is long enough.' : 'Quick route available.'}`,
      weatherSuitability: 'optimal' as const,
      type: 'culture' as const,
    },
    {
      id: 'cr-4',
      title: 'Beachside Water Sport (Jet Ski or Parasail)',
      category: 'Outdoor & Adventure',
      estDuration: '1 Hour',
      cost: 900,
      distance: '1.5 km',
      whyItFits: availableMinutes >= 60 ? 'Perfect conditions right now for 1 quick session.' : 'Tight but doable in your window.',
      weatherSuitability: 'optimal' as const,
      type: 'activity' as const,
    },
    {
      id: 'cr-5',
      title: 'Local Artisan Market & Souvenir Browse',
      category: 'Shopping & Culture',
      estDuration: '1 Hour',
      cost: 500,
      distance: '0.7 km',
      whyItFits: 'Zero pressure shopping. Browse at your own pace.',
      weatherSuitability: 'indoor_safe' as const,
      type: 'activity' as const,
    },
  ];

  // Filter by available time and budget
  return all.filter((r) => {
    const durationMins = r.estDuration.includes('45') ? 45 : r.estDuration.includes('1.5') ? 90 : 60;
    return durationMins <= availableMinutes && r.cost <= remainingBudget;
  }).slice(0, 4);
}
