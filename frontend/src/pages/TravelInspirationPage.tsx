import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Calendar,
  CloudSun,
  Heart,
  ArrowRight,
  Compass,
  MapPin,
  Clock,
  Award,
  Sun,
  CloudRain,
  Snowflake,
  ShieldCheck,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useWishlist } from '../context/WishlistContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { FEATURED_DESTINATIONS, EnrichedDestination } from '../data/destinationData';

export const TravelInspirationPage: React.FC = () => {
  const navigate = useNavigate();
  const { origin, budget, travellers, changeDestination, setStep } = useTripBuilder();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [activeSeason, setActiveSeason] = useState<'all' | 'monsoon' | 'winter' | 'summer'>('all');

  const trendingDestinations = FEATURED_DESTINATIONS.filter((d) => d.trendingReason);
  const weekendDestinations = FEATURED_DESTINATIONS.filter((d) => d.isWeekendGetaway);
  const seasonalDestinations = FEATURED_DESTINATIONS.filter((d) => {
    if (activeSeason === 'all') return true;
    return d.seasonality === activeSeason || d.seasonality === 'year_round';
  });

  const handlePlanTrip = (destCity: string) => {
    changeDestination(destCity, origin, undefined, undefined, travellers, budget);
    setStep('travel');
    navigate('/trip-builder');
  };

  const handleToggleWishlist = (dest: EnrichedDestination) => {
    if (isInWishlist(dest.id)) {
      removeFromWishlist(dest.id);
    } else {
      addToWishlist({
        id: dest.id,
        type: 'destination',
        title: dest.city,
        subtitle: `${dest.country} • ${dest.best_time}`,
        price: dest.startingEstimatedPrice,
        rating: 4.9,
        imageUrl: dest.image_url,
        data: dest,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Editorial Hero Banner */}
        <div className="surface-card p-8 sm:p-12 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-4 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EDITORIAL TRAVEL INSPIRATION</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Curated Escapes & Seasonal Recommendations
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore handpicked getaways tailored for this season, top trending weekend escapes from{' '}
              <strong className="text-[#C8A96B]">{origin}</strong>, and bespoke travel ideas.
            </p>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-2 min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Personalized For You:</span>
            <p className="text-sm font-bold text-white">Starting Origin: {origin}</p>
            <p className="text-xs text-[#C8A96B] font-semibold">Budget: ₹{budget.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* SECTION 1: TRENDING DESTINATIONS */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-bold font-editorial text-[#0B1220]">Trending Right Now</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Curated by TripPilot Travel Intelligence</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingDestinations.slice(0, 3).map((dest) => {
              const saved = isInWishlist(dest.id);
              return (
                <div
                  key={dest.id}
                  className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-luxury transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img src={dest.image_url} alt={dest.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow-xs">
                        🔥 Trending
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(dest)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                          saved ? 'bg-rose-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <span className="text-[10px] font-bold uppercase text-slate-300 block">{dest.country}</span>
                      <h3 className="text-2xl font-bold font-editorial">{dest.city}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed font-medium">
                        "{dest.trendingReason}"
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Best: <strong>{dest.best_time}</strong></span>
                        <span className="font-black text-slate-900">From ₹{dest.startingEstimatedPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/destinations/${dest.id}`)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        Read Guide
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlanTrip(dest.city)}
                        className="btn-primary text-xs !py-1.5 px-3.5 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                      >
                        <span>Plan Trip</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: WEEKEND GETAWAYS */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-bold font-editorial text-[#0B1220]">
                Weekend Getaways from {origin} (2–3 Days)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-400">Quick transit & low travel fatigue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weekendDestinations.map((dest) => {
              const transit = dest.travelTimeFromHubs[origin] || dest.travelTimeFromHubs['Hyderabad'] || 'Direct Flight';
              return (
                <div
                  key={dest.id}
                  className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-luxury transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {dest.state ? `${dest.state}, India` : 'India'}
                        </span>
                        <h3 className="text-xl font-bold font-editorial text-[#0B1220]">{dest.city}</h3>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        {transit}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{dest.description}</p>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Estimated Weekend:</span>
                      <strong className="text-slate-900">₹{(dest.startingEstimatedPrice * 0.7).toFixed(0)} / pax</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlanTrip(dest.city)}
                    className="w-full btn-primary text-xs !py-2 font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Plan Weekend Trip</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: SEASONAL RECOMMENDATIONS */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl font-bold font-editorial text-[#0B1220]">Seasonal Recommendations</h2>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
              {[
                { id: 'all', label: 'All Seasons' },
                { id: 'monsoon', label: '🌧️ Monsoon Escapes' },
                { id: 'winter', label: '☀️ Winter Sun' },
                { id: 'summer', label: '⛰️ Summer Alpine' },
              ].map((s) => (
                <motion.button
                  key={s.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSeason(s.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeSeason === s.id
                      ? 'bg-[#0B1220] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeason}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {seasonalDestinations.map((dest) => (
                <motion.div
                  key={dest.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-luxury transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {dest.country}
                        </span>
                        <h3 className="text-xl font-bold font-editorial text-[#0B1220]">{dest.city}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">{dest.weather}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{dest.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-900">
                      ₹{dest.startingEstimatedPrice.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePlanTrip(dest.city)}
                      className="btn-primary text-xs !py-1.5 px-3.5 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <span>Plan Trip</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
