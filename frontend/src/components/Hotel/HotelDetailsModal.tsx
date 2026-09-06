import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Hotel } from '../../types';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { Star, MapPin, Check, ShieldCheck, Wifi, Waves, UtensilsCrossed, Coffee, Bed, Users } from 'lucide-react';

interface HotelDetailsModalProps {
  hotel: Hotel;
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  isSelected: boolean;
  nights?: number;
  rooms?: number;
}

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({
  hotel,
  isOpen,
  onClose,
  onSelect,
  isSelected,
  nights = 1,
  rooms = 1,
}) => {
  const [selectedRoomType, setSelectedRoomType] = useState<string>(
    hotel.room_types && hotel.room_types.length > 0 ? hotel.room_types[0] : 'Deluxe Ocean View Room'
  );

  const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  const displayImages =
    hotel.image_urls && hotel.image_urls.length > 0
      ? hotel.image_urls
      : [
          fallbackImage,
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const roomOptions = [
    {
      name: 'Deluxe King Room',
      description: '1 Extra-Large King Bed • Ocean or Garden View • 42 sq.m',
      multiplier: 1.0,
      perks: ['Free Breakfast Buffet', 'Free High-Speed WiFi', 'Complimentary Bottled Water'],
    },
    {
      name: 'Executive Suite with Balcony',
      description: '1 King Bed + Living Area • Private Sunset Balcony • 68 sq.m',
      multiplier: 1.35,
      perks: ['Lounge Access', 'Airport Pickup & Drop', 'Free Breakfast & High Tea'],
    },
  ];

  const currentPrice = hotel.price_per_night;
  const totalPrice = currentPrice * nights * rooms;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Property Overview & Room Selection" maxWidth="xl">
      <div className="space-y-6">
        {/* Photo Gallery with Thumbnails */}
        <div className="space-y-2">
          <div className="h-64 sm:h-72 rounded-2xl overflow-hidden relative border border-slate-200">
            <img
              src={displayImages[activeImageIndex] || fallbackImage}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-900">{hotel.rating.toFixed(1)} / 5.0</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Title, Address & Verified Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900">{hotel.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              {hotel.address || `${hotel.city}, ${hotel.country}`}
            </p>
          </div>
          <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            100% Quality Audited
          </span>
        </div>

        {/* About Property */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">About the Property</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{hotel.description}</p>
        </div>

        {/* Room Tiers Selection */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Available Room Options</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomOptions.map((room) => {
              const roomPrice = Math.round(currentPrice * room.multiplier);
              const roomTotalPrice = roomPrice * nights * rooms;
              const isChosen = selectedRoomType === room.name;

              return (
                <div
                  key={room.name}
                  onClick={() => setSelectedRoomType(room.name)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isChosen
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{room.name}</span>
                      <input
                        type="radio"
                        checked={isChosen}
                        onChange={() => setSelectedRoomType(room.name)}
                        className="text-blue-600 focus:ring-0"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">{room.description}</p>
                    <div className="space-y-1 pt-1">
                      {room.perks.map((perk) => (
                        <div key={perk} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                          <Check className="w-3 h-3 text-blue-600" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400">Total ({nights}N, {rooms}R):</span>
                    <CurrencyDisplay amount={roomTotalPrice} className="text-base font-black text-slate-900" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Payable</span>
            <CurrencyDisplay amount={totalPrice} className="text-2xl font-black text-slate-900" />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary text-xs !py-2.5 px-4 font-bold">
              Close
            </button>
            <button
              onClick={onSelect}
              className="btn-primary text-xs !py-2.5 px-6 font-bold shadow-sm"
            >
              {isSelected ? 'Update Stay in Trip' : 'Add Room to Trip'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
