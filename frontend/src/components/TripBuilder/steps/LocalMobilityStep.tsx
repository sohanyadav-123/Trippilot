import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Bike, Navigation, ShieldCheck, Check, ChevronRight, Fuel, Sparkles, Zap, DollarSign, HeartHandshake, Compass, X, Trash2 } from 'lucide-react';
import { useTripBuilder, LocalTransportType, TransportOptimization, LocalMobilityItem } from '../../../context/TripBuilderContext';
import { useTravelSettings } from '../../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../Common/CurrencyDisplay';

export const LocalMobilityStep: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    destination,
    tripNights,
    localTransportPreference,
    setLocalTransportPreference,
    transportOptimization,
    setTransportOptimization,
    selectedMobility,
    selectMobilityItem,
    removeMobility,
    skipMobility,
    goToNextStep,
    goToPrevStep,
  } = useTripBuilder();

  const [activeType, setActiveType] = useState<LocalTransportType>(localTransportPreference || 'rental_car');
  const [activeOpt, setActiveOpt] = useState<TransportOptimization>(transportOptimization || 'best_overall');

  // Realistic destination-aware mobility inventory for Goa / coastal hubs
  const mobilityInventory: LocalMobilityItem[] = [
    {
      id: 'mob-scooter-1',
      type: 'scooter',
      title: 'Honda Activa 6G / Suzuki Access Scooter',
      vehicleModel: '125cc Automatic • 2 Helmets Included',
      price: 450 * tripNights,
      route: 'Unlimited exploration across North & South Goa beaches',
      capacity: '2 Riders • Helmet & Rain Poncho',
      provider: 'TripPilot Verified Coastal Rentals',
      features: ['Unlimited Kilometres', 'Doorstep Delivery', 'Zero Deposit', '24/7 Roadside Assist'],
      badge: 'Cheapest',
    },
    {
      id: 'mob-rental-suv',
      type: 'rental_car',
      title: 'Self-Drive Hyundai Creta / Mahindra Thar (SUV)',
      vehicleModel: '5-Seater Automatic / Manual SUV',
      price: 2400 * tripNights,
      route: 'Delivered directly at Arrival Hub or Villa/Hotel',
      capacity: '5 Passengers • 4 Bags',
      provider: 'TripPilot Self-Drive Fleet',
      features: ['Unlimited Kilometres', 'Full Tank Delivered', 'Comprehensive Insurance', 'Fastag Enabled'],
      badge: 'Best Overall',
    },
    {
      id: 'mob-chauffeur-sedan',
      type: 'private_transfer',
      title: 'Private AC Sedan with Dedicated Chauffeur',
      vehicleModel: 'Toyota Etios / Maruti Dzire (Dual AC)',
      price: 1800 * tripNights,
      route: '8 Hours / 80 KM daily sightseeing & hotel transfers',
      capacity: '4 Passengers • 3 Bags',
      provider: 'TripPilot Professional Chauffeur Desk',
      features: ['Professional Driver', 'Fuel Included', 'Free Flight/Train Delay Waiting', 'Air Conditioned'],
      badge: 'Comfortable',
    },
    {
      id: 'mob-ondemand-cab',
      type: 'cab',
      title: 'Pre-Paid Cab Package & On-Demand City Rides',
      vehicleModel: 'Hatchback / Sedan City Cabs',
      price: 1200 * tripNights,
      route: 'On-demand digital ride hailing across local zones',
      capacity: '4 Passengers',
      provider: 'TripPilot QuickCab Network',
      features: ['Instant Booking', 'Zero Surge Guarantee', 'Verified Drivers'],
      badge: 'Fastest',
    },
    {
      id: 'mob-transit-bus',
      type: 'bus',
      title: 'Goa Kadamba AC Electric Shuttle Pass',
      vehicleModel: 'Green EV Public Transit Network',
      price: 150 * tripNights,
      route: 'Connects Panjim, Calangute, Baga, Margao & Airport',
      capacity: '1 Pass per person',
      provider: 'State Transit Electric Network',
      features: ['Eco-friendly', 'Direct Coastal Express Routes', 'Digital QR Pass'],
      badge: 'Cheapest',
    },
  ];

  const mobilityTypeCards: {
    id: LocalTransportType;
    icon: any;
    title: string;
    subtitle: string;
    estPrice: string;
    badge?: string;
  }[] = [
    { id: 'scooter', icon: Bike, title: t('step.mobility.filter_scooter', 'Scooters & Bikes'), subtitle: 'Freedom on beach roads', estPrice: `₹450/day`, badge: t('step.travel.cheapest', 'Cheapest') },
    { id: 'rental_car', icon: Car, title: t('step.mobility.filter_car', 'Self-Drive Cars'), subtitle: 'SUV & explore freely', estPrice: `₹2,400/day`, badge: t('step.travel.best_value', 'Best Overall') },
    { id: 'private_transfer', icon: Car, title: t('step.mobility.filter_cab', 'Chauffeur Cabs'), subtitle: 'Dedicated full-day driver', estPrice: `₹1,800/day`, badge: t('step.travel.comfortable', 'Comfortable') },
    { id: 'cab', icon: Car, title: t('step.travel.cab', 'Intercity Cab'), subtitle: 'On-demand & transfers', estPrice: `₹1,200/day`, badge: t('step.travel.fastest', 'Fastest') },
    { id: 'bus', icon: Navigation, title: t('step.travel.bus', 'Bus'), subtitle: 'Eco-friendly public transit', estPrice: `₹150/day` },
    { id: 'flexible', icon: Sparkles, title: t('step.travel.compare_all', "I'm Flexible"), subtitle: 'Best value recommendation', estPrice: 'All options' },
  ];

  const handleSelectType = (type: LocalTransportType) => {
    setActiveType(type);
    setLocalTransportPreference(type);
  };

  const handleSelectOpt = (opt: TransportOptimization) => {
    setActiveOpt(opt);
    setTransportOptimization(opt);
  };

  // Filter inventory
  const filteredMobility = mobilityInventory.filter((item) => {
    if (activeType !== 'flexible' && item.type !== activeType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ─── 1. STEP HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-0.5">
            {t('step.mobility.header_step', 'Step 3 of 6 • Local Mobility')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
            {t('step.mobility.question', { destination }, `How would you like to get around in ${destination}?`)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('step.mobility.empty_desc', { destination }, 'Choose self-drive cars, coastal scooters, dedicated chauffeurs, or on-demand cabs.')}
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
            onClick={skipMobility}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('step.mobility.skip', 'Skip Transport →')}
          </button>
        </div>
      </div>

      {/* ─── 2. SELECTED MOBILITY BANNER / EMPTY STATE BANNER ─── */}
      {selectedMobility ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-md text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0 border border-emerald-200">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {t('step.mobility.selected', `${selectedMobility.type.replace('_', ' ').toUpperCase()} Selected ✓`)}
                </span>
                <span className="text-sm font-bold text-[#0B1220]">{selectedMobility.title}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedMobility.vehicleModel} • {tripNights} {t('builder.nights', 'Days')} Local Mobility •{' '}
                <CurrencyDisplay amount={selectedMobility.price} className="font-black text-slate-900" /> total
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <button
              type="button"
              onClick={removeMobility}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors"
              title="Remove local transport"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('step.mobility.remove', 'Remove')}</span>
            </button>

            <button
              type="button"
              onClick={goToNextStep}
              className="btn-primary text-xs !py-2 px-4.5 font-bold shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{t('sidebar.continue_to', { step: t('step.activities', 'Activities') }, 'Next: Activities')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">{t('step.mobility.empty_title', 'No Local Transport Selected')}</span>
              <span className="text-[11px] text-slate-500">
                {t('step.mobility.empty_desc', { destination }, 'Select a rental car, scooter, or private chauffeur below or skip to hailed rides.')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={skipMobility}
            className="btn-secondary text-xs font-bold py-1.5 px-3 whitespace-nowrap"
          >
            {t('step.mobility.skip', 'Skip Transport →')}
          </button>
        </div>
      )}

      {/* ─── 3. VISUAL MOBILITY SELECTOR CARDS ─── */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          {t('step.mobility.question', { destination }, 'Select Your Local Mobility Preference:')}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {mobilityTypeCards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeType === card.id;

            return (
              <motion.button
                key={card.id}
                type="button"
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleSelectType(card.id)}
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
                  <span className={`font-semibold ${isSelected ? 'text-[#C8A96B]' : 'text-slate-700'}`}>
                    {card.estPrice}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. TRANSPORT OPTIMIZATION PILLS ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 text-xs">
        <span className="text-slate-400 font-bold text-[11px]">How should we optimize your local transport?</span>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'best_overall', label: '🧭 Best Overall', opt: 'best_overall' as TransportOptimization },
            { id: 'cheapest', label: '💰 Cheapest', opt: 'cheapest' as TransportOptimization },
            { id: 'fastest', label: '⚡ Fastest', opt: 'fastest' as TransportOptimization },
            { id: 'comfortable', label: '✨ Most Comfortable', opt: 'comfortable' as TransportOptimization },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectOpt(item.opt)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeOpt === item.opt
                  ? 'bg-[#0B1220] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 5. MOBILITY INVENTORY GRID ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeType + activeOpt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredMobility.map((item) => {
            const isItemPicked = selectedMobility?.id === item.id;

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className={`surface-card p-5 rounded-2xl transition-all bg-white flex flex-col justify-between ${
                  isItemPicked ? 'border-[#0B1220] ring-2 ring-[#0B1220]/10 shadow-md' : 'hover:border-slate-300'
                }`}
              >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center font-bold flex-shrink-0">
                      {item.type === 'scooter' ? <Bike className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1220]">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.vehicleModel}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <CurrencyDisplay amount={item.price} className="text-lg font-black text-[#0B1220]" />
                    <span className="text-[10px] text-slate-400 block">{t('step.mobility.total_days', { days: tripNights }, `${tripNights} days total`)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Navigation className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold">{item.route}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
                    {item.features.map((f) => (
                      <span key={f} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#158A6A]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('step.mobility.free_cancel', 'Free cancellation up to 4 hours before pickup • Zero security deposit')}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold">{item.provider}</span>

                <div className="flex items-center gap-1.5">
                  {isItemPicked ? (
                    <>
                      <span className="text-xs font-bold py-2 px-3.5 rounded-xl bg-[#158A6A] text-white shadow-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('step.mobility.added', 'Added to Trip')}</span>
                      </span>
                      <button
                        type="button"
                        onClick={removeMobility}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                        title={t('step.mobility.remove', 'Remove transport selection')}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selectMobilityItem(item)}
                      className="btn-primary text-xs font-bold py-2 px-4 rounded-xl transition-all"
                    >
                      <span>{selectedMobility ? t('step.mobility.switch', 'Switch to This') : t('step.mobility.add', 'Add to Trip')}</span>
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
  );
};
