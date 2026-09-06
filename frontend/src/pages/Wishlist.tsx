import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Trash2,
  Plane,
  Building2,
  Luggage,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  Plus,
  Bell,
  Wallet,
  Check,
} from 'lucide-react';
import { useWishlist, WishlistItem } from '../context/WishlistContext';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useCart } from '../hooks/useCart';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { EmptyState } from '../components/Common/EmptyState';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const Wishlist: React.FC = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { t, tPlace, tRoute } = useTravelSettings();
  const {
    selectTravelItem,
    selectStayItem,
    addActivity,
    setDestination,
  } = useTripBuilder();
  const { addFlight, addHotel } = useCart();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('all');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Demo initial items if empty for interactive trial
  const initialDemoItems: WishlistItem[] = [
    {
      id: 'wish-demo-1',
      type: 'flight',
      title: 'IndiGo 6E-2041 · Non-stop Flight',
      subtitle: 'Delhi (DEL) → Goa (GOI) · 2h 35m',
      price: 4199,
      savedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80',
      data: {
        id: 'fl-demo-1',
        airline: 'IndiGo',
        flight_number: '6E-2041',
        origin: 'Delhi',
        destination: 'Goa',
        departure_time: '2026-09-15T06:10:00',
        arrival_time: '2026-09-15T08:45:00',
        duration: 155,
        stops: 0,
        cabin_class: 'Economy',
        price: 4199,
        seats_available: 4,
      },
    },
    {
      id: 'wish-demo-2',
      type: 'hotel',
      title: 'Taj Exotica Resort & Spa',
      subtitle: 'Benaulim Beach, South Goa',
      price: 8500,
      savedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
      data: {
        id: 'ht-demo-2',
        name: 'Taj Exotica Resort & Spa',
        city: 'Goa',
        price_per_night: 8500,
        star_rating: 5,
        rating: 4.9,
      },
    },
    {
      id: 'wish-demo-3',
      type: 'activity',
      title: 'Catamaran Sunset Cruise & Dolphin Safari',
      subtitle: 'Mandovi River / Panjim Marina, Goa',
      price: 2200,
      savedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
      data: {
        id: 'act-demo-3',
        title: 'Catamaran Sunset Cruise',
        cost: 2200,
        destination: 'Goa',
        category: 'Cruise',
        duration: '2 Hours',
      },
    },
  ];

  const displayList = items.length > 0 ? items : initialDemoItems;

  const filteredItems = displayList.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleAddToTrip = (item: WishlistItem) => {
    if (item.type === 'flight') {
      selectTravelItem({
        id: item.data?.id || item.id,
        mode: 'flight',
        title: item.title,
        operator: item.data?.airline || 'IndiGo',
        identifier: item.data?.flight_number || '6E-2041',
        departureTime: item.data?.departure_time || '06:00',
        arrivalTime: item.data?.arrival_time || '08:30',
        duration: '2h 30m',
        price: item.price || 4000,
        origin: item.data?.origin || 'Delhi',
        destination: item.data?.destination || 'Goa',
      });
      if (item.data?.destination) setDestination(item.data.destination);
    } else if (item.type === 'hotel') {
      selectStayItem({
        id: item.data?.id || item.id,
        name: item.title,
        type: 'Hotel',
        destination: item.data?.city || 'Goa',
        address: item.subtitle,
        description: 'Selected boutique stay from saved wishlist.',
        image_urls: item.imageUrl ? [item.imageUrl] : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        rating: item.rating || 4.8,
        review_count: 120,
        price_per_night: item.price || 5000,
        cancellation_policy: 'Free cancellation up to 48 hours before check-in',
      });
    } else if (item.type === 'activity') {
      addActivity({
        id: item.data?.id || item.id,
        name: item.title,
        destination: item.data?.destination || 'Goa',
        category: item.data?.category || 'Tour',
        duration: item.data?.duration || '2 Hours',
        rating: 4.8,
        price: item.price || 2000,
        image_url: item.imageUrl || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        description: item.subtitle,
        time: '16:00',
      });
    }

    setAddedNotice(`Added "${item.title}" to your active Trip Builder!`);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'package':
        return <Luggage className="w-4 h-4 text-emerald-600" />;
      case 'activity':
        return <Compass className="w-4 h-4 text-amber-600" />;
      default:
        return <Compass className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-xs">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t('wishlist.title', 'Saved Travel Wishlist')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('wishlist.subtitle', 'Save flights, verified stays, cruises & tours to quickly insert them into your live Trip Blueprint')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/plan"
            className="btn-primary text-xs !py-2.5 px-4 font-bold shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('wishlist.open_builder', 'Open Trip Builder')}</span>
          </Link>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-slate-400 hover:text-rose-600 font-semibold p-2 transition-colors"
              title={t('action.remove', 'Clear all saved items')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Success Added Feedback Banner */}
      {addedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{addedNotice}</span>
          </div>
          <Link to="/plan" className="underline hover:text-emerald-950">
            View in Plan →
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: t('wishlist.all_items', 'All Items') },
          { id: 'flight', label: t('nav.flights', 'Flights') },
          { id: 'hotel', label: t('nav.hotels', 'Hotels & Stays') },
          { id: 'activity', label: t('nav.activities', 'Tours & Activities') },
          { id: 'package', label: t('nav.packages', 'Packages') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              filterType === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Wishlist Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No items in this category"
          description="Browse flights, hotels, or activities and tap the heart icon to save them for later."
          actionLabel="Explore Destinations"
          onAction={() => navigate('/destinations')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="surface-card rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group bg-white"
            >
              <div>
                {item.imageUrl && (
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                      {getIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>

                    {/* Price Alert Demo Badge */}
                    <div className="absolute top-3 right-3 bg-emerald-500/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                      <Bell className="w-2.5 h-2.5" />
                      <span>Price Alert Active</span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{tPlace(item.title)}</h3>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{tRoute(item.subtitle)}</span>
                    </p>
                  )}
                  {item.price && (
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Cost</span>
                      <CurrencyDisplay amount={item.price} className="text-lg font-black text-slate-900" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 font-semibold transition-colors"
                >
                  Remove
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddToTrip(item)}
                    className="btn-primary text-xs !py-1.5 px-3.5 font-bold shadow-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Trip</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

