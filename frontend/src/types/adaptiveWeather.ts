export type TravelGroupType =
  | 'solo'
  | 'couple'
  | 'family'
  | 'family_kids'
  | 'friends'
  | 'group'
  | 'business'
  | 'students';

export type ForecastConfidence = 'high' | 'moderate' | 'low';
export type WeatherImpactLevel = 'low' | 'moderate' | 'high';

export interface TideInfo {
  highTideTime: string;
  lowTideTime: string;
  seaCondition: 'Calm' | 'Moderate' | 'Rough' | 'Hazardous';
  waveHeightMeters: number;
}

export interface WeatherDayForecast {
  dayNumber: number;
  date: string;
  dayLabel: string;
  tempC: number;
  tempMinC: number;
  feelsLikeC?: number;
  condition: string;
  rainProbability: number;
  rainTimeWindow?: string; // e.g. '02:00 PM - 06:00 PM'
  windSpeedKmh: number;
  uvIndex: number;
  tide?: TideInfo;
  officialSource: string;
  alertLevel: 'none' | 'advisory' | 'warning' | 'severe';
  confidence: ForecastConfidence;
  confidenceLabel: string;
  impactLevel: WeatherImpactLevel;
  weatherCode?: number;
}

export interface AlternativeActivitySuggestion {
  id: string;
  name: string;
  category: string;
  duration: string;
  cost: number;
  priceDifference: number;
  description: string;
  reason: string;
  suitableGroupTypes: TravelGroupType[];
  location: string;
  image_url: string;
}

export interface ItineraryConflict {
  id: string;
  eventId: string;
  dayNumber: number;
  eventTitle: string;
  eventType: string;
  originalTime: string;
  conflictType: 'rain' | 'tide' | 'wind' | 'heat' | 'rough_sea';
  severity: 'advisory' | 'warning' | 'severe';
  impactExplanation: string;
  isBooked?: boolean;
  suggestedTimeShift?: {
    newTime: string;
    reason: string;
  };
  suggestedAlternative?: AlternativeActivitySuggestion;
  costDifference: number;
}

export interface WeatherAdaptationChange {
  original_activity: string;
  original_time: string;
  replacement_activity: string;
  new_time: string;
  type: 'activity' | 'dining' | 'sightseeing' | 'transport' | 'custom';
  cost: number;
  cost_difference: number;
  reason: string;
  is_booked?: boolean;
  booking_advisory?: string | null;
}

export interface DayAdaptationProposal {
  affected_day: number;
  weather_impact: WeatherImpactLevel;
  action: 'modify' | 'reschedule';
  reason: string;
  changes: WeatherAdaptationChange[];
  proposed_activities: Array<{
    time: string;
    activity: string;
    description?: string;
    estimated_cost: number;
    type: string;
    location?: string;
    is_weather_sheltered?: boolean;
    is_booked?: boolean;
  }>;
  estimated_budget_change: number;
  travel_time_change: string;
  safety_notes: string;
  source?: string;
}

export interface WeatherPreAdaptationSnapshot {
  dayNumber: number;
  timestamp: number;
  originalEvents: any[];
  reason: string;
}

export interface PlanBScenario {
  dayNumber: number;
  title: string;
  rationale: string;
  groupType: TravelGroupType;
  events: Array<{
    time: string;
    title: string;
    type: 'travel' | 'stay' | 'activity' | 'dining' | 'custom';
    description: string;
    cost: number;
    location: string;
  }>;
}

export interface NotificationSettings {
  sevenDaysBefore: boolean;
  threeDaysBefore: boolean;
  twentyFourHoursBefore: boolean;
  twoHoursBefore: boolean;
  weatherAlerts: boolean;
  tideMarineAlerts: boolean;
  itineraryShifts: boolean;
}
