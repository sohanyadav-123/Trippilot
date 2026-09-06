import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Coffee,
  Utensils,
  Hospital,
  ShieldCheck,
  Fuel,
  Train,
  Car,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Star,
  ShoppingBag,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useWishlist } from '../context/WishlistContext';

export const NearbyDiscoveryPage: React.FC = () => {
  const { destination, tripNights, addCustomItineraryEvent } = useTripBuilder();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [activeCategory, setActiveCategory] = useState<string>('restaurants');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [addedItemTitle, setAddedItemTitle] = useState<string | null>(null);

  const totalDays = Math.max(2, tripNights || 4);

  const categories = [
    { id: 'restaurants', label: '🍽️ Dining & Cafés', icon: Utensils },
    { id: 'hospitals', label: '🏥 Hospitals & Pharmacies', icon: Hospital },
    { id: 'atms', label: '💳 ATMs & Currency Exchange', icon: CreditCard },
    { id: 'fuel', label: '⛽ Fuel & EV Fast Charging', icon: Fuel },
    { id: 'transport', label: '🚆 Metro & Transit Stations', icon: Train },
    { id: 'shopping', label: '🛍️ Markets & Artisans', icon: ShoppingBag },
    { id: 'attractions', label: '📍 Sights & Viewpoints', icon: MapPin },
  ];

  const nearbyInventory: Record<string, any[]> = {
    restaurants: [
      {
        id: 'nb-r1',
        name: 'Fisherman’s Wharf Coastal Grill',
        distance: '0.8 km',
        travelTime: '3 min walk',
        rating: 4.9,
        priceLevel: '₹₹',
        openStatus: 'Open until 11:00 PM',
        cuisine: 'Authentic Goan Seafood & Grill',
        address: 'Riverside Walk, Cavelossim',
        cost: 950,
      },
      {
        id: 'nb-r2',
        name: 'Gunpowder South Indian Bistro',
        distance: '1.4 km',
        travelTime: '5 min drive',
        rating: 4.8,
        priceLevel: '₹₹',
        openStatus: 'Open until 10:30 PM',
        cuisine: 'Malabar & Andhra Coastal Delicacies',
        address: 'Assagao Village Main Road',
        cost: 800,
      },
      {
        id: 'nb-r3',
        name: 'Thalassa Sunset Cliffside Lounge',
        distance: '2.1 km',
        travelTime: '8 min drive',
        rating: 4.9,
        priceLevel: '₹₹₹',
        openStatus: 'Open until 1:00 AM',
        cuisine: 'Greek, Cocktails & Live Music',
        address: 'Vagator Cliff Viewpoint',
        cost: 1600,
      },
      {
        id: 'nb-r4',
        name: 'Artisan Latin Quarter Pastry & Café',
        distance: '0.4 km',
        travelTime: '2 min walk',
        rating: 4.7,
        priceLevel: '₹',
        openStatus: 'Open from 8:00 AM',
        cuisine: 'Fresh Roast Coffee & Local Pastries',
        address: 'Fontainhas Heritage Lane',
        cost: 350,
      },
    ],
    hospitals: [
      {
        id: 'nb-h1',
        name: 'Manipal Multi-Specialty Hospital',
        distance: '3.2 km',
        travelTime: '10 min drive',
        rating: 4.9,
        openStatus: '24/7 Emergency Open',
        address: 'Dona Paula, Goa',
        phone: '+91 832 667 0444',
      },
      {
        id: 'nb-h2',
        name: 'Apollo 24x7 Express Pharmacy',
        distance: '0.5 km',
        travelTime: '2 min walk',
        rating: 4.8,
        openStatus: '24 Hours Open',
        address: 'Main Coastal Beach Road',
        phone: '+91 832 227 8900',
      },
    ],
    atms: [
      {
        id: 'nb-atm1',
        name: 'HDFC Bank ATM & International Card Cash Out',
        distance: '0.3 km',
        travelTime: '1 min walk',
        rating: 4.8,
        openStatus: '24/7 Operable',
        address: 'Beach Road Circle',
      },
      {
        id: 'nb-atm2',
        name: 'SBI Global Currency Exchange & ATM',
        distance: '0.7 km',
        travelTime: '3 min drive',
        rating: 4.6,
        openStatus: 'Open 9 AM – 7 PM',
        address: 'Central Market Road',
      },
    ],
    fuel: [
      {
        id: 'nb-f1',
        name: 'Indian Oil Petrol, Diesel & Air Station',
        distance: '1.1 km',
        travelTime: '4 min drive',
        openStatus: '24/7 Open',
        address: 'NH-66 Highway Junction',
      },
      {
        id: 'nb-f2',
        name: 'TATA Power EV Fast Supercharger (60kW)',
        distance: '1.8 km',
        travelTime: '6 min drive',
        openStatus: 'Available 24/7',
        address: 'Resort Strip Hub',
      },
    ],
    transport: [
      {
        id: 'nb-t1',
        name: 'Thivim Railway Station (THVM)',
        distance: '14.5 km',
        travelTime: '25 min drive',
        openStatus: 'Major Express Train Stop',
        address: 'Konkan Railway Line',
      },
      {
        id: 'nb-t2',
        name: 'MOPA International Airport (GOX)',
        distance: '28 km',
        travelTime: '40 min cab',
        openStatus: 'All Domestic & Intl Flights',
        address: 'North Goa Expressway',
      },
    ],
    shopping: [
      {
        id: 'nb-s1',
        name: 'Anjuna Wednesday Artisan Flea Market',
        distance: '1.9 km',
        travelTime: '7 min drive',
        rating: 4.8,
        openStatus: 'Open Every Wednesday 9 AM – Sunset',
        cuisine: 'Handicrafts, Textiles & Local Spices',
        address: 'Anjuna Beachfront',
      },
      {
        id: 'nb-s2',
        name: 'Organic Spice Plantation & Souvenir Store',
        distance: '6.2 km',
        travelTime: '15 min drive',
        rating: 4.9,
        openStatus: 'Open 9:30 AM – 6:00 PM',
        cuisine: 'Fresh Cardamom, Vanilla & Cashews',
        address: 'Ponda Spice Trail',
      },
    ],
    attractions: [
      {
        id: 'nb-a1',
        name: 'Fort Aguada & Coastal Lighthouse',
        distance: '2.4 km',
        travelTime: '8 min drive',
        rating: 4.8,
        openStatus: 'Open 9:00 AM – 6:00 PM',
        cuisine: '17th-century Portuguese fortress with sweeping ocean views',
        address: 'Sinquerim Beach Cliff',
        cost: 200,
      },
      {
        id: 'nb-a2',
        name: 'Fontainhas Portuguese Latin Quarter',
        distance: '8.1 km',
        travelTime: '18 min drive',
        rating: 4.9,
        openStatus: 'Open Day & Night',
        cuisine: 'UNESCO preserved heritage precinct with pastel manors',
        address: 'Panjim Central',
        cost: 0,
      },
    ],
  };

  const activeItems = nearbyInventory[activeCategory] || nearbyInventory.restaurants;

  const handleAddStopToItinerary = (item: any) => {
    addCustomItineraryEvent(selectedDay, {
      date: '2026-09-15',
      time: activeCategory === 'restaurants' ? '08:00 PM' : '04:00 PM',
      title: item.name,
      type: activeCategory === 'restaurants' ? 'dining' : 'activity',
      location: `${destination} (${item.distance})`,
      cost: item.cost || 0,
      description: item.cuisine || item.address || 'Nearby discovered spot',
    });

    setAddedItemTitle(item.name);
    setTimeout(() => setAddedItemTitle(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <Navigation className="w-3.5 h-3.5" />
              <span>NEARBY DISCOVERY & ESSENTIALS</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
              Essential Places Near {destination}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Discover verified nearby restaurants, emergency 24/7 pharmacies, international ATMs, EV chargers, and local sights.
            </p>
          </div>

          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-xs space-y-2 min-w-[240px]">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Add Directly to Day:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                <motion.button
                  key={d}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === d
                      ? 'bg-[#C8A96B] text-[#0B1220] shadow-xs'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Day {d}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {addedItemTitle && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>✓ Added "{addedItemTitle}" to your Day {selectedDay} itinerary schedule!</span>
          </div>
        )}

        {/* Category Selector Horizontal Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="surface-card rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all"
              >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-[#0B1220] leading-snug">{item.name}</h3>
                    {item.cuisine && <p className="text-xs text-slate-600 mt-1">{item.cuisine}</p>}
                    {item.address && (
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                    {item.distance}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="font-semibold text-emerald-700">{item.openStatus}</span>
                  {item.rating && (
                    <span className="font-bold text-slate-800 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.cost != null && item.cost > 0 ? (
                  <span className="text-xs font-black text-slate-900">~₹{item.cost}/person</span>
                ) : (
                  <span className="text-[11px] text-slate-400">{item.travelTime || 'Verified'}</span>
                )}

                <button
                  type="button"
                  onClick={() => handleAddStopToItinerary(item)}
                  className="btn-primary text-xs !py-1.5 px-3.5 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Day {selectedDay}</span>
                </button>
              </div>
            </motion.div>
          ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
