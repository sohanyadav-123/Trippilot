import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Star, MapPin, Check, ChevronRight, AlertCircle, Sparkles, Home, BedDouble, Trees, Castle, Waves, Coffee, Utensils, Wifi, ShieldCheck, Filter, X, Edit3, Trash2 } from 'lucide-react';
import { useTripBuilder, StayTypePreference, StayItem } from '../../../context/TripBuilderContext';
import { useTravelSettings } from '../../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../Common/CurrencyDisplay';

export const StayStep: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    destination,
    departureDate,
    returnDate,
    travellers,
    tripNights,
    stayTypePreference,
    setStayTypePreference,
    selectedStay,
    selectStayItem,
    changeStayRoom,
    removeStay,
    skipStay,
    goToNextStep,
    goToPrevStep,
  } = useTripBuilder();

  const [activeType, setActiveType] = useState<StayTypePreference>(stayTypePreference || 'hotel');
  const [roomChangeOpen, setRoomChangeOpen] = useState(false);

  // Type-specific filter states
  const [filterPoolOnly, setFilterPoolOnly] = useState(false);
  const [filterBeachfrontOnly, setFilterBeachfrontOnly] = useState(false);
  const [filterBedrooms, setFilterBedrooms] = useState<number>(0);
  const [filterBreakfast, setFilterBreakfast] = useState(false);

  // Curated stay inventory tagged by type
  const stayInventory: StayItem[] = [
    // ─── VILLAS ───
    {
      id: 'st-villa-nirvana',
      name: 'Villa Nirvana Luxury Private Pool Haven',
      type: 'Villa',
      destination: destination,
      address: 'Anjuna Coastal Hills, North Goa',
      description: 'Ultra-luxury 4-BHK private pool villa with personal chef, manicured garden gazebo, and 5-minute buggy ride to beach.',
      image_urls: [
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.9,
      review_count: 140,
      price_per_night: 11500,
      bedrooms: 4,
      hasPrivatePool: true,
      isBeachfront: true,
      hasKitchen: true,
      hasParking: true,
      hasBreakfast: true,
      cancellation_policy: 'Free cancellation up to 72 hours prior',
      room_types: ['Entire 4-BHK Villa (Sleeps 8)', '3-BHK Private Wing (Sleeps 6)'],
    },
    {
      id: 'st-villa-casasol',
      name: 'Casa Del Sol Heritage Portuguese Pool Villa',
      type: 'Villa',
      destination: destination,
      address: 'Assagao Village, Goa',
      description: 'Restored colonial villa surrounded by palm groves with private turquoise plunge pool, open courtyard, and chef kitchen.',
      image_urls: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.8,
      review_count: 95,
      price_per_night: 8500,
      bedrooms: 3,
      hasPrivatePool: true,
      isBeachfront: false,
      hasKitchen: true,
      hasParking: true,
      hasBreakfast: true,
      cancellation_policy: 'Free cancellation up to 48 hours prior',
      room_types: ['Entire 3-BHK Villa (Sleeps 6)'],
    },
    {
      id: 'st-villa-oceanpalms',
      name: 'Ocean Palms Sunset Beach Villa',
      type: 'Villa',
      destination: destination,
      address: 'Morjim Beach Road, Goa',
      description: 'Direct beachfront villa with unobstructed sea sunsets, private infinity splash pool, and direct beach gate.',
      image_urls: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.9,
      review_count: 180,
      price_per_night: 14200,
      bedrooms: 5,
      hasPrivatePool: true,
      isBeachfront: true,
      hasKitchen: true,
      hasParking: true,
      hasBreakfast: true,
      cancellation_policy: 'Flexible refund policy',
      room_types: ['Entire 5-BHK Beachfront Villa'],
    },

    // ─── HOTELS ───
    {
      id: 'st-hotel-taj',
      name: 'Taj Exotica Resort & Luxury Suites',
      type: 'Hotel',
      destination: destination,
      address: 'Benaulim, South Goa',
      description: 'Mediterranean-style 5-star haven spread across 56 beachfront acres with Jiva luxury spa and fine dining.',
      image_urls: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.9,
      review_count: 480,
      price_per_night: 13900,
      isBeachfront: true,
      hasParking: true,
      hasBreakfast: true,
      cancellation_policy: 'Free cancellation up to 48 hours before check-in',
      room_types: ['Deluxe Sea View Suite', 'Luxury Plunge Pool Suite', 'Presidential Suite'],
    },
    {
      id: 'st-hotel-alila',
      name: 'Alila Diwa Sanctuary & Wellness Hotel',
      type: 'Hotel',
      destination: destination,
      address: 'Majorda Beach Road, South Goa',
      description: 'Contemporary Balinese luxury hotel nestled amidst serene paddy fields with bespoke spa and infinity pool.',
      image_urls: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.8,
      review_count: 320,
      price_per_night: 9500,
      isBeachfront: false,
      hasParking: true,
      hasBreakfast: true,
      cancellation_policy: 'Free cancellation up to 24 hours prior',
      room_types: ['Terrace Room', 'Diwa Club Suite'],
    },

    // ─── RESORTS ───
    {
      id: 'st-resort-w',
      name: 'W Goa Beachfront Luxury Lifestyle Resort',
      type: 'Resort',
      destination: destination,
      address: 'Vagator Beach, North Goa',
      description: 'Chic 5-star lifestyle resort situated directly on Vagator cliff with Rock Pool DJ lounge, AWAY Spa, and private chalets.',
      image_urls: [
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.9,
      review_count: 390,
      price_per_night: 16500,
      isBeachfront: true,
      hasPrivatePool: true,
      hasParking: true,
      hasBreakfast: true,
      cancellation_policy: 'Free cancellation up to 48 hours prior',
      room_types: ['Marvelous Suite with Sea View', 'WOW Villa with Plunge Pool'],
    },

    // ─── APARTMENTS & HOLIDAY HOMES ───
    {
      id: 'st-apt-candolim',
      name: 'Candolim Coastal Serviced Apartment',
      type: 'Apartment',
      destination: destination,
      address: 'Candolim Main Road, Goa',
      description: 'Modern 2-BHK serviced apartment with modular kitchen, high-speed Wi-Fi, shared pool, and covered parking.',
      image_urls: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.7,
      review_count: 110,
      price_per_night: 4200,
      bedrooms: 2,
      hasKitchen: true,
      hasParking: true,
      cancellation_policy: 'Free cancellation up to 24 hours prior',
      room_types: ['Entire 2-BHK Apartment (Sleeps 4)'],
    },

    // ─── BOUTIQUE STAYS ───
    {
      id: 'st-boutique-fontainhas',
      name: 'Fontainhas 19th-Century Heritage Manor',
      type: 'Boutique',
      destination: destination,
      address: 'Latin Quarter, Panjim, Goa',
      description: 'Restored Portuguese ancestral manor featuring hand-crafted azulejos tiles, courtyard café, and bespoke hospitality.',
      image_urls: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80',
      ],
      rating: 4.8,
      review_count: 220,
      price_per_night: 5400,
      hasBreakfast: true,
      cancellation_policy: 'Standard policy',
      room_types: ['Heritage Balcony Suite', 'Portuguese Queen Room'],
    },
  ];

  const stayTypeCards: {
    id: StayTypePreference;
    icon: any;
    title: string;
    subtitle: string;
    count: number;
    badge?: string;
  }[] = [
    { id: 'villa', icon: Home, title: t('step.stay.filter_villas', 'Villa'), subtitle: 'Private pool & space for groups', count: 3, badge: 'Best for Groups' },
    { id: 'hotel', icon: Building2, title: t('step.stay.filter_hotels', 'Hotel'), subtitle: 'Full service & prime locations', count: 2 },
    { id: 'resort', icon: Waves, title: t('step.stay.filter_resorts', 'Resort'), subtitle: 'Beachfront & all-inclusive relaxation', count: 1, badge: 'Luxury' },
    { id: 'apartment', icon: BedDouble, title: t('step.stay.filter_apartments', 'Apartment'), subtitle: 'Kitchen & space for long stays', count: 1, badge: 'Value' },
    { id: 'boutique', icon: Castle, title: 'Boutique Stay', subtitle: 'Heritage & artisanal design', count: 1 },
    { id: 'flexible', icon: Sparkles, title: t('step.travel.compare_all', "I'm Flexible"), subtitle: 'Compare all stay types', count: 8 },
  ];

  const handleSelectStayType = (type: StayTypePreference) => {
    setActiveType(type);
    setStayTypePreference(type);
  };

  // Filter inventory strictly matching chosen category & filters
  const filteredInventory = stayInventory.filter((item) => {
    if (activeType !== 'flexible') {
      if (activeType === 'villa' && item.type !== 'Villa') return false;
      if (activeType === 'hotel' && item.type !== 'Hotel') return false;
      if (activeType === 'resort' && item.type !== 'Resort') return false;
      if (activeType === 'apartment' && item.type !== 'Apartment') return false;
      if (activeType === 'boutique' && item.type !== 'Boutique') return false;
    }

    if (filterPoolOnly && !item.hasPrivatePool) return false;
    if (filterBeachfrontOnly && !item.isBeachfront) return false;
    if (filterBedrooms > 0 && (item.bedrooms || 1) < filterBedrooms) return false;
    if (filterBreakfast && !item.hasBreakfast) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── 1. STEP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-0.5">
            {t('step.stay.header_step', 'Step 2 of 6 • Accommodation')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
            {t('step.stay.question', { destination }, `Where would you like to stay in ${destination}?`)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {departureDate} to {returnDate} • {tripNights} {tripNights === 1 ? t('builder.nights', 'Night') : t('builder.nights', 'Nights')} • {travellers} {travellers > 1 ? t('builder.travellers_label', 'Guests') : t('builder.traveller_label', 'Guest')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevStep}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ← {t('builder.back', 'Back')}
          </button>
          <button
            type="button"
            onClick={skipStay}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('step.stay.skip', 'Skip Stays →')}
          </button>
        </div>
      </div>

      {/* ─── 2. SELECTED STAY BANNER / EMPTY STATE BANNER ─── */}
      {selectedStay ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-md text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {t('step.stay.selected', `${selectedStay.type} Selected ✓`)}
                </span>
                <span className="text-sm font-bold text-[#0B1220]">{selectedStay.name}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Room: <span className="font-bold text-slate-800">{selectedStay.selectedRoomName || 'Standard Booking'}</span> • {tripNights} {t('builder.nights', 'Nights')} •{' '}
                <CurrencyDisplay amount={selectedStay.price_per_night * tripNights} className="font-black text-slate-900" /> total
              </p>

              {/* Room Quick-Changer Pills */}
              {selectedStay.room_types && selectedStay.room_types.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <BedDouble className="w-3 h-3" />
                    <span>Change Room:</span>
                  </span>
                  {selectedStay.room_types.map((room) => {
                    const isRoomPicked = selectedStay.selectedRoomName === room;
                    return (
                      <button
                        key={room}
                        type="button"
                        onClick={() => changeStayRoom(room)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-all ${
                          isRoomPicked
                            ? 'bg-[#0B1220] text-white border-[#0B1220]'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {room} {isRoomPicked && '✓'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <button
              type="button"
              onClick={removeStay}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors"
              title="Remove this hotel selection"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('step.stay.remove', 'Remove')}</span>
            </button>

            <button
              type="button"
              onClick={goToNextStep}
              className="btn-primary text-xs !py-2 px-4.5 font-bold shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{t('sidebar.continue_to', { step: t('step.local_transport', 'Get Around') }, 'Next: Get Around')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">{t('step.stay.empty_title', 'No Accommodation Selected')}</span>
              <span className="text-[11px] text-slate-500">
                {t('step.stay.empty_desc', 'Browse hotels, luxury villas, resorts, and homestays for your trip.')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={skipStay}
            className="btn-secondary text-xs font-bold py-1.5 px-3 whitespace-nowrap"
          >
            {t('step.stay.skip', 'Skip Stay →')}
          </button>
        </div>
      )}

      {/* ─── 3. VISUAL STAY TYPE SELECTOR CARDS ─── */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          {t('step.stay.question', { destination }, 'Where would you like to stay?')}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stayTypeCards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeType === card.id;

            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleSelectStayType(card.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0B1220] text-white border-[#0B1220] ring-2 ring-[#0B1220]/20 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {card.badge && (
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-[#C8A96B] text-[#0B1220]' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {card.badge}
                  </span>
                )}

                <div className="space-y-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/10 text-[#C8A96B]' : 'bg-slate-100 text-[#0B1220]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-xs tracking-tight">{card.title}</h4>
                  <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100/20 text-[10px]">
                  <span className={`font-semibold ${isSelected ? 'text-[#C8A96B]' : 'text-slate-500'}`}>
                    {card.count} {card.count === 1 ? 'Property' : 'Properties'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. DYNAMIC TYPE-SPECIFIC FILTERS BAR ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </span>

          {/* Villa specific filters */}
          {(activeType === 'villa' || activeType === 'flexible') && (
            <button
              type="button"
              onClick={() => setFilterPoolOnly(!filterPoolOnly)}
              className={`px-2.5 py-1 rounded-xl font-bold border transition-all ${
                filterPoolOnly ? 'bg-[#0B1220] text-white border-[#0B1220]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🏊 Private Pool
            </button>
          )}

          {/* Beachfront Filter */}
          <button
            type="button"
            onClick={() => setFilterBeachfrontOnly(!filterBeachfrontOnly)}
            className={`px-2.5 py-1 rounded-xl font-bold border transition-all ${
              filterBeachfrontOnly ? 'bg-[#0B1220] text-white border-[#0B1220]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🌊 Beachfront
          </button>

          {/* Breakfast */}
          <button
            type="button"
            onClick={() => setFilterBreakfast(!filterBreakfast)}
            className={`px-2.5 py-1 rounded-xl font-bold border transition-all ${
              filterBreakfast ? 'bg-[#0B1220] text-white border-[#0B1220]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            ☕ Free Breakfast
          </button>

          {/* Bedrooms for Villas / Apartments */}
          {(activeType === 'villa' || activeType === 'apartment') && (
            <select
              value={filterBedrooms}
              onChange={(e) => setFilterBedrooms(Number(e.target.value))}
              aria-label="Filter by bedrooms"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-bold text-slate-700 focus:outline-none"
            >
              <option value={0}>Any Bedrooms</option>
              <option value={2}>2+ Bedrooms</option>
              <option value={3}>3+ Bedrooms</option>
              <option value={4}>4+ Bedrooms</option>
            </select>
          )}
        </div>

        {(filterPoolOnly || filterBeachfrontOnly || filterBedrooms > 0 || filterBreakfast) && (
          <button
            type="button"
            onClick={() => {
              setFilterPoolOnly(false);
              setFilterBeachfrontOnly(false);
              setFilterBedrooms(0);
              setFilterBreakfast(false);
            }}
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* ─── 5. FILTERED INVENTORY LIST ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeType + String(filterPoolOnly) + String(filterBeachfrontOnly) + String(filterBedrooms) + String(filterBreakfast)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          {filteredInventory.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-sm text-slate-900">No properties matched your specific filters</p>
              <button
                type="button"
                onClick={() => {
                  setFilterPoolOnly(false);
                  setFilterBeachfrontOnly(false);
                  setFilterBedrooms(0);
                  setFilterBreakfast(false);
                }}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredInventory.map((item) => {
              const isPicked = selectedStay?.id === item.id;
              const currentRoom = isPicked && selectedStay?.selectedRoomName ? selectedStay.selectedRoomName : item.room_types?.[0];

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  className={`surface-card p-5 rounded-2xl transition-all bg-white ${
                    isPicked ? 'border-[#0B1220] ring-2 ring-[#0B1220]/10 shadow-md' : 'hover:border-slate-300'
                  }`}
                >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Photo thumbnail */}
                  <div className="md:col-span-4 relative h-52 md:h-full min-h-[190px] rounded-xl overflow-hidden">
                    <img
                      src={item.image_urls[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#0B1220]/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {item.type}
                    </div>
                    {item.hasPrivatePool && (
                      <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Private Pool
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 bg-white/95 backdrop-blur-md text-[#0B1220] text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{item.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({item.review_count})</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.address}</span>
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-[#0B1220] mt-1">{item.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    {/* Room / Unit Selector */}
                    {item.room_types && item.room_types.length > 0 && (
                      <div className="pt-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Select Unit / Configuration:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {item.room_types.map((room) => {
                            const isRoomActive = currentRoom === room;
                            return (
                              <button
                                key={room}
                                type="button"
                                onClick={() => selectStayItem(item, room)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                  isRoomActive && isPicked
                                    ? 'bg-[#0B1220] text-white border-[#0B1220]'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {room}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Feature tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-600">
                      {item.bedrooms && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          🛏️ {item.bedrooms} Bedrooms
                        </span>
                      )}
                      {item.hasKitchen && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          🍳 Kitchen Included
                        </span>
                      )}
                      {item.hasBreakfast && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          ☕ Free Breakfast
                        </span>
                      )}
                      {item.isBeachfront && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                          🌊 Beachfront Access
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end md:border-l md:border-slate-100 md:pl-5 space-y-3">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">{t('step.stay.per_night', 'Per Night')}</span>
                      <CurrencyDisplay amount={item.price_per_night} className="text-xl font-black text-[#0B1220]" />
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {tripNights} {t('builder.nights', 'Nights')}:{' '}
                        <CurrencyDisplay
                          amount={item.price_per_night * tripNights}
                          className="font-bold text-slate-900"
                        />
                      </span>
                    </div>

                    <div className="w-full space-y-1.5">
                      {isPicked ? (
                        <>
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="flex-grow text-xs font-bold py-2.5 px-3 rounded-xl bg-[#158A6A] text-white shadow-xs flex items-center justify-center gap-1">
                              <Check className="w-4 h-4" />
                              <span>{t('step.stay.selected_btn', 'Stay Selected')}</span>
                            </span>
                            <button
                              type="button"
                              onClick={removeStay}
                              className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                              title="Remove stay selection"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={goToNextStep}
                            className="w-full text-[11px] font-bold text-blue-600 hover:text-blue-700 underline text-center block pt-1"
                          >
                            {t('sidebar.continue_to', { step: t('step.local_transport', 'Get Around') }, 'Next: Get Around →')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectStayItem(item)}
                          className="btn-primary w-full text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>{t('step.stay.select_stay', 'Select Stay')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
