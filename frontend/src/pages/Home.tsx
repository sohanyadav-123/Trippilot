import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Plane,
  Building2,
  Luggage,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  Users,
  Search,
  Tag,
  Check,
  Percent,
  Clock,
  Zap,
  Navigation,
  CloudSun,
  TrendingDown,
  Globe2,
  Baby,
  Accessibility,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SearchWidget } from '../components/Search/SearchWidget';
import { searchService } from '../services/searchService';
import { Destination, Offer, HolidayPackage } from '../types';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const Home: React.FC = () => {
  const { language, setLanguage, travelMode, setTravelMode, t, tPlace, tRoute } = useTravelSettings();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const navigate = useNavigate();

  // Static curated packages
  const holidayPackages: (HolidayPackage & { duration?: string; tag?: string })[] = [
    {
      id: 'pkg-1',
      title: t('holidayPackage.pkg-1.title', 'Majestic Goa Luxury Beachfront Getaway'),
      destination: 'Goa',
      duration_days: 5,
      duration_nights: 4,
      duration: '4 Nights / 5 Days',
      price: 18499,
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews_count: 320,
      inclusions: ['5★ Beach Resort', 'Daily Buffet Breakfast', 'South Goa Private Tour', 'Airport Transfers'],
      theme: 'Luxury',
      highlights: ['Baga Beach', 'Private Pool', 'Dolphin Tour'],
      tag: t('tag.best_seller', 'Best Seller'),
    },
    {
      id: 'pkg-2',
      title: t('holidayPackage.pkg-2.title', 'Dubai Extravaganza & Desert Safari Retreat'),
      destination: 'Dubai',
      duration_days: 6,
      duration_nights: 5,
      duration: '5 Nights / 6 Days',
      price: 42999,
      image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviews_count: 480,
      inclusions: ['4★ City Hotel', 'Desert Safari + BBQ Dinner', 'Burj Khalifa At The Top', 'Marina Dhow Cruise'],
      theme: 'Luxury',
      highlights: ['Burj Khalifa', 'Desert Safari', 'Dubai Mall'],
      tag: t('tag.trending', 'Trending'),
    },
    {
      id: 'pkg-3',
      title: t('holidayPackage.pkg-3.title', 'Bali Tropical Villas & Sacred Temples Escape'),
      destination: 'Bali',
      duration_days: 7,
      duration_nights: 6,
      duration: '6 Nights / 7 Days',
      price: 54999,
      image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviews_count: 510,
      inclusions: ['Private Pool Villa', 'Ubud Waterfall Tour', 'Nusa Penida Day Trip', 'Balinese Spa Session'],
      theme: 'Honeymoon',
      highlights: ['Ubud Rice Terraces', 'Tanah Lot', 'Nusa Penida'],
      tag: t('tag.romantic_escape', 'Romantic Escape'),
    },
    {
      id: 'pkg-4',
      title: t('holidayPackage.pkg-4.title', 'Manali Alpine Peaks & Solang Adventure'),
      destination: 'Manali',
      duration_days: 5,
      duration_nights: 4,
      duration: '4 Nights / 5 Days',
      price: 14999,
      image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviews_count: 290,
      inclusions: ['Riverview Mountain Resort', 'Rohtang Pass Permit', 'Paragliding Experience', 'Bonfire & Music'],
      theme: 'Adventure',
      highlights: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple'],
      tag: t('tag.adventure', 'Adventure'),
    },
  ];

  // Static curated offers
  const offers: (Offer & { id: string; badge: string; discount: string })[] = [
    {
      id: 'off-1',
      title: t('offer.off-1.title', 'Fly High & Save Big'),
      description: t('offer.off-1.desc', 'Flat ₹1,500 off on all domestic non-stop flights booked this week.'),
      code: 'TRIPFLY1500',
      discount: t('offer.off-1.discount', 'Flat ₹1,500 OFF'),
      discount_type: 'flat',
      discount_value: 1500,
      max_discount: 1500,
      min_booking_amount: 5000,
      valid_until: '31 Aug 2026',
      badge: t('offer.badge.flights', 'FLIGHTS'),
    },
    {
      id: 'off-2',
      title: t('offer.off-2.title', 'Luxury Staycation Special'),
      description: t('offer.off-2.desc', 'Get up to 25% discount + complimentary breakfast at 5★ verified resorts.'),
      code: 'STAYLUXE25',
      discount: t('offer.off-2.discount', '25% OFF'),
      discount_type: 'percentage',
      discount_value: 25,
      max_discount: 5000,
      min_booking_amount: 10000,
      valid_until: '15 Sep 2026',
      badge: t('offer.badge.hotels', 'HOTELS'),
    },
    {
      id: 'off-3',
      title: t('offer.off-3.title', 'AI Smart Bundle'),
      description: t('offer.off-3.desc', 'Book flight + hotel together via AI Planner and unlock ₹3,000 instant cashback.'),
      code: 'AIPILOT3000',
      discount: t('offer.off-3.discount', '₹3,000 CASHBACK'),
      discount_type: 'flat',
      discount_value: 3000,
      max_discount: 3000,
      min_booking_amount: 20000,
      valid_until: '30 Sep 2026',
      badge: t('offer.badge.packages', 'PACKAGES'),
    },
  ];

  // Static popular direct flight routes
  const popularFlightDeals = [
    {
      airline: 'IndiGo',
      flightNumber: '6E-204',
      origin: 'Hyderabad (HYD)',
      destination: 'Goa (GOI)',
      departure: '06:15',
      arrival: '07:40',
      duration: '1h 25m',
      stops: t('label.non_stop', 'Non-stop'),
      price: 3499,
      badge: t('flightDeal.badge.lowest_fare', 'Lowest Fare'),
    },
    {
      airline: 'Air India',
      flightNumber: 'AI-803',
      origin: 'Delhi (DEL)',
      destination: 'Mumbai (BOM)',
      departure: '08:00',
      arrival: '10:15',
      duration: '2h 15m',
      stops: t('label.non_stop', 'Non-stop'),
      price: 4299,
      badge: t('flightDeal.badge.popular_route', 'Popular Route'),
    },
    {
      airline: 'Vistara',
      flightNumber: 'UK-872',
      origin: 'Bengaluru (BLR)',
      destination: 'Delhi (DEL)',
      departure: '17:30',
      arrival: '20:15',
      duration: '2h 45m',
      stops: t('label.non_stop', 'Non-stop'),
      price: 5199,
      badge: t('flightDeal.badge.best_rated', 'Best Rated'),
    },
    {
      airline: 'Emirates',
      flightNumber: 'EK-501',
      origin: 'Mumbai (BOM)',
      destination: 'Dubai (DXB)',
      departure: '04:30',
      arrival: '06:15',
      duration: '3h 15m',
      stops: t('label.non_stop', 'Non-stop'),
      price: 13999,
      badge: t('flightDeal.badge.international_special', 'International Special'),
    },
  ];

  // Curated trending destinations
  const trendingDestinations = [
    {
      city: 'Goa',
      country: 'India',
      tag: t('trending.goa.tag', 'Sun, Sand & Heritage'),
      startingPrice: 3499,
      bestSeason: 'Nov – Mar',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
    {
      city: 'Dubai',
      country: 'United Arab Emirates',
      tag: t('trending.dubai.tag', 'Futuristic Luxury & Skylines'),
      startingPrice: 10999,
      bestSeason: 'Oct – Apr',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      city: 'Bali',
      country: 'Indonesia',
      tag: t('trending.bali.tag', 'Tropical Villas & Waterfalls'),
      startingPrice: 15499,
      bestSeason: 'Apr – Oct',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      tag: t('trending.singapore.tag', 'Gardens, Cuisine & Marina Bay'),
      startingPrice: 12999,
      bestSeason: 'Year-round',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    },
    {
      city: 'Paris',
      country: 'France',
      tag: t('trending.paris.tag', 'Art, Cafes & Architecture'),
      startingPrice: 28999,
      bestSeason: 'Apr – Jun',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
      rating: 4.9,
    },
    {
      city: 'Maldives',
      country: 'Maldives',
      tag: t('trending.maldives.tag', 'Overwater Bungalows & Reefs'),
      startingPrice: 34999,
      bestSeason: 'Dec – Apr',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
      rating: 5.0,
    },
  ];

  useEffect(() => {
    const fetchFeaturedDestinations = async () => {
      try {
        const res = await searchService.getDestinations(undefined, true, 1, 6);
        if (res.success && res.data?.destinations && res.data.destinations.length > 0) {
          setDestinations(res.data.destinations.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    };
    fetchFeaturedDestinations();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* ─── 1. LUXURY EDITORIAL HERO & CENTRAL SEARCH ENGINE ─── */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6 sm:space-y-7 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 text-[#0B1220] text-xs sm:text-sm font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#C8A96B]" />
            <span>{t('hero.badge', 'INTELLIGENT TRAVEL ORCHESTRATION')}</span>
          </div>

          <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#0B1220] leading-[1.08]">
            {t('hero.title_p1', 'Your journey,')} <br />
            <span className="italic font-normal">{t('hero.title_p2', 'beautifully planned.')}</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            {t('hero.subtitle', 'Discover destinations, build intelligent itineraries, and book every part of your trip in one place.')}
          </p>

          {/* Hero Preferences Toolbar: Language & Experience Mode */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Choose Language */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
              <Globe2 className="w-4 h-4 text-[#C8A96B]" />
              <span className="text-sm font-bold text-slate-700">{t('hero.choose_language', 'Language')}:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-sm font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
                aria-label={t('hero.choose_language', 'Choose Language')}
              >
                <option value="en">🌐 English</option>
                <option value="hi">🌐 हिन्दी (Hindi)</option>
                <option value="te">🌐 Telugu (తెలుగు)</option>
              </select>
            </div>

            {/* Travel Experience Mode Switcher */}
            <div className="inline-flex flex-wrap items-center justify-center p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2.5 pr-1 flex items-center gap-1.5 hidden sm:inline-flex">
                <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                {t('mode.title', 'Mode')}:
              </span>
              <button
                type="button"
                onClick={() => {
                  setTravelMode('standard');
                  toast.success('Active: Standard Travel (Full Inventory)', { id: 'home-mode', icon: '✈️' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  travelMode === 'standard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span>{t('mode.standard', 'Standard Travel')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTravelMode('family');
                  toast.success('Active: Family with Kids (Kid-Safe Resorts & Family Seats)', { id: 'home-mode', icon: '👨‍👩‍👧' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  travelMode === 'family'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>{t('mode.family', 'Family with Kids')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTravelMode('accessibility');
                  toast.success('Active: Accessibility Mode (Wheelchair & Step-Free)', { id: 'home-mode', icon: '♿' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  travelMode === 'accessibility'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Accessibility className="w-4 h-4" />
                <span>{t('mode.accessibility', 'Accessibility Mode')}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => navigate('/ai-planner')}
              className="btn-primary text-sm sm:text-base !py-3.5 px-8 font-bold shadow-md rounded-2xl"
            >
              {t('hero.start_planning', 'Start Planning')}
            </button>
            <button
              onClick={() => navigate('/destinations')}
              className="btn-secondary text-sm sm:text-base !py-3.5 px-8 font-bold shadow-xs rounded-2xl"
            >
              {t('hero.explore_destinations', 'Explore Destinations')}
            </button>
          </div>
        </div>

        {/* Active Travel Experience Mode Dynamic Notification & Feature Banner */}
        {travelMode !== 'standard' && (
          <div className="max-w-5xl mx-auto mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {travelMode === 'family' ? (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 flex-shrink-0">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-amber-900">
                        {t('mode.family', 'Family with Kids')} Mode Active
                      </span>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        Kid-Safe Resorts & Family Seating
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mt-0.5">
                      {t('mode.family_desc', 'Kid-safe resorts, play zones & family seats')} — search results automatically prioritize adjoining rooms, swimming pools, and child-safe routes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTravelMode('standard');
                    toast.success('Switched to Standard Travel mode', { id: 'home-mode' });
                  }}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 underline flex-shrink-0 self-end sm:self-auto"
                >
                  Reset to Standard
                </button>
              </div>
            ) : (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 flex-shrink-0">
                    <Accessibility className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-900">
                        {t('mode.accessibility', 'Accessibility Mode')} Active
                      </span>
                      <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full font-bold">
                        Step-Free & Wheelchair Ready
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900/80 mt-0.5">
                      {t('mode.accessibility_desc', 'Wheelchair access, step-free hotels & cabs')} — highlighting ramp-equipped hotels, elevator access, airport wheelchair assistance & accessible cabs.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTravelMode('standard');
                    toast.success('Switched to Standard Travel mode', { id: 'home-mode' });
                  }}
                  className="text-xs font-bold text-indigo-800 hover:text-indigo-950 underline flex-shrink-0 self-end sm:self-auto"
                >
                  Reset to Standard
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Engine Centerpiece */}
        <div className="max-w-6xl mx-auto">
          <SearchWidget />
        </div>
      </section>

      {/* ─── 2. TRENDING DESTINATIONS (LARGE EDITORIAL PHOTOGRAPHY) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {t('hero.trending_badge', 'Top Escapes & Getaways')}
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0B1220]">
              {t('hero.trending_title', 'Featured Global Destinations')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('hero.trending_subtitle', 'Hand-picked journeys with curated stays, seasonal highlights, and cultural secrets.')}
            </p>
          </div>
          <Link
            to="/destinations"
            className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>{t('hero.explore_all', 'Explore all destinations')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingDestinations.map((dest) => (
            <div
              key={dest.city}
              onClick={() => navigate(`/hotels?city=${encodeURIComponent(dest.city)}`)}
              className="surface-card-hover rounded-2xl overflow-hidden cursor-pointer group flex flex-col bg-white"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/80 via-[#0B1220]/20 to-transparent" />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-[#0B1220] flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{dest.rating}</span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C8A96B] block">
                    {tPlace(dest.country)}
                  </span>
                  <h3 className="font-editorial text-2xl font-bold tracking-tight text-white">{tPlace(dest.city)}</h3>
                </div>
              </div>

              <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-700 italic">"{dest.tag}"</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('label.best_time', 'Best Time:')} {dest.bestSeason}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('hero.fares_from', 'Fares & Stays from')}</span>
                    <CurrencyDisplay amount={dest.startingPrice} className="text-base font-black text-[#0B1220]" />
                  </div>
                  <button className="btn-secondary text-xs !py-1.5 px-3.5 font-semibold">
                    {t('action.view_details', 'Explore Stays')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. EXPLORE BY TRAVEL STYLE ("Find a trip that feels like you") ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            {t('style.badge', 'Tailored Experiences')}
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0B1220]">
            {t('style.title', 'Find a trip that feels like you.')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('style.subtitle', 'Whether you are chasing coastal serenity, high-altitude alpine trails, or rich cultural immersion.')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: t('style.beach', 'Beach Escapes'), image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', query: 'beach' },
            { label: t('style.mountain', 'Mountain Trails'), image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80', query: 'mountains' },
            { label: t('style.luxury', 'Luxury Stays'), image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80', query: 'luxury' },
            { label: t('style.family', 'Family Vacations'), image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80', query: 'family' },
            { label: t('style.romantic', 'Romantic Escapes'), image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80', query: 'romantic' },
            { label: t('style.culture', 'Culture & Heritage'), image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80', query: 'cultural' },
          ].map((style) => (
            <div
              key={style.label}
              onClick={() => navigate(`/destinations?style=${style.query}`)}
              className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={style.image}
                alt={style.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/80 via-[#0B1220]/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="font-bold text-xs sm:text-sm block leading-tight">{style.label}</span>
                <span className="text-[10px] text-slate-300 group-hover:underline inline-flex items-center gap-1 mt-0.5">
                  {t('action.browse', 'Browse')} →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DIRECT FLIGHT DEALS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {t('flights.section_badge', 'Direct Airfares')}
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0B1220]">
              {t('flights.section_title', 'Trending Flight Routes')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('flights.section_subtitle', 'Non-stop airline routes with leading carriers and zero convenience fee.')}
            </p>
          </div>
          <Link
            to="/flights"
            className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>{t('flights.view_all', 'View all flight schedules')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularFlightDeals.map((flight) => (
            <div
              key={flight.flightNumber}
              onClick={() => {
                const orig = flight.origin.split(' ')[0];
                const dest = flight.destination.split(' ')[0];
                navigate(`/flights?origin=${orig}&destination=${dest}&departure_date=2026-09-15`);
              }}
              className="surface-card-hover p-5 rounded-2xl cursor-pointer group flex flex-col justify-between bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900">{tPlace(flight.airline)}</span>
                  <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    {flight.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between my-2">
                  <div>
                    <span className="text-base font-black text-slate-900">{flight.departure}</span>
                    <p className="text-[11px] text-slate-500">{tPlace(flight.origin.split(' ')[0])}</p>
                  </div>
                  <div className="flex flex-col items-center px-2">
                    <span className="text-[10px] text-slate-400 font-mono">{flight.duration}</span>
                    <div className="w-16 h-px bg-slate-300 relative my-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-0 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold">{flight.stops}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">{flight.arrival}</span>
                    <p className="text-[11px] text-slate-500">{tPlace(flight.destination.split(' ')[0])}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('label.fares_from', 'Fares from')}</span>
                  <CurrencyDisplay amount={flight.price} className="text-base font-black text-slate-900" />
                </div>
                <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                  {t('action.book_now', 'Book')} <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. PERSONALIZED RECOMMENDATIONS ("Picked for you") ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-1">
              {t('picks.badge', 'Curated Recommendations')}
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0B1220]">
              {t('picks.title', 'Picked for you.')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('picks.subtitle', 'Handpicked hotels, activities, and dining matching your travel style and preferences.')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              type: 'STAY',
              title: t('picks.stay.title', 'Taj Exotica Resort & Spa'),
              location: tPlace('South Goa, India'),
              image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
              rating: 4.9,
              price: 14500,
              priceUnit: t('picks.price_unit_night', '/ night'),
              rationale: t('picks.stay.rationale', 'Matches your budget & 1.2 km from private beach'),
              badge: t('picks.stay.badge', 'Luxury Villa'),
              link: '/hotels?city=Goa',
            },
            {
              type: 'ACTIVITY',
              title: t('picks.activity.title', 'Red Dune Desert Safari & BBQ'),
              location: tPlace('Lahbab Desert, Dubai'),
              image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
              rating: 4.9,
              price: 3450,
              priceUnit: t('picks.price_unit_person', '/ person'),
              rationale: t('picks.activity.rationale', 'Popular with families • 5★ Buffet included'),
              badge: t('picks.activity.badge', 'Top Experience'),
              link: '/activities',
            },
            {
              type: 'DINING',
              title: t('picks.dining.title', 'Thalassa Greek Taverna'),
              location: tPlace('Vagator Cliff, Goa'),
              image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
              rating: 4.9,
              price: 2200,
              priceUnit: t('picks.price_unit_two', 'avg for two'),
              rationale: t('picks.dining.rationale', 'Iconic sunset views • High local rating'),
              badge: t('picks.dining.badge', 'Romantic Dinner'),
              link: '/restaurants',
            },
            {
              type: 'GEM',
              title: t('picks.gem.title', 'Fontainhas Heritage Bakery Walk'),
              location: tPlace('Old Latin Quarter, Panjim'),
              image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
              rating: 4.8,
              price: 0,
              priceUnit: t('picks.price_unit_free', 'Free walk'),
              rationale: t('picks.gem.rationale', 'Uncrowded authentic spot • 18th-century charm'),
              badge: t('picks.gem.badge', 'Hidden Gem'),
              link: '/hidden-gems',
            },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => navigate(item.link)}
              className="surface-card-hover rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group bg-white"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#0B1220]/85 backdrop-blur-md text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {item.badge}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md text-[#0B1220] text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {item.location}
                  </span>
                  <h3 className="font-bold text-sm text-[#0B1220] group-hover:text-[#2563EB] transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {/* Rationale pill */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10.5px] text-slate-600 leading-snug">
                    <span className="text-[#C8A96B] font-bold">{t('picks.why_it_fits', 'Why it fits:')} </span>
                    {item.rationale}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">
                    {item.price === 0 ? t('label.entry', 'Entry') : t('label.rates_from', 'Rates from')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    {item.price === 0 ? (
                      <span className="font-black text-sm text-[#0B1220]">{t('label.free', 'Free')}</span>
                    ) : (
                      <CurrencyDisplay amount={item.price} className="text-base font-black text-[#0B1220]" />
                    )}
                    <span className="text-[10px] text-slate-400">{item.priceUnit}</span>
                  </div>
                </div>
                <button className="btn-secondary text-xs !py-1.5 px-3 font-semibold">
                  {t('action.view', 'View')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. CURATED HOLIDAY PACKAGES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {t('packages.badge', 'All-Inclusive Trips')}
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0B1220]">
              {t('packages.title', 'Curated Holiday Packages')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('packages.subtitle', 'Pre-planned travel packages with flights, 4★/5★ accommodation, private transfers, and excursions.')}
            </p>
          </div>
          <Link
            to="/destinations"
            className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>{t('packages.view_all', 'View all packages')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {holidayPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => navigate(`/ai-planner?destination=${encodeURIComponent(pkg.destination)}`)}
              className="surface-card-hover rounded-2xl overflow-hidden cursor-pointer group transition-all flex flex-col justify-between bg-white"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#0B1220]/85 backdrop-blur-md text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md">
                    {pkg.tag}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md text-[#0B1220] text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#C8A96B] tracking-wider">
                    {pkg.duration}
                  </span>
                  <h3 className="font-bold text-sm text-[#0B1220] group-hover:text-[#2563EB] transition-colors line-clamp-2">
                    {pkg.title}
                  </h3>

                  <div className="space-y-1 pt-1">
                    {pkg.inclusions.slice(0, 3).map((inc) => (
                      <div key={inc} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Check className="w-3 h-3 text-[#158A6A] flex-shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">{t('label.per_person', 'Per person')}</span>
                  <CurrencyDisplay amount={pkg.price} className="text-base font-black text-[#0B1220]" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/ai-planner?destination=${encodeURIComponent(pkg.destination)}`);
                  }}
                  className="btn-primary text-xs !py-1.5 px-3.5 font-semibold"
                >
                  {t('action.customize', 'Customize')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6. INTELLIGENT TRAVEL ECOSYSTEM SHOWCASE ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block">
            {t('intel.badge', 'TripPilot Intelligence')}
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#0B1220]">
            {t('intel.title', 'Everything you need for a better trip.')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {t('intel.subtitle', 'Quiet intelligence that makes travel orchestration seamless — from route optimization to weather adaptation and live expense splitting.')}
          </p>
        </div>

        {/* 4 Core Interactive Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Route Optimization */}
          <div className="surface-card p-6 sm:p-7 rounded-2xl bg-white space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0B1220]">{t('intel.route.title', 'Smart Route & Transit Optimization')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('intel.route.desc', 'Automatically calculates shortest transit paths between beaches, heritage forts, and dining spots to minimize cross-city road travel.')}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#0B1220]">
                  <span>{t('intel.route.day1', 'Day 1: North Goa Coastal Path')}</span>
                  <span className="text-[#158A6A] font-bold bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#BBF7D0]">
                    {t('intel.route.saves', 'Saves 35 mins')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{t('intel.route.loc1', 'Hotel')}</span> → <span>{t('intel.route.loc2', 'Fort Aguada')}</span> → <span>{t('intel.route.loc3', 'Baga Beach')}</span> → <span>{t('intel.route.loc4', 'Waterfront Dinner')}</span>
                </div>
              </div>
            </div>

            <Link
              to="/ai-planner?destination=Goa"
              className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] inline-flex items-center gap-1 pt-2"
            >
              <span>{t('intel.route.link', 'Try Route Optimizer in AI Planner')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 2. Weather-Based Itinerary Adaptation */}
          <div className="surface-card p-6 sm:p-7 rounded-2xl bg-white space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center">
                <CloudSun className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0B1220]">{t('intel.weather.title', 'Weather-Aware Adaptive Planning')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('intel.weather.desc', 'Intelligently detects sudden afternoon coastal showers and suggests moving outdoor watersports to morning with indoor heritage galleries in the afternoon.')}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#0B1220]">
                  <span>{t('intel.weather.advisory', 'Rain Forecast Advisory')}</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    {t('intel.weather.badge', 'Automatic Suggestion')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t('intel.weather.quote', '"Shifted parasailing to 10:00 AM. Scheduled Museum of Goa for 03:00 PM."')}
                </p>
              </div>
            </div>

            <Link
              to="/ai-planner?destination=Goa"
              className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] inline-flex items-center gap-1 pt-2"
            >
              <span>{t('intel.weather.link', 'Explore Weather-Aware Blueprints')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3. AI Budget Optimizer & Smart Swaps */}
          <div className="surface-card p-6 sm:p-7 rounded-2xl bg-white space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0B1220]">{t('intel.budget.title', 'AI Budget Optimizer & Smart Swaps')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('intel.budget.desc', 'Pinpoints budget-heavy categories and recommends 1-click alternative flight slots or vetted luxury stays with identical ratings to save thousands.')}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#0B1220] block">{t('intel.budget.alt', 'Recommended Alternative')}</span>
                  <span className="text-[11px] text-slate-600">{t('intel.budget.alt_desc', 'Switch to Heritage Boutique Resort & Spa')}</span>
                </div>
                <span className="font-black text-sm text-[#158A6A] bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                  {t('intel.budget.save', 'Save ₹4,500')}
                </span>
              </div>
            </div>

            <Link
              to="/budget"
              className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] inline-flex items-center gap-1 pt-2"
            >
              <span>{t('intel.budget.link', 'Open Budget Optimization Hub')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4. Group Planning & Expense Split */}
          <div className="surface-card p-6 sm:p-7 rounded-2xl bg-white space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0B1220]">{t('intel.group.title', 'Collaborative Group Trips & Voting')}</h3>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#0B1220]">
                  <span>{t('intel.group.poll', 'Day 2 Activity Poll: Winner')}</span>
                  <span className="text-[10px] text-[#158A6A] font-bold">{t('intel.group.votes', '4 of 5 Votes')}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {t('intel.group.quote', '"Grande Island Dolphin Sightseeing & Sunset Cruise"')}
                </p>
              </div>
            </div>

            <Link
              to="/ai-planner?tab=group"
              className="text-xs font-bold text-[#0B1220] hover:text-[#2563EB] inline-flex items-center gap-1 pt-2"
            >
              <span>{t('intel.group.link', 'Collaborate on Group Trips')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 7. GLOBAL TRAVEL STANDARDS & TRUST ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h4 className="font-bold text-sm text-[#0B1220]">{t('trust.1.title', '100% Audited Properties')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('trust.1.desc', 'Every luxury resort and boutique villa is verified for safety, cleanliness, and authentic guest standards.')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h4 className="font-bold text-sm text-[#0B1220]">{t('trust.2.title', 'Zero Hidden Markups')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('trust.2.desc', 'Clear, transparent fare breakdowns including taxes, baggage allowances, and carrier surcharges.')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h4 className="font-bold text-sm text-[#0B1220]">{t('trust.3.title', 'Flexible Rescheduling')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('trust.3.desc', 'Change flight dates or stay duration with minimal hassle and instant digital voucher generation.')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h4 className="font-bold text-sm text-[#0B1220]">{t('trust.4.title', '24/7 Priority Travel Desk')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('trust.4.desc', 'Real-time concierge assistance for flight rescheduling, hotel check-in support, and trip advice.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
