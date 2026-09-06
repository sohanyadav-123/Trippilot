export type TravelGroupType =
  | 'solo'
  | 'couple'
  | 'family'
  | 'family_kids'
  | 'friends'
  | 'group'
  | 'business'
  | 'students';

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
  condition: 'Sunny' | 'Partly Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm' | 'High Wind';
  rainProbability: number;
  rainTimeWindow?: string; // e.g. '02:00 PM - 06:00 PM'
  windSpeedKmh: number;
  uvIndex: number;
  tide?: TideInfo;
  officialSource: string;
  alertLevel: 'none' | 'advisory' | 'warning' | 'severe';
}

export interface AlternativeActivitySuggestion {
  id: string;
  name: string;
  category: string;
  duration: string;
  cost: number;
  priceDifference: number; // e.g. -2000 means saves 2,000 INR
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
  impactExplanation: string; // The "WHY" explanation
  suggestedTimeShift?: {
    newTime: string;
    reason: string;
  };
  suggestedAlternative?: AlternativeActivitySuggestion;
  costDifference: number;
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
