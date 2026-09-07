import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Flight, Hotel, Destination, Booking, SelectedItem, TravellerDetail, ContactInfo } from '../types';

export type TripStep = 'travel' | 'stays' | 'local_transport' | 'activities' | 'itinerary' | 'review';
export type StepState = 'not_started' | 'completed' | 'skipped';

export type TravelModePreference = 'flight' | 'train' | 'bus' | 'car' | 'cab' | 'flexible';
export type StayTypePreference = 'hotel' | 'villa' | 'apartment' | 'resort' | 'hostel' | 'holiday_home' | 'camp' | 'boutique' | 'flexible';
export type LocalTransportType = 'cab' | 'rental_car' | 'scooter' | 'private_transfer' | 'bus' | 'flexible';
export type TransportOptimization = 'cheapest' | 'fastest' | 'comfortable' | 'best_overall';

export interface IntercityTravelItem {
  id: string;
  mode: 'flight' | 'train' | 'bus' | 'car' | 'cab';
  title: string;
  operator: string;
  identifier: string; // e.g. 6E-542, 12780 Express, Volvo Multi-Axle
  departureTime: string;
  arrivalTime: string;
  duration: string; // e.g. 1h 30m, 11h 45m
  price: number; // per traveller
  origin: string;
  destination: string;
  badge?: 'Fastest' | 'Cheapest' | 'Best Value' | 'Most Comfortable';
  details?: string;
  inclusions?: string[];
}

export interface StayItem {
  id: string;
  name: string;
  type: 'Hotel' | 'Villa' | 'Apartment' | 'Resort' | 'Hostel' | 'Holiday Home' | 'Boutique';
  destination: string;
  address: string;
  description: string;
  image_urls: string[];
  rating: number;
  review_count: number;
  price_per_night: number;
  bedrooms?: number;
  hasPrivatePool?: boolean;
  isBeachfront?: boolean;
  hasKitchen?: boolean;
  hasParking?: boolean;
  hasBreakfast?: boolean;
  cancellation_policy: string;
  room_types?: string[];
  selectedRoomName?: string;
}

export interface LocalMobilityItem {
  id: string;
  type: LocalTransportType;
  title: string;
  vehicleModel: string;
  price: number; // total for trip
  route: string;
  capacity: string;
  provider: string;
  features: string[];
  badge?: 'Cheapest' | 'Fastest' | 'Comfortable' | 'Best Overall';
}

export interface SelectedActivity {
  id: string;
  name: string;
  destination: string;
  category: string;
  duration: string;
  rating: number;
  price: number;
  image_url: string;
  description?: string;
  day?: number;
  time?: string;
}

export interface ItineraryEvent {
  id: string;
  day: number;
  date: string;
  time: string;
  title: string;
  type: 'travel' | 'transport' | 'stay' | 'activity' | 'dining' | 'custom';
  description?: string;
  cost?: number;
  location?: string;
}

export interface TripSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  cabin: string;
  budget: number;
  travelStyle?: TravelStyle;
  interests?: string[];
  tripPurpose?: string;
  dateFlexibility?: DateFlexibility;
}

import {
  TravelGroupType,
  ItineraryConflict,
  NotificationSettings,
  WeatherPreAdaptationSnapshot,
} from '../types/adaptiveWeather';
import {
  TravelStyle,
  DateFlexibility,
  RestaurantItem,
  PackingItem,
  DocumentCheckItem,
  SharedMember,
  GroupExpense,
  TripScoreBreakdown,
  TripHealthStatus,
  TripHealthIssue,
  Expense,
  PriceAlert,
  BudgetOptimizationRecommendation,
  CategorySpendItem,
  SettlementBalance,
} from '../types';
import { TripSuggestion, TripActivityEntry, TripComment } from '../types/collaboration';
import { adaptiveWeatherService } from '../services/adaptiveWeatherService';
import { convertCurrency, normalizeToBaseCurrency, SUPPORTED_CURRENCIES } from '../utils/currencyUtils';

export interface TripBuilderContextType {
  // Search parameters
  origin: string;
  setOrigin: (origin: string) => void;
  destination: string;
  setDestination: (dest: string) => void;
  departureDate: string;
  returnDate: string;
  travellers: number;
  cabin: string;
  budget: number;

  // Active step & statuses
  currentStep: TripStep;
  stepStatus: Record<TripStep, StepState>;

  // Group Type for personalization
  groupType: TravelGroupType;
  setGroupType: (type: TravelGroupType) => void;

  // Adaptive Weather Intelligence & Conflicts
  detectedConflicts: ItineraryConflict[];
  activePlanVersion: Record<number, 'A' | 'B'>;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  togglePlanVersion: (dayNumber: number, version: 'A' | 'B') => void;
  applyConflictOptimization: (conflictId: string, choice: 'time_shift' | 'alternative') => void;
  applyPlanB: (dayNumber: number) => void;
  lastWeatherSnapshot: WeatherPreAdaptationSnapshot | null;
  dismissedWeatherDays: number[];
  applyDayAdaptation: (dayNumber: number, newActivities: any[], reason?: string) => void;
  undoWeatherAdaptation: () => void;
  dismissWeatherAlertForDay: (dayNumber: number) => void;

  // Step 1: Getting There
  travelModePreference: TravelModePreference;
  selectedTravel: IntercityTravelItem | null;

  // Step 2: Where to Stay
  stayTypePreference: StayTypePreference;
  selectedStay: StayItem | null;

  // Step 3: Getting Around
  localTransportPreference: LocalTransportType;
  transportOptimization: TransportOptimization;
  selectedMobility: LocalMobilityItem | null;

  // Step 4: Activities
  selectedActivities: SelectedActivity[];

  // Step 5: Itinerary
  customItinerary: ItineraryEvent[];

  // Financials & Calculations
  travelTotal: number;
  stayTotal: number;
  mobilityTotal: number;
  activitiesTotal: number;
  subtotal: number;
  taxes: number;
  estimatedTotal: number;
  remainingBudget: number;
  completedStepsCount: number;
  tripNights: number;

  // State Management & Reset
  isDraftEmpty: boolean;
  canUndo: boolean;

  // Actions
  setTripSearch: (params: Partial<TripSearchParams>) => void;
  setStep: (step: TripStep) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;

  setTravelModePreference: (mode: TravelModePreference) => void;
  selectTravelItem: (item: IntercityTravelItem) => void;
  removeTravel: () => void;
  unselectTravel: () => void;
  replaceTravel: (item: IntercityTravelItem) => void;
  skipTravel: () => void;

  setStayTypePreference: (type: StayTypePreference) => void;
  selectStayItem: (item: StayItem, roomName?: string) => void;
  changeStayRoom: (roomName: string, pricePerNight?: number) => void;
  removeStay: () => void;
  unselectStay: () => void;
  replaceStay: (item: StayItem, roomName?: string) => void;
  skipStay: () => void;

  setLocalTransportPreference: (type: LocalTransportType) => void;
  setTransportOptimization: (opt: TransportOptimization) => void;
  selectMobilityItem: (item: LocalMobilityItem) => void;
  removeMobility: () => void;
  unselectMobility: () => void;
  replaceMobility: (item: LocalMobilityItem) => void;
  skipMobility: () => void;

  addActivity: (activity: SelectedActivity) => void;
  removeActivity: (activityId: string) => void;
  toggleActivity: (activity: SelectedActivity) => void;
  skipActivities: () => void;

  updateItineraryEvent: (id: string, updated: Partial<ItineraryEvent>) => void;
  moveItineraryEvent: (id: string, newDay: number, newTime?: string) => void;
  replaceItineraryEvent: (id: string, replacement: Partial<ItineraryEvent>) => void;
  addItineraryEvent: (event: Omit<ItineraryEvent, 'id'>) => void;
  addCustomItineraryEvent: (day: number, event: Omit<ItineraryEvent, 'id' | 'day'>) => void;
  removeItineraryEvent: (id: string) => void;
  regenerateItinerary: () => void;
  applyDayOptimization: (dayNumber: number, optimizedStops: import('../types').OptimizedStopItem[]) => void;

  // Undo Notification
  undoNotification: { message: string; undoFn: () => void } | null;
  triggerUndoNotification: (message: string, undoFn: () => void) => void;
  dismissUndoNotification: () => void;

  setBudget: (budget: number) => void;
  changeDestination: (
    newDestination: string,
    newOrigin?: string,
    newDepDate?: string,
    newRetDate?: string,
    newTravellers?: number,
    newBudget?: number
  ) => void;
  resetTripDraft: () => void;
  resetTrip: () => void;
  undoLastAction: () => void;

  // ─── 20-FEATURE PRODUCT EXPANSION ───
  travelStyle: TravelStyle;
  setTravelStyle: (style: TravelStyle) => void;
  interests: string[];
  setInterests: (interests: string[]) => void;
  toggleInterest: (interest: string) => void;
  tripPurpose: string;
  setTripPurpose: (purpose: string) => void;
  dateFlexibility: DateFlexibility;
  setDateFlexibility: (flex: DateFlexibility) => void;

  selectedRestaurants: RestaurantItem[];
  addRestaurant: (item: RestaurantItem) => void;
  removeRestaurant: (id: string) => void;

