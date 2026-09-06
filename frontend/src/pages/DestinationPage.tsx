import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CloudSun,
  Sparkles,
  Plane,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Compass,
  Star,
  Luggage,
  UtensilsCrossed,
  Clock,
  Heart,
  ArrowLeftRight,
  Send,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { searchService } from '../services/searchService';
import { Destination, Flight, Hotel, Activity } from '../types';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useWishlist } from '../context/WishlistContext';
import { FEATURED_DESTINATIONS, EnrichedDestination } from '../data/destinationData';

export const DestinationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { origin, budget, travellers, travelStyle, changeDestination, setStep, addActivity, addRestaurant } = useTripBuilder();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [destination, setDestination] = useState<EnrichedDestination | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attractions' | 'stays' | 'dining' | 'itineraries'>('overview');
  const [aiPromptInput, setAiPromptInput] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Match from enriched dataset first
        const found =
          FEATURED_DESTINATIONS.find(
            (d) => d.id === id || d.city.toLowerCase() === id.toLowerCase() || d.id === `dest-${id.toLowerCase()}`
          ) || FEATURED_DESTINATIONS[0];

        setDestination(found);

        // Fetch live/mock flights & hotels
        const [flightRes, hotelRes, actRes] = await Promise.all([
          searchService.searchFlights({ origin, destination: found.city, per_page: 3 }),
          searchService.searchHotels({ city: found.city, per_page: 3 }),
          searchService.searchActivities({ destination: found.city, per_page: 4 }),
        ]);

        if (flightRes.success && flightRes.data) setFlights(flightRes.data.flights || []);
        if (hotelRes.success && hotelRes.data) setHotels(hotelRes.data.hotels || []);
        if (actRes.success && actRes.data) setActivities(actRes.data.activities || []);
      } catch {
        // Fallback
        setDestination(FEATURED_DESTINATIONS[0]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, origin]);

  if (loading || !destination) {
    return <LoadingSpinner size="xl" text="Loading destination travel blueprint..." className="py-32" />;
  }

  const saved = isInWishlist(destination.id);

  const handleToggleWishlist = () => {
    if (saved) {
      removeFromWishlist(destination.id);
    } else {
      addToWishlist({
        id: destination.id,
        type: 'destination',
        title: destination.city,
        subtitle: `${destination.country} • ${destination.best_time}`,
        price: destination.startingEstimatedPrice,
        rating: 4.9,
        imageUrl: destination.image_url,
        data: destination,
      });
    }
  };

  const handlePlanTrip = () => {
    changeDestination(destination.city);
    setStep('travel');
    navigate('/trip-builder');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Hero Banner with Rich Imagery */}
      <div className="relative h-[480px] sm:h-[520px] bg-slate-900 overflow-hidden">
        <img
          src={destination.image_url}
          alt={destination.city}
          className="w-full h-full object-cover opacity-80 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-black/40 to-black/30" />

        {/* Top Floating Controls */}
        <div className="absolute top-6 left-4 right-4 max-w-7xl mx-auto flex items-center justify-between z-20">
          <Link
            to="/destinations"
            className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold backdrop-blur-md transition-colors"
          >
            ← All Destinations
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/compare-trips?add=${encodeURIComponent(destination.city)}`)}
              className="px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>

            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                saved ? 'bg-rose-500 text-white' : 'bg-black/40 hover:bg-black/60 text-white'
              }`}
              title={saved ? 'Saved in Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Content Bottom */}
        <div className="absolute bottom-8 left-4 right-4 max-w-7xl mx-auto z-20 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#C8A96B] text-[#0B1220] text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
              {destination.region || 'Curated Destination'}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
              {destination.durationSuggestion || '4–6 Days Recommended'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300 block">
                {destination.state ? `${destination.state}, ${destination.country}` : destination.country}
              </span>
              <h1 className="text-4xl sm:text-6xl font-bold font-editorial text-white tracking-tight">
                {destination.city}
              </h1>
            </div>

            {/* Quick Action Plan Card */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Starting Estimate</span>
                <span className="text-2xl font-black text-[#C8A96B]">
                  ₹{destination.startingEstimatedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-slate-400 block">per person from {origin}</span>
              </div>

              <button
                type="button"
                onClick={handlePlanTrip}
                className="btn-primary text-xs !py-3 px-6 font-bold shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Plan Trip with {destination.city}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-30 space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: '📖 Overview & Highlights' },
            { id: 'attractions', label: '📍 Top Sights & Activities' },
            { id: 'stays', label: '🏨 Stays & Flights' },
            { id: 'dining', label: '🍽️ Food & Cuisine' },
            { id: 'itineraries', label: '🗓️ Blueprint Itineraries' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0B1220] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description card */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-xl font-bold text-[#0B1220] font-editorial">About {destination.city}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{destination.description}</p>

                {/* Highlights List */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Signature Experiences:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {destination.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimated Budget Breakdown */}
              <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0B1220]">Estimated Trip Cost Breakdown</h3>
                  <span className="text-xs font-bold text-slate-400">4-Day Baseline</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">Travel (Return)</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">
                      ₹{destination.costBreakdown.travel.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block">Stays (3 Nights)</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">
                      ₹{(destination.costBreakdown.hotelPerNight * 3).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Activities</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">
                      ₹{destination.costBreakdown.activities.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-700 uppercase block">Food Estimate</span>
                    <span className="text-base font-black text-slate-900 mt-1 block">
                      ₹{(destination.costBreakdown.foodPerDay * 4).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  Estimates are calculated using current provider baseline rates and adjust dynamically in Trip Builder.
                </p>
              </div>
            </div>

            {/* Sidebar Details & AI Prompts */}
            <div className="space-y-6">
              {/* Climate & Best Time */}
              <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-[#0B1220] flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-[#C8A96B]" />
                  <span>Climate & Seasonality</span>
                </h4>
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Best Time to Visit:</span>
                    <strong className="text-slate-900">{destination.best_time}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Current Forecast:</span>
                    <strong className="text-blue-700">{destination.weather}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Travel from {origin}:</span>
                    <strong className="text-slate-900">
                      {destination.travelTimeFromHubs[origin] || destination.travelTimeFromHubs['Delhi'] || 'Direct Flight'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Ask TripPilot AI Assistant Prompt Shortcuts */}
              <div className="surface-card p-6 rounded-3xl bg-[#0B1220] text-white shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                  <h4 className="font-bold text-sm text-white">Ask AI about {destination.city}</h4>
                </div>
                <p className="text-xs text-slate-300">Quick suggestions you can ask our Travel Copilot:</p>

                <div className="space-y-1.5">
                  {[
                    `What are the top 3 hidden gems in ${destination.city}?`,
                    `Can I plan ${destination.city} under ₹${budget.toLocaleString('en-IN')}?`,
                    `What is the best area to stay for ${travelStyle} travel?`,
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => alert(`Copilot initialized with: "${prompt}". Open AI Assistant at bottom right.`)}
                      className="w-full text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors border border-white/10"
                    >
                      💡 {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTRACTIONS */}
        {activeTab === 'attractions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.attractions.map((attr, idx) => (
                <div key={idx} className="surface-card p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stop #{idx + 1}</span>
                      <h4 className="font-bold text-base text-[#0B1220]">{attr}</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      Must Visit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    One of the most highly rated attractions in {destination.city}. Included in TripPilot recommended blueprints.
                  </p>
                  <button
                    type="button"
                    onClick={handlePlanTrip}
                    className="w-full btn-secondary text-xs !py-1.5 font-bold flex items-center justify-center gap-1"
                  >
                    <span>Include in My Trip</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STAYS & FLIGHTS */}
        {activeTab === 'stays' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#0B1220]">Verified Accommodations in {destination.city}</h3>
              <button onClick={handlePlanTrip} className="text-xs font-bold text-blue-600 hover:underline">
                Explore Full Hotel Catalog →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
                  <img src={hotel.image_urls[0]} alt={hotel.name} className="w-full h-40 object-cover rounded-2xl" />
                  <div>
                    <h4 className="font-bold text-sm text-[#0B1220]">{hotel.name}</h4>
                    <p className="text-xs text-slate-500">{hotel.address}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <CurrencyDisplay amount={hotel.price_per_night} className="font-black text-slate-900" />
                    <button onClick={handlePlanTrip} className="btn-primary text-xs !py-1 px-3">
                      Select Stay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DINING */}
        {activeTab === 'dining' && (
          <div className="space-y-6">
            <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-bold text-[#0B1220] font-editorial">Culinary Heritage & Food Specialties</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {destination.foodSpecialties.map((dish, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{dish}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">Plan curated breakfasts, dinners & cliffside lounges</span>
                <Link to="/restaurant-planner" className="btn-primary text-xs !py-2 px-4 font-bold flex items-center gap-1">
                  <span>Open Restaurant Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BLUEPRINT ITINERARIES */}
        {activeTab === 'itineraries' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Weekend Special
                </span>
                <h4 className="font-bold text-lg text-[#0B1220]">3-Day Highlights Blueprint</h4>
                <p className="text-xs text-slate-600">
                  Fast-paced itinerary covering primary coastal viewpoints, historic forts, and evening sunset dining.
                </p>
                <button onClick={handlePlanTrip} className="btn-primary text-xs !py-2 px-4 font-bold w-full">
                  Load 3-Day Blueprint
                </button>
              </div>

              <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Complete Holiday
                </span>
                <h4 className="font-bold text-lg text-[#0B1220]">5-Day Immersive Blueprint</h4>
                <p className="text-xs text-slate-600">
                  Balanced itinerary with heritage walks, water adventures, Ayurvedic wellness relaxation, and food crawls.
                </p>
                <button onClick={handlePlanTrip} className="btn-primary text-xs !py-2 px-4 font-bold w-full">
                  Load 5-Day Blueprint
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
