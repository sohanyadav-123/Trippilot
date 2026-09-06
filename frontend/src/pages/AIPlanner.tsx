import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Navigation,
  CloudSun,
  TrendingDown,
  Smile,
  Crown,
  ChevronRight,
  Save,
  ShoppingBag,
  Share2,
  Download,
  AlertCircle,
  Building2,
  Plane,
  Car,
  Utensils,
  Info,
  Vote,
  ArrowRight,
  RotateCcw,
  Check,
  Trash2,
  Sliders,
} from 'lucide-react';
import { aiService } from '../services/aiService';
import { itineraryService } from '../services/itineraryService';
import { useAuth } from '../hooks/useAuth';
import { useTravelSettings } from '../context/TravelSettingsContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { RouteOptimizerView } from '../components/Itinerary/RouteOptimizerView';
import { AdaptiveIntelligenceBanner } from '../components/Itinerary/AdaptiveIntelligenceBanner';
import { GroupTripPlanner } from '../components/Itinerary/GroupTripPlanner';
import { BudgetOptimizerCard } from '../components/Itinerary/BudgetOptimizerCard';
import { VisualDestinationSearch } from '../components/AI/VisualDestinationSearch';
import { SmartTripTimeline } from '../components/Itinerary/SmartTripTimeline';
import { ItineraryDay } from '../types';
import { useTripBuilder } from '../context/TripBuilderContext';

interface AITripOption {
  id: string;
  destination: string;
  tagline: string;
  duration: string;
  nights: number;
  estTotal: number;
  travelCost: number;
  hotelCost: number;
  transportCost: number;
  activitiesCost: number;
  foodEstimate: number;
  dataStatus: 'LIVE' | 'ESTIMATED' | 'DEMO';
  bestFor: string;
  whyItFits: string;
  flight: {
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
  };
  hotel: {
    name: string;
    rating: number;
    roomType: string;
    pricePerNight: number;
    totalStay: number;
  };
  transport: {
    type: string;
    model: string;
    price: number;
  };
}