  packingList: PackingItem[];
  togglePackingItem: (id: string) => void;
  addPackingItem: (name: string, category: PackingItem['category'], essential?: boolean) => void;
  removePackingItem: (id: string) => void;

  documentChecklist: DocumentCheckItem[];
  toggleDocumentItem: (id: string) => void;

  sharedMembers: SharedMember[];
  addSharedMember: (email: string, name: string, role?: 'editor' | 'viewer') => void;
  removeSharedMember: (id: string) => void;

  groupExpenses: GroupExpense[];
  addGroupExpense: (expense: Omit<GroupExpense, 'id'>) => void;
  settleGroupExpense: (id: string) => void;

  tripScore: TripScoreBreakdown;
  tripHealth: TripHealthStatus;

  // ─── PHASE 3: FINANCIAL INTELLIGENCE & BUDGET ───
  baseCurrency: string;
  setBaseCurrency: (code: string) => void;
  plannedCost: number;
  actualSpent: number;
  budgetStatus: 'within_budget' | 'near_limit' | 'over_budget';
  budgetUsedPercentage: number;
  budgetRemainingPercentage: number;
  categorySpendBreakdown: CategorySpendItem[];
  
  // Expenses CRUD
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  toggleExpenseSettlement: (id: string) => void;

  // Group Splitting & Settlement Matrix
  settlementBalances: SettlementBalance[];

  // Price Alerts
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  togglePriceAlert: (id: string) => void;
  deletePriceAlert: (id: string) => void;
  simulatePriceDrop: (id: string, newPrice: number) => void;

  // Budget Optimizer
  optimizationRecommendations: BudgetOptimizationRecommendation[];
  applyOptimizationRecommendation: (id: string) => void;
  revertOptimizationRecommendation: (id: string) => void;

  completeBooking: (
    travellerDetails: TravellerDetail[],
    contact: ContactInfo,
    paymentMethod: string
  ) => Promise<{ success: boolean; bookingId?: string; bookingReference?: string; error?: string }>;

  // ─── PHASE 7: COLLABORATION & PERSONALIZATION ───
  // Shared Trip Suggestions
  suggestions: TripSuggestion[];
  addSuggestion: (s: Omit<TripSuggestion, 'id' | 'createdAt' | 'status'>) => void;
  acceptSuggestion: (id: string) => void;
  rejectSuggestion: (id: string, note?: string) => void;

  // Trip Activity Log
  tripActivityLog: TripActivityEntry[];
  logTripActivity: (entry: Omit<TripActivityEntry, 'id' | 'timestamp'>) => void;

  // Trip Comments
  tripComments: TripComment[];
  addTripComment: (comment: Omit<TripComment, 'id' | 'createdAt'>) => void;
  deleteTripComment: (id: string) => void;

