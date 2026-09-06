import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Building2,
  Luggage,
  Train,
  Bus,
  Car,
  Compass,
  ArrowRightLeft,
  Search,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  Wallet,
  X,
  Baby,
  Accessibility,
} from 'lucide-react';
import { LocationItem, LOCATIONS_DATA } from '../../data/locationData';
import { LocationSelectorModal } from './LocationSelectorModal';
import { CustomDatePicker } from './CustomDatePicker';
import { TravellerClassSelector, CabinClass } from './TravellerClassSelector';
import { TripBudgetSelector } from './TripBudgetSelector';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';

type SearchTab = 'flights' | 'hotels' | 'packages' | 'trains' | 'buses' | 'cabs';
type TripType = 'one-way' | 'round-trip' | 'multi-city';
type FareType = 'regular' | 'student' | 'senior' | 'armed_forces' | 'doctor_nurse' | 'corporate';

export const SearchWidget: React.FC = () => {
  const navigate = useNavigate();
  const { travelMode, setTravelMode, t, tPlace } = useTravelSettings();
  const { budget: savedBudget, setTripSearch, setStep } = useTripBuilder();

  // Auto-adapt travellers when Travel Experience Mode switches
  useEffect(() => {
    if (travelMode === 'family') {
      if (adults === 1 && children === 0) {
        setAdults(2);
        setChildren(1);
      }
      if (hotelAdults === 1 && hotelChildren === 0) {
        setHotelAdults(2);
        setHotelChildren(1);
      }
    }
  }, [travelMode]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<SearchTab>('flights');

  // ── Flight Search State ──
  const [tripType, setTripType] = useState<TripType>('one-way');
  const [fareType, setFareType] = useState<FareType>('regular');
  const [originLocation, setOriginLocation] = useState<LocationItem>(LOCATIONS_DATA[0]); // Hyderabad
  const [destinationLocation, setDestinationLocation] = useState<LocationItem>(LOCATIONS_DATA[4]); // Goa
  const [departureDate, setDepartureDate] = useState('2026-09-15');
  const [returnDate, setReturnDate] = useState('2026-09-20');
  const [flexibleDays, setFlexibleDays] = useState(0);

  // Travellers & Cabin
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState<CabinClass>('Economy');

  // Optional Trip Budget
  const [tripBudget, setTripBudget] = useState<number | null>(savedBudget || null);

  // ── Modals / Popovers Visibility ──
  const [isFromPickerOpen, setIsFromPickerOpen] = useState(false);
  const [isToPickerOpen, setIsToPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [isBudgetPickerOpen, setIsBudgetPickerOpen] = useState(false);
  const [swapRotating, setSwapRotating] = useState(false);

  // ── Hotel State ──
  const [hotelLocation, setHotelLocation] = useState<LocationItem>(LOCATIONS_DATA[4]); // Goa
  const [hotelCheckIn, setHotelCheckIn] = useState('2026-09-15');
  const [hotelCheckOut, setHotelCheckOut] = useState('2026-09-20');
  const [hotelAdults, setHotelAdults] = useState(2);
  const [hotelChildren, setHotelChildren] = useState(0);
  const [hotelRooms, setHotelRooms] = useState(1);
  const [isHotelLocationOpen, setIsHotelLocationOpen] = useState(false);
  const [isHotelDateOpen, setIsHotelDateOpen] = useState(false);

  // ── Trains & Buses State ──
  const [trainOrigin, setTrainOrigin] = useState<LocationItem>(LOCATIONS_DATA[1]); // Delhi
  const [trainDestination, setTrainDestination] = useState<LocationItem>(LOCATIONS_DATA[4]); // Goa
  const [trainDate, setTrainDate] = useState('2026-09-15');
  const [trainClass, setTrainClass] = useState('All');
  const [isTrainFromOpen, setIsTrainFromOpen] = useState(false);
  const [isTrainToOpen, setIsTrainToOpen] = useState(false);
  const [isTrainDateOpen, setIsTrainDateOpen] = useState(false);

  // ── Packages State ──
  const [packageDestination, setPackageDestination] = useState<LocationItem>(LOCATIONS_DATA[4]); // Goa
  const [packageDuration, setPackageDuration] = useState('5');
  const [packageTheme, setPackageTheme] = useState('All');
  const [isPackageDestOpen, setIsPackageDestOpen] = useState(false);

  // ── Validation & Search State ──
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // ── Swap Locations ──
  const handleSwapLocations = () => {
    setSwapRotating(true);
    const temp = originLocation;
    setOriginLocation(destinationLocation);
    setDestinationLocation(temp);
    setTimeout(() => setSwapRotating(false), 300);
  };

  // ── Flight / Full Trip Submit ──
  const handleFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!originLocation) {
      setValidationError(t('val.select_departure_city', 'Please select your departure city.'));
      return;
    }
    if (!destinationLocation) {
      setValidationError(t('val.select_destination', 'Please select your destination.'));
      return;
    }
    if (originLocation.id === destinationLocation.id) {
      setValidationError(t('val.identical_cities', 'Departure and destination cities cannot be identical.'));
      return;
    }
    if (!departureDate) {
      setValidationError(t('val.select_departure_date', 'Please select a departure date.'));
      return;
    }

    setIsSearching(true);
    const totalPassengers = adults + children + infants;

    // Initialize continuous TripBuilderContext state
    setTripSearch({
      origin: originLocation.city,
      destination: destinationLocation.city,
      departureDate: departureDate,
      returnDate: returnDate || departureDate,
      travellers: totalPassengers,
      cabin: cabinClass,
      budget: tripBudget || 0,
    });
    setStep('travel');

    navigate('/plan');
  };

  // ── Hotel Submit ──
  const handleHotelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!hotelLocation) {
      setValidationError(t('val.select_hotel_city', 'Please select your destination city.'));
      return;
    }

    const params = new URLSearchParams({
      city: hotelLocation.city,
      check_in: hotelCheckIn,
      check_out: hotelCheckOut,
      guests: String(hotelAdults + hotelChildren),
      rooms: String(hotelRooms),
    });
    navigate(`/hotels?${params.toString()}`);
  };

  // ── Trains Submit ──
  const handleTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      mode: 'trains',
      origin: trainOrigin.city,
      destination: trainDestination.city,
      date: trainDate,
      class: trainClass,
    });
    navigate(`/flights?${params.toString()}`);
  };

  // ── Buses Submit ──
  const handleBusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      mode: 'buses',
      origin: originLocation.city,
      destination: destinationLocation.city,
      date: departureDate,
    });
    navigate(`/flights?${params.toString()}`);
  };

  // ── Packages Submit ──
  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      destination: packageDestination.city,
      days: packageDuration,
      theme: packageTheme,
    });
    navigate(`/ai-planner?${params.toString()}`);
  };

  const totalPassengers = adults + children + infants;

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-floating border border-slate-200/80 p-5 sm:p-7 relative z-30 transition-all">
      {/* ─── 1. TOP TABS: FLIGHTS, HOTELS, PACKAGES, TRAINS, BUSES, CABS, ACTIVITIES ─── */}
      <div className="flex items-center gap-1 sm:gap-2 pb-5 border-b border-slate-100 overflow-x-auto scrollbar-none mb-6">
        {[
          { id: 'flights', label: t('search.tab_flights', 'Flights'), icon: Plane },
          { id: 'hotels', label: t('search.tab_hotels', 'Hotels & Stays'), icon: Building2 },
          { id: 'packages', label: t('search.tab_packages', 'Holiday Packages'), icon: Luggage },
          { id: 'trains', label: t('search.tab_trains', 'Trains'), icon: Train },
          { id: 'buses', label: t('search.tab_buses', 'Buses'), icon: Bus },
          { id: 'cabs', label: t('search.tab_cabs', 'Airport Cabs'), icon: Car },
          { id: 'activities', label: t('search.tab_activities', 'Tours & Activities'), icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'activities') {
                  navigate('/activities');
                  return;
                }
                setActiveTab(tab.id as SearchTab);
                setValidationError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#0B1220] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Travel Experience Mode Live Adaptive Perks Indicator */}
      {travelMode !== 'standard' && (
        <div
          className={`mb-4 px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 border ${
            travelMode === 'family'
              ? 'bg-amber-50/90 border-amber-200 text-amber-950 shadow-xs'
              : 'bg-indigo-50/90 border-indigo-200 text-indigo-950 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                travelMode === 'family' ? 'bg-amber-200/80 text-amber-800' : 'bg-indigo-200/80 text-indigo-800'
              }`}
            >
              {travelMode === 'family' ? <Baby className="w-4 h-4" /> : <Accessibility className="w-4 h-4" />}
            </div>
            <div className="leading-tight">
              <span className="font-extrabold uppercase tracking-wide text-[11px] block">
                {travelMode === 'family' ? 'Family with Kids Active' : 'Accessibility Mode Active'}
              </span>
              <span className="text-[11px] opacity-80 block mt-0.5">
                {travelMode === 'family'
                  ? 'Auto-prioritizing adjacent family seating, kid-friendly hotels, and family rooms.'
                  : 'Auto-requesting wheelchair assistance, step-free hotels, and accessible mobility cabs.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTravelMode('standard')}
            className={`text-[11px] font-bold underline whitespace-nowrap self-end sm:self-auto ${
              travelMode === 'family' ? 'text-amber-800 hover:text-amber-950' : 'text-indigo-800 hover:text-indigo-950'
            }`}
          >
            Reset to Standard
          </button>
        </div>
      )}

      {/* Validation Banner */}
      {validationError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-rose-600 hover:text-rose-800 font-bold">
            {t('action.dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      {/* ─── 2. FLIGHTS TAB ─── */}
      {activeTab === 'flights' && (
        <form onSubmit={handleFlightSubmit} className="space-y-5">
          {/* Trip Type & Special Fares Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Trip Types: One-Way, Round-Trip, Multi-City */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              {[
                { id: 'one-way', label: t('search.one_way', 'One Way') },
                { id: 'round-trip', label: t('search.round_trip', 'Round Trip') },
                { id: 'multi-city', label: t('search.multi_city', 'Multi City') },
              ].map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  onClick={() => setTripType(tItem.id as TripType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tripType === tItem.id
                      ? 'bg-white text-[#0B1220] shadow-sm'
                      : 'text-slate-600 hover:text-[#0B1220]'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>

            {/* Special Fare Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-bold uppercase text-slate-400 mr-1 hidden lg:inline">
                {t('search.special_fares', 'Special Fares:')}
              </span>
              {[
                { id: 'regular', label: t('search.fare_regular', 'Regular') },
                { id: 'student', label: t('search.fare_student', 'Student') },
                { id: 'senior', label: t('search.fare_senior', 'Senior Citizen') },
                { id: 'armed_forces', label: t('search.fare_armed_forces', 'Armed Forces') },
                { id: 'doctor_nurse', label: t('search.fare_doctor_nurse', 'Doctor / Nurse') },
              ].map((fare) => (
                <button
                  key={fare.id}
                  type="button"
                  onClick={() => setFareType(fare.id as FareType)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap ${
                    fareType === fare.id
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {fare.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => navigate('/ai-planner')}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all whitespace-nowrap"
                title="Search destinations by uploading a scenery photo"
              >
                <ImageIcon className="w-3 h-3" />
                <span>{t('search.ai_photo_search', 'AI Photo Search')}</span>
              </button>
            </div>
          </div>

          {/* Main Flight Inputs Grid: 5-Column Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 relative">
            {/* FROM Field */}
            <div className="sm:col-span-1 lg:col-span-3 relative">
              <div
                onClick={() => setIsFromPickerOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer transition-all duration-150 group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.where_from', 'Where from? (Departure)')}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tPlace(originLocation.city)}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {originLocation.airportCode || originLocation.city.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {originLocation.airportName || `${tPlace(originLocation.state)}, ${tPlace(originLocation.country)}`}
                </p>
              </div>
            </div>

            {/* SWAP Button */}
            <div className="hidden lg:flex absolute left-[25%] -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-sm flex items-center justify-center transition-all"
                title={t('search.swap_locations', 'Swap departure & destination')}
              >
                <ArrowRightLeft className={`w-3.5 h-3.5 transition-transform duration-300 ${swapRotating ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* TO Field */}
            <div className="sm:col-span-1 lg:col-span-3 relative">
              <div
                onClick={() => setIsToPickerOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer transition-all duration-150 group"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.where_to', 'Where to? (Destination)')}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tPlace(destinationLocation.city)}
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {destinationLocation.airportCode || destinationLocation.city.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {destinationLocation.airportName || `${tPlace(destinationLocation.state)}, ${tPlace(destinationLocation.country)}`}
                </p>
              </div>
            </div>

            {/* DATES Field */}
            <div className="sm:col-span-1 lg:col-span-2 grid grid-cols-2 gap-2">
              <div
                onClick={() => setIsDatePickerOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3 cursor-pointer transition-colors"
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.departure', 'Departure')}
                </label>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{departureDate}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{t('search.outbound', 'Outbound')}</span>
              </div>

              <div
                onClick={() => {
                  if (tripType === 'one-way') {
                    setTripType('round-trip');
                  }
                  setIsDatePickerOpen(true);
                }}
                className={`bg-slate-50 border border-slate-200/90 rounded-2xl p-3 transition-colors cursor-pointer ${
                  tripType === 'one-way' ? 'hover:border-blue-400 opacity-80' : 'hover:border-blue-500/60'
                }`}
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.return', 'Return')}
                </label>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                  {tripType === 'one-way' ? '+ Return' : returnDate}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {tripType === 'one-way' ? t('search.optional', 'Optional') : t('search.inbound', 'Inbound')}
                </span>
              </div>
            </div>

            {/* TRAVELLERS & CABIN CLASS */}
            <div className="sm:col-span-1 lg:col-span-2 relative">
              <div
                onClick={() => setIsTravellerPickerOpen(!isTravellerPickerOpen)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer transition-colors h-full flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.travellers_class', 'Travellers & Class')}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {totalPassengers === 1 ? t('traveller.single', '1 Traveller') : t('traveller.plural', { count: totalPassengers }, `${totalPassengers} Travellers`)}
                  </span>
                  <span className="text-[11px] text-blue-600 font-bold ml-1">{cabinClass}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {adults} {t('traveller.adults', 'Adults')}
                  {children > 0 ? `, ${children}C` : ''}
                  {infants > 0 ? `, ${infants}I` : ''}
                </p>
              </div>

              {/* Traveller Selector Popover */}
              <TravellerClassSelector
                isOpen={isTravellerPickerOpen}
                onClose={() => setIsTravellerPickerOpen(false)}
                adults={adults}
                children={children}
                infants={infants}
                cabinClass={cabinClass}
                onAdultsChange={setAdults}
                onChildrenChange={setChildren}
                onInfantsChange={setInfants}
                onCabinClassChange={setCabinClass}
              />
            </div>

            {/* TRIP BUDGET FIELD (OPTIONAL) */}
            <div className="sm:col-span-2 lg:col-span-2 relative">
              <div
                onClick={() => setIsBudgetPickerOpen(!isBudgetPickerOpen)}
                className={`bg-slate-50 hover:bg-slate-100/90 border rounded-2xl p-3.5 cursor-pointer transition-colors group relative h-full flex flex-col justify-between ${
                  tripBudget
                    ? 'border-amber-400/90 bg-amber-50/40 ring-1 ring-amber-300/60'
                    : 'border-slate-200/90 hover:border-blue-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {t('search.trip_budget', 'Trip Budget')}
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600">
                    {t('search.optional', 'Optional')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs sm:text-sm font-bold truncate ${
                      tripBudget ? 'text-amber-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    {tripBudget ? `₹${tripBudget.toLocaleString('en-IN')}` : t('search.target_budget', 'Target budget')}
                  </span>
                  {tripBudget ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTripBudget(null);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                      title="Clear budget"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Wallet className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  )}
                </div>

                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {tripBudget
                    ? `₹${Math.round(tripBudget / Math.max(1, totalPassengers)).toLocaleString('en-IN')} / ${t('search.per_person', 'person')}`
                    : 'Optimize whole trip'}
                </p>
              </div>

              {/* Trip Budget Popover */}
              <TripBudgetSelector
                isOpen={isBudgetPickerOpen}
                onClose={() => setIsBudgetPickerOpen(false)}
                budget={tripBudget}
                onBudgetChange={setTripBudget}
                totalPassengers={totalPassengers}
              />
            </div>
          </div>

          {/* Quick Popular Routes & Main CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-bold text-slate-400">{t('search.popular_routes', 'Popular:')}</span>
              {[
                { o: 'HYD', d: 'GOI', label: 'Hyderabad → Goa' },
                { o: 'DEL', d: 'BOM', label: 'Delhi → Mumbai' },
                { o: 'BLR', d: 'DEL', label: 'Bengaluru → Delhi' },
                { o: 'BOM', d: 'DXB', label: 'Mumbai → Dubai' },
              ].map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => {
                    const orig = LOCATIONS_DATA.find((a) => a.airportCode === route.o) || LOCATIONS_DATA[0];
                    const dest = LOCATIONS_DATA.find((a) => a.airportCode === route.d) || LOCATIONS_DATA[4];
                    setOriginLocation(orig);
                    setDestinationLocation(dest);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors"
                >
                  {route.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto btn-primary px-9 py-3.5 text-sm font-black shadow-sm rounded-2xl flex items-center justify-center gap-2 min-w-[220px]"
            >
              <Sparkles className="w-4 h-4 text-[#C8A96B]" />
              {isSearching ? t('ai.thinking', 'Launching Trip Builder...') : t('search.plan_my_trip', 'PLAN MY TRIP')}
            </button>
          </div>
        </form>
      )}

      {/* ─── 3. HOTELS TAB ─── */}
      {activeTab === 'hotels' && (
        <form onSubmit={handleHotelSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Destination */}
            <div className="md:col-span-5 relative">
              <div
                onClick={() => setIsHotelLocationOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer transition-colors"
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.destination_city', 'City, Destination or Property')}
                </label>
                <div className="text-base font-bold text-slate-900">{tPlace(hotelLocation.city)}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {hotelLocation.state}, {hotelLocation.country} • 500+ verified properties
                </p>
              </div>
            </div>

            {/* Check-in & Check-out */}
            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <div
                onClick={() => setIsHotelDateOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.check_in', 'Check-In')}
                </label>
                <span className="text-xs font-bold text-slate-900 block">{hotelCheckIn}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">From 2:00 PM</span>
              </div>

              <div
                onClick={() => setIsHotelDateOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.check_out', 'Check-Out')}
                </label>
                <span className="text-xs font-bold text-slate-900 block">{hotelCheckOut}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Until 11:00 AM</span>
              </div>
            </div>

            {/* Guests & Rooms */}
            <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.guests_rooms', 'Guests & Rooms')}
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  {hotelAdults} {t('traveller.adults', 'Adults')}, {hotelRooms} Room{hotelRooms > 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={hotelAdults <= 1}
                    onClick={() => setHotelAdults(hotelAdults - 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    disabled={hotelAdults >= 8}
                    onClick={() => setHotelAdults(hotelAdults + 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 mt-0.5 font-bold">Free cancellation available</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-400">{t('search.popular_routes', 'Popular:')}</span>
              {['Goa Beachfront', 'Dubai Marina', 'Bali Villas', 'Manali Cottages'].map((destName) => (
                <button
                  key={destName}
                  type="button"
                  onClick={() => {
                    const item = LOCATIONS_DATA.find((l) => l.city.toLowerCase().includes(destName.split(' ')[0].toLowerCase())) || LOCATIONS_DATA[4];
                    setHotelLocation(item);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200"
                >
                  {destName}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="btn-primary px-9 py-3.5 text-sm font-black shadow-sm rounded-2xl flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> {t('search.search_hotels_btn', 'SEARCH HOTELS')}
            </button>
          </div>
        </form>
      )}

      {/* ─── 4. HOLIDAY PACKAGES TAB ─── */}
      {activeTab === 'packages' && (
        <form onSubmit={handlePackageSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div
              onClick={() => setIsPackageDestOpen(true)}
              className="md:col-span-5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.package_destination', 'Dream Vacation Destination')}
              </label>
              <div className="text-base font-bold text-slate-900">{tPlace(packageDestination.city)}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Includes Flights + 4★ Stays + Sightseeing</p>
            </div>

            <div className="md:col-span-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.package_duration', 'Trip Duration')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                {['3', '5', '7', '10'].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setPackageDuration(days)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      packageDuration === days
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Day-by-day customizable blueprint</p>
            </div>

            <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.package_theme', 'Experience Theme')}
              </label>
              <select
                value={packageTheme}
                onChange={(e) => setPackageTheme(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none mt-1"
              >
                {['All', 'Honeymoon', 'Family', 'Adventure', 'Luxury', 'Budget'].map((tOpt) => (
                  <option key={tOpt} value={tOpt}>
                    {tOpt} Escapes
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
              <Sparkles className="w-4 h-4" /> AI co-pilot optimizes activities, dining, and route budgets
            </div>
            <button
              type="submit"
              className="btn-primary px-9 py-3.5 text-sm font-black shadow-sm rounded-2xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {t('search.search_packages_btn', 'GENERATE BLUEPRINT')}
            </button>
          </div>
        </form>
      )}

      {/* ─── 5. TRAINS TAB ─── */}
      {activeTab === 'trains' && (
        <form onSubmit={handleTrainSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div
              onClick={() => setIsTrainFromOpen(true)}
              className="md:col-span-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.boarding_station', 'From Station')}
              </label>
              <div className="text-base font-bold text-slate-900">{tPlace(trainOrigin.city)}</div>
              <p className="text-[11px] text-slate-500 truncate">{trainOrigin.stationName || 'Central Junction'}</p>
            </div>

            <div
              onClick={() => setIsTrainToOpen(true)}
              className="md:col-span-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.arrival_station', 'To Station')}
              </label>
              <div className="text-base font-bold text-slate-900">{tPlace(trainDestination.city)}</div>
              <p className="text-[11px] text-slate-500 truncate">{trainDestination.stationName || 'City Station'}</p>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <div
                onClick={() => setIsTrainDateOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3.5 cursor-pointer"
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.travel_date', 'Travel Date')}
                </label>
                <div className="text-xs font-bold text-slate-900">{trainDate}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.quota_class', 'Class')}
                </label>
                <select
                  value={trainClass}
                  onChange={(e) => setTrainClass(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none mt-0.5"
                >
                  <option value="All">All Classes</option>
                  <option value="EC">Exec. Chair (EC)</option>
                  <option value="1A">AC 1st Class (1A)</option>
                  <option value="2A">AC 2 Tier (2A)</option>
                  <option value="3A">AC 3 Tier (3A)</option>
                  <option value="SL">Sleeper (SL)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary px-9 py-3.5 text-sm font-black shadow-sm rounded-2xl">
              {t('search.search_trains_btn', 'SEARCH TRAINS')}
            </button>
          </div>
        </form>
      )}

      {/* ─── 6. BUSES TAB ─── */}
      {activeTab === 'buses' && (
        <form onSubmit={handleBusSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div
              onClick={() => setIsFromPickerOpen(true)}
              className="md:col-span-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.where_from', 'From City')}
              </label>
              <div className="text-base font-bold text-slate-900">{originLocation.city}</div>
              <p className="text-[11px] text-slate-500">{originLocation.busTerminal || 'Central Bus Terminal'}</p>
            </div>

            <div
              onClick={() => setIsToPickerOpen(true)}
              className="md:col-span-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.where_to', 'To City')}
              </label>
              <div className="text-base font-bold text-slate-900">{destinationLocation.city}</div>
              <p className="text-[11px] text-slate-500">{destinationLocation.busTerminal || 'Express Terminal'}</p>
            </div>

            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <div
                onClick={() => setIsDatePickerOpen(true)}
                className="bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-2xl p-3.5 cursor-pointer"
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  {t('search.travel_date', 'Travel Date')}
                </label>
                <div className="text-xs font-bold text-slate-900">{departureDate}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Bus Type
                </label>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">Volvo AC Sleeper</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary px-9 py-3.5 text-sm font-black shadow-sm rounded-2xl">
              {t('search.search_buses_btn', 'SEARCH BUSES')}
            </button>
          </div>
        </form>
      )}

      {/* ─── 7. AIRPORT CABS TAB ─── */}
      {activeTab === 'cabs' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/flights?mode=buses&origin=${originLocation.city}&destination=${destinationLocation.city}`);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div
              onClick={() => setIsFromPickerOpen(true)}
              className="md:col-span-5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.pickup_location', 'Pickup Airport / City')}
              </label>
              <div className="text-base font-bold text-slate-900">{originLocation.city}</div>
              <p className="text-[11px] text-slate-500">{originLocation.airportName || 'Airport Terminal 1 / 2'}</p>
            </div>

            <div
              onClick={() => setIsToPickerOpen(true)}
              className="md:col-span-4 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 hover:border-blue-500/60 rounded-2xl p-3.5 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                {t('search.dropoff_location', 'Drop Destination')}
              </label>
              <div className="text-base font-bold text-slate-900">{destinationLocation.city}</div>
              <p className="text-[11px] text-slate-500">Hotel / Resort / City Center</p>
            </div>

            <div className="md:col-span-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Vehicle Type
              </label>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">Sedan (Dzire / Etios)</span>
              <p className="text-[10px] text-slate-500">Up to 4 Passengers</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary px-9 py-3.5 text-sm font-black shadow-sm rounded-2xl">
              {t('search.search_cabs_btn', 'SEARCH AIRPORT CABS')}
            </button>
          </div>
        </form>
      )}

      {/* ─── MODAL CONTROLS ─── */}
      {/* Origin Selector Modal */}
      <LocationSelectorModal
        isOpen={isFromPickerOpen}
        onClose={() => setIsFromPickerOpen(false)}
        onSelect={(item) => setOriginLocation(item)}
        title={t('search.where_from', 'Where are you flying from?')}
        placeholder="Search departure city or airport (e.g. Hyderabad, DEL, BOM)..."
        currentSelectedId={originLocation.id}
      />

      {/* Destination Selector Modal */}
      <LocationSelectorModal
        isOpen={isToPickerOpen}
        onClose={() => setIsToPickerOpen(false)}
        onSelect={(item) => setDestinationLocation(item)}
        title={t('search.where_to', 'Where are you going?')}
        placeholder="Search destination city or airport (e.g. Goa, Dubai, Bali)..."
        currentSelectedId={destinationLocation.id}
      />

      {/* Hotel Location Modal */}
      <LocationSelectorModal
        isOpen={isHotelLocationOpen}
        onClose={() => setIsHotelLocationOpen(false)}
        onSelect={(item) => setHotelLocation(item)}
        title={t('search.destination_city', 'Where are you staying?')}
        placeholder="Search city, island or resort area..."
        currentSelectedId={hotelLocation.id}
      />

      {/* Package Destination Modal */}
      <LocationSelectorModal
        isOpen={isPackageDestOpen}
        onClose={() => setIsPackageDestOpen(false)}
        onSelect={(item) => setPackageDestination(item)}
        title={t('search.package_destination', 'Select Vacation Destination')}
        placeholder="Search holiday spot..."
        currentSelectedId={packageDestination.id}
      />

      {/* Train Origin / Dest Modals */}
      <LocationSelectorModal
        isOpen={isTrainFromOpen}
        onClose={() => setIsTrainFromOpen(false)}
        onSelect={(item) => setTrainOrigin(item)}
        title={t('search.boarding_station', 'From Railway Station')}
        placeholder="Search railway station or city..."
        typeFilter="railway_station"
        currentSelectedId={trainOrigin.id}
      />
      <LocationSelectorModal
        isOpen={isTrainToOpen}
        onClose={() => setIsTrainToOpen(false)}
        onSelect={(item) => setTrainDestination(item)}
        title={t('search.arrival_station', 'To Railway Station')}
        placeholder="Search railway station or city..."
        typeFilter="railway_station"
        currentSelectedId={trainDestination.id}
      />

      {/* Date Picker Modal */}
      <CustomDatePicker
        isOpen={isDatePickerOpen || isHotelDateOpen || isTrainDateOpen}
        onClose={() => {
          setIsDatePickerOpen(false);
          setIsHotelDateOpen(false);
          setIsTrainDateOpen(false);
        }}
        departureDate={isHotelDateOpen ? hotelCheckIn : isTrainDateOpen ? trainDate : departureDate}
        returnDate={isHotelDateOpen ? hotelCheckOut : returnDate}
        isRoundTrip={isHotelDateOpen ? true : tripType === 'round-trip'}
        onSelectDeparture={(d) => {
          if (isHotelDateOpen) setHotelCheckIn(d);
          else if (isTrainDateOpen) setTrainDate(d);
          else setDepartureDate(d);
        }}
        onSelectReturn={(d) => {
          if (isHotelDateOpen) setHotelCheckOut(d);
          else setReturnDate(d);
        }}
        flexibleDays={flexibleDays}
        onSelectFlexibleDays={setFlexibleDays}
      />
    </div>
  );
};
