import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Star, Clock, MapPin, Check, Plus, ShieldCheck, Sparkles, Filter, Search, Wallet } from 'lucide-react';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { useWishlist } from '../context/WishlistContext';
import { useTripBuilder } from '../context/TripBuilderContext';

interface Activity {
  id: string;
  name: string;
  destination: string;
  category: 'Adventure' | 'Water Sports' | 'City Tours' | 'Food' | 'Culture' | 'Cruises';
  duration: string;
  rating: number;
  reviewsCount: number;
  price: number;
  image_url: string;
  description: string;
  inclusions: string[];
}

const ACTIVITIES_DATA: Activity[] = [
  {
    id: 'act-1-goa',
    name: 'Grande Island Scuba Diving & Dolphin Sightseeing',
    destination: 'Goa',
    category: 'Water Sports',
    duration: '5 Hours',
    rating: 4.9,
    reviewsCount: 380,
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    description: 'PADI-certified underwater diving with equipment, boat transfer, dolphin spotting, and GoPro video.',
    inclusions: ['Scuba Gear', 'Boat Transfer', 'Snacks & Lunch', 'GoPro HD Video'],
  },
  {
    id: 'act-2-goa',
    name: 'Mandovi Luxury Sunset River Cruise & Live DJ',
    destination: 'Goa',
    category: 'Cruises',
    duration: '2.5 Hours',
    rating: 4.8,
    reviewsCount: 420,
    price: 999,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    description: 'Panoramic river sunset cruise with traditional Goan folk performances, DJ music, and welcome drinks.',
    inclusions: ['Welcome Drink', 'Folk Dance Show', 'DJ Party', 'Sightseeing Deck Access'],
  },
  {
    id: 'act-3-dubai',
    name: 'Premium Red Dune Desert Safari with BBQ Dinner',
    destination: 'Dubai',
    category: 'Adventure',
    duration: '6 Hours',
    rating: 4.9,
    reviewsCount: 650,
    price: 3450,
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    description: '4x4 dune bashing in Lahbab desert, sandboarding, camel ride, Tanoura dance, and 5★ buffet dinner.',
    inclusions: ['4x4 Dune Bashing', 'Camel Ride', 'BBQ Buffet Dinner', 'Hotel Pick & Drop'],
  },
  {
    id: 'act-4-manali',
    name: 'Solang Valley Paragliding & ATV Quad Biking',
    destination: 'Manali',
    category: 'Adventure',
    duration: '3 Hours',
    rating: 4.7,
    reviewsCount: 290,
    price: 1850,
    image_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    description: 'High-altitude tandem paragliding overlooking pine peaks and thrilling all-terrain quad biking.',
    inclusions: ['Tandem Flight Pilot', 'Safety Gear', 'ATV Ride (2 km)', 'GoPro Recording'],
  },
  {
    id: 'act-5-bali',
    name: 'Mount Batur Sunrise Volcano Trek & Hot Springs',
    destination: 'Bali',
    category: 'Adventure',
    duration: '8 Hours',
    rating: 4.9,
    reviewsCount: 510,
    price: 2999,
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    description: 'Early morning guided trek to the caldera summit for sunrise breakfast followed by natural hot springs soak.',
    inclusions: ['Guide & Flashlight', 'Summit Breakfast', 'Hot Spring Entry', 'Hotel Transfers'],
  },
  {
    id: 'act-6-jaipur',
    name: 'Old Pink City Heritage Walk & Authentic Street Food',
    destination: 'Jaipur',
    category: 'Culture',
    duration: '3.5 Hours',
    rating: 4.8,
    reviewsCount: 190,
    price: 750,
    image_url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop&q=80',
    description: 'Explore Hawa Mahal backstreets, heritage bazaars, artisan bangle makers, and legendary kachori stalls.',
    inclusions: ['Local Historian Guide', 'Food Tastings (5+ Items)', 'Mineral Water', 'Heritage Route Map'],
  },
];

export const ActivitiesList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedActivities, setAddedActivities] = useState<string[]>([]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { budget: activeBudget } = useTripBuilder();
  const navigate = useNavigate();

  const categories = ['All', 'Adventure', 'Water Sports', 'Cruises', 'Culture'];

  const filtered = ACTIVITIES_DATA.filter((act) => {
    const matchesCat = selectedCategory === 'All' || act.category === selectedCategory;
    const matchesSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleToggleAdd = (act: Activity) => {
    if (addedActivities.includes(act.id)) {
      setAddedActivities(addedActivities.filter((id) => id !== act.id));
    } else {
      setAddedActivities([...addedActivities, act.id]);
    }
  };

  const handleToggleWishlist = (act: Activity) => {
    if (isInWishlist(act.id)) {
      removeFromWishlist(act.id);
    } else {
      addToWishlist({
        id: act.id,
        type: 'activity',
        title: act.name,
        subtitle: `${act.destination} • ${act.category}`,
        price: act.price,
        imageUrl: act.image_url,
        rating: act.rating,
        data: act,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>AUTHENTIC EXPERIENCES & TOURS</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Discover Top Tours & Outdoor Adventures
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Handpicked excursions, scuba dives, desert safaris, and heritage walks with verified local tour guides.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city or activity..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Active Trip Target Budget Context */}
        {activeBudget > 0 && (
          <div className="mt-4 p-3 px-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Total Trip Budget:</strong> <CurrencyDisplay amount={activeBudget} className="font-bold" />
              </span>
            </div>
            <span className="text-[11px] text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-lg border border-amber-200 font-medium">
              Tours & activity bookings contribute to your overall trip budget
            </span>
          </div>
        )}
      </div>

      {/* Grid of Activities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((act) => {
          const isAdded = addedActivities.includes(act.id);
          const wishlisted = isInWishlist(act.id);

          return (
            <div
              key={act.id}
              className="surface-card rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 overflow-hidden flex flex-col justify-between group transition-all bg-white"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={act.image_url}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {act.destination} • {act.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-xl flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{act.rating}</span>
                    <span className="text-slate-400">({act.reviewsCount})</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{act.duration}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {act.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{act.description}</p>

                  <div className="space-y-1 pt-1">
                    {act.inclusions.slice(0, 3).map((inc) => (
                      <div key={inc} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">From</span>
                  <CurrencyDisplay amount={act.price} className="text-lg font-black text-slate-900" />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleWishlist(act)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                      wishlisted
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900'
                    }`}
                    title={wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                  >
                    ★
                  </button>

                  <button
                    onClick={() => handleToggleAdd(act)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'btn-primary'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added to Trip
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add to Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
