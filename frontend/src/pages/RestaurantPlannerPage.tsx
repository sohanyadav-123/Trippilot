import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Star,
  MapPin,
  Plus,
  Check,
  Trash2,
  Clock,
  ShieldCheck,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { RestaurantItem } from '../types';

export const RestaurantPlannerPage: React.FC = () => {
  const {
    destination,
    travellers,
    tripNights,
    selectedRestaurants,
    addRestaurant,
    removeRestaurant,
    addCustomItineraryEvent,
  } = useTripBuilder();

  const [activeMeal, setActiveMeal] = useState<string>('all');
  const [activeDiet, setActiveDiet] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const totalDays = Math.max(2, tripNights || 4);

  const mealFilters = [
    { id: 'all', label: '🍽️ All Dining' },
    { id: 'breakfast', label: '☕ Breakfast & Cafés' },
    { id: 'lunch', label: '🥗 Casual Lunch & Grills' },
    { id: 'dinner', label: '🍷 Fine Dining & Dinners' },
    { id: 'nightlife', label: '🍸 Sunset Cliff Lounges' },
  ];

  const dietFilters = [
    { id: 'all', label: 'All Cuisines' },
    { id: 'seafood', label: '🦞 Seafood Specialties' },
    { id: 'veg', label: '🌱 Pure Veg & Vegan' },
    { id: 'local', label: '🍛 Authentic Regional' },
  ];

  const restaurantCatalog: (RestaurantItem & { popularDishes: string[]; distance: string; dietTag: string })[] = [
    {
      id: 'res-goa-1',
      name: 'Fisherman’s Wharf Riverside Coastal Grill',
      cuisine: 'Authentic Goan Seafood & Asian Grills',
      rating: 4.9,
      price_level: '₹₹',
      image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      location: 'Cavelossim Riverside, Goa',
      meal_type: 'dinner',
      cost: 1200,
      popularDishes: ['Butter Garlic King Prawns', 'Goan Fish Curry', 'Crab Xec Xec'],
      distance: '0.8 km from hotel',
      dietTag: 'seafood',
    },
    {
      id: 'res-goa-2',
      name: 'Gunpowder Artisanal Heritage Kitchen',
      cuisine: 'Malabar, Andhra & South Indian Coastal Delicacies',
      rating: 4.8,
      price_level: '₹₹',
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      location: 'Assagao Heritage Precinct, Goa',
      meal_type: 'lunch',
      cost: 850,
      popularDishes: ['Kerela Beef Fry / Mushroom Roast', 'Malabar Parotta', 'Appam & Stew'],
      distance: '1.4 km from hotel',
      dietTag: 'local',
    },
    {
      id: 'res-goa-3',
      name: 'Thalassa Sunset Cliffside Lounge',
      cuisine: 'Greek, Mediterranean & Signature Cocktails',
      rating: 4.9,
      price_level: '₹₹₹',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      location: 'Vagator Ocean Cliff, Goa',
      meal_type: 'nightlife',
      cost: 2200,
      popularDishes: ['Greek Salad with Feta', 'Souvlaki Wraps', 'Baklava with Ice Cream'],
      distance: '2.1 km from hotel',
      dietTag: 'seafood',
    },
    {
      id: 'res-goa-4',
      name: 'Infanteria Artisanal Bakery & Coastal Café',
      cuisine: 'European Breakfasts, Croissants & Baked Treats',
      rating: 4.7,
      price_level: '₹',
      image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      location: 'Baga Beach Main Road, Goa',
      meal_type: 'breakfast',
      cost: 450,
      popularDishes: ['English Breakfast Platter', 'Fresh Butter Croissants', 'Bebinca Slice'],
      distance: '0.4 km from hotel',
      dietTag: 'veg',
    },
    {
      id: 'res-goa-5',
      name: 'Navtara Pure Vegetarian Coastal Bhojanalya',
      cuisine: 'Authentic South Indian & North Indian Thalis',
      rating: 4.6,
      price_level: '₹',
      image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
      location: 'Panjim Market Circle, Goa',
      meal_type: 'lunch',
      cost: 400,
      popularDishes: ['Special Royal Veg Thali', 'Ghee Roast Dosa', 'Paneer Butter Masala'],
      distance: '1.2 km from hotel',
      dietTag: 'veg',
    },
    {
      id: 'res-goa-6',
      name: 'Antares Beach Club & Restaurant by Sarah Todd',
      cuisine: 'Modern Australian & Coastal Tapas',
      rating: 4.8,
      price_level: '₹₹₹',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      location: 'Small Vagator Beachfront, Goa',
      meal_type: 'dinner',
      cost: 1900,
      popularDishes: ['Wood-Fired Gourmet Pizzas', 'Charcoal Grilled Lobster', 'Cocktail Flights'],
      distance: '2.5 km from hotel',
      dietTag: 'seafood',
    },
  ];

  const filteredCatalog = restaurantCatalog.filter((r) => {
    if (activeMeal !== 'all' && r.meal_type !== activeMeal) return false;
    if (activeDiet !== 'all' && r.dietTag !== activeDiet) return false;
    return true;
  });

  const handleAddToItinerary = (res: typeof restaurantCatalog[0]) => {
    addRestaurant(res);

    const mealTimes: Record<string, string> = {
      breakfast: '09:00 AM',
      lunch: '01:30 PM',
      dinner: '08:30 PM',
      nightlife: '09:30 PM',
    };

    addCustomItineraryEvent(selectedDay, {
      date: '2026-09-15',
      time: mealTimes[res.meal_type] || '08:00 PM',
      title: `Dining: ${res.name}`,
      type: 'dining',
      location: res.location,
      cost: res.cost * travellers,
      description: `Reserved dining stop: ${res.cuisine} • Est. ₹${(res.cost * travellers).toLocaleString('en-IN')}`,
    });

    setSuccessToast(`✓ Added "${res.name}" to Day ${selectedDay} timeline! Estimated budget updated.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="surface-card p-8 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
              <Utensils className="w-3.5 h-3.5" />
              <span>RESTAURANT & CULINARY PLANNER</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
              Where to Eat in {destination}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore curated breakfast spots, seafood grills, pure-veg kitchens, and cliffside lounges. Adding dining automatically updates your daily timeline and reserves your estimated food budget.
            </p>
          </div>

          {/* Reserved Status Card */}
          <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-2 min-w-[260px]">
            <div className="flex items-center justify-between text-slate-300">
              <span>Reserved Dining:</span>
              <strong className="text-white font-black text-sm">{selectedRestaurants.length} Places</strong>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Target Day to Add:</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                      selectedDay === d ? 'bg-[#C8A96B] text-[#0B1220]' : 'bg-white/20 text-white'
                    }`}
                  >
                    D{d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">
              Dismiss
            </button>
          </div>
        )}

        {/* Filter Controls: Meal types + Diet pills */}
        <div className="space-y-3">
          {/* Meal Types */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {mealFilters.map((meal) => (
              <motion.button
                key={meal.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMeal(meal.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  activeMeal === meal.id
                    ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {meal.label}
              </motion.button>
            ))}
          </div>

          {/* Diet Preferences */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dietFilters.map((diet) => (
              <motion.button
                key={diet.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveDiet(diet.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  activeDiet === diet.id
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diet.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMeal + '-' + activeDiet}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCatalog.map((res) => {
              const isAlreadyAdded = selectedRestaurants.some((r) => r.id === res.id);

              return (
                <motion.div
                  key={res.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden hover:shadow-luxury transition-all flex flex-col justify-between"
                >
                {/* Image */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img src={res.image_url} alt={res.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                      {res.price_level} • {res.meal_type}
                    </span>
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {res.rating}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">{res.cuisine}</span>
                    <h3 className="font-editorial text-xl font-bold">{res.name}</h3>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{res.location}</span>
                    </p>

                    {/* Popular Dishes */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Signature Dishes:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {res.popularDishes.map((dish, i) => (
                          <span key={i} className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded-md border border-amber-200/60">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost</span>
                      <CurrencyDisplay amount={res.cost * travellers} className="font-black text-sm text-slate-900" />
                      <span className="text-[9px] text-slate-400 block">for {travellers} pax</span>
                    </div>

                    {isAlreadyAdded ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                          ✓ Added
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRestaurant(res.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove restaurant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToItinerary(res)}
                        className="btn-primary text-xs !py-2 px-4 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Day {selectedDay}</span>
                      </button>
                    )}
                  </div>
                </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