export const AIPlanner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, tPlace, travelMode } = useTravelSettings();
  const {
    changeDestination,
    selectTravelItem,
    selectStayItem,
    selectMobilityItem,
    addActivity,
    addCustomItineraryEvent,
    setBudget: setContextBudget,
    setStep,
  } = useTripBuilder();

  // Natural Language Prompt State
  const [naturalPrompt, setNaturalPrompt] = useState(
    'I have ₹40,000, two people, five days from Hyderabad, and want a relaxed beach trip with good food.'
  );

  // Active sub-tab in planner
  const [activeTab, setActiveTab] = useState<'schedule' | 'timeline' | 'route' | 'weather' | 'group' | 'budget_opt' | 'visual_search'>('schedule');

  // Form parameters
  const [origin, setOrigin] = useState('Hyderabad');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [durationDays, setDurationDays] = useState(Number(searchParams.get('days') || 5));
  const [travellers, setTravellers] = useState(Number(searchParams.get('travellers') || 2));
  const [budget, setBudget] = useState(Number(searchParams.get('budget') || 40000));
  const [interests, setInterests] = useState<string[]>(['Beach', 'Food', 'Culture', 'Relaxation']);
  const [travelStyle, setTravelStyle] = useState<'budget' | 'balanced' | 'comfort' | 'luxury'>('balanced');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt-1');

  // AI response state
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // 4 AI Trip Options
  const tripOptions: AITripOption[] = [
    {
      id: 'opt-1',
      destination: 'Goa',
      tagline: 'Coastal Vibes & Seafood Culture',
      duration: '5 Days / 4 Nights',
      nights: 4,
      estTotal: 37500,
      travelCost: 9700,
      hotelCost: 13200,
      transportCost: 3600,
      activitiesCost: 5000,
      foodEstimate: 6000,
      dataStatus: 'ESTIMATED',
      bestFor: 'Beach + Dining + Sunset Cruises',
      whyItFits: `Direct 1.5 hr flights from ${origin}, excellent 4★ beach resorts under budget, and fits your ${travelStyle} style perfectly.`,
      flight: {
        airline: 'IndiGo Airlines',
        flightNumber: '6E-512',
        departureTime: '09:15 AM',
        arrivalTime: '10:45 AM',
        price: 4850,
      },
      hotel: {
        name: 'The Heritage Coastal Resort & Spa',
        rating: 4.8,
        roomType: 'Deluxe Sea View Suite',
        pricePerNight: 3300,
        totalStay: 13200,
      },
      transport: {
        type: 'Airport Transfer & Rental Car',
        model: 'Maruti Ertiga (AC 6-Seater)',
        price: 3600,
      },
    },
    {
      id: 'opt-2',
      destination: 'Gokarna',
      tagline: 'Tranquil Beach Treks & Cliff Cafes',
      duration: '5 Days / 4 Nights',
      nights: 4,
      estTotal: 30500,
      travelCost: 6500,
      hotelCost: 11000,
      transportCost: 3000,
      activitiesCost: 4000,
      foodEstimate: 6000,
      dataStatus: 'ESTIMATED',
      bestFor: 'Relaxation + Uncrowded Sands',
      whyItFits: `Economical coastal escape leaving ₹${(budget - 30500).toLocaleString('en-IN')} unspent for dining and wellness.`,
      flight: {
        airline: 'Air India Express',
        flightNumber: 'IX-381',
        departureTime: '07:30 AM',
        arrivalTime: '09:15 AM',
        price: 3250,
      },
      hotel: {
        name: 'Kudle Oceanfront Boutique Stays',
        rating: 4.7,
        roomType: 'Beach Cottage',
        pricePerNight: 2750,
        totalStay: 11000,
      },
      transport: {
        type: 'Local Cab & Scooter Rental',
        model: 'Honda Activa 6G',
        price: 3000,
      },
    },
    {
      id: 'opt-3',
      destination: 'Varkala',
      tagline: 'Red Cliffs, Ayurvedic Spas & Arabian Sea',
      duration: '5 Days / 4 Nights',
      nights: 4,
      estTotal: 34000,
      travelCost: 8800,
      hotelCost: 12400,
      transportCost: 3800,
      activitiesCost: 4000,
      foodEstimate: 5000,
      dataStatus: 'ESTIMATED',
      bestFor: 'Cliff Cafes + Wellness + Culture',
      whyItFits: 'Picturesque cliffside accommodation with dramatic sunset panoramas and high budget efficiency.',
      flight: {
        airline: 'IndiGo Airlines',
        flightNumber: '6E-720',
        departureTime: '10:00 AM',
        arrivalTime: '11:50 AM',
        price: 4400,
      },
      hotel: {
        name: 'Varkala Cliffside Heritage Villa',
        rating: 4.6,
        roomType: 'Ocean Breeze Room',
        pricePerNight: 3100,
        totalStay: 12400,
      },
      transport: {
        type: 'Private Airport Cab',
        model: 'Toyota Etios (Sedan)',
        price: 3800,
      },
    },
    {
      id: 'opt-4',
      destination: 'Kerala',
      tagline: 'Backwaters & Emerald Hill Tea Estates',
      duration: '5 Days / 4 Nights',
      nights: 4,
      estTotal: 38500,
      travelCost: 9200,
      hotelCost: 14000,
      transportCost: 4500,
      activitiesCost: 4800,
      foodEstimate: 6000,
      dataStatus: 'ESTIMATED',
      bestFor: 'Nature + Houseboats + Scenic Hills',
      whyItFits: 'Lush backwaters cruise and Ayurvedic treatments within target budget limit.',
      flight: {
        airline: 'SpiceJet',
        flightNumber: 'SG-405',
        departureTime: '08:45 AM',
        arrivalTime: '10:30 AM',
        price: 4600,
      },
      hotel: {
        name: 'Alleppey Backwater Heritage Retreat',
        rating: 4.8,
        roomType: 'Lagoon View Cottage',
        pricePerNight: 3500,
        totalStay: 14000,
      },
      transport: {
        type: 'Private Chauffeur Car',
        model: 'Toyota Innova Crysta',
        price: 4500,
      },
    },
  ];

  const currentOption = tripOptions.find((opt) => opt.id === selectedOptionId) || tripOptions[0];

  // Natural Language Prompt Parser
  const handleParsePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const text = naturalPrompt.toLowerCase();

    // Detect budget
    const budgetMatch = text.match(/₹?\s*(\d+[\d,]*)/);
    if (budgetMatch) {
      const parsedNum = Number(budgetMatch[1].replace(/,/g, ''));
      if (parsedNum >= 5000) setBudget(parsedNum);
    }

    // Detect travellers
    if (text.includes('solo') || text.includes('1 person') || text.includes('one person')) {
      setTravellers(1);
    } else if (text.includes('two') || text.includes('2 people') || text.includes('couple') || text.includes('2 travellers')) {
      setTravellers(2);
    } else if (text.includes('three') || text.includes('3 people')) {
      setTravellers(3);
    } else if (text.includes('four') || text.includes('4 people') || text.includes('family')) {
      setTravellers(4);
    }

    // Detect origin
    if (text.includes('from hyderabad')) setOrigin('Hyderabad');
    else if (text.includes('from delhi')) setOrigin('Delhi');
    else if (text.includes('from mumbai')) setOrigin('Mumbai');
    else if (text.includes('from bangalore')) setOrigin('Bangalore');

    // Detect destination
    if (text.includes('gokarna')) {
      setDestination('Gokarna');
      setSelectedOptionId('opt-2');
    } else if (text.includes('varkala')) {
      setDestination('Varkala');
      setSelectedOptionId('opt-3');
    } else if (text.includes('kerala')) {
      setDestination('Kerala');
      setSelectedOptionId('opt-4');
    } else {
      setDestination('Goa');
      setSelectedOptionId('opt-1');
    }

    generatePlan();
  };

  // Generate Itinerary Mock
  const generatePlan = async () => {
    setLoading(true);
    setSaveStatus(null);
    try {
      const mockDays: ItineraryDay[] = Array.from({ length: durationDays }).map((_, idx) => ({
        day: idx + 1,
        date: `Day ${idx + 1}`,
        accommodation: `${currentOption.hotel.name}`,
        daily_budget: Math.round(budget / durationDays),
        activities: [
          {
            time: '09:00 AM',
            activity: idx === 0 ? `Arrival from ${origin} & Hotel Check-in` : 'Morning Coastal Viewpoint & Light Walk',
            description: `Scenic walk and traditional local breakfast in ${currentOption.destination}.`,
            estimated_cost: Math.round((budget / durationDays) * 0.2),
            type: 'sightseeing',
          },
          {
            time: '01:30 PM',
            activity: 'Authentic Regional Dining & Heritage Stop',
            description: 'Multi-course coastal seafood lunch and heritage architecture trail.',
            estimated_cost: Math.round((budget / durationDays) * 0.3),
            type: 'food',
          },
          {
            time: '05:00 PM',
            activity: 'Sunset Beach Relaxation & Water Sports',
            description: 'Unwind at uncrowded golden sands as the sun sets over the sea.',
            estimated_cost: Math.round((budget / durationDays) * 0.3),
            type: 'adventure',
          },
          {
            time: '08:30 PM',
            activity: 'Waterfront Dinner with Live Acoustic Music',
            description: 'Chef specials and ocean breeze dining.',
            estimated_cost: Math.round((budget / durationDays) * 0.2),
            type: 'food',
          },
        ],
      }));

      setItinerary({
        destination: currentOption.destination,
        duration_days: durationDays,
        total_estimated_budget: currentOption.estTotal,
        days: mockDays,
        budget_breakdown: {
          flights: currentOption.travelCost,
          hotels: currentOption.hotelCost,
          transport: currentOption.transportCost,
          activities: currentOption.activitiesCost,
          food: currentOption.foodEstimate,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
  }, [selectedOptionId]);

  // Accept Complete Plan & Route to Canonical Trip Builder
  const handleAcceptPlan = () => {
    // 1. Sync search & destination
    changeDestination(
      currentOption.destination,
      origin,
      startDate,
      '2026-09-20',
      travellers,
      budget
    );

    // 2. Select Flight
    selectTravelItem({
      id: `fl-${currentOption.destination.toLowerCase()}`,
      title: `${currentOption.flight.airline} (${origin} → ${currentOption.destination})`,
      mode: 'flight',
      operator: currentOption.flight.airline,
      departureTime: currentOption.flight.departureTime,
      arrivalTime: currentOption.flight.arrivalTime,
      duration: '1h 30m',
      price: currentOption.flight.price,
      origin: origin,
      destination: currentOption.destination,
      identifier: currentOption.flight.flightNumber,
      inclusions: ['Direct Flight', 'Free Seat Selection', 'Hand Baggage Included'],
    });

    // 3. Select Stay
    selectStayItem({
      id: `hotel-${currentOption.destination.toLowerCase()}`,
      name: currentOption.hotel.name,
      type: 'Resort',
      destination: currentOption.destination,
      address: `Main Beach Road, ${currentOption.destination}`,
      description: currentOption.whyItFits,
      image_urls: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80'],
      rating: currentOption.hotel.rating,
      review_count: 142,
      price_per_night: currentOption.hotel.pricePerNight,
      cancellation_policy: 'Free cancellation up to 48 hours before check-in',
      selectedRoomName: currentOption.hotel.roomType,
    });

    // 4. Select Mobility
    selectMobilityItem({
      id: `mob-${currentOption.destination.toLowerCase()}`,
      type: 'rental_car',
      title: currentOption.transport.type,
      vehicleModel: currentOption.transport.model,
      price: currentOption.transport.price,
      route: `${currentOption.destination} Airport ⇄ Stays & Sightseeing`,
      capacity: `${travellers} Seats`,
      provider: 'Verified TripPilot Fleet',
      features: ['AC Vehicle', 'Chauffeur / Self-Drive Option', 'Sanitized'],
    });

    // 5. Navigate to Trip Builder Review
    setStep('review');
    navigate('/trip-builder');
  };

  // AI Customizer Filters
  const handleCustomizer = (modifier: string) => {
    if (modifier === 'luxury') {
      setBudget((b) => Math.round(b * 1.25));
      setTravelStyle('luxury');
    } else if (modifier === 'save') {
      setBudget((b) => Math.max(20000, Math.round(b * 0.85)));
      setTravelStyle('budget');
    } else if (modifier === 'adventure') {
      setInterests((prev) => Array.from(new Set([...prev, 'Adventure', 'Water Sports'])));
    } else if (modifier === 'relaxed') {
      setInterests((prev) => Array.from(new Set([...prev, 'Relaxation', 'Wellness'])));
    } else if (modifier === 'food') {
      setInterests((prev) => Array.from(new Set([...prev, 'Food', 'Local Experiences'])));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner with Natural Language Bar */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-luxury bg-white space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#0B1220] border border-[#C8A96B]/40 text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{t('ai.badge', 'INTELLIGENT AI TRIP ARCHITECT')}</span>
              </div>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B1220] tracking-tight">
              {t('ai.hero_title', 'Design Your Perfect Holiday with AI')}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl">
              {t('ai.hero_desc', 'Describe your dream trip in plain English or select from tailored alternatives. TripPilot calculates flights, hotels, activities, and budget seamlessly.')}
            </p>
          </div>
        </div>

        {/* Natural Language Prompt Input Bar */}
        <form onSubmit={handleParsePrompt} className="p-2 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 flex-grow w-full">
            <Sparkles className="w-4 h-4 text-[#C8A96B] flex-shrink-0" />
            <input
              type="text"
              value={naturalPrompt}
              onChange={(e) => setNaturalPrompt(e.target.value)}
              placeholder={t('ai.prompt_placeholder', 'e.g. I have ₹40,000, two people, five days from Hyderabad, want a beach trip...')}
              className="bg-transparent text-xs sm:text-sm font-medium text-slate-900 w-full focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="btn-primary text-xs font-bold !py-2.5 px-6 rounded-xl w-full sm:w-auto flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <span>{t('ai.generate_btn', 'Generate Trip Plans')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* ─── 4 ALTERNATIVE TRIP OPTIONS CAROUSEL ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-[#0B1220]">{t('ai.blueprints_title', '2–4 AI Trip Blueprints')}</h2>
            <p className="text-xs text-slate-500">{t('ai.blueprints_desc', 'Compare alternative destinations matching your budget & travel style')}</p>
          </div>
          <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
            {t('ai.options_count', { count: tripOptions.length }, `${tripOptions.length} Options Generated`)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tripOptions.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const remaining = budget - opt.estTotal;

            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-luxury ring-2 ring-[#C8A96B]'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-[#C8A96B]/20 text-[#C8A96B] border-[#C8A96B]/40'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {opt.duration}
                    </span>
                    <span className={`text-[9.5px] font-bold uppercase ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                      {opt.dataStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-editorial text-2xl font-bold ${isSelected ? 'text-white' : 'text-[#0B1220]'}`}>
                      {tPlace(opt.destination)}
                    </h3>
                    <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {opt.tagline}
                    </p>
                  </div>

                  <div className={`p-3 rounded-2xl space-y-1 text-xs ${
                    isSelected ? 'bg-white/10 text-slate-200' : 'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}>
                    <div className="flex justify-between">
                      <span>Estimated Total:</span>
                      <CurrencyDisplay amount={opt.estTotal} className={`font-black ${isSelected ? 'text-white' : 'text-slate-900'}`} />
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Remaining Budget:</span>
                      <span className={remaining >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        ₹{remaining.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <p className={`text-[11px] leading-relaxed italic ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{opt.whyItFits}"
                  </p>
                </div>

                <button
                  type="button"
                  className={`w-full text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-[#C8A96B] text-[#0B1220]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'Selected Blueprint ✓' : 'Select Option'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── AI CUSTOMIZER TOOLBAR ─── */}
      <div className="surface-card p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Sliders className="w-4 h-4 text-[#C8A96B]" />
          <span>Quick AI Refinements:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleCustomizer('luxury')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition-colors"
          >
            👑 More Luxury
          </button>
          <button
            type="button"
            onClick={() => handleCustomizer('save')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition-colors"
          >
            💰 Save Money
          </button>
          <button
            type="button"
            onClick={() => handleCustomizer('adventure')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition-colors"
          >
            🏄 More Adventure
          </button>
          <button
            type="button"
            onClick={() => handleCustomizer('relaxed')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition-colors"
          >
            🌴 More Relaxed
          </button>
          <button
            type="button"
            onClick={() => handleCustomizer('food')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition-colors"
          >
            🍽️ More Food
          </button>
        </div>
      </div>

      {/* ─── SELECTED BLUEPRINT DETAILS: FLIGHTS, HOTEL, TRANSPORT, BUDGET ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: AI Item Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Recommended Flight */}
          <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Recommended Flight</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">ESTIMATED</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-extrabold text-sm text-[#0B1220] block">{currentOption.flight.airline} ({currentOption.flight.flightNumber})</span>
                <span className="text-slate-500 font-medium">
                  {currentOption.flight.departureTime} ({origin}) → {currentOption.flight.arrivalTime} ({currentOption.destination}) • Direct (1h 30m)
                </span>
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={currentOption.flight.price} className="font-black text-base text-slate-900 block" />
                <span className="text-[10px] text-slate-400">per person</span>
              </div>
            </div>
          </div>

          {/* AI Recommended Hotel */}
          <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Recommended Stay</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">★ {currentOption.hotel.rating} Rating</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-extrabold text-sm text-[#0B1220] block">{currentOption.hotel.name}</span>
                <span className="text-slate-500 font-medium">
                  {currentOption.hotel.roomType} • {currentOption.nights} Nights Stay
                </span>
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={currentOption.hotel.totalStay} className="font-black text-base text-slate-900 block" />
                <span className="text-[10px] text-slate-400">₹{currentOption.hotel.pricePerNight.toLocaleString('en-IN')} / night</span>
              </div>
            </div>
          </div>

          {/* AI Recommended Transport */}
          <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Recommended Mobility</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">ALL 5 DAYS</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-extrabold text-sm text-[#0B1220] block">{currentOption.transport.type}</span>
                <span className="text-slate-500 font-medium">{currentOption.transport.model}</span>
              </div>
              <div className="text-right">
                <CurrencyDisplay amount={currentOption.transport.price} className="font-black text-base text-slate-900 block" />
                <span className="text-[10px] text-slate-400">total vehicle cost</span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs (Schedule, Timeline, Route, Weather) */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'schedule' ? 'bg-[#0B1220] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Day-by-Day Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'timeline' ? 'bg-[#0B1220] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Smart Timeline
            </button>
          </div>

          {/* Day-by-day Itinerary view */}
          {activeTab === 'schedule' && itinerary?.days && (
            <div className="space-y-4">
              {itinerary.days.map((dayItem: ItineraryDay) => (
                <div key={dayItem.day} className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-[#0B1220]">Day {dayItem.day} • {currentOption.destination}</span>
                    <span className="text-xs text-slate-400 font-mono">Est. Day Spend: ₹{dayItem.daily_budget.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-2.5">
                    {dayItem.activities.map((act, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block">{act.time}</span>
                          <h4 className="font-bold text-slate-900 mt-0.5">{act.activity}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                        </div>
                        <CurrencyDisplay amount={act.estimated_cost} className="font-bold text-slate-800" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'timeline' && <SmartTripTimeline />}
        </div>

        {/* Right Col: AI Budget Breakdown & Accept Action */}
        <div className="space-y-5">
          {/* AI Explainability Card */}
          <div className="surface-card p-5 rounded-3xl bg-[#0B1220] text-white shadow-lg space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96B] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WHY THIS BLUEPRINT?</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentOption.whyItFits}
            </p>
          </div>

          {/* AI Itemized Budget Card */}
          <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-base text-[#0B1220] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Budget Plan</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">ESTIMATED</span>
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Flights ({origin} ⇄ {currentOption.destination}):</span>
                <CurrencyDisplay amount={currentOption.travelCost} className="font-bold text-slate-900" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hotels & Stays ({currentOption.nights} Nights):</span>
                <CurrencyDisplay amount={currentOption.hotelCost} className="font-bold text-slate-900" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Transport & Mobility:</span>
                <CurrencyDisplay amount={currentOption.transportCost} className="font-bold text-slate-900" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Activities & Excursions:</span>
                <CurrencyDisplay amount={currentOption.activitiesCost} className="font-bold text-slate-900" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Food & Dining Estimate:</span>
                <CurrencyDisplay amount={currentOption.foodEstimate} className="font-bold text-slate-900" />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-sm">
                <span className="font-bold text-slate-900">Total Estimated Cost:</span>
                <CurrencyDisplay amount={currentOption.estTotal} className="font-black text-slate-900" />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between text-xs text-emerald-950">
                <span className="font-bold">Remaining Target Budget:</span>
                <span className="font-black text-emerald-900 font-mono">
                  ₹{(budget - currentOption.estTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Accept Plan Button */}
            <button
              type="button"
              onClick={handleAcceptPlan}
              className="btn-primary w-full text-xs font-bold !py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-luxury mt-4"
            >
              <span>Accept Plan & Go to Trip Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
