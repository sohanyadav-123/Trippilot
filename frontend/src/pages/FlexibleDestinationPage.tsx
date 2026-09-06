import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  CloudSun,
  Clock,
  Heart,
  Users,
  Plane,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useWishlist } from '../context/WishlistContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { FEATURED_DESTINATIONS, EnrichedDestination } from '../data/destinationData';

export const FlexibleDestinationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    origin: contextOrigin,
    budget: contextBudget,
    travellers: contextTravellers,
    travelStyle: contextStyle,
    interests: contextInterests,
    changeDestination,
    setStep,
  } = useTripBuilder();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Flexible Inputs Form State
  const [selectedOrigin, setSelectedOrigin] = useState<string>(contextOrigin || 'Hyderabad');
  const [inputBudget, setInputBudget] = useState<number>(contextBudget || 30000);
  const [durationDays, setDurationDays] = useState<number>(5);
  const [guestCount, setGuestCount] = useState<number>(contextTravellers || 2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    contextInterests.length > 0 ? contextInterests : ['beach', 'food']
  );
  const [selectedStyle, setSelectedStyle] = useState<string>(contextStyle || 'balanced');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Domestic' | 'International'>('all');

  const allInterests = [
    { id: 'beach', label: '🏖️ Beach' },
    { id: 'food', label: '🍲 Food & Culinary' },
    { id: 'heritage', label: '🏛️ Heritage & Culture' },
    { id: 'mountain', label: '⛰️ Mountains & Alpine' },
    { id: 'luxury', label: '✨ Luxury & Royal' },
    { id: 'relaxation', label: '🧘 Wellness & Calm' },
    { id: 'adventure', label: '🏄 Adventure & Sports' },
    { id: 'nature', label: '🌲 Nature & Wildlife' },
  ];

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Dynamic Multi-Factor Discovery Recommendation Engine
  const recommendedResults = useMemo(() => {
    return FEATURED_DESTINATIONS.map((dest) => {
      // Calculate realistic itemized trip estimates
      const baseTravel = dest.costBreakdown.travel * guestCount;
      const baseHotel = dest.costBreakdown.hotelPerNight * (durationDays - 1);
      const baseTransport = dest.costBreakdown.localTransport;
      const baseActivities = dest.costBreakdown.activities * guestCount;
      const baseFood = dest.costBreakdown.foodPerDay * durationDays * guestCount;
      const estTotal = baseTravel + baseHotel + baseTransport + baseActivities + baseFood;
      const isWithinBudget = estTotal <= inputBudget;
      const remainingBudget = inputBudget - estTotal;

      // Travel Time
      const travelTime =
        dest.travelTimeFromHubs[selectedOrigin] ||
        dest.travelTimeFromHubs['Hyderabad'] ||
        dest.travelTimeFromHubs['Delhi'] ||
        'Direct connection';

      // Compute Match Score (0 - 100)
      let score = 70;
      const matchingTags = dest.tags.filter((t) => selectedInterests.includes(t));
      score += matchingTags.length * 10;
      if (isWithinBudget) score += 15;
      if (dest.isWeekendGetaway && durationDays <= 3) score += 5;
      const finalScore = Math.min(99, Math.max(50, score));

      // Generate "Why It Fits" Explanation
      const reasons: string[] = [];
      if (isWithinBudget) {
        reasons.push(`Fits your ₹${inputBudget.toLocaleString('en-IN')} budget with ₹${Math.max(0, remainingBudget).toLocaleString('en-IN')} buffer.`);
      } else {
        reasons.push(`Slightly over target by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}.`);
      }
      if (matchingTags.length > 0) {
        reasons.push(`Matches your ${matchingTags.join(' & ')} preferences.`);
      }
      reasons.push(`Optimal for a ${durationDays}-day vacation with ${guestCount} travellers.`);

      const whyItFits = reasons.join(' ');

      return {
        dest,
        estTotal,
        baseTravel,
        baseHotel,
        baseTransport,
        baseActivities,
        baseFood,
        isWithinBudget,
        remainingBudget,
        travelTime,
        finalScore,
        whyItFits,
        matchingTags,
      };
    })
      .filter((r) => {
        if (regionFilter !== 'all' && r.dest.region !== regionFilter) return false;
        return true;
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }, [selectedOrigin, inputBudget, durationDays, guestCount, selectedInterests, selectedStyle, regionFilter]);

  const handleSelectAndPlan = (destCity: string) => {
    changeDestination(destCity, selectedOrigin, undefined, undefined, guestCount, inputBudget);
    setStep('travel');
    navigate('/trip-builder');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <Compass className="w-3.5 h-3.5" />
              <span>I'M FLEXIBLE • DESTINATION INTELLIGENCE</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
              Don't know where to go?
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tell TripPilot your starting city, budget, and travel preferences. We'll analyze flights, stays, activities, and seasonal weather to reveal your perfect destinations.
            </p>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-2 min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Personalized Criteria</span>
            <p className="text-sm font-bold text-white">
              From {selectedOrigin} • ₹{inputBudget.toLocaleString('en-IN')} • {durationDays} Days
            </p>
            <span className="text-[11px] text-[#C8A96B] font-semibold block">
              {recommendedResults.filter((r) => r.isWithinBudget).length} destinations within budget
            </span>
          </div>
        </div>

        {/* Interactive Criteria Form */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Origin */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Starting City
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                {['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata'].map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Budget */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Total Budget (₹)
              </label>
              <input
                type="number"
                step={5000}
                value={inputBudget}
                onChange={(e) => setInputBudget(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Trip Duration
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value={3}>3 Days (Weekend Escape)</option>
                <option value={4}>4 Days (Short Holiday)</option>
                <option value={5}>5 Days (Standard Vacation)</option>
                <option value={7}>7 Days (Full Week)</option>
              </select>
            </div>

            {/* Guests */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Travellers
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
              >
                <option value={1}>1 Solo Traveller</option>
                <option value={2}>2 Couple / Pair</option>
                <option value={4}>4 Friends / Family</option>
                <option value={6}>6 Group</option>
              </select>
            </div>
          </div>

          {/* Interests Filter Chips */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Select What You Love:
            </label>
            <div className="flex flex-wrap gap-2">
              {allInterests.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-editorial text-[#0B1220]">
              Recommended Destinations for You ({recommendedResults.length})
            </h2>
            <span className="text-xs text-slate-400">Sorted by best multi-factor match</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedResults.map(({ dest, estTotal, isWithinBudget, remainingBudget, travelTime, finalScore, whyItFits }) => (
              <motion.div
                key={dest.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-luxury transition-all flex flex-col justify-between"
              >
                {/* Image Header */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img src={dest.image_url} alt={dest.city} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3">
                    <span className="bg-[#0B1220]/80 backdrop-blur-md text-[#C8A96B] font-black text-xs px-2.5 py-1 rounded-xl border border-[#C8A96B]/30">
                      ⭐ {finalScore}% Match
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">{dest.country}</span>
                    <h3 className="text-2xl font-bold font-editorial">{dest.city}</h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Cost & Travel Time row */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Total Cost</span>
                        <CurrencyDisplay amount={estTotal} className="font-black text-sm text-slate-900" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Travel Time</span>
                        <span className="font-bold text-slate-700">{travelTime}</span>
                      </div>
                    </div>

                    {/* Why It Fits Explanatory Box */}
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/70 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-blue-900 uppercase">
                        <Sparkles className="w-3 h-3 text-[#C8A96B]" />
                        <span>WHY TRIPPILOT RECOMMENDS THIS:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{whyItFits}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isWithinBudget
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {isWithinBudget ? '✓ Within Budget' : `₹${Math.abs(remainingBudget).toLocaleString('en-IN')} Over Target`}
                      </span>
                      <span className="text-[11px] text-slate-400">{dest.weather}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/destinations/${dest.id}`)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900"
                    >
                      View Guide
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAndPlan(dest.city)}
                      className="btn-primary text-xs !py-1.5 px-4 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <span>Plan This Trip</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
