import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Plus,
  Clock,
  MapPin,
  Calendar,
  CloudSun,
  Award,
  DollarSign,
  UtensilsCrossed,
  Compass,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { FEATURED_DESTINATIONS, EnrichedDestination } from '../data/destinationData';

export const CompareTripsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { origin, budget, travellers, travelStyle, interests, changeDestination, setStep } = useTripBuilder();

  const addCityParam = searchParams.get('add');
  const defaultList = addCityParam
    ? Array.from(new Set(['Goa', 'Kerala', addCityParam]))
    : ['Goa', 'Kerala', 'Gokarna'];

  const [compareList, setCompareList] = useState<string[]>(defaultList);
  const [durationDays, setDurationDays] = useState<number>(4);

  // Available destinations to add
  const availableToAdd = FEATURED_DESTINATIONS.filter(
    (d) => !compareList.some((c) => c.toLowerCase() === d.city.toLowerCase())
  );

  const comparisonData = useMemo(() => {
    return compareList.map((cityName) => {
      const dest =
        FEATURED_DESTINATIONS.find((d) => d.city.toLowerCase() === cityName.toLowerCase()) ||
        FEATURED_DESTINATIONS[0];

      const estTravel = dest.costBreakdown.travel * travellers;
      const estHotel = dest.costBreakdown.hotelPerNight * (durationDays - 1);
      const estTransport = dest.costBreakdown.localTransport;
      const estActivities = dest.costBreakdown.activities * travellers;
      const estFood = dest.costBreakdown.foodPerDay * durationDays * travellers;
      const estTotal = estTravel + estHotel + estTransport + estActivities + estFood;
      const isBudgetFit = estTotal <= budget;
      const budgetHeadroom = budget - estTotal;

      const travelTime =
        dest.travelTimeFromHubs[origin] ||
        dest.travelTimeFromHubs['Hyderabad'] ||
        dest.travelTimeFromHubs['Delhi'] ||
        'Direct connection';

      // Parse hours
      const hoursMatch = travelTime.match(/(\d+(\.\d+)?)\s*h/);
      const travelHours = hoursMatch ? parseFloat(hoursMatch[1]) : 4;

      // Score dimensions
      const beachScore = dest.tags.includes('beach') ? 95 : 40;
      const foodScore = dest.tags.includes('food') || dest.foodSpecialties.length > 3 ? 92 : 60;
      const cultureScore = dest.tags.includes('heritage') || dest.tags.includes('culture') ? 94 : 50;

      return {
        cityName: dest.city,
        dest,
        estTravel,
        estHotel,
        estTransport,
        estActivities,
        estFood,
        estTotal,
        isBudgetFit,
        budgetHeadroom,
        travelTime,
        travelHours,
        weather: dest.weather,
        bestTime: dest.best_time,
        beachScore,
        foodScore,
        cultureScore,
      };
    });
  }, [compareList, durationDays, travellers, budget, origin]);

  // Determine evidence-based recommendations
  const minCost = Math.min(...comparisonData.map((c) => c.estTotal));
  const minTravelHours = Math.min(...comparisonData.map((c) => c.travelHours));
  const bestForBudget = comparisonData.find((c) => c.estTotal === minCost);
  const bestForShortTravel = comparisonData.find((c) => c.travelHours === minTravelHours);
  const bestForCultureFood = [...comparisonData].sort((a, b) => (b.foodScore + b.cultureScore) - (a.foodScore + a.cultureScore))[0];
  const bestOverall = comparisonData[0];

  const handleChooseTrip = (destCity: string) => {
    changeDestination(destCity, origin, undefined, undefined, travellers, budget);
    setStep('travel');
    navigate('/trip-builder');
  };

  const handleRemove = (cityName: string) => {
    if (compareList.length <= 2) {
      alert('Keep at least 2 destinations to compare.');
      return;
    }
    setCompareList((prev) => prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase()));
  };

  const handleAdd = (cityName: string) => {
    if (compareList.length >= 4) {
      alert('You can compare up to 4 destinations at a time.');
      return;
    }
    setCompareList((prev) => [...prev, cityName]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>COMPARE TRIPS SIDE-BY-SIDE</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
              Compare 2–4 Trip Options
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Evaluate total cost, travel times, hotel pricing, and weather fit side-by-side from <strong>{origin}</strong> with transparent evidence-based recommendations.
            </p>
          </div>

          {/* Quick Add Destination Dropdown */}
          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-xs space-y-2 min-w-[260px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Add to Comparison ({compareList.length}/4):</span>
            <div className="flex flex-wrap gap-1.5">
              {availableToAdd.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleAdd(d.city)}
                  className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{d.city}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side-by-Side Cards Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonData.map((item) => {
            const isBestBudget = item.cityName === bestForBudget?.cityName;
            const isBestShortTravel = item.cityName === bestForShortTravel?.cityName;
            const isBestOverall = item.cityName === bestOverall?.cityName;

            return (
              <div
                key={item.cityName}
                className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:shadow-luxury transition-all"
              >
                <div className="space-y-4">
                  {/* Top Bar: Title & Badges */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {item.dest.country}
                      </span>
                      <h3 className="font-editorial text-2xl font-bold text-[#0B1220]">{item.cityName}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.cityName)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove from comparison"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recommendation Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {isBestOverall && (
                      <span className="text-[10px] font-extrabold uppercase bg-[#0B1220] text-[#C8A96B] px-2 py-0.5 rounded border border-[#C8A96B]/30">
                        🏆 Best Overall
                      </span>
                    )}
                    {isBestBudget && (
                      <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                        💰 Best for Budget
                      </span>
                    )}
                    {isBestShortTravel && (
                      <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-300">
                        ⏱️ Fastest Travel
                      </span>
                    )}
                  </div>

                  {/* Total Cost & Travel Time */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Estimated Total:</span>
                      <CurrencyDisplay amount={item.estTotal} className="font-black text-base text-slate-900" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Travel Time ({origin}):</span>
                      <strong className="text-slate-800">{item.travelTime}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Budget Target:</span>
                      <strong className={item.isBudgetFit ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.isBudgetFit ? '✓ Fits Target' : '⚠️ Over Budget'}
                      </strong>
                    </div>
                  </div>

                  {/* Itemized Comparison Table */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Cost Breakdown ({durationDays} Days / {travellers} Pax):
                    </span>
                    <div className="space-y-1 text-slate-700">
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span>✈️ Travel:</span>
                        <strong>₹{item.estTravel.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span>🏨 Hotel Stays:</span>
                        <strong>₹{item.estHotel.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span>🚗 Local Transport:</span>
                        <strong>₹{item.estTransport.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span>🏄 Activities:</span>
                        <strong>₹{item.estActivities.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span>🍽️ Food Estimate:</span>
                        <strong>₹{item.estFood.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Top Sights:
                    </span>
                    <p className="text-xs text-slate-600 truncate">{item.dest.attractions.slice(0, 3).join(' • ')}</p>
                  </div>
                </div>

                {/* Plan This Trip Action */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleChooseTrip(item.cityName)}
                    className="w-full btn-primary text-xs !py-2.5 px-4 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Plan {item.cityName} Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Comparison Recommendations Section */}
        <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C8A96B]" />
            <h3 className="font-bold text-base text-[#0B1220]">TripPilot AI Comparison Summary</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">Best for Budget</span>
              <h4 className="font-bold text-sm text-emerald-950">{bestForBudget?.cityName}</h4>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Lowest estimated total at ₹{bestForBudget?.estTotal.toLocaleString('en-IN')} with maximum headroom of ₹{Math.max(0, bestForBudget?.budgetHeadroom || 0).toLocaleString('en-IN')}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 block">Best for Short Travel</span>
              <h4 className="font-bold text-sm text-blue-950">{bestForShortTravel?.cityName}</h4>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                Shortest transit time at {bestForShortTravel?.travelTime} from {origin}, minimizing travel fatigue.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-purple-800 block">Best for Food + Culture</span>
              <h4 className="font-bold text-sm text-purple-950">{bestForCultureFood?.cityName}</h4>
              <p className="text-[11px] text-purple-900 leading-relaxed">
                Highest cultural heritage score and renowned regional cuisine specialties ({bestForCultureFood?.dest.foodSpecialties.slice(0, 2).join(', ')}).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
