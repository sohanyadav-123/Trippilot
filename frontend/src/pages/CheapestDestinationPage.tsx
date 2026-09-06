import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeftRight,
  TrendingDown,
  Clock,
  MapPin,
  Filter,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { FEATURED_DESTINATIONS, EnrichedDestination } from '../data/destinationData';

export const CheapestDestinationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    origin: contextOrigin,
    travellers: contextTravellers,
    budget: contextBudget,
    changeDestination,
    setStep,
  } = useTripBuilder();

  const [selectedOrigin, setSelectedOrigin] = useState<string>(contextOrigin || 'Hyderabad');
  const [inputBudget, setInputBudget] = useState<number>(contextBudget || 30000);
  const [durationDays, setDurationDays] = useState<number>(4);
  const [guestCount, setGuestCount] = useState<number>(contextTravellers || 2);
  const [sortBy, setSortBy] = useState<'lowest_total' | 'budget_headroom' | 'travel_time' | 'best_overall'>('lowest_total');

  const budgetResults = useMemo(() => {
    return FEATURED_DESTINATIONS.map((dest) => {
      // Calculate realistic itemized breakdown
      const estTravel = dest.costBreakdown.travel * guestCount;
      const estHotel = dest.costBreakdown.hotelPerNight * (durationDays - 1);
      const estTransport = dest.costBreakdown.localTransport;
      const estActivities = dest.costBreakdown.activities * guestCount;
      const estFood = dest.costBreakdown.foodPerDay * durationDays * guestCount;
      const estTotal = estTravel + estHotel + estTransport + estActivities + estFood;
      const isWithin = estTotal <= inputBudget;
      const remaining = inputBudget - estTotal;

      const travelTime =
        dest.travelTimeFromHubs[selectedOrigin] ||
        dest.travelTimeFromHubs['Hyderabad'] ||
        'Direct connection';

      // Parse travel time hours for sorting
      const hoursMatch = travelTime.match(/(\d+(\.\d+)?)\s*h/);
      const travelHours = hoursMatch ? parseFloat(hoursMatch[1]) : 4;

      return {
        dest,
        estTravel,
        estHotel,
        estTransport,
        estActivities,
        estFood,
        estTotal,
        isWithin,
        remaining,
        travelTime,
        travelHours,
      };
    }).sort((a, b) => {
      if (sortBy === 'lowest_total') return a.estTotal - b.estTotal;
      if (sortBy === 'budget_headroom') return b.remaining - a.remaining;
      if (sortBy === 'travel_time') return a.travelHours - b.travelHours;
      return a.estTotal - b.estTotal;
    });
  }, [selectedOrigin, inputBudget, durationDays, guestCount, sortBy]);

  const handlePlanTrip = (destCity: string) => {
    changeDestination(destCity, selectedOrigin, undefined, undefined, guestCount, inputBudget);
    setStep('travel');
    navigate('/trip-builder');
  };

  const handleCompare = (destCity: string) => {
    navigate(`/compare-trips?add=${encodeURIComponent(destCity)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <DollarSign className="w-3.5 h-3.5" />
              <span>CHEAPEST DESTINATION FINDER</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
              Where can you go for <span className="text-[#C8A96B]">₹{inputBudget.toLocaleString('en-IN')}</span>?
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Transparent cost breakdown for flights, stays, transport, activities, and food from <strong>{selectedOrigin}</strong>.
            </p>
          </div>

          {/* Form Quick Adjuster */}
          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-3 min-w-[280px]">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Your Exact Budget Limit (₹)
              </label>
              <input
                type="number"
                step={5000}
                value={inputBudget}
                onChange={(e) => setInputBudget(Number(e.target.value))}
                className="w-full bg-white text-[#0B1220] font-black text-lg py-1.5 px-3 rounded-xl focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Days
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-white text-[#0B1220] font-bold text-xs py-1.5 px-2 rounded-xl focus:outline-none"
                >
                  <option value={3}>3 Days</option>
                  <option value={4}>4 Days</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full bg-white text-[#0B1220] font-bold text-xs py-1.5 px-2 rounded-xl focus:outline-none"
                >
                  <option value={1}>1 Pax</option>
                  <option value={2}>2 Pax</option>
                  <option value={4}>4 Pax</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">From Origin:</span>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {['Hyderabad', 'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="lowest_total">💰 Lowest Estimated Total</option>
              <option value="budget_headroom">📈 Maximum Budget Headroom</option>
              <option value="travel_time">⏱️ Shortest Travel Time</option>
              <option value="best_overall">🌟 Best Overall Value</option>
            </select>
          </div>
        </div>

        {/* Results List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetResults.map(({ dest, estTravel, estHotel, estTransport, estActivities, estFood, estTotal, isWithin, remaining, travelTime }) => (
            <div
              key={dest.id}
              className={`surface-card rounded-3xl bg-white border shadow-sm p-6 flex flex-col justify-between space-y-4 transition-all ${
                isWithin ? 'border-slate-200 hover:border-emerald-300' : 'border-rose-200 opacity-90'
              }`}
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {dest.state ? `${dest.state}, ${dest.country}` : dest.country}
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-[#0B1220]">{dest.city}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${
                      isWithin
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {isWithin ? 'Within Budget' : 'Over Budget'}
                  </span>
                </div>

                {/* Total Estimate & Buffer */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Total</span>
                    <CurrencyDisplay amount={estTotal} className="font-black text-lg text-slate-900" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isWithin ? 'Budget Headroom' : 'Over Target'}
                    </span>
                    <span className={`font-black text-xs ${isWithin ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isWithin ? `+ ₹${remaining.toLocaleString('en-IN')}` : `- ₹${Math.abs(remaining).toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                {/* Transparent Itemized Breakdown */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Transparent Estimate Breakdown:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                      <span>✈️ Travel:</span>
                      <strong>₹{estTravel.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                      <span>🏨 Stays:</span>
                      <strong>₹{estHotel.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                      <span>🚗 Transport:</span>
                      <strong>₹{estTransport.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                      <span>🏄 Activities:</span>
                      <strong>₹{estActivities.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700 col-span-2">
                      <span>🍽️ Food ({durationDays} Days):</span>
                      <strong>₹{estFood.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {travelTime}
                  </span>
                  <span>{dest.weather}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCompare(dest.city)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Compare</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlanTrip(dest.city)}
                  className="btn-primary text-xs !py-1.5 px-4 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <span>Plan Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
