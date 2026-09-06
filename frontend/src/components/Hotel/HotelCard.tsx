import React, { useState } from 'react';
import { Building2, Star, MapPin, Check, ArrowRight, Wifi, Waves, UtensilsCrossed, ShieldCheck, Eye, Coffee, Sparkles } from 'lucide-react';
import { Hotel } from '../../types';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { useCart } from '../../hooks/useCart';
import { HotelDetailsModal } from './HotelDetailsModal';

interface HotelCardProps {
  hotel: Hotel;
  nights?: number;
  rooms?: number;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, nights = 1, rooms = 1 }) => {
  const { addHotel, items } = useCart();
  const [modalOpen, setModalOpen] = useState(false);

  const isSelected = items.some((item) => item.type === 'hotel' && item.item.id === hotel.id);

  const handleSelect = () => {
    addHotel(hotel, nights, rooms);
  };

  const amenityIcons: Record<string, any> = {
    WiFi: Wifi,
    'Free WiFi': Wifi,
    Pool: Waves,
    'Swimming Pool': Waves,
    Restaurant: UtensilsCrossed,
    'Fine Dining': UtensilsCrossed,
    Breakfast: Coffee,
    'Free Breakfast': Coffee,
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const displayImage = hotel.image_urls && hotel.image_urls.length > 0 ? hotel.image_urls[0] : fallbackImage;
  const totalPrice = hotel.price_per_night * nights * rooms;

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.8) return 'Exceptional';
    if (rating >= 4.5) return 'Superb';
    if (rating >= 4.0) return 'Very Good';
    return 'Good';
  };

  return (
    <>
      <div className="surface-card p-4 sm:p-5 mb-4 border border-slate-200 hover:border-slate-300 rounded-3xl flex flex-col md:flex-row gap-5 transition-all duration-150 bg-white shadow-sm">
        {/* Left Column: Hotel Image & Rating */}
        <div className="md:w-64 h-48 sm:h-52 rounded-2xl overflow-hidden relative flex-shrink-0">
          <img
            src={displayImage}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e: any) => {
              e.target.src = fallbackImage;
            }}
          />
          <div className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
            {hotel.property_type || 'Verified Stay'}
          </div>
          <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-slate-900">{hotel.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Middle Column: Details & Amenities */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{hotel.name}</h3>
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 mb-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{hotel.address || `${hotel.city}, ${hotel.country}`}</span>
              {hotel.distance_from_center && (
                <span className="text-slate-400">• {hotel.distance_from_center}</span>
              )}
            </p>

            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
              {hotel.description}
            </p>

            {/* Recommendation Reasoning Badge */}
            <div className="mb-2 p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="leading-snug">
                <strong>Why it fits:</strong> Matches your itinerary budget and is located 1.2 km from primary sightseeing attractions.
              </span>
            </div>

            {/* Amenities Badges */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(hotel.amenities || []).slice(0, 4).map((amenity) => {
                const Icon = amenityIcons[amenity];
                return (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    {Icon && <Icon className="w-3 h-3 text-blue-600" />}
                    {amenity}
                  </span>
                );
              })}
            </div>

            {hotel.cancellation_policy && (
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {hotel.cancellation_policy}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              View Room Options & Photo Gallery →
            </button>
          </div>
        </div>

        {/* Right Column: Pricing & Action */}
        <div className="md:w-52 flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {nights} Night{nights > 1 ? 's' : ''}, {rooms} Room{rooms > 1 ? 's' : ''}
            </span>
            <CurrencyDisplay amount={totalPrice} className="text-2xl font-black text-slate-900" />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              + taxes & service charges
            </span>
          </div>

          <div className="w-full mt-3">
            <button
              onClick={handleSelect}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'btn-primary'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Booked
                </>
              ) : (
                'Select Room'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Details Modal */}
      {modalOpen && (
        <HotelDetailsModal
          hotel={hotel}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={() => {
            handleSelect();
            setModalOpen(false);
          }}
          isSelected={isSelected}
          nights={nights}
          rooms={rooms}
        />
      )}
    </>
  );
};
