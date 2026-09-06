// All TypeScript types for TripPilot

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  preferences?: {
    currency: string;
    notifications: boolean;
    travel_style: string[];
  };
  created_at?: string;
}

export interface Destination {
  id: string;
  country: string;
  city: string;
  description: string;
  image_url: string;
  tags: string[];
  attractions: string[];
  average_daily_budget: number;
  featured: boolean;
  best_time?: string;
  weather?: string;
}

export interface Flight {
  id: string;
  airline: string;
  airline_logo?: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: number; // in minutes
  stops: number;
  cabin_class: string;
  price: number;
  seats_available: number;
  baggage_policy: string;
  cancellation_policy: string;
  fare_type?: 'Saver' | 'Flexi' | 'SuperFlex';
  aircraft?: string;
}

export interface Hotel {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  description: string;
  image_urls: string[];
  rating: number;
  review_count?: number;
  amenities: string[];
  room_types: string[];
  price_per_night: number;
  cancellation_policy: string;
  available_rooms: number;
  distance_from_center?: string;
  property_type?: 'Hotel' | 'Resort' | 'Villa' | 'Apartment' | 'Boutique';
}

export interface HolidayPackage {
  id: string;
  title: string;
  destination: string;
  image_url: string;
  duration_days: number;
  duration_nights: number;
  price: number;
  original_price?: number;
  rating: number;
  reviews_count: number;
  inclusions: string[];
  theme: 'Family' | 'Honeymoon' | 'Adventure' | 'Luxury' | 'Weekend';
  highlights: string[];
}

