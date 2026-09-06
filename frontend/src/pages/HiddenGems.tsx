import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Users,
  Plus,
  Check,
  Star,
  ShieldCheck,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { EmptyState } from '../components/Common/EmptyState';

interface HiddenGem {
  id: string;
  name: string;
  destination: string;
  category: 'Secluded Beach' | 'Heritage' | 'Nature Spot' | 'Artisan & Café' | 'Viewpoint';
  crowdLevel: 'Very Low' | 'Low' | 'Moderate';
  bestTime: string;
  entryFee: number;
  imageUrl: string;
  description: string;
  insiderTip: string;
}

const GEMS_DATA: HiddenGem[] = [
  {
    id: 'gem-1',
    name: 'Kakolem Beach (Tiger Beach)',
    destination: 'Goa',
    category: 'Secluded Beach',
    crowdLevel: 'Very Low',
    bestTime: '07:30 AM – 11:00 AM',
    entryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    description: 'One of Goa’s most secluded, unspoiled beaches sheltered between forested cliffs with a freshwater natural spring falling onto the beach.',
    insiderTip: 'Wear good footwear for the 15-minute downhill dirt trail; visit during low tide for pristine swimming lagoons.',
  },
  {
    id: 'gem-2',
    name: 'Fontainhas Heritage Latin Quarter Bakery Trail',
    destination: 'Goa',
    category: 'Artisan & Café',
    crowdLevel: 'Low',
    bestTime: '04:00 PM – 07:00 PM',
    entryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
    description: 'Walk through narrow 18th-century Portuguese cobblestone alleys visiting historic family-owned bakeries serving traditional Bebinca and pastéis de nata.',
    insiderTip: 'Stop at 31st January Bakery for freshly baked warm Poee bread and coconut dodol.',
  },
  {
    id: 'gem-3',
    name: 'Jana Waterfall & Traditional Himachali Kitchen',
    destination: 'Manali',
    category: 'Nature Spot',
    crowdLevel: 'Low',
    bestTime: '10:00 AM – 03:00 PM',
    entryFee: 50,
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    description: 'Picturesque pine wood waterfall hidden in a traditional deodar village serving woodfire Siddu with ghee and red rice.',
    insiderTip: 'Try the local apple cider and freshly prepared herbal tea by the wooden bridge café.',
  },
  {
    id: 'gem-4',
    name: 'Al Fahidi Historic District & Textile Alleys',
    destination: 'Dubai',
    category: 'Heritage',
    crowdLevel: 'Moderate',
    bestTime: '05:00 PM – 08:30 PM',
    entryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    description: 'Authentic 1890s wind-tower courtyard architecture showcasing calligraphy museums, coin souqs, and serene Arabian tea houses.',
    insiderTip: 'Cross the creek using a traditional wooden Abra boat for just 1 AED instead of tourist ferries.',
  },
  {
    id: 'gem-5',
    name: 'Sidemen Valley Peaceful Emerald River Sanctuary',
    destination: 'Bali',
    category: 'Nature Spot',
    crowdLevel: 'Very Low',
    bestTime: '06:30 AM – 10:00 AM',
    entryFee: 150,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    description: 'Untouched rural East Bali nestled beneath Mount Agung with misty mountain streams, bamboo suspension bridges, and traditional ikat weavers.',
    insiderTip: 'Rent a scooter early morning for clear views of Mount Agung before cloud cover sets in.',
  },
  {
    id: 'gem-6',
    name: 'Galgibaga Turtle Nesting & Pine Beach',
    destination: 'Goa',
    category: 'Secluded Beach',
    crowdLevel: 'Very Low',
    bestTime: '04:30 PM – 06:45 PM',
    entryFee: 0,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    description: 'Protected Olive Ridley turtle sanctuary in Canacona featuring miles of tranquil silver sand backed by casuarina and pine groves.',
    insiderTip: 'Strictly zero commercial music; excellent spot for sunset meditation and fresh river oysters at local shacks.',
  },
];

export const HiddenGems: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [addedGems, setAddedGems] = useState<string[]>([]);
  const navigate = useNavigate();

  const destinations = ['All', 'Goa', 'Manali', 'Dubai', 'Bali'];

  const filtered = GEMS_DATA.filter((gem) => {
    return selectedCity === 'All' || gem.destination === selectedCity;
  });

  const handleToggleAdd = (gem: HiddenGem) => {
    if (addedGems.includes(gem.id)) {
      setAddedGems(addedGems.filter((id) => id !== gem.id));
    } else {
      setAddedGems([...addedGems, gem.id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>BEYOND THE TOURIST TRAIL</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Curated Hidden Gems & Locals’ Favorites
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Uncrowded beaches, artisan heritage bakeries, secret mountain streams, and authentic cultural sanctuaries vetted by resident curators.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {destinations.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCity === city
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Hidden Gems */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No hidden gems found"
          description={`No secret spots match "${selectedCity}". Try selecting another destination.`}
          actionLabel="Show All Destinations"
          onAction={() => setSelectedCity('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((gem) => {
          const isAdded = addedGems.includes(gem.id);

          return (
            <div
              key={gem.id}
              className="surface-card rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 overflow-hidden flex flex-col justify-between group transition-all bg-white"
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={gem.imageUrl}
                    alt={gem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {gem.destination} • {gem.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-xl border border-emerald-200 shadow-xs">
                    Crowd: {gem.crowdLevel}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Best Hours: {gem.bestTime}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {gem.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{gem.description}</p>

                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                    <span className="font-bold block uppercase text-[9px] text-amber-700 tracking-wider">
                      ★ Insider Recommendation:
                    </span>
                    <p className="leading-snug">{gem.insiderTip}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Entry Fee</span>
                  <span className="font-black text-slate-900 text-sm">
                    {gem.entryFee === 0 ? 'Free Entry' : `₹${gem.entryFee}`}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleAdd(gem)}
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
