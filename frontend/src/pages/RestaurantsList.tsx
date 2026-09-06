import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Star,
  MapPin,
  Clock,
  Plus,
  Check,
  Search,
  Filter,
  DollarSign,
  Coffee,
  Heart,
} from 'lucide-react';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { EmptyState } from '../components/Common/EmptyState';

interface Restaurant {
  id: string;
  name: string;
  destination: string;
  cuisine: string;
  category: 'Local Food' | 'Fine Dining' | 'Cafés' | 'Romantic' | 'Vegetarian' | 'Street Food';
  priceLevel: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  avgCostForTwo: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  address: string;
  distanceFromCenter: string;
  mustTryDish: string;
  dietaryTags: string[];
}

const RESTAURANTS_DATA: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Fisherman’s Wharf Waterfront Dining',
    destination: 'Goa',
    cuisine: 'Authentic Goan & Coastal Seafood',
    category: 'Local Food',
    priceLevel: '₹₹₹',
    avgCostForTwo: 1800,
    rating: 4.9,
    reviewsCount: 680,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    address: 'Near Sal River, Cavelossim, South Goa',
    distanceFromCenter: '1.2 km from Taj Exotica',
    mustTryDish: 'Butter Garlic King Prawns & Fish Curry Thali',
    dietaryTags: ['Fresh Seafood', 'Gluten-Free Options'],
  },
  {
    id: 'rest-2',
    name: 'Thalassa Greek Taverna & Sunset Lounge',
    destination: 'Goa',
    cuisine: 'Mediterranean & Greek',
    category: 'Romantic',
    priceLevel: '₹₹₹₹',
    avgCostForTwo: 3200,
    rating: 4.8,
    reviewsCount: 920,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    address: 'Siolim Waterfront Promenade, North Goa',
    distanceFromCenter: '4.5 km from Baga',
    mustTryDish: 'Grilled Halloumi & Spicy Souvlaki Wrap',
    dietaryTags: ['Sunset View', 'Cocktail Lounge'],
  },
  {
    id: 'rest-3',
    name: 'Verandah Art Café & Bakery',
    destination: 'Goa',
    cuisine: 'Continental, Artisanal Coffee & Desserts',
    category: 'Cafés',
    priceLevel: '₹₹',
    avgCostForTwo: 800,
    rating: 4.7,
    reviewsCount: 340,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    address: 'Fontainhas Latin Quarter, Panaji',
    distanceFromCenter: 'Central Panjim',
    mustTryDish: 'Warm Chocolate Babka & Pour-Over Coffee',
    dietaryTags: ['Vegetarian', 'Vegan Friendly', 'Quiet Workspace'],
  },
  {
    id: 'rest-4',
    name: 'Govinda Pure Veg & Jain Heritage Kitchen',
    destination: 'Goa',
    cuisine: 'Pure Vegetarian & North/South Indian',
    category: 'Vegetarian',
    priceLevel: '₹₹',
    avgCostForTwo: 650,
    rating: 4.8,
    reviewsCount: 410,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
    address: 'ISKCON Complex, Margao / Panjim Road',
    distanceFromCenter: '3 km from City Center',
    mustTryDish: 'Special Royal Thali & Paneer Tikka Masala',
    dietaryTags: ['100% Pure Veg', 'Jain Options Available', 'No Onion / Garlic'],
  },
  {
    id: 'rest-5',
    name: 'Al Ustad Special Kebab House',
    destination: 'Dubai',
    cuisine: 'Authentic Persian & Middle Eastern',
    category: 'Local Food',
    priceLevel: '₹₹',
    avgCostForTwo: 1400,
    rating: 4.9,
    reviewsCount: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    address: 'Al Souq Al Kabeer, Bur Dubai',
    distanceFromCenter: 'Central Historic Souq',
    mustTryDish: 'Yogurt Marinated Mutton Kebab & Saffron Rice',
    dietaryTags: ['Halal Certified', 'Iconic Heritage Eatery'],
  },
  {
    id: 'rest-6',
    name: 'The Johnson’s Café & Mountain Bakery',
    destination: 'Manali',
    cuisine: 'Italian, Wood-Fired Pizza & Himachali Trout',
    category: 'Cafés',
    priceLevel: '₹₹₹',
    avgCostForTwo: 1600,
    rating: 4.8,
    reviewsCount: 550,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    address: 'Circuit House Road, Siyal, Manali',
    distanceFromCenter: '1 km from Mall Road',
    mustTryDish: 'Fresh Woodfire Truffle Pizza & Almond Trout',
    dietaryTags: ['Pine Garden Seating', 'Live Acoustic Music'],
  },
];

export const RestaurantsList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedRestaurants, setAddedRestaurants] = useState<string[]>([]);
  const navigate = useNavigate();

  const categories = ['All', 'Local Food', 'Fine Dining', 'Cafés', 'Romantic', 'Vegetarian'];

  const filtered = RESTAURANTS_DATA.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleToggleAdd = (r: Restaurant) => {
    if (addedRestaurants.includes(r.id)) {
      setAddedRestaurants(addedRestaurants.filter((id) => id !== r.id));
    } else {
      setAddedRestaurants([...addedRestaurants, r.id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <UtensilsCrossed className="w-3.5 h-3.5 text-blue-600" />
            <span>CURATED DINING & CULINARY EXPERIENCES</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Discover Top Restaurants & Artisan Cafés
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Handpicked coastal seafood shacks, sunset Greek tavernas, pure vegetarian & Jain eateries, and heritage coffee shops.
          </p>
        </div>

        {/* Filter Bar */}
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
              placeholder="Search by cuisine or restaurant..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid of Restaurants */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No dining options found"
          description={`No restaurants match "${searchQuery || selectedCategory}". Try searching for another cuisine or resetting filters.`}
          actionLabel="Reset All Filters"
          onAction={() => {
            setSelectedCategory('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => {
          const isAdded = addedRestaurants.includes(r.id);

          return (
            <div
              key={r.id}
              className="surface-card rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 overflow-hidden flex flex-col justify-between group transition-all bg-white"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={r.imageUrl}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {r.destination} • {r.priceLevel}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-xl border border-slate-200 flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{r.rating}</span>
                    <span className="text-slate-400">({r.reviewsCount})</span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider block">
                    {r.cuisine}
                  </span>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {r.name}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>{r.address}</span>
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block">Chef’s Special:</span>
                    <p className="text-slate-600 italic">"{r.mustTryDish}"</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.dietaryTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg for two</span>
                  <CurrencyDisplay amount={r.avgCostForTwo} className="text-base font-black text-slate-900" />
                </div>

                <button
                  onClick={() => handleToggleAdd(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    isAdded ? 'bg-emerald-600 text-white' : 'btn-primary'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added to Itinerary
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add to Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