export interface Booking {
  id: string;
  booking_reference: string;
  trip_id?: string;
  destination_title?: string;
  is_demo?: boolean;
  mode?: 'DEMO' | 'LIVE';
  selected_items: SelectedItem[];
  traveller_details: TravellerDetail[];
  addons?: Array<{ id: string; name: string; price: number; type: string; selected?: boolean }>;
  contact: ContactInfo;
  total_amount: number;
  subtotal: number;
  taxes: number;
  service_fee: number;
  currency: string;
  breakdown: PriceBreakdownItem[];
  payment_id: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  trip_budget?: number;
  planned_total?: number;
  remaining_budget?: number;
  cancellation_details?: {
    reason: string;
    cancelled_at: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SelectedItem {
  type: 'flight' | 'hotel' | 'activity' | 'package' | 'transport' | 'train' | 'bus';
  id: string;
  quantity?: number;
  nights?: number;
  rooms?: number;
  flight_data?: Flight;
  hotel_data?: Hotel;
  package_data?: HolidayPackage;
  activity_data?: any;
  transport_data?: any;
}

export interface TravellerDetail {
  id?: string;
  title: string;
  first_name: string;
  last_name: string;
  dob?: string;
  date_of_birth?: string;
  gender?: string;
  passport_number?: string;
  nationality?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
}

export interface ContactInfo {
  email: string;
  phone: string;
  country_code: string;
}

export interface PriceBreakdownItem {
  type: string;
  id: string;
  description: string;
  unit_price: number;
  quantity: number;
  price: number;
  amount?: number;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travellers: number;
  days: ItineraryDay[];
  estimated_cost: number;
  estimated_total_cost?: number;
  budget_id?: string;
  ai_generated: boolean;
  summary: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: Activity[];
  accommodation: string;
  daily_budget: number;
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
  estimated_cost: number;
  type: 'sightseeing' | 'food' | 'transport' | 'accommodation' | 'adventure';
}

export interface Budget {
  id: string;
  trip_name: string;
  currency: string;
  total_budget: number;
  categories: BudgetCategories;
  expenses: Expense[];
  planned_amount?: number;
  spent_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategories {
  flights: number;
  hotels: number;
  food: number;
  activities: number;
  local_transport: number;
  shopping: number;
  miscellaneous: number;
}

export interface CategorySpendItem {
  category: keyof BudgetCategories;
  label: string;
  planned: number;
  actual: number;
  remaining: number;
  iconName?: string;
}

export interface Expense {
  id: string;
  category: keyof BudgetCategories;
  description: string;
  amount: number;
  currency?: string;
  baseCurrency?: string;
  convertedAmount?: number;
  date: string;
  paidBy?: string;
  participants?: string[];
  splitMode?: 'equal' | 'custom' | 'percentage';
  splits?: Record<string, number>;
  notes?: string;
  settlementStatus?: 'unsettled' | 'settled';
  createdAt?: string;
}

export interface PriceAlert {
  id: string;
  tripId?: string;
  type: 'flight' | 'hotel' | 'trip';
  title: string;
  targetPrice: number;
  currentPrice: number;
  lowestObserved?: number;
  currency: string;
  status: 'active' | 'paused';
  lastChecked: string;
  routeOrDetails?: string;
  isSimulatedPriceDrop?: boolean;
  droppedPrice?: number;
  savingsEstimate?: number;
  createdAt: string;
}

export interface BudgetOptimizationRecommendation {
  id: string;
  category: 'hotel' | 'flight' | 'activity' | 'transport';
  currentTitle: string;
  currentCost: number;
  recommendedTitle: string;
  recommendedCost: number;
  savings: number;
  tradeoffs: string[];
  reasoning: string;
  applied: boolean;
  scoreImpact?: string;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateAgainstINR: number; // 1 Code = X INR
  flag: string;
}

export interface SettlementBalance {
  fromMember: string;
  toMember: string;
  amount: number;
  settled: boolean;
  expenseTitle?: string;
}


export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIResponse {
  source: 'ai' | 'fallback';
  reply: string;
  suggestions: string[];
  requires_action: boolean;
  action_type: string | null;
}

export interface SearchFlightParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  passengers: number;
  cabin_class: string;
  trip_type?: 'one-way' | 'round-trip' | 'multi-city';
}

export interface SearchHotelParams {
  city: string;
  country?: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items?: T[];
  flights?: T[];
  hotels?: T[];
  destinations?: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface CartItem {
  type: 'flight' | 'hotel' | 'package';
  item: Flight | Hotel | HolidayPackage;
  quantity: number;
  nights?: number;
  rooms?: number;
  subtotal: number;
}

export interface Offer {
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount: number;
  min_booking_amount: number;
  valid_until: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'flight' | 'hotel' | 'deal' | 'system';
}

// ─── 20-FEATURE PRODUCT EXPANSION TYPES ───
export type TravelStyle = 'budget' | 'balanced' | 'comfort' | 'luxury' | 'custom';
export type DateFlexibility = 'exact' | '1day' | '3days' | '7days';

export interface RestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price_level: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  image_url: string;
  location: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'cafe' | 'nightlife';
  cost: number;
}

export type PackingCategory =
  | 'Clothing'
  | 'Toiletries'
  | 'Electronics'
  | 'Documents'
  | 'Health & Personal Care'
  | 'Weather Gear'
  | 'Activity Gear'
  | 'Travel Accessories'
  | 'Sun & Rain'
  | 'Footwear'
  | 'Swim & Water'
  | 'Hiking & Gear'
  | 'Other';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  essential: boolean;
  checked: boolean;
  assignedTo?: string; // For shared trips (e.g. "Sohan", "Rahul", "Shared Gear")
  quantity?: number;
  isCustom?: boolean;
  reason?: string; // Weather/Activity rationale
}

export type DocumentSourceType = 'OFFICIAL REQUIREMENT' | 'TRIPPILOT RECOMMENDATION';

export interface DocumentCheckItem {
  id: string;
  title: string;
  category: 'Tickets' | 'Identities' | 'Vouchers' | 'Insurance' | 'Medical' | 'Contacts' | 'Visa & Entry';
  sourceType: DocumentSourceType;
  required: boolean;
  completed: boolean;
  note?: string;
  actionLink?: string;
}

export interface TravelHelpContact {
  id: string;
  name: string;
  type: 'emergency' | 'hospital' | 'police' | 'embassy' | 'hotel' | 'airline' | 'transport' | 'trippilot_support';
  phone: string;
  address?: string;
  distance?: string;
  sourceType: 'OFFICIAL' | 'PROVIDER' | 'TRIPPILOT SUPPORT';
  availability?: string;
  actionUrl?: string;
}

export interface PreDepartureReminder {
  id: string;
  timeframe: '7_days' | '3_days' | '1_day' | '2_hours';
  timeframeLabel: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface TripReadinessSummary {
  overallPercentage: number;
  statusLabel: 'Fully Ready' | 'Near Ready' | 'Needs Attention';
  completedCount: number;
  totalCount: number;
  checklist: {
    key: string;
    label: string;
    status: 'ready' | 'incomplete' | 'warning';
    details: string;
    actionLabel?: string;
    actionRoute?: string;
  }[];
}

export interface SharedMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
}

export interface GroupExpense {
  id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_between: string[];
  date: string;
  settled: boolean;
}

export interface TripScoreBreakdown {
  total: number;
  budgetFit: number;
  convenience: number;
  weatherFit: number;
  interestMatch: number;
  stayQuality?: number;
  travelTimeFit?: number;
  explanation: string[];
}

export interface TripHealthIssue {
  id: string;
  severity: 'warning' | 'error' | 'info';
  message: string;
  actionStep?: string;
  actionLabel?: string;
}

export interface TripHealthStatus {
  readyPercentage: number;
  statusLabel: 'Fully Ready' | 'Near Ready' | 'Needs Attention';
  issues: TripHealthIssue[];
}

export interface OptimizedStopItem {
  id: string;
  time: string;
  title: string;
  type: string;
  location: string;
  duration: string;
  cost?: number;
  description?: string;
  openingHours?: string;
}

export interface DayOptimizationResult {
  dayNumber: number;
  currentStops: OptimizedStopItem[];
  optimizedStops: OptimizedStopItem[];
  estimatedTimeSavedMinutes: number;
  reasoning: string;
  factorsConsidered: string[];
  tradeoffs: string[];
}

export interface ContextualRecommendation {
  id: string;
  title: string;
  category: string;
  estDuration: string;
  cost: number;
  distance: string;
  whyItFits: string;
  weatherSuitability: 'optimal' | 'moderate' | 'indoor_safe';
  type: 'activity' | 'dining' | 'relaxation' | 'culture';
}

export interface AICopilotActionCard {
  id: string;
  actionType: 'change_destination' | 'replace_hotel' | 'optimize_day' | 'start_fresh' | 'add_activity' | 'budget_optimizer';
  title: string;
  description: string;
  payload?: any;
  buttonLabel: string;
  status: 'pending' | 'applied' | 'dismissed';
}


