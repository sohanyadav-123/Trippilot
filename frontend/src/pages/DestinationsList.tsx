import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  Compass,
  Star,
  Calendar,
  CloudSun,
  Heart,
  Sparkles,
  ArrowLeftRight,
  TrendingUp,
  Flame,
  Luggage,
  ShieldCheck,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useWishlist } from '../context/WishlistContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { FEATURED_DESTINATIONS, EnrichedDestination } from '../data/destinationData';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const DestinationsList: React.FC = () => {
  const { t, tPlace } = useTravelSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { origin, budget, travellers, travelStyle, interests, changeDestination, setStep } = useTripBuilder();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Domestic' | 'International'>('all');

  const categories = [
    { id: 'all', label: '🌟 All Destinations' },
    { id: 'trending', label: '🔥 Trending Now' },
    { id: 'weekend', label: '🌴 Weekend Escapes' },
    { id: 'beach', label: '🏖️ Beaches & Islands' },
    { id: 'mountain', label: '⛰️ Mountains & Snow' },
    { id: 'heritage', label: '🏛️ Heritage & Forts' },
    { id: 'luxury', label: '✨ Luxury & Royal' },
    { id: 'budget', label: '💰 Budget Friendly' },
    { id: 'romantic', label: '💖 Romantic Getaways' },
    { id: 'food', label: '🍲 Culinary & Street Food' },
    { id: 'international', label: '✈️ International' },
  ];

  // Filter logic
  const filteredDestinations = useMemo(() => {
    return FEATURED_DESTINATIONS.filter((dest) => {
      // Search text match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        dest.city.toLowerCase().includes(query) ||
        dest.country.toLowerCase().includes(query) ||
        (dest.state && dest.state.toLowerCase().includes(query)) ||
        dest.tags.some((t) => t.toLowerCase().includes(query)) ||
        dest.attractions.some((a) => a.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Region filter
      if (regionFilter !== 'all' && dest.region !== regionFilter) return false;

      // Category filter
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'trending') return Boolean(dest.trendingReason);
      if (selectedCategory === 'weekend') return Boolean(dest.isWeekendGetaway);
      if (selectedCategory === 'international') return dest.region === 'International';
      if (selectedCategory === 'mountain') return dest.tags.includes('mountain') || dest.tags.includes('snow');
      return dest.tags.includes(selectedCategory);
    });
  }, [searchQuery, selectedCategory, regionFilter]);

  const handlePlanTrip = (dest: EnrichedDestination) => {
    changeDestination(dest.city);
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

  const handleCompare = (destCity: string) => {
    navigate(`/compare-trips?add=${encodeURIComponent(destCity)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Editorial Hero Banner */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <Compass className="w-3.5 h-3.5" />
              <span>EXPLORE & DESTINATION INTELLIGENCE</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Discover Where to Travel Next
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore curated Indian and international destinations with real cost estimates from{' '}
              <strong className="text-[#C8A96B]">{origin}</strong>, seasonal climate forecasts, and direct 1-click trip planning.
            </p>
          </div>

          {/* Quick Stats / Context badge */}
          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-2.5 min-w-[260px]">
            <div className="flex items-center justify-between text-slate-300">
              <span>Your Starting Origin:</span>
              <strong className="text-white">{origin}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Target Trip Budget:</span>
              <strong className="text-[#C8A96B]">₹{budget.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Travel Style:</span>
              <strong className="text-white capitalize">{travelStyle}</strong>
            </div>
            <div className="pt-2 border-t border-white/15 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/flexible-destinations')}
                className="text-xs text-[#C8A96B] font-bold hover:underline flex items-center gap-1"
              >
                <span>Try "I'm Flexible"</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search city, beach, heritage, snow, or attractions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Region Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['all', 'Domestic', 'International'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRegionFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    regionFilter === r
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === 'all' ? 'All Regions' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white border border-dashed border-slate-200 space-y-3">
            <Compass className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">No destinations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any destinations matching "{searchQuery}". Try clearing filters or searching for another term.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setRegionFilter('all');
              }}
              className="btn-primary text-xs !py-2 px-4"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + regionFilter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDestinations.map((dest) => {
                const saved = isInWishlist(dest.id);
                const travelTime = dest.travelTimeFromHubs[origin] || dest.travelTimeFromHubs['Delhi'] || 'Direct Flights';

                return (
                  <motion.div
                    key={dest.id}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="surface-card rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-luxury transition-all duration-300 flex flex-col justify-between group"
                  >
                  {/* Card Image Header */}
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    <img
                      src={dest.image_url}
                      alt={dest.city}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {dest.region === 'International' && (
                          <span className="bg-purple-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
                            International
                          </span>
                        )}
                        {dest.isWeekendGetaway && (
                          <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
                            Weekend Trip
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(dest)}
                        aria-label={saved ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 duration-150 ${
                          saved
                            ? 'bg-rose-500 text-white shadow-xs heart-pop-active'
                            : 'bg-black/30 hover:bg-black/50 text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 transition-transform duration-150 ${saved ? 'fill-current scale-110' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                            {dest.state ? `${tPlace(dest.state)}, ${tPlace(dest.country)}` : tPlace(dest.country)}
                          </span>
                          <h3 className="text-2xl font-bold font-editorial text-white leading-tight">
                            {tPlace(dest.city)}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-300 uppercase block font-semibold">{t('hero.fares_from', 'Estimated from')}</span>
                          <span className="text-lg font-black text-[#C8A96B]">
                            ₹{dest.startingEstimatedPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Meta Tags (Best Time, Weather, Travel Time) */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-[#C8A96B] flex-shrink-0" />
                          <span className="truncate"><strong>Best:</strong> {dest.best_time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <CloudSun className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{dest.weather}</span>
                        </div>
                      </div>

                      {/* Trending Reason */}
                      {dest.trendingReason && (
                        <div className="flex items-start gap-2 text-[11px] text-slate-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                          <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>{dest.trendingReason}</span>
                        </div>
                      )}

                      {/* Attractions Pills */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Top Highlights:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dest.attractions.slice(0, 3).map((attr, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                            >
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/destinations/${dest.id}`)}
                        className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Explore Guide
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCompare(dest.city)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1"
                          title="Compare with other destinations"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-slate-500" />
                          <span className="hidden sm:inline">Compare</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePlanTrip(dest)}
                          className="btn-primary text-xs !py-1.5 px-3 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                        >
                          <span>Plan Trip</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
