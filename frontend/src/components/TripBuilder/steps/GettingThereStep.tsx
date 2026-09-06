import React, { useState } from 'react';
import { Plane, Train, Bus, Car, Sparkles, Check, Clock, ShieldCheck, ChevronRight, AlertCircle, ArrowRight, Zap, TrendingUp, HeartHandshake, X } from 'lucide-react';
import { useTripBuilder, TravelModePreference, IntercityTravelItem } from '../../../context/TripBuilderContext';
import { useTravelSettings } from '../../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../Common/CurrencyDisplay';

export const GettingThereStep: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    origin,
    destination,
    departureDate,
    travellers,
    cabin,
    travelModePreference,
    setTravelModePreference,
    selectedTravel,
    selectTravelItem,
    removeTravel,
    skipTravel,
    goToNextStep,
  } = useTripBuilder();

  const [activeTab, setActiveTab] = useState<TravelModePreference>(travelModePreference || 'flight');

  // Multi-modal travel options inventory
  const travelInventory: Record<string, IntercityTravelItem[]> = {
    flight: [
      {
        id: 'fl-1',
        mode: 'flight',
        title: 'IndiGo Non-Stop Express',
        operator: 'IndiGo Airlines',
        identifier: '6E-542 (Airbus A320neo)',
        departureTime: '07:15 AM',
        arrivalTime: '08:45 AM',
        duration: '1h 30m',
        price: 3850,
        origin: origin,
        destination: destination,
        badge: 'Fastest',
        details: '7kg Cabin + 15kg Check-in • Free seat selection',
        inclusions: ['Direct Non-stop', 'Complimentary Water', 'USB Charging Port'],
      },
      {
        id: 'fl-2',
        mode: 'flight',
        title: 'Air India Express Premium Economy',
        operator: 'Air India Express',
        identifier: 'IX-924 (Boeing 737 MAX)',
        departureTime: '10:30 AM',
        arrivalTime: '12:05 PM',
        duration: '1h 35m',
        price: 4120,
        origin: origin,
        destination: destination,
        badge: 'Best Value',
        details: '7kg Cabin + 15kg Check-in • Flexible reschedule',
        inclusions: ['Snack Box Included', 'Extra Legroom Option'],
      },
      {
        id: 'fl-3',
        mode: 'flight',
        title: 'Vistara Club Luxury Service',
        operator: 'Vistara',
        identifier: 'UK-812 (Airbus A321neo)',
        departureTime: '02:45 PM',
        arrivalTime: '04:20 PM',
        duration: '1h 35m',
        price: 4890,
        origin: origin,
        destination: destination,
        badge: 'Most Comfortable',
        details: '7kg Cabin + 20kg Check-in + Hot Gourmet Meal',
        inclusions: ['Chef Curated Meal', 'Priority Baggage', 'In-flight Wi-Fi'],
      },
    ],
    train: [
      {
        id: 'tr-1',
        mode: 'train',
        title: 'Vande Bharat High-Speed Superfast',
        operator: 'Indian Railways',
        identifier: '20671 / AC Executive & Chair Car',
        departureTime: '06:00 AM',
        arrivalTime: '02:30 PM',
        duration: '8h 30m',
        price: 1850,
        origin: origin,
        destination: destination,
        badge: 'Fastest',
        details: 'Executive Chair Car • Onboard Hot Meals & Tea',
        inclusions: ['Panoramic Windows', 'Reclining Seats', 'Catering Included', 'Wi-Fi Infotainment'],
      },
      {
        id: 'tr-2',
        mode: 'train',
        title: 'Goa Superfast Express (AC 2-Tier)',
        operator: 'Indian Railways',
        identifier: '12780 / AC 2-Tier Sleeper',
        departureTime: '08:40 PM',
        arrivalTime: '08:15 AM',
        duration: '11h 35m',
        price: 1420,
        origin: origin,
        destination: destination,
        badge: 'Best Value',
        details: 'Overnight Sleeper • Clean Bedroll & Reading Lights',
        inclusions: ['Clean Linens', 'Charging Socket', 'Confirmed Berth'],
      },
      {
        id: 'tr-3',
        mode: 'train',
        title: 'Konkan Scenic Coast Express',
        operator: 'Indian Railways',
        identifier: '10103 / AC 3-Tier Economy',
        departureTime: '11:15 PM',
        arrivalTime: '11:45 AM',
        duration: '12h 30m',
        price: 980,
        origin: origin,
        destination: destination,
        badge: 'Cheapest',
        details: 'Budget AC Sleeper through Western Ghats waterfalls',
        inclusions: ['Scenic Route', 'Budget Berth'],
      },
    ],
    bus: [
      {
        id: 'bs-1',
        mode: 'bus',
        title: 'IntrCity SmartBus Volvo Multi-Axle',
        operator: 'IntrCity SmartBus',
        identifier: 'Volvo 9600 AC Sleeper (2+1)',
        departureTime: '07:30 PM',
        arrivalTime: '08:00 AM',
        duration: '12h 30m',
        price: 1250,
        origin: origin,
        destination: destination,
        badge: 'Most Comfortable',
        details: 'Single & Double Sleepers • Blanket & Water Bottle',
        inclusions: ['AC Temperature Control', 'GPS Live Tracking', 'Sanitized Bedding', 'Washroom Onboard'],
      },
      {
        id: 'bs-2',
        mode: 'bus',
        title: 'Zingbus Luxury Electric AC Sleeper',
        operator: 'Zingbus',
        identifier: 'EV Electric Sleeper',
        departureTime: '09:00 PM',
        arrivalTime: '09:30 AM',
        duration: '12h 30m',
        price: 899,
        origin: origin,
        destination: destination,
        badge: 'Cheapest',
        details: 'Zero Emission • Free Lounge Access at Boarding',
        inclusions: ['Premium Lounge Access', 'Snack Kit', 'Reading Lamp'],
      },
    ],
    car: [
      {
        id: 'cr-1',
        mode: 'car',
        title: 'Self-Drive Highway Road Trip (SUV)',
        operator: 'TripPilot Self-Drive Hub',
        identifier: 'Hyundai Creta / Mahindra Thar',
        departureTime: 'Flexible / 06:00 AM Recommended',
        arrivalTime: '04:30 PM',
        duration: '10h 30m',
        price: 4200,
        origin: origin,
        destination: destination,
        badge: 'Best Value',
        details: 'Doorstep vehicle delivery • Unlimited KM allowance',
        inclusions: ['Zero Security Deposit', 'Fastag Toll Enabled', 'Comprehensive Insurance', '24/7 Roadside Assistance'],
      },
    ],
    cab: [
      {
        id: 'cb-1',
        mode: 'cab',
        title: 'One-Way Private Intercity Chauffeur Sedan',
        operator: 'TripPilot Verified Chauffeur',
        identifier: 'Maruti Suzuki Dzire / Toyota Etios',
        departureTime: 'On-Demand Doorstep Pickup',
        arrivalTime: 'Direct Doorstep Drop',
        duration: '10h 00m',
        price: 6800,
        origin: origin,
        destination: destination,
        badge: 'Most Comfortable',
        details: 'Door-to-door direct transport • Professional highway driver',
        inclusions: ['Toll Taxes Included', 'Fuel & State Permit Included', 'Night Surcharge Included'],
      },
    ],
  };

  const modeCards: {
    id: TravelModePreference;
    icon: any;
    title: string;
    subtitle: string;
    estPrice: string;
    estTime: string;
    badge?: string;
  }[] = [
    {
      id: 'flight',
      icon: Plane,
      title: t('step.travel.flight', 'Flight'),
      subtitle: t('step.travel.flight_sub', 'Fastest for long distances'),
      estPrice: 'From ₹3,850',
      estTime: '1h 30m',
      badge: t('step.travel.fastest', 'Fastest'),
    },
    {
      id: 'train',
      icon: Train,
      title: t('step.travel.train', 'Train'),
      subtitle: t('step.travel.train_sub', 'Comfortable & scenic journey'),
      estPrice: 'From ₹980',
      estTime: '8h 30m',
      badge: t('step.travel.best_value', 'Best Value'),
    },
    {
      id: 'bus',
      icon: Bus,
      title: t('step.travel.bus', 'Bus'),
      subtitle: t('step.travel.bus_sub', 'Affordable overnight sleeper'),
      estPrice: 'From ₹899',
      estTime: '12h 30m',
      badge: t('step.travel.cheapest', 'Cheapest'),
    },
    {
      id: 'car',
      icon: Car,
      title: t('step.travel.car', 'Self-Drive Car'),
      subtitle: t('step.travel.car_sub', 'Road trip at your own pace'),
      estPrice: '₹4,200 est.',
      estTime: '10h 30m',
    },
    {
      id: 'cab',
      icon: Car,
      title: t('step.travel.cab', 'Intercity Cab'),
      subtitle: t('step.travel.cab_sub', 'Private door-to-door chauffeur'),
      estPrice: '₹6,800 total',
      estTime: '10h 00m',
    },
    {
      id: 'flexible',
      icon: Sparkles,
      title: t('step.travel.compare_all', 'Compare All'),
      subtitle: t('step.travel.compare_sub', 'Side-by-side comparison'),
      estPrice: 'All modes',
      estTime: 'Multi-modal',
    },
  ];

  const handleSelectMode = (mode: TravelModePreference) => {
    setActiveTab(mode);
    setTravelModePreference(mode);
  };

  const getActiveItems = () => {
    if (activeTab === 'flexible') {
      // Return top 1 from each
      return [
        travelInventory.flight[0],
        travelInventory.train[0],
        travelInventory.bus[0],
        travelInventory.car[0],
        travelInventory.cab[0],
      ];
    }
    return travelInventory[activeTab] || travelInventory.flight;
  };

  const activeItems = getActiveItems();

  return (
    <div className="space-y-6">
      {/* ─── 1. STEP HEADER & QUESTION ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-0.5">
            {t('step.travel.header_step', 'Step 1 of 6 • Getting There')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
            {t('step.travel.question', { destination }, `How would you like to travel to ${destination}?`)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {origin} → {destination} • {departureDate} • {travellers} {travellers > 1 ? t('builder.travellers_label', 'Travellers') : t('builder.traveller_label', 'Traveller')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={skipTravel}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('step.travel.skip', 'Skip Travel →')}
          </button>
        </div>
      </div>

      {/* ─── 2. SELECTED TRAVEL BANNER / EMPTY STATE BANNER ─── */}
      {selectedTravel ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-md text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold flex-shrink-0 border border-blue-200">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {t('step.travel.selected', { mode: selectedTravel.mode.toUpperCase() }, `${selectedTravel.mode.toUpperCase()} Selected ✓`)}
                </span>
                <span className="text-sm font-bold text-[#0B1220]">{selectedTravel.title}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedTravel.operator} • {selectedTravel.departureTime} ({origin}) → {selectedTravel.arrivalTime} ({destination}) • {selectedTravel.duration} •{' '}
                <CurrencyDisplay
                  amount={selectedTravel.mode === 'car' || selectedTravel.mode === 'cab' ? selectedTravel.price : selectedTravel.price * travellers}
                  className="font-black text-slate-900"
                /> {t('step.travel.total_fare', 'Total')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <button
              type="button"
              onClick={removeTravel}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-colors"
              title="Remove this travel selection"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('step.travel.remove', 'Remove')}</span>
            </button>

            <button
              type="button"
              onClick={goToNextStep}
              className="btn-primary text-xs !py-2 px-4.5 font-bold shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{t('sidebar.continue_to', { step: t('step.stays', 'Stays') }, 'Next: Stays')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block">{t('step.travel.empty_title', 'No Intercity Travel Selected')}</span>
              <span className="text-[11px] text-slate-500">
                {t('step.travel.empty_desc', { destination }, `Choose from flights, trains, buses, self-drive rentals, or cabs for your journey to ${destination}.`)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={skipTravel}
            className="btn-secondary text-xs font-bold py-1.5 px-3 whitespace-nowrap"
          >
            {t('step.travel.skip', 'Skip Travel →')}
          </button>
        </div>
      )}

      {/* ─── 3. VISUAL MODE SELECTOR CARDS ─── */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
          {t('step.travel.select_mode', 'Select Your Preferred Mode of Transport:')}
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {modeCards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeTab === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectMode(card.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0B1220] text-white border-[#0B1220] ring-2 ring-[#0B1220]/20 shadow-md scale-[1.02]'
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

                <div className="pt-2 mt-2 border-t border-slate-100/20 flex items-center justify-between text-[10px]">
                  <span className="font-bold">{card.estPrice}</span>
                  <span className={`font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{card.estTime}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. INVENTORY / COMPARISON RESULTS ─── */}
      <div className="space-y-3.5 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0B1220] flex items-center gap-1.5">
            <span>{t('step.travel.available_options', 'Available Options')} ({origin} → {destination})</span>
            {activeTab === 'flexible' && (
              <span className="text-[10px] font-bold bg-[#C8A96B]/20 text-[#0B1220] px-2 py-0.5 rounded">
                Multi-Modal Comparison Matrix
              </span>
            )}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {activeItems.length} options curated
          </span>
        </div>

        <div className="space-y-3.5">
          {activeItems.map((item) => {
            const isItemPicked = selectedTravel?.id === item.id;
            const Icon = item.mode === 'flight' ? Plane : item.mode === 'train' ? Train : item.mode === 'bus' ? Bus : Car;
            const totalPrice = item.mode === 'car' || item.mode === 'cab' ? item.price : item.price * travellers;

            return (
              <div
                key={item.id}
                className={`surface-card p-5 rounded-2xl transition-all bg-white relative ${
                  isItemPicked ? 'border-[#0B1220] ring-2 ring-[#0B1220]/10 shadow-md' : 'hover:border-slate-300'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Mode & Operator */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center font-bold flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-[#0B1220]">{item.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.operator} • {item.identifier}
                      </p>
                      {item.badge && (
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Duration */}
                  <div className="md:col-span-5 flex items-center justify-between gap-3 px-2">
                    <div>
                      <span className="text-base font-black text-[#0B1220] block">{item.departureTime}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.origin}</span>
                    </div>

                    <div className="flex flex-col items-center flex-grow px-2">
                      <span className="text-[11px] text-slate-400 font-mono">{item.duration}</span>
                      <div className="w-full h-px bg-slate-300 relative my-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#0B1220] absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-[10px] text-[#158A6A] font-bold">
                        {item.mode.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#0B1220] block">{item.arrivalTime}</span>
                      <span className="text-xs text-slate-500 font-medium">{item.destination}</span>
                    </div>
                  </div>

                  {/* Pricing & Selection CTA */}
                  <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-4 md:border-l md:border-slate-100 md:pl-4">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        {item.mode === 'car' || item.mode === 'cab' ? t('step.travel.total_fare', 'Total Fare') : t('step.travel.per_person', 'Per Person')}
                      </span>
                      <CurrencyDisplay amount={item.price} className="text-lg font-black text-[#0B1220]" />
                      {item.mode !== 'car' && item.mode !== 'cab' && travellers > 1 && (
                        <span className="text-[10px] text-slate-500 block">
                          Total: <CurrencyDisplay amount={totalPrice} className="font-bold" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-[140px]">
                      {isItemPicked ? (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="flex-grow text-xs font-bold px-3 py-2 rounded-xl bg-[#158A6A] text-white shadow-xs flex items-center justify-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>{t('step.travel.selected_btn', 'Selected')}</span>
                            </span>
                            <button
                              type="button"
                              onClick={removeTravel}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                              title="Remove intercity travel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={goToNextStep}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline text-center"
                          >
                            {t('sidebar.continue_to', { step: t('step.stays', 'Stays') }, 'Next: Stays →')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectTravelItem(item)}
                          className="btn-primary text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>
                            {item.mode === 'flight'
                              ? t('step.travel.select_flight', 'Select Flight')
                              : item.mode === 'train'
                              ? t('step.travel.select_train', 'Select Train')
                              : item.mode === 'bus'
                              ? t('step.travel.select_bus', 'Select Bus')
                              : item.mode === 'car'
                              ? t('step.travel.select_car', 'Select Self-Drive Car')
                              : t('step.travel.select_cab', 'Select Cab')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inclusions & policies */}
                {item.inclusions && item.inclusions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#158A6A]" />
                      <span>{item.details}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.inclusions.map((inc) => (
                        <span key={inc} className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-100">
                          {inc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
