import React from 'react';
import { Filter, RotateCcw, Star, Building2, Waves, Wifi, UtensilsCrossed, Coffee } from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface HotelFilterProps {
  rating: number | null;
  onRatingChange: (rating: number | null) => void;
  priceRange: number;
  onPriceChange: (price: number) => void;
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  selectedPropertyType?: string | null;
  onPropertyTypeChange?: (type: string | null) => void;
  onReset: () => void;
}

const COMMON_AMENITIES = [
  'Free WiFi',
  'Swimming Pool',
  'Free Breakfast',
  'Spa & Wellness',
  'Fine Dining',
  'Beach Access',
  'Gym & Fitness',
  'Airport Shuttle',
];

const PROPERTY_TYPES = ['All', 'Resort', 'Hotel', 'Villa', 'Boutique'];

export const HotelFilter: React.FC<HotelFilterProps> = ({
  rating,
  onRatingChange,
  priceRange,
  onPriceChange,
  selectedAmenities,
  onAmenitiesChange,
  selectedPropertyType,
  onPropertyTypeChange,
  onReset,
}) => {
  const handleToggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      onAmenitiesChange(selectedAmenities.filter((a) => a !== amenity));
    } else {
      onAmenitiesChange([...selectedAmenities, amenity]);
    }
  };

  return (
    <div className="surface-card p-5 rounded-3xl border border-slate-200 space-y-6 sticky top-24 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-blue-600" /> Filter Stays
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Property Type Filter */}
      {onPropertyTypeChange && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Property Type</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {PROPERTY_TYPES.map((pt) => {
              const active = pt === 'All' ? !selectedPropertyType : selectedPropertyType === pt;
              return (
                <button
                  key={pt}
                  type="button"
                  onClick={() => onPropertyTypeChange(pt === 'All' ? null : pt)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Guest Rating Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Guest Rating</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'All', val: null },
            { label: '4.0+', val: 4.0 },
            { label: '4.5+', val: 4.5 },
            { label: '4.8+', val: 4.8 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onRatingChange(item.val)}
              className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                rating === item.val
                  ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.val && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Nightly Rate</h4>
          <CurrencyDisplay amount={priceRange} className="text-xs font-black text-blue-600" />
        </div>
        <input
          type="range"
          min="1000"
          max="50000"
          step="500"
          value={priceRange > 50000 ? 50000 : priceRange}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>₹1,000</span>
          <span>₹50,000+</span>
        </div>
      </div>

      {/* Popular Amenities Checkboxes */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Amenities</h4>
        <div className="space-y-1.5">
          {COMMON_AMENITIES.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleAmenity(amenity)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span className={`font-semibold ${isChecked ? 'text-slate-900 font-bold' : ''}`}>
                    {amenity}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