  // User Travel Preferences (Phase 7E)
  seatPreference: 'window' | 'aisle' | 'no_preference';
  setSeatPreference: (pref: 'window' | 'aisle' | 'no_preference') => void;
  mealPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference';
  setMealPreference: (pref: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference') => void;
  tripPace: 'relaxed' | 'balanced' | 'packed';
  setTripPace: (pace: 'relaxed' | 'balanced' | 'packed') => void;
  hotelStarPreference: 3 | 4 | 5 | 0;
  setHotelStarPreference: (stars: 3 | 4 | 5 | 0) => void;
  foodPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference';
  setFoodPreference: (pref: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference') => void;
}

const LOCAL_STORAGE_KEY = 'trippilot_flexible_trip_builder_state_v2';

const DEFAULT_TRIP: TripSearchParams = {
  origin: 'Hyderabad',
  destination: 'Goa',
  departureDate: '2026-09-15',
  returnDate: '2026-09-20',
  travellers: 2,
  cabin: 'Economy',
  budget: 50000,
};

const STEPS_ORDER: TripStep[] = ['travel', 'stays', 'local_transport', 'activities', 'itinerary', 'review'];

const TripBuilderContext = createContext<TripBuilderContextType | undefined>(undefined);

export const TripBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Search criteria
  const [isDraftEmpty, setIsDraftEmpty] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>(DEFAULT_TRIP.origin);
  const [destination, setDestination] = useState<string>(DEFAULT_TRIP.destination);
  const [departureDate, setDepartureDate] = useState<string>(DEFAULT_TRIP.departureDate);
  const [returnDate, setReturnDate] = useState<string>(DEFAULT_TRIP.returnDate);
  const [travellers, setTravellers] = useState<number>(DEFAULT_TRIP.travellers);
  const [cabin, setCabin] = useState<string>(DEFAULT_TRIP.cabin);
  const [budget, setBudgetState] = useState<number>(DEFAULT_TRIP.budget);

  // Stepper & Status
  const [currentStep, setCurrentStep] = useState<TripStep>('travel');
  const [stepStatus, setStepStatus] = useState<Record<TripStep, StepState>>({
    travel: 'not_started',
    stays: 'not_started',
    local_transport: 'not_started',
    activities: 'not_started',
    itinerary: 'not_started',
    review: 'not_started',
  });

  // Group Type for Personalization
  const [groupType, setGroupTypeState] = useState<TravelGroupType>('couple');

  // Plan A vs Plan B per day
  const [activePlanVersion, setActivePlanVersion] = useState<Record<number, 'A' | 'B'>>({
    2: 'A',
    4: 'A',
  });

  // Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sevenDaysBefore: true,
    threeDaysBefore: true,
    twentyFourHoursBefore: true,
    twoHoursBefore: true,
    weatherAlerts: true,
    tideMarineAlerts: true,
    itineraryShifts: true,
  });

  // Step 1: Getting There
  const [travelModePreference, setTravelModePreference] = useState<TravelModePreference>('flight');
  const [selectedTravel, setSelectedTravel] = useState<IntercityTravelItem | null>(null);

  // Step 2: Where to Stay
  const [stayTypePreference, setStayTypePreference] = useState<StayTypePreference>('hotel');
  const [selectedStay, setSelectedStay] = useState<StayItem | null>(null);

  // Step 3: Getting Around
  const [localTransportPreference, setLocalTransportPreference] = useState<LocalTransportType>('rental_car');
  const [transportOptimization, setTransportOptimization] = useState<TransportOptimization>('best_overall');
  const [selectedMobility, setSelectedMobility] = useState<LocalMobilityItem | null>(null);

  // Step 4: Activities
  const [selectedActivities, setSelectedActivities] = useState<SelectedActivity[]>([]);

  // Step 5: Itinerary
  const [customItinerary, setCustomItinerary] = useState<ItineraryEvent[]>([]);
  const [lastWeatherSnapshot, setLastWeatherSnapshot] = useState<WeatherPreAdaptationSnapshot | null>(null);
  const [dismissedWeatherDays, setDismissedWeatherDays] = useState<number[]>([]);

  // ─── 20-FEATURE PRODUCT EXPANSION STATE ───
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('balanced');
  const [interests, setInterests] = useState<string[]>(['Beach', 'Food', 'Culture', 'Relaxation']);
  const [tripPurpose, setTripPurpose] = useState<string>('Couple');
  const [dateFlexibility, setDateFlexibility] = useState<DateFlexibility>('exact');

  const [selectedRestaurants, setSelectedRestaurants] = useState<RestaurantItem[]>([]);

  // Default Packing Assistant Items
  const [packingList, setPackingList] = useState<PackingItem[]>([
    { id: 'p1', name: 'Cotton T-Shirts & Breathable Shirts', category: 'Clothing', essential: true, checked: true },
    { id: 'p2', name: 'Lightweight Shorts & Linen Trousers', category: 'Clothing', essential: true, checked: false },
    { id: 'p3', name: 'High SPF Sunscreen (SPF 50+)', category: 'Sun & Rain', essential: true, checked: true },
    { id: 'p4', name: 'UV Protection Sunglasses', category: 'Sun & Rain', essential: true, checked: false },
    { id: 'p5', name: 'Comfortable Beach Sandals / Slides', category: 'Footwear', essential: true, checked: false },
    { id: 'p6', name: 'Walking / Trekking Shoes', category: 'Footwear', essential: false, checked: false },
    { id: 'p7', name: 'Swimwear / Board Shorts', category: 'Swim & Water', essential: true, checked: true },
    { id: 'p8', name: 'Waterproof Phone Pouch', category: 'Electronics', essential: false, checked: false },
    { id: 'p9', name: 'Power Bank (10,000+ mAh)', category: 'Electronics', essential: true, checked: true },
    { id: 'p10', name: 'Personal Toiletries & Travel Kit', category: 'Toiletries', essential: true, checked: false },
  ]);

  // Default Document Checklist
  const [documentChecklist, setDocumentChecklist] = useState<DocumentCheckItem[]>([
    { id: 'd1', title: 'Flight / Travel E-Ticket', category: 'Tickets', sourceType: 'OFFICIAL REQUIREMENT', required: true, completed: false, note: 'Digital QR or printed pass' },
    { id: 'd2', title: 'Hotel Confirmation Voucher', category: 'Vouchers', sourceType: 'TRIPPILOT RECOMMENDATION', required: true, completed: false, note: 'Check-in voucher with booking ref' },
    { id: 'd3', title: 'Government Photo ID / Aadhar / Driving License', category: 'Identities', sourceType: 'OFFICIAL REQUIREMENT', required: true, completed: true, note: 'Original ID required at check-in' },
    { id: 'd4', title: 'Passport & Travel Visa (If Applicable)', category: 'Identities', sourceType: 'OFFICIAL REQUIREMENT', required: false, completed: false },
    { id: 'd5', title: 'Travel Insurance Policy Document', category: 'Insurance', sourceType: 'TRIPPILOT RECOMMENDATION', required: false, completed: false },
    { id: 'd6', title: 'Emergency Medical Contacts & Prescriptions', category: 'Medical', sourceType: 'TRIPPILOT RECOMMENDATION', required: true, completed: true },
  ]);

  // Shared Trip Members
  const [sharedMembers, setSharedMembers] = useState<SharedMember[]>([
    { id: 'm1', name: 'Sohan (You)', email: 'sohan@example.com', role: 'owner' },
  ]);

  // ─── PHASE 7: COLLABORATION STATE ───
  const [suggestions, setSuggestions] = useState<TripSuggestion[]>([
    {
      id: 'sug-demo-1',
      suggestedBy: 'Rahul Sharma',
      suggestedByEmail: 'rahul@example.com',
      type: 'activity',
      title: 'Sunset Cruise',
      description: 'A 2-hour sunset catamaran cruise along the Goa coastline. Great views!',
      cost: 2500,
      status: 'pending',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'sug-demo-2',
      suggestedBy: 'Priya Patel',
      suggestedByEmail: 'priya@example.com',
      type: 'restaurant',
      title: 'Fisherman\'s Wharf',
      description: 'Excellent seafood restaurant at the waterfront. Must try their butter garlic prawns.',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [tripActivityLog, setTripActivityLog] = useState<TripActivityEntry[]>([
    {
      id: 'act-1',
      actor: 'Sohan (You)',
      action: 'added flight',
      detail: 'IndiGo 6E-2041 · Hyderabad → Goa',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      type: 'flight',
    },
    {
      id: 'act-2',
      actor: 'Sohan (You)',
      action: 'selected hotel',
      detail: 'Taj Exotica Resort & Spa',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: 'hotel',
    },
    {
      id: 'act-3',
      actor: 'Rahul Sharma',
      action: 'submitted suggestion',
      detail: 'Sunset Cruise activity',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'activity',
    },
  ]);

  const [tripComments, setTripComments] = useState<TripComment[]>([
    {
      id: 'cmt-1',
      authorName: 'Priya Patel',
      authorEmail: 'priya@example.com',
      itemId: 'general',
      itemType: 'general',
      text: 'Should we book the sunset cruise for Day 3? It looks amazing!',
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
  ]);

  // ─── PHASE 7E: TRAVEL PREFERENCE STATES ───
  const [seatPreference, setSeatPreferenceState] = useState<'window' | 'aisle' | 'no_preference'>('window');
  const [mealPreference, setMealPreferenceState] = useState<'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference'>('vegetarian');
  const [tripPace, setTripPaceState] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [hotelStarPreference, setHotelStarPreferenceState] = useState<3 | 4 | 5 | 0>(4);
  const [foodPreference, setFoodPreferenceState] = useState<'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference'>('vegetarian');

  // Group Expense Splitting
  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>([]);

  // ─── PHASE 3: FINANCIAL INTELLIGENCE & BUDGET STATES ───
  const [baseCurrency, setBaseCurrency] = useState<string>('INR');

  // Multi-Currency Expenses Log
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp-1',
      category: 'flights',
      description: 'Flight Booking Advance Payment',
      amount: 12400,
      currency: 'INR',
      baseCurrency: 'INR',
      convertedAmount: 12400,
      date: '2026-09-01',
      paidBy: 'Sohan',
      participants: ['Sohan', 'Rahul'],
      settlementStatus: 'unsettled',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'exp-2',
      category: 'food',
      description: 'Dinner at Thalassa Greek Tavern, Vagator',
      amount: 3200,
      currency: 'INR',
      baseCurrency: 'INR',
      convertedAmount: 3200,
      date: '2026-09-16',
      paidBy: 'Sohan',
      participants: ['Sohan', 'Rahul', 'Priya'],
      settlementStatus: 'unsettled',
      createdAt: new Date().toISOString(),
    },
  ]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const converted = normalizeToBaseCurrency(
      expense.amount,
      expense.currency || baseCurrency,
      baseCurrency
    );
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      currency: expense.currency || baseCurrency,
      baseCurrency: baseCurrency,
      convertedAmount: converted,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          if (updates.amount !== undefined || updates.currency !== undefined) {
            updated.convertedAmount = normalizeToBaseCurrency(
              updated.amount,
              updated.currency || baseCurrency,
              baseCurrency
            );
          }
          return updated;
        }
        return e;
      })
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleExpenseSettlement = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              settlementStatus: e.settlementStatus === 'settled' ? 'unsettled' : 'settled',
            }
          : e
      )
    );
  };

  // Price Alerts State & Handlers
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([
    {
      id: 'pa-1',
      type: 'flight',
      title: 'Hyderabad → Goa Flight Alert',
      targetPrice: 5000,
      currentPrice: 6200,
      lowestObserved: 5800,
      currency: 'INR',
      status: 'active',
      lastChecked: '10 mins ago',
      routeOrDetails: 'Indigo 6E-542 / Direct Non-Stop',
      isSimulatedPriceDrop: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pa-2',
      type: 'hotel',
      title: 'Taj Exotica Resort & Spa Alert',
      targetPrice: 10000,
      currentPrice: 12500,
      lowestObserved: 11500,
      currency: 'INR',
      status: 'active',
      lastChecked: '25 mins ago',
      routeOrDetails: 'Deluxe Sea View Room / 3 Nights',
      isSimulatedPriceDrop: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pa-3',
      type: 'trip',
      title: 'Complete Goa Trip Package Alert',
      targetPrice: 40000,
      currentPrice: 43500,
      lowestObserved: 42000,
      currency: 'INR',
      status: 'active',
      lastChecked: '1 hour ago',
      routeOrDetails: 'Flight + 4★ Stay + Cabs + Activities',
      isSimulatedPriceDrop: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const addPriceAlert = (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `pa-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
  };

  const togglePriceAlert = (id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a))
    );
  };

  const deletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const simulatePriceDrop = (id: string, newPrice: number) => {
    setPriceAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const savings = Math.max(0, a.currentPrice - newPrice);
          return {
            ...a,
            droppedPrice: newPrice,
            savingsEstimate: savings,
            isSimulatedPriceDrop: true,
            lowestObserved: Math.min(a.lowestObserved || a.currentPrice, newPrice),
            lastChecked: 'Just now',
          };
        }
        return a;
      })
    );
  };

  // Budget Optimization Recommendations & Handlers
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<BudgetOptimizationRecommendation[]>([
    {
      id: 'opt-hotel-1',
      category: 'hotel',
      currentTitle: '5★ Luxury Beach Villa (₹18,500 for 3 Nights)',
      currentCost: 18500,
      recommendedTitle: 'Heritage Boutique Resort & Spa (₹14,000 for 3 Nights)',
      recommendedCost: 14000,
      savings: 4500,
      tradeoffs: ['4.7★ vs 4.9★ rating', '5 mins further from beachfront', 'Includes complimentary breakfast buffet'],
      reasoning: 'We found a resort with matching luxury amenities, ocean view, and verified 4.7★ reviews for ₹4,500 less.',
      applied: false,
      scoreImpact: '+6 pts Budget Fit',
    },
    {
      id: 'opt-flight-1',
      category: 'flight',
      currentTitle: 'Peak Evening Indigo Flight (₹6,200/person)',
      currentCost: 12400,
      recommendedTitle: 'Early Morning Non-stop Flight 06:15 AM (₹4,600/person)',
      recommendedCost: 9200,
      savings: 3200,
      tradeoffs: ['Departs 06:15 AM (earlier morning departure)', 'Allows full first day at destination', 'Direct non-stop'],
      reasoning: 'Switching to the early morning slot saves ₹3,200 for 2 travellers and unlocks early hotel check-in.',
      applied: false,
      scoreImpact: '+4 pts Budget Fit',
    },
    {
      id: 'opt-act-1',
      category: 'activity',
      currentTitle: 'Private Luxury Sunset Yacht Cruise (₹4,500)',
      currentCost: 4500,
      recommendedTitle: 'Shared Catamaran Sunset Sail & Dolphin Watch (₹1,800)',
      recommendedCost: 1800,
      savings: 2700,
      tradeoffs: ['Shared with 8-10 guests vs private boat', 'Same coastal sunset route', 'Includes mocktails & local guide'],
      reasoning: 'Enjoy the exact same sunset panorama on a shared catamaran and save ₹2,700.',
      applied: false,
      scoreImpact: '+3 pts Budget Fit',
    },
  ]);

  const applyOptimizationRecommendation = (id: string) => {
    pushSnapshot();
    setOptimizationRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          if (rec.category === 'hotel' && selectedStay) {
            setSelectedStay({
              ...selectedStay,
              name: rec.recommendedTitle,
              price_per_night: Math.round(rec.recommendedCost / Math.max(1, tripNights)),
            });
          } else if (rec.category === 'flight' && selectedTravel) {
            setSelectedTravel({
              ...selectedTravel,
              title: rec.recommendedTitle,
              price: Math.round(rec.recommendedCost / Math.max(1, travellers)),
            });
          }
          return { ...rec, applied: true };
        }
        return rec;
      })
    );
  };

  const revertOptimizationRecommendation = (id: string) => {
    pushSnapshot();
    setOptimizationRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, applied: false } : rec))
    );
  };

  // Action Handlers
  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const addRestaurant = (item: RestaurantItem) => {
    pushSnapshot();
    if (!selectedRestaurants.some((r) => r.id === item.id)) {
      setSelectedRestaurants((prev) => [...prev, item]);
    }
  };

  const removeRestaurant = (id: string) => {
    const r = selectedRestaurants.find((item) => item.id === id);
    pushSnapshot();
    setSelectedRestaurants((prev) => prev.filter((item) => item.id !== id));
    triggerUndoNotification(`${r?.name || 'Restaurant'} removed.`, () => {
      if (r) addRestaurant(r);
    });
  };

  const togglePackingItem = (id: string) => {
    setPackingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const addPackingItem = (name: string, category: PackingItem['category'], essential: boolean = false) => {
    const newItem: PackingItem = {
      id: `p-${Date.now()}`,
      name,
      category,
      essential,
      checked: false,
    };
    setPackingList((prev) => [...prev, newItem]);
  };

  const removePackingItem = (id: string) => {
    setPackingList((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleDocumentItem = (id: string) => {
    setDocumentChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const addSharedMember = (email: string, name: string, role: 'editor' | 'viewer' = 'editor') => {
    const newMember: SharedMember = {
      id: `mem-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role,
    };
    setSharedMembers((prev) => [...prev, newMember]);
  };

  const removeSharedMember = (id: string) => {
    setSharedMembers((prev) => prev.filter((m) => m.id !== id && m.role !== 'owner'));
  };

  const addGroupExpense = (expense: Omit<GroupExpense, 'id'>) => {
    const newExpense: GroupExpense = {
      ...expense,
      id: `ge-${Date.now()}`,
    };
    setGroupExpenses((prev) => [...prev, newExpense]);
  };

  const settleGroupExpense = (id: string) => {
    setGroupExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, settled: true } : e))
    );
  };

  // Undo Notification state
  const [undoNotification, setUndoNotification] = useState<{ message: string; undoFn: () => void } | null>(null);

  const triggerUndoNotification = (message: string, undoFn: () => void) => {
    setUndoNotification({ message, undoFn });
  };

  const dismissUndoNotification = () => {
    setUndoNotification(null);
  };

  // History Stack for Undo capability
  const [historyStack, setHistoryStack] = useState<any[]>([]);

  const pushSnapshot = () => {
    const snapshot = {
      isDraftEmpty,
      origin,
      destination,
      departureDate,
      returnDate,
      travellers,
      cabin,
      budget,
      currentStep,
      stepStatus: { ...stepStatus },
      travelModePreference,
      selectedTravel,
      stayTypePreference,
      selectedStay,
      localTransportPreference,
      transportOptimization,
      selectedMobility,
      selectedActivities: [...selectedActivities],
      customItinerary: [...customItinerary],
    };
    setHistoryStack((prev) => [...prev.slice(-10), snapshot]);
  };

  const undoLastAction = () => {
    if (historyStack.length === 0) return;
    const last = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setIsDraftEmpty(last.isDraftEmpty);
    setOrigin(last.origin);
    setDestination(last.destination);
    setDepartureDate(last.departureDate);
    setReturnDate(last.returnDate);
    setTravellers(last.travellers);
    setCabin(last.cabin);
    setBudgetState(last.budget);
    setCurrentStep(last.currentStep);
    setStepStatus(last.stepStatus);
    setTravelModePreference(last.travelModePreference);
    setSelectedTravel(last.selectedTravel);
    setStayTypePreference(last.stayTypePreference);
    setSelectedStay(last.selectedStay);
    setLocalTransportPreference(last.localTransportPreference);
    setTransportOptimization(last.transportOptimization);
    setSelectedMobility(last.selectedMobility);
    setSelectedActivities(last.selectedActivities);
    setCustomItinerary(last.customItinerary);
  };

  // Detected Itinerary & Weather Conflicts
  const detectedConflicts = useMemo(() => {
    if (!destination || customItinerary.length === 0) return [];
    return adaptiveWeatherService.detectItineraryConflicts(
      customItinerary,
      destination,
      departureDate,
      groupType,
      travellers
    );
  }, [customItinerary, destination, departureDate, groupType, travellers]);

  const setGroupType = (type: TravelGroupType) => {
    setGroupTypeState(type);
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
  };

  const togglePlanVersion = (dayNumber: number, version: 'A' | 'B') => {
    setActivePlanVersion((prev) => ({ ...prev, [dayNumber]: version }));
    if (version === 'B') {
      const planB = adaptiveWeatherService.getPlanBScenario(dayNumber, destination, departureDate, groupType, travellers);
      setCustomItinerary((prev) => {
        const withoutDay = prev.filter((ev) => ev.day !== dayNumber);
        const newEvents: ItineraryEvent[] = planB.events.map((ev, idx) => ({
          id: `ev-planb-d${dayNumber}-${idx}`,
          day: dayNumber,
          date: departureDate,
          time: ev.time,
          title: ev.title,
          type: ev.type,
          description: ev.description,
          cost: ev.cost,
          location: ev.location,
        }));
        return [...withoutDay, ...newEvents].sort((a, b) => a.day - b.day);
      });
    } else {
      regenerateItinerary();
    }
  };

  const applyPlanB = (dayNumber: number) => {
    togglePlanVersion(dayNumber, 'B');
  };

  const applyConflictOptimization = (conflictId: string, choice: 'time_shift' | 'alternative') => {
    const conflict = detectedConflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    if (choice === 'time_shift' && conflict.suggestedTimeShift) {
      updateItineraryEvent(conflict.eventId, {
        time: conflict.suggestedTimeShift.newTime,
        description: `${conflict.eventTitle} (${conflict.suggestedTimeShift.reason})`,
      });
    } else if (choice === 'alternative' && conflict.suggestedAlternative) {
      updateItineraryEvent(conflict.eventId, {
        title: conflict.suggestedAlternative.name,
        type: 'activity',
        description: `${conflict.suggestedAlternative.category} • ${conflict.suggestedAlternative.description}`,
        cost: conflict.suggestedAlternative.cost,
        location: conflict.suggestedAlternative.location,
      });
    }
  };

  const parseTimeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : '';
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const applyDayAdaptation = (dayNumber: number, newActivities: any[], reason: string = 'Weather adaptation') => {
    const originalEventsForDay = customItinerary.filter((ev) => ev.day === dayNumber);
    setLastWeatherSnapshot({
      dayNumber,
      timestamp: Date.now(),
      originalEvents: originalEventsForDay,
      reason,
    });

    setCustomItinerary((prev) => {
      const withoutDay = prev.filter((ev) => ev.day !== dayNumber);
      const adaptedEvents: ItineraryEvent[] = newActivities.map((act, idx) => ({
        id: `ev-adapted-d${dayNumber}-${idx}-${Date.now()}`,
        day: dayNumber,
        date: departureDate || '2026-09-15',
        time: act.time || '10:00 AM',
        title: act.activity || act.title || 'Adapted Activity',
        type: (act.type as any) || 'activity',
        description: act.description || act.reason || '',
        cost: act.estimated_cost ?? act.cost ?? 0,
        location: act.location || `${destination} Central`,
        ...(act.is_booked ? { is_booked: true } : {}),
      }));

      return [...withoutDay, ...adaptedEvents].sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });
    });
  };

  const undoWeatherAdaptation = () => {
    if (!lastWeatherSnapshot) return;
    const { dayNumber, originalEvents } = lastWeatherSnapshot;
    setCustomItinerary((prev) => {
      const withoutDay = prev.filter((ev) => ev.day !== dayNumber);
      return [...withoutDay, ...originalEvents].sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
      });
    });
    setLastWeatherSnapshot(null);
  };

  const dismissWeatherAlertForDay = (dayNumber: number) => {
    setDismissedWeatherDays((prev) => (prev.includes(dayNumber) ? prev : [...prev, dayNumber]));
  };


  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.destination) {
          setOrigin(parsed.origin || '');
          setDestination(parsed.destination);
          setDepartureDate(parsed.departureDate || '');
          setReturnDate(parsed.returnDate || '');
          setTravellers(parsed.travellers || 1);
          setCabin(parsed.cabin || 'Economy');
          setBudgetState(parsed.budget || 0);
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          if (parsed.stepStatus) setStepStatus(parsed.stepStatus);
          if (parsed.travelModePreference) setTravelModePreference(parsed.travelModePreference);
          if (parsed.selectedTravel) setSelectedTravel(parsed.selectedTravel);
          if (parsed.stayTypePreference) setStayTypePreference(parsed.stayTypePreference);
          if (parsed.selectedStay) setSelectedStay(parsed.selectedStay);
          if (parsed.localTransportPreference) setLocalTransportPreference(parsed.localTransportPreference);
          if (parsed.transportOptimization) setTransportOptimization(parsed.transportOptimization);
          if (parsed.selectedMobility) setSelectedMobility(parsed.selectedMobility);
          if (parsed.selectedActivities) setSelectedActivities(parsed.selectedActivities);
          if (parsed.customItinerary) setCustomItinerary(parsed.customItinerary);
          if (Array.isArray(parsed.dismissedWeatherDays)) setDismissedWeatherDays(parsed.dismissedWeatherDays);
          if (parsed.lastWeatherSnapshot) setLastWeatherSnapshot(parsed.lastWeatherSnapshot);
          setIsDraftEmpty(false);
        } else {
          setIsDraftEmpty(true);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved flexible trip builder state:', e);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      if (isDraftEmpty || !destination) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }

      const stateToSave = {
        origin,
        destination,
        departureDate,
        returnDate,
        travellers,
        cabin,
        budget,
        currentStep,
        stepStatus,
        travelModePreference,
        selectedTravel,
        stayTypePreference,
        selectedStay,
        localTransportPreference,
        transportOptimization,
        selectedMobility,
        selectedActivities,
        customItinerary,
        dismissedWeatherDays,
        lastWeatherSnapshot,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save flexible trip builder state:', e);
    }
  }, [
    isDraftEmpty,
    origin,
    destination,
    departureDate,
    returnDate,
    travellers,
    cabin,
    budget,
    currentStep,
    stepStatus,
    travelModePreference,
    selectedTravel,
    stayTypePreference,
    selectedStay,
    localTransportPreference,
    transportOptimization,
    selectedMobility,
    selectedActivities,
    customItinerary,
    dismissedWeatherDays,
    lastWeatherSnapshot,
  ]);

  // Calculated Trip Nights
  const tripNights = useMemo(() => {
    try {
      const d1 = new Date(departureDate);
      const d2 = new Date(returnDate);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff || 4);
    } catch {
      return 5;
    }
  }, [departureDate, returnDate]);

  // Financial calculations
  const travelTotal = useMemo(() => {
    if (!selectedTravel) return 0;
    // For car/cab it's usually total vehicle cost, for flight/train/bus it's per passenger
    if (selectedTravel.mode === 'car' || selectedTravel.mode === 'cab') {
      return selectedTravel.price;
    }
    return selectedTravel.price * travellers;
  }, [selectedTravel, travellers]);

  const stayTotal = useMemo(() => {
    if (!selectedStay) return 0;
    return selectedStay.price_per_night * tripNights;
  }, [selectedStay, tripNights]);

  const mobilityTotal = useMemo(() => {
    if (!selectedMobility) return 0;
    return selectedMobility.price;
  }, [selectedMobility]);

  const activitiesTotal = useMemo(() => {
    return selectedActivities.reduce((sum, act) => sum + act.price * travellers, 0);
  }, [selectedActivities, travellers]);

  const subtotal = useMemo(() => {
    return travelTotal + stayTotal + mobilityTotal + activitiesTotal;
  }, [travelTotal, stayTotal, mobilityTotal, activitiesTotal]);

  const taxes = useMemo(() => {
    return Math.round(subtotal * 0.05);
  }, [subtotal]);

  const estimatedTotal = useMemo(() => {
    return subtotal + taxes;
  }, [subtotal, taxes]);

  const plannedCost = estimatedTotal;

  const actualSpent = useMemo(() => {
    return expenses.reduce((sum, e) => {
      const val = e.convertedAmount !== undefined
        ? e.convertedAmount
        : normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency);
      return sum + val;
    }, 0);
  }, [expenses, baseCurrency]);

  const remainingBudget = useMemo(() => {
    return budget - plannedCost;
  }, [budget, plannedCost]);

  const budgetUsedPercentage = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.min(100, Math.round((plannedCost / budget) * 100));
  }, [budget, plannedCost]);

  const budgetRemainingPercentage = useMemo(() => {
    if (budget <= 0) return 0;
    return Math.max(0, 100 - budgetUsedPercentage);
  }, [budget, budgetUsedPercentage]);

  const budgetStatus: 'within_budget' | 'near_limit' | 'over_budget' = useMemo(() => {
    if (budget <= 0) return 'within_budget';
    if (plannedCost > budget) return 'over_budget';
    if (plannedCost >= budget * 0.8) return 'near_limit';
    return 'within_budget';
  }, [budget, plannedCost]);

  const categorySpendBreakdown: CategorySpendItem[] = useMemo(() => {
    const flightActual = expenses
      .filter((e) => e.category === 'flights')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);
    const hotelActual = expenses
      .filter((e) => e.category === 'hotels')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);
    const transportActual = expenses
      .filter((e) => e.category === 'local_transport')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);
    const activitiesActual = expenses
      .filter((e) => e.category === 'activities')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);
    const foodActual = expenses
      .filter((e) => e.category === 'food')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);
    const shoppingActual = expenses
      .filter((e) => e.category === 'shopping')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);
    const miscActual = expenses
      .filter((e) => e.category === 'miscellaneous')
      .reduce((sum, e) => sum + (e.convertedAmount || normalizeToBaseCurrency(e.amount, e.currency || baseCurrency, baseCurrency)), 0);

    const diningPlanned = selectedRestaurants.reduce((sum, r) => sum + r.cost, 0);

    return [
      { category: 'flights', label: 'Flights / Travel', planned: travelTotal, actual: flightActual, remaining: Math.max(0, travelTotal - flightActual) },
      { category: 'hotels', label: 'Stays & Hotels', planned: stayTotal, actual: hotelActual, remaining: Math.max(0, stayTotal - hotelActual) },
      { category: 'local_transport', label: 'Transport & Cabs', planned: mobilityTotal, actual: transportActual, remaining: Math.max(0, mobilityTotal - transportActual) },
      { category: 'activities', label: 'Activities & Tours', planned: activitiesTotal, actual: activitiesActual, remaining: Math.max(0, activitiesTotal - activitiesActual) },
      { category: 'food', label: 'Dining & Food', planned: diningPlanned, actual: foodActual, remaining: Math.max(0, diningPlanned - foodActual) },
      { category: 'shopping', label: 'Shopping & Gifts', planned: 0, actual: shoppingActual, remaining: 0 },
      { category: 'miscellaneous', label: 'Taxes & Other', planned: taxes, actual: miscActual, remaining: Math.max(0, taxes - miscActual) },
    ];
  }, [travelTotal, stayTotal, mobilityTotal, activitiesTotal, selectedRestaurants, taxes, expenses, baseCurrency]);

  const settlementBalances: SettlementBalance[] = useMemo(() => {
    const balances: SettlementBalance[] = [];
    
    // Group expenses breakdown
    groupExpenses.forEach((ge) => {
      if (ge.split_between && ge.split_between.length > 0) {
        const splitAmount = Math.round(ge.amount / ge.split_between.length);
        ge.split_between.forEach((member) => {
          if (member !== ge.paid_by) {
            balances.push({
              fromMember: member,
              toMember: ge.paid_by,
              amount: splitAmount,
              settled: ge.settled,
              expenseTitle: ge.title,
            });
          }
        });
      }
    });

    // Multi-member regular expenses
    expenses.forEach((e) => {
      if (e.paidBy && e.participants && e.participants.length > 1) {
        const perPerson = Math.round(e.amount / e.participants.length);
        e.participants.forEach((p) => {
          if (p !== e.paidBy) {
            balances.push({
              fromMember: p,
              toMember: e.paidBy!,
              amount: perPerson,
              settled: e.settlementStatus === 'settled',
              expenseTitle: e.description,
            });
          }
        });
      }
    });

    return balances;
  }, [groupExpenses, expenses]);

  const completedStepsCount = useMemo(() => {
    return Object.values(stepStatus).filter((s) => s === 'completed' || s === 'skipped').length;
  }, [stepStatus]);

  // ─── EXPLAINABLE TRIP SCORE CALCULATOR (0 - 100) ───
  const tripScore: TripScoreBreakdown = useMemo(() => {
    let budgetFit = 100;
    if (budget > 0) {
      if (remainingBudget < 0) {
        const overPercent = Math.abs(remainingBudget) / budget;
        budgetFit = Math.max(20, Math.round(100 - overPercent * 150));
      } else {
        budgetFit = 95;
      }
    }

    let convenience = 75;
    if (selectedTravel) convenience += 10;
    if (selectedStay) convenience += 10;
    if (selectedMobility) convenience += 5;

    let weatherFit = 92;
    if (detectedConflicts.length > 0) {
      weatherFit -= detectedConflicts.length * 15;
    }
    weatherFit = Math.max(40, weatherFit);

    let interestMatch = Math.min(100, 70 + interests.length * 6);

    const total = Math.round(budgetFit * 0.35 + convenience * 0.25 + weatherFit * 0.2 + interestMatch * 0.2);

    const explanation: string[] = [];
    if (budgetFit >= 90) explanation.push(`Budget fit: Estimated total is well within your ₹${budget.toLocaleString('en-IN')} target.`);
    else explanation.push(`Budget warning: Planned selections exceed target by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}.`);

    if (selectedTravel && selectedStay) explanation.push(`Convenience: Both intercity travel and stay accommodations are confirmed.`);
    else if (!selectedTravel) explanation.push(`Convenience gap: Intercity flight/train travel is not yet selected.`);

    if (weatherFit >= 85) explanation.push(`Weather suitability: Favorable climate and sea tide forecast for ${destination}.`);
    else explanation.push(`Weather alert: Active weather/tide conflict detected on Day ${detectedConflicts[0]?.dayNumber || 1}.`);

    explanation.push(`Interest match: Strong alignment with your selected ${interests.slice(0, 3).join(', ')} preferences.`);

    return {
      total,
      budgetFit,
      convenience,
      weatherFit,
      interestMatch,
      explanation,
    };
  }, [budget, remainingBudget, selectedTravel, selectedStay, selectedMobility, detectedConflicts, interests, destination]);

  // ─── TRIP HEALTH & READINESS EVALUATOR ───
  const tripHealth: TripHealthStatus = useMemo(() => {
    const issues: TripHealthIssue[] = [];

    if (!selectedTravel) {
      issues.push({
        id: 'no-travel',
        severity: 'warning',
        message: `No intercity flight/train selected for ${origin} → ${destination}.`,
        actionStep: 'travel',
        actionLabel: 'Choose Travel',
      });
    }

    if (!selectedStay) {
      issues.push({
        id: 'no-stay',
        severity: 'warning',
        message: `No hotel or stay selected in ${destination}.`,
        actionStep: 'stays',
        actionLabel: 'Choose Hotel',
      });
    }

    if (!selectedMobility) {
      issues.push({
        id: 'no-mobility',
        severity: 'info',
        message: 'No local cab or rental transport arranged.',
        actionStep: 'local_transport',
        actionLabel: 'Arrange Transport',
      });
    }

    if (remainingBudget < 0) {
      issues.push({
        id: 'budget-overrun',
        severity: 'error',
        message: `Trip is ₹${Math.abs(remainingBudget).toLocaleString('en-IN')} over budget!`,
        actionStep: 'review',
        actionLabel: 'Optimize Selections',
      });
    }

    const pendingDocs = documentChecklist.filter((d) => d.required && !d.completed);
    if (pendingDocs.length > 0) {
      issues.push({
        id: 'docs-pending',
        severity: 'info',
        message: `${pendingDocs.length} required travel documents unchecked.`,
        actionLabel: 'Check Documents',
      });
    }

    let readyPercentage = 100;
    if (!selectedTravel) readyPercentage -= 25;
    if (!selectedStay) readyPercentage -= 25;
    if (!selectedMobility) readyPercentage -= 10;
    if (remainingBudget < 0) readyPercentage -= 15;
    if (pendingDocs.length > 0) readyPercentage -= 10;

    readyPercentage = Math.max(20, readyPercentage);

    const statusLabel: 'Fully Ready' | 'Near Ready' | 'Needs Attention' =
      readyPercentage >= 90 ? 'Fully Ready' : readyPercentage >= 65 ? 'Near Ready' : 'Needs Attention';

    return {
      readyPercentage,
      statusLabel,
      issues,
    };
  }, [selectedTravel, selectedStay, selectedMobility, remainingBudget, documentChecklist, origin, destination]);

  // Dynamic multi-modal Itinerary Generator
  const buildDynamicItinerary = (): ItineraryEvent[] => {
    const events: ItineraryEvent[] = [];

    // Day 1 Arrival & Transport Leg
    let arrivalTitle = `Arrival in ${destination}`;
    let arrivalTime = '11:00 AM';
    let arrivalDesc = `Arrival from ${origin}`;

    if (selectedTravel) {
      if (selectedTravel.mode === 'flight') {
        arrivalTitle = `Flight Arrival at ${destination} Airport (${selectedTravel.identifier})`;
        arrivalTime = selectedTravel.arrivalTime || '10:35 AM';
        arrivalDesc = `${selectedTravel.operator} flight ${selectedTravel.identifier} arriving from ${origin}`;
      } else if (selectedTravel.mode === 'train') {
        arrivalTitle = `Train Arrival at ${destination} Railway Station`;
        arrivalTime = selectedTravel.arrivalTime || '11:45 AM';
        arrivalDesc = `${selectedTravel.operator} (${selectedTravel.identifier}) arriving from ${origin}`;
      } else if (selectedTravel.mode === 'bus') {
        arrivalTitle = `Intercity Bus Arrival at ${destination} Central Hub`;
        arrivalTime = selectedTravel.arrivalTime || '08:30 AM';
        arrivalDesc = `${selectedTravel.operator} AC Sleeper Coach`;
      } else if (selectedTravel.mode === 'car' || selectedTravel.mode === 'cab') {
        arrivalTitle = `Scenic Highway Drive Arrival in ${destination}`;
        arrivalTime = '02:00 PM';
        arrivalDesc = `Private road trip from ${origin} via scenic coastal ghats`;
      }
    }

    events.push({
      id: 'ev-travel-arr',
      day: 1,
      date: departureDate,
      time: arrivalTime,
      title: arrivalTitle,
      type: 'travel',
      description: arrivalDesc,
      cost: travelTotal,
      location: `${destination}`,
    });

    // Local Mobility Pickup (Day 1)
    if (selectedMobility) {
      events.push({
        id: 'ev-mobility-pickup',
        day: 1,
        date: departureDate,
        time: '12:30 PM',
        title: `${selectedMobility.title} Handover & Start`,
        type: 'transport',
        description: `${selectedMobility.vehicleModel} • ${selectedMobility.features.join(' • ')}`,
        cost: selectedMobility.price,
        location: `${destination} Terminal / Hotel Pickup`,
      });
    }

    // Check-in (Day 1)
    events.push({
      id: 'ev-stay-checkin',
      day: 1,
      date: departureDate,
      time: '02:00 PM',
      title: selectedStay ? `Check-in: ${selectedStay.name} (${selectedStay.type})` : `Check-in at Accommodations`,
      type: 'stay',
      description: selectedStay
        ? `${selectedStay.address} • ${selectedStay.selectedRoomName || 'Primary Booking'}`
        : `Check-in and refresh`,
      cost: stayTotal,
      location: selectedStay?.address || `${destination} Central`,
    });

    // Selected Activities spread across days
    selectedActivities.forEach((act, idx) => {
      const assignedDay = Math.min((idx % (tripNights || 4)) + 1, tripNights || 4);
      const timeSlots = ['10:00 AM', '03:30 PM', '05:30 PM'];
      events.push({
        id: `ev-act-${act.id}`,
        day: assignedDay,
        date: departureDate,
        time: timeSlots[idx % timeSlots.length],
        title: act.name,
        type: 'activity',
        description: `${act.category} • Duration: ${act.duration} • Rating: ★ ${act.rating}`,
        cost: act.price * travellers,
        location: act.destination,
      });
    });

    // Curated dining on Day 1 evening
    events.push({
      id: 'ev-dining-1',
      day: 1,
      date: departureDate,
      time: '08:00 PM',
      title: `Welcome Dinner & Local Culinary Tasting`,
      type: 'dining',
      description: `Authentic regional specialties & relaxed evening vibe`,
      cost: 1000 * travellers,
      location: `${destination} Coast`,
    });

    return events;
  };

  const regenerateItinerary = () => {
    setCustomItinerary(buildDynamicItinerary());
  };

  useEffect(() => {
    if (customItinerary.length === 0 && (selectedTravel || selectedStay || selectedMobility || selectedActivities.length > 0)) {
      setCustomItinerary(buildDynamicItinerary());
    }
  }, [selectedTravel, selectedStay, selectedMobility, selectedActivities.length]);

  // Actions
  const setTripSearch = (params: Partial<TripSearchParams>) => {
    if (params.origin) setOrigin(params.origin);
    if (params.destination) setDestination(params.destination);
    if (params.departureDate) setDepartureDate(params.departureDate);
    if (params.returnDate) setReturnDate(params.returnDate);
    if (params.travellers) setTravellers(params.travellers);
    if (params.cabin) setCabin(params.cabin);
    if (params.budget) setBudgetState(params.budget);
  };

  const setStep = (step: TripStep) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex < STEPS_ORDER.length - 1) {
      const next = STEPS_ORDER[currentIndex + 1];
      setCurrentStep(next);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      const prev = STEPS_ORDER[currentIndex - 1];
      setCurrentStep(prev);
    }
  };

  // Travel Actions
  const selectTravelItem = (item: IntercityTravelItem) => {
    pushSnapshot();
    setSelectedTravel(item);
    setTravelModePreference(item.mode);
    setStepStatus((prev) => ({ ...prev, travel: 'completed' }));
    setIsDraftEmpty(false);
  };

  const removeTravel = () => {
    const prev = selectedTravel;
    pushSnapshot();
    setSelectedTravel(null);
    setStepStatus((prevStatus) => ({ ...prevStatus, travel: 'not_started' }));
    setCustomItinerary((prev) => prev.filter((ev) => ev.id !== 'ev-travel-arr'));
    triggerUndoNotification('Travel selection removed.', () => {
      if (prev) selectTravelItem(prev);
    });
  };

  const unselectTravel = removeTravel;
  const replaceTravel = selectTravelItem;

  const skipTravel = () => {
    pushSnapshot();
    setSelectedTravel(null);
    setStepStatus((prev) => ({ ...prev, travel: 'skipped' }));
    goToNextStep();
  };

  // Stay Actions
  const selectStayItem = (item: StayItem, roomName?: string) => {
    pushSnapshot();
    const updated = { ...item, selectedRoomName: roomName || item.selectedRoomName || item.room_types?.[0] };
    setSelectedStay(updated);
    setStepStatus((prev) => ({ ...prev, stays: 'completed' }));
    setIsDraftEmpty(false);
  };

  const changeStayRoom = (roomName: string, pricePerNight?: number) => {
    pushSnapshot();
    setSelectedStay((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        selectedRoomName: roomName,
        price_per_night: pricePerNight !== undefined ? pricePerNight : prev.price_per_night,
      };
    });
  };

  const removeStay = () => {
    const prev = selectedStay;
    pushSnapshot();
    setSelectedStay(null);
    setStepStatus((prevStatus) => ({ ...prevStatus, stays: 'not_started' }));
    setCustomItinerary((prev) => prev.filter((ev) => ev.id !== 'ev-stay-checkin'));
    triggerUndoNotification('Hotel selection removed.', () => {
      if (prev) selectStayItem(prev, prev.selectedRoomName);
    });
  };

  const unselectStay = removeStay;
  const replaceStay = selectStayItem;

  const skipStay = () => {
    pushSnapshot();
    setSelectedStay(null);
    setStepStatus((prev) => ({ ...prev, stays: 'skipped' }));
    goToNextStep();
  };

  // Local Mobility Actions
  const selectMobilityItem = (item: LocalMobilityItem) => {
    pushSnapshot();
    setSelectedMobility(item);
    setStepStatus((prev) => ({ ...prev, local_transport: 'completed' }));
    setIsDraftEmpty(false);
  };

  const removeMobility = () => {
    const prev = selectedMobility;
    pushSnapshot();
    setSelectedMobility(null);
    setStepStatus((prevStatus) => ({ ...prevStatus, local_transport: 'not_started' }));
    setCustomItinerary((prev) => prev.filter((ev) => ev.id !== 'ev-mobility-pickup'));
    triggerUndoNotification('Local transport removed.', () => {
      if (prev) selectMobilityItem(prev);
    });
  };

  const unselectMobility = removeMobility;
  const replaceMobility = selectMobilityItem;

  const skipMobility = () => {
    pushSnapshot();
    setSelectedMobility(null);
    setStepStatus((prev) => ({ ...prev, local_transport: 'skipped' }));
    goToNextStep();
  };

  // Activities Actions
  const addActivity = (activity: SelectedActivity) => {
    pushSnapshot();
    if (!selectedActivities.some((a) => a.id === activity.id)) {
      setSelectedActivities((prev) => [...prev, activity]);
    }
    setStepStatus((prev) => ({ ...prev, activities: 'completed' }));
    setIsDraftEmpty(false);
  };

  const removeActivity = (activityId: string) => {
    const act = selectedActivities.find((a) => a.id === activityId);
    pushSnapshot();
    setSelectedActivities((prev) => {
      const updated = prev.filter((a) => a.id !== activityId);
      if (updated.length === 0) {
        setStepStatus((s) => ({ ...s, activities: 'not_started' }));
      }
      return updated;
    });
    setCustomItinerary((prev) => prev.filter((ev) => ev.id !== `ev-act-${activityId}`));
    triggerUndoNotification(`${act?.name || 'Activity'} removed.`, () => {
      if (act) addActivity(act);
    });
  };

  const toggleActivity = (activity: SelectedActivity) => {
    if (selectedActivities.some((a) => a.id === activity.id)) {
      removeActivity(activity.id);
    } else {
      addActivity(activity);
    }
  };

  const skipActivities = () => {
    pushSnapshot();
    setStepStatus((prev) => ({ ...prev, activities: 'skipped' }));
    goToNextStep();
  };

  // Itinerary Actions
  const updateItineraryEvent = (id: string, updated: Partial<ItineraryEvent>) => {
    pushSnapshot();
    setCustomItinerary((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...updated } : ev)));
    setStepStatus((prev) => ({ ...prev, itinerary: 'completed' }));
  };

  const moveItineraryEvent = (id: string, newDay: number, newTime?: string) => {
    pushSnapshot();
    setCustomItinerary((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, day: newDay, ...(newTime ? { time: newTime } : {}) } : ev))
    );
  };

  const replaceItineraryEvent = (id: string, replacement: Partial<ItineraryEvent>) => {
    pushSnapshot();
    setCustomItinerary((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...replacement } : ev))
    );
  };

  const addItineraryEvent = (event: Omit<ItineraryEvent, 'id'>) => {
    pushSnapshot();
    const newId = `ev-custom-${Date.now()}`;
    setCustomItinerary((prev) => [...prev, { ...event, id: newId }]);
    setStepStatus((prev) => ({ ...prev, itinerary: 'completed' }));
  };

  const addCustomItineraryEvent = (day: number, event: Omit<ItineraryEvent, 'id' | 'day'>) => {
    pushSnapshot();
    const newId = `ev-custom-${Date.now()}`;
    setCustomItinerary((prev) => [...prev, { ...event, id: newId, day }]);
    setStepStatus((prev) => ({ ...prev, itinerary: 'completed' }));
  };

  const removeItineraryEvent = (id: string) => {
    const ev = customItinerary.find((e) => e.id === id);
    pushSnapshot();
    setCustomItinerary((prev) => prev.filter((e) => e.id !== id));
    triggerUndoNotification(`${ev?.title || 'Itinerary item'} removed.`, () => {
      if (ev) setCustomItinerary((prev) => [...prev, ev]);
    });
  };

  /**
   * Phase 4A: Apply Optimize My Day result.
   * Re-assigns event times to match the optimized sequence.
   * User must explicitly click "Apply Optimization" — never auto-applied.
   */
  const applyDayOptimization = (dayNumber: number, optimizedStops: import('../types').OptimizedStopItem[]) => {
    pushSnapshot();
    setCustomItinerary((prev) => {
      const otherDays = prev.filter((ev) => ev.day !== dayNumber);
      const thisDay = prev.filter((ev) => ev.day === dayNumber);
      const updated = optimizedStops.map((stop) => {
        const original = thisDay.find((ev) => ev.id === stop.id);
        if (!original) return null;
        return { ...original, time: stop.time };
      }).filter((ev): ev is ItineraryEvent => ev !== null);
      return [...otherDays, ...updated];
    });
    triggerUndoNotification(`Day ${dayNumber} schedule optimized.`, () => {
      // undone by snapshot
    });
  };

  const setBudget = (newBudget: number) => {
    setBudgetState(newBudget);
  };


  // Canonical Destination Change: resets destination-specific items
  const changeDestination = (
    newDestination: string,
    newOrigin?: string,
    newDepDate?: string,
    newRetDate?: string,
    newTravellers?: number,
    newBudget?: number
  ) => {
    pushSnapshot();
    const destChanged = newDestination !== destination;
    if (destChanged) {
      setDestination(newDestination);
      // Clear destination-specific items
      setSelectedStay(null);
      setSelectedMobility(null);
      setSelectedActivities([]);
      setCustomItinerary([]);
      setStepStatus((prev) => ({
        ...prev,
        stays: 'not_started',
        local_transport: 'not_started',
        activities: 'not_started',
        itinerary: 'not_started',
      }));

      // If travel was bound to old destination, clear it
      if (selectedTravel && selectedTravel.destination !== newDestination) {
        setSelectedTravel(null);
        setStepStatus((prev) => ({ ...prev, travel: 'not_started' }));
      }
    }
    if (newOrigin !== undefined) setOrigin(newOrigin);
    if (newDepDate !== undefined) setDepartureDate(newDepDate);
    if (newRetDate !== undefined) setReturnDate(newRetDate);
    if (newTravellers !== undefined) setTravellers(newTravellers);
    if (newBudget !== undefined) setBudgetState(newBudget);
    setIsDraftEmpty(false);
  };

  // Canonical Global Reset: clears draft completely and removes localStorage
  const resetTripDraft = () => {
    pushSnapshot();
    setIsDraftEmpty(true);
    setOrigin('');
    setDestination('');
    setDepartureDate('');
    setReturnDate('');
    setTravellers(1);
    setCabin('Economy');
    setBudgetState(0);
    setCurrentStep('travel');
    setStepStatus({
      travel: 'not_started',
      stays: 'not_started',
      local_transport: 'not_started',
      activities: 'not_started',
      itinerary: 'not_started',
      review: 'not_started',
    });
    setSelectedTravel(null);
    setSelectedStay(null);
    setSelectedMobility(null);
    setSelectedActivities([]);
    setCustomItinerary([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear trip storage:', e);
    }
  };

  const resetTrip = resetTripDraft;

  const completeBooking = async (
    travellerDetails: TravellerDetail[],
    contact: ContactInfo,
    paymentMethod: string
  ) => {
    try {
      const bookingRef = `TP-${Math.floor(100000 + Math.random() * 900000)}`;
      const bookingId = `bk-${Date.now()}`;

      const selectedItems: SelectedItem[] = [];

      if (selectedTravel) {
        selectedItems.push({
          type: selectedTravel.mode === 'flight' ? 'flight' : 'package',
          id: selectedTravel.id,
          quantity: travellers,
        });
      }

      if (selectedStay) {
        selectedItems.push({
          type: 'hotel',
          id: selectedStay.id,
          nights: tripNights,
          rooms: 1,
        });
      }

      selectedActivities.forEach((act) => {
        selectedItems.push({
          type: 'activity',
          id: act.id,
          quantity: travellers,
        });
      });

      const breakdown = [];

      if (selectedTravel) {
        breakdown.push({
          type: selectedTravel.mode,
          id: selectedTravel.id,
          description: `${selectedTravel.operator} (${selectedTravel.identifier}) • ${selectedTravel.origin} → ${selectedTravel.destination}`,
          unit_price: selectedTravel.price,
          quantity: selectedTravel.mode === 'car' || selectedTravel.mode === 'cab' ? 1 : travellers,
          price: travelTotal,
        });
      }

      if (selectedStay) {
        breakdown.push({
          type: 'stay',
          id: selectedStay.id,
          description: `${selectedStay.name} (${selectedStay.type}) • ${tripNights} nights`,
          unit_price: selectedStay.price_per_night,
          quantity: tripNights,
          price: stayTotal,
        });
      }

      if (selectedMobility) {
        breakdown.push({
          type: 'local_transport',
          id: selectedMobility.id,
          description: `${selectedMobility.title} (${selectedMobility.vehicleModel})`,
          unit_price: selectedMobility.price,
          quantity: 1,
          price: selectedMobility.price,
        });
      }

      selectedActivities.forEach((act) => {
        breakdown.push({
          type: 'activity',
          id: act.id,
          description: act.name,
          unit_price: act.price,
          quantity: travellers,
          price: act.price * travellers,
        });
      });

      const confirmedBooking: Booking = {
        id: bookingId,
        booking_reference: bookingRef,
        selected_items: selectedItems,
        traveller_details: travellerDetails,
        contact: contact,
        total_amount: estimatedTotal,
        subtotal: subtotal,
        taxes: taxes,
        service_fee: 0,
        currency: 'INR',
        breakdown: breakdown,
        payment_id: `pay_demo_${Date.now()}`,
        status: 'confirmed',
        trip_budget: budget || undefined,
        planned_total: estimatedTotal,
        remaining_budget: budget ? Math.max(0, budget - estimatedTotal) : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to localStorage for instant reflection in MyBookings & Confirmation
      try {
        const existingRaw = localStorage.getItem('trippilot_user_bookings');
        const existing: Booking[] = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem('trippilot_user_bookings', JSON.stringify([confirmedBooking, ...existing]));
      } catch (err) {
        console.warn('Failed to save to local bookings store:', err);
      }

      return {
        success: true,
        bookingId: bookingId,
        bookingReference: bookingRef,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to complete booking',
      };
    }
  };

  // ─── PHASE 7: COLLABORATION & PREFERENCE HANDLERS ───
  const addSuggestion = (s: Omit<TripSuggestion, 'id' | 'createdAt' | 'status'>) => {
    const newSug: TripSuggestion = {
      ...s,
      id: `sug-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSuggestions((prev) => [newSug, ...prev]);
  };

  const acceptSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          if (s.type === 'activity') {
            addActivity({
              id: `act-${Date.now()}`,
              name: s.title,
              destination: destination,
              category: 'Tour',
              duration: '2 Hours',
              rating: 4.8,
              price: s.cost || 2000,
              image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
              description: s.description,
              time: '17:00',
            });
          }
          return { ...s, status: 'accepted' };
        }
        return s;
      })
    );
  };

  const rejectSuggestion = (id: string, note?: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected', note } : s))
    );
  };

  const logTripActivity = (entry: Omit<TripActivityEntry, 'id' | 'timestamp'>) => {
    const newEntry: TripActivityEntry = {
      ...entry,
      id: `act-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setTripActivityLog((prev) => [newEntry, ...prev]);
  };

  const addTripComment = (comment: Omit<TripComment, 'id' | 'createdAt'>) => {
    const newCmt: TripComment = {
      ...comment,
      id: `cmt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTripComments((prev) => [...prev, newCmt]);
  };

  const deleteTripComment = (id: string) => {
    setTripComments((prev) => prev.filter((c) => c.id !== id));
  };

  const value: TripBuilderContextType = {
    origin,
    setOrigin,
    destination,
    setDestination,
    departureDate,
    returnDate,
    travellers,
    cabin,
    budget,
    currentStep,
    stepStatus,
    travelModePreference,
    selectedTravel,
    stayTypePreference,
    selectedStay,
    localTransportPreference,
    transportOptimization,
    selectedMobility,
    selectedActivities,
    customItinerary,
    travelTotal,
    stayTotal,
    mobilityTotal,
    activitiesTotal,
    subtotal,
    taxes,
    estimatedTotal,
    remainingBudget,
    completedStepsCount,
    tripNights,
    isDraftEmpty,
    canUndo: historyStack.length > 0,
    groupType,
    setGroupType,
    detectedConflicts,
    activePlanVersion,
    notificationSettings,
    updateNotificationSettings,
    togglePlanVersion,
    applyConflictOptimization,
    applyPlanB,
    lastWeatherSnapshot,
    dismissedWeatherDays,
    applyDayAdaptation,
    undoWeatherAdaptation,
    dismissWeatherAlertForDay,
    setTripSearch,
    setStep,
    goToNextStep,
    goToPrevStep,
    setTravelModePreference,
    selectTravelItem,
    removeTravel,
    unselectTravel,
    replaceTravel,
    skipTravel,
    setStayTypePreference,
    selectStayItem,
    changeStayRoom,
    removeStay,
    unselectStay,
    replaceStay,
    skipStay,
    setLocalTransportPreference,
    setTransportOptimization,
    selectMobilityItem,
    removeMobility,
    unselectMobility,
    replaceMobility,
    skipMobility,
    addActivity,
    removeActivity,
    toggleActivity,
    skipActivities,
    updateItineraryEvent,
    moveItineraryEvent,
    replaceItineraryEvent,
    addItineraryEvent,
    addCustomItineraryEvent,
    removeItineraryEvent,
    regenerateItinerary,
    applyDayOptimization,
    undoNotification,
    triggerUndoNotification,
    dismissUndoNotification,
    setBudget,
    changeDestination,
    resetTripDraft,
    resetTrip,
    undoLastAction,
    // ─── 20-FEATURE PRODUCT EXPANSION EXPORTS ───
    travelStyle,
    setTravelStyle,
    interests,
    setInterests,
    toggleInterest,
    tripPurpose,
    setTripPurpose,
    dateFlexibility,
    setDateFlexibility,
    selectedRestaurants,
    addRestaurant,
    removeRestaurant,
    packingList,
    togglePackingItem,
    addPackingItem,
    removePackingItem,
    documentChecklist,
    toggleDocumentItem,
    sharedMembers,
    addSharedMember,
    removeSharedMember,
    groupExpenses,
    addGroupExpense,
    settleGroupExpense,
    tripScore,
    tripHealth,
    // ─── PHASE 3: FINANCIAL INTELLIGENCE & BUDGET EXPORTS ───
    baseCurrency,
    setBaseCurrency,
    plannedCost,
    actualSpent,
    budgetStatus,
    budgetUsedPercentage,
    budgetRemainingPercentage,
    categorySpendBreakdown,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpenseSettlement,
    settlementBalances,
    priceAlerts,
    addPriceAlert,
    togglePriceAlert,
    deletePriceAlert,
    simulatePriceDrop,
    optimizationRecommendations,
    applyOptimizationRecommendation,
    revertOptimizationRecommendation,
    completeBooking,
    // ─── PHASE 7: COLLABORATION & PREFERENCES ───
    suggestions,
    addSuggestion,
    acceptSuggestion,
    rejectSuggestion,
    tripActivityLog,
    logTripActivity,
    tripComments,
    addTripComment,
    deleteTripComment,
    seatPreference,
    setSeatPreference: setSeatPreferenceState,
    mealPreference,
    setMealPreference: setMealPreferenceState,
    tripPace,
    setTripPace: setTripPaceState,
    hotelStarPreference,
    setHotelStarPreference: setHotelStarPreferenceState,
    foodPreference,
    setFoodPreference: setFoodPreferenceState,
  };

  return <TripBuilderContext.Provider value={value}>{children}</TripBuilderContext.Provider>;
};

export const useTripBuilder = () => {
  const context = useContext(TripBuilderContext);
  if (!context) {
    throw new Error('useTripBuilder must be used within a TripBuilderProvider');
  }
  return context;
};
