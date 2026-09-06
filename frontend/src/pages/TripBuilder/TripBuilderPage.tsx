import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Building2, Car, Compass, Route, Check, ChevronRight, Edit3, RotateCcw, Undo2, MapPin, Calendar, Users, DollarSign, Sparkles, ArrowRight } from 'lucide-react';
import { useTripBuilder, TripStep, TravelModePreference } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { GettingThereStep } from '../../components/TripBuilder/steps/GettingThereStep';
import { StayStep } from '../../components/TripBuilder/steps/StayStep';
import { LocalMobilityStep } from '../../components/TripBuilder/steps/LocalMobilityStep';
import { ActivityStep } from '../../components/TripBuilder/steps/ActivityStep';
import { ItineraryStep } from '../../components/TripBuilder/steps/ItineraryStep';
import { ReviewStep } from '../../components/TripBuilder/steps/ReviewStep';
import { TripSummarySidebar } from '../../components/TripBuilder/TripSummarySidebar';
import { EditSearchModal } from '../../components/TripBuilder/EditSearchModal';
import { StartFreshModal } from '../../components/TripBuilder/StartFreshModal';
import { UndoToast } from '../../components/TripBuilder/UndoToast';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';
import { DestinationWeatherBanner } from '../../components/Weather/DestinationWeatherBanner';

const POPULAR_DESTINATIONS = [
  { name: 'Goa', desc: 'Beaches, nightlife & heritage', tag: 'Trending' },
  { name: 'Kerala', desc: 'Backwaters, tea estates & hills', tag: 'Scenic' },
  { name: 'Jaipur', desc: 'Royal palaces & cultural heritage', tag: 'Heritage' },
  { name: 'Manali', desc: 'Himalayan peaks & adventure sports', tag: 'Mountain' },
];

export const TripBuilderPage: React.FC = () => {
  const { t, tPlace } = useTravelSettings();

  const stepDefinitions: { id: TripStep; label: string; icon: any }[] = [
    { id: 'travel', label: t('step.travel', 'Travel'), icon: Plane },
    { id: 'stays', label: t('step.stays', 'Stay'), icon: Building2 },
    { id: 'local_transport', label: t('step.local_transport', 'Get Around'), icon: Car },
    { id: 'activities', label: t('step.activities', 'Activities'), icon: Compass },
    { id: 'itinerary', label: t('step.itinerary', 'Itinerary'), icon: Route },
    { id: 'review', label: t('step.review', 'Review & Book'), icon: Check },
  ];
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    travellers,
    tripNights,
    budget,
    currentStep,
    stepStatus,
    estimatedTotal,
    remainingBudget,
    isDraftEmpty,
    canUndo,
    undoNotification,
    dismissUndoNotification,
    setStep,
    goToNextStep,
    goToPrevStep,
    changeDestination,
    resetTripDraft,
    undoLastAction,
  } = useTripBuilder();

  const [editSearchOpen, setEditSearchOpen] = useState(false);
  const [startFreshModalOpen, setStartFreshModalOpen] = useState(false);
  const [whatShouldIDoOpen, setWhatShouldIDoOpen] = useState(false);

  // Local form state for empty setup screen
  const [initOrigin, setInitOrigin] = useState('Hyderabad');
  const [initDestination, setInitDestination] = useState('Goa');
  const [initDeparture, setInitDeparture] = useState('2026-09-15');
  const [initReturn, setInitReturn] = useState('2026-09-20');
  const [initAdults, setInitAdults] = useState(2);
  const [initChildren, setInitChildren] = useState(0);
  const [initInfants, setInitInfants] = useState(0);
  const [initBudget, setInitBudget] = useState(40000);
  const [initStyle, setInitStyle] = useState<'budget' | 'balanced' | 'comfort' | 'luxury'>('balanced');
  const [initPurpose, setInitPurpose] = useState('Couple');
  const [initInterests, setInitInterests] = useState<string[]>(['Beach', 'Food', 'Culture']);

  const totalTravellers = initAdults + initChildren + initInfants;
  const perPersonBudget = totalTravellers > 0 && initBudget > 0 ? Math.round(initBudget / totalTravellers) : 0;

  const allInterests = [
    'Beach',
    'Adventure',
    'Food',
    'Culture',
    'Nature',
    'Shopping',
    'Nightlife',
    'History',
    'Relaxation',
    'Photography',
    'Wellness',
    'Sports',
    'Local Experiences',
  ];

  const handleToggleInterest = (item: string) => {
    setInitInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleStartNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initDestination) return;
    changeDestination(
      initDestination,
      initOrigin || 'Hyderabad',
      initDeparture || '2026-09-15',
      initReturn || '2026-09-20',
      totalTravellers || 1,
      initBudget || 0
    );
  };

  const currentStepIndex = stepDefinitions.findIndex((s) => s.id === currentStep);

  // If no destination or isDraftEmpty, render the pristine Initial Setup screen
  if (isDraftEmpty || !destination) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-3xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#0B1220] text-white mx-auto flex items-center justify-center shadow-lg">
              <Compass className="w-6 h-6 text-[#C8A96B]" />
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B1220] tracking-tight">
              {t('builder.where_to_travel', 'Where would you like to travel?')}
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {t('builder.configure_desc', 'Configure your trip criteria and build a personalized itinerary with flights, stays, transport, and curated experiences.')}
            </p>
          </div>

          {/* Quick Setup Form */}
          <form onSubmit={handleStartNewTrip} className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-luxury space-y-5">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('builder.departing_from', 'Departing From')}</span>
                </label>
                <input
                  type="text"
                  value={initOrigin}
                  onChange={(e) => setInitOrigin(e.target.value)}
                  placeholder={t('builder.departing_placeholder', 'e.g. Hyderabad, Delhi, Mumbai')}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B1220] text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>{t('builder.destination', 'Destination')}</span>
                </label>
                <input
                  type="text"
                  value={initDestination}
                  onChange={(e) => setInitDestination(e.target.value)}
                  placeholder={t('builder.destination_placeholder', 'e.g. Goa, Kerala, Jaipur')}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B1220] text-sm font-medium"
                />
              </div>
            </div>

            {/* Popular Destinations Quick Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('builder.popular_destinations', 'Popular Destinations')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    type="button"
                    onClick={() => setInitDestination(dest.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      initDestination === dest.name
                        ? 'border-[#0B1220] bg-slate-50 ring-1 ring-[#0B1220]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{dest.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {dest.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{dest.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('builder.departure_date', 'Departure Date')}</span>
                </label>
                <input
                  type="date"
                  value={initDeparture}
                  onChange={(e) => setInitDeparture(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('builder.return_date', 'Return Date')}</span>
                </label>
                <input
                  type="date"
                  value={initReturn}
                  onChange={(e) => setInitReturn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
            </div>

            {/* Travellers Breakdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('builder.travellers_count', { count: totalTravellers }, `Travellers (${totalTravellers} Total)`)}</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <span className="text-[11px] font-bold text-slate-500 block">{t('builder.adults', 'Adults')}</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setInitAdults(Math.max(1, initAdults - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-xs hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-slate-900">{initAdults}</span>
                    <button
                      type="button"
                      onClick={() => setInitAdults(initAdults + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-xs hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <span className="text-[11px] font-bold text-slate-500 block">{t('builder.children', 'Children')}</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setInitChildren(Math.max(0, initChildren - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-xs hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-slate-900">{initChildren}</span>
                    <button
                      type="button"
                      onClick={() => setInitChildren(initChildren + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-xs hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                  <span className="text-[11px] font-bold text-slate-500 block">{t('builder.infants', 'Infants')}</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setInitInfants(Math.max(0, initInfants - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-xs hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-slate-900">{initInfants}</span>
                    <button
                      type="button"
                      onClick={() => setInitInfants(initInfants + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 font-bold text-xs hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Style & Trip Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('builder.travel_style', 'Travel Style')}</span>
                </label>
                <select
                  value={initStyle}
                  onChange={(e) => setInitStyle(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="budget">💰 {t('builder.style_budget', 'Budget')} — Backpacker / Cost-efficient</option>
                  <option value="balanced">⚖️ {t('builder.style_balanced', 'Balanced')} — Value & Comfort</option>
                  <option value="comfort">✨ {t('builder.style_comfort', 'Comfort')} — Premium Stays & Flights</option>
                  <option value="luxury">👑 {t('builder.style_luxury', 'Luxury')} — 5-Star Resorts & Private Transfers</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t('builder.trip_purpose', 'Trip Purpose')}</span>
                </label>
                <select
                  value={initPurpose}
                  onChange={(e) => setInitPurpose(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="Solo">{t('builder.purpose_solo', 'Solo Exploration')}</option>
                  <option value="Couple">{t('builder.purpose_couple', 'Romantic / Couple Gateway')}</option>
                  <option value="Family">{t('builder.purpose_family', 'Family Holiday')}</option>
                  <option value="Friends">{t('builder.purpose_friends', 'Friends Adventure')}</option>
                  <option value="Business">{t('builder.purpose_business', 'Business / Workation')}</option>
                  <option value="Honeymoon">Honeymoon</option>
                </select>
              </div>
            </div>

            {/* Interest Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>{t('builder.interests', 'Interests & Experiences (Select all that apply)')}</span>
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allInterests.map((interest) => {
                  const isSelected = initInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Per Person Calculation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#158A6A]" />
                  <span>{t('builder.target_budget', 'Target Budget (₹)')}</span>
                </label>
                {perPersonBudget > 0 && totalTravellers > 1 && (
                  <span className="text-[11px] font-bold text-[#158A6A]">
                    {t('builder.per_person_est', { amount: perPersonBudget.toLocaleString('en-IN') }, `≈ ₹${perPersonBudget.toLocaleString('en-IN')} / person`)}
                  </span>
                )}
              </div>
              <input
                type="number"
                value={initBudget || ''}
                onChange={(e) => setInitBudget(Number(e.target.value))}
                placeholder="e.g. 50000 (₹)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B1220] text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary text-sm !py-3.5 px-6 font-bold rounded-xl shadow-luxury flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4 text-[#C8A96B]" />
              <span>{t('builder.start_building', 'Start Building My Trip')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-16">
      {/* ─── 1. TOP PERSISTENT TRIP BUILDER HEADER ─── */}
      <div className="bg-white border-b border-slate-200 sticky top-14 lg:top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Trip Destination & Route info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0B1220] text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
                <Compass className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-editorial text-lg sm:text-xl font-bold text-[#0B1220] tracking-tight leading-none">
                    {t('builder.trip_title', { destination: tPlace(destination).toUpperCase() }, `${tPlace(destination).toUpperCase()} TRIP`)}
                  </h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('builder.multi_modal_planner', 'Flexible Multi-Modal Planner')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {tPlace(origin)} → {tPlace(destination)} • {departureDate} to {returnDate} ({tripNights} {t('builder.nights', 'Nights')}) • {travellers} {travellers > 1 ? t('builder.travellers_label', 'Travellers') : t('builder.traveller_label', 'Traveller')}
                </p>
              </div>
            </div>

            {/* Edit Search, Undo & Start Fresh Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">{t('builder.est_total', 'Est. Total')}</span>
                  <CurrencyDisplay amount={estimatedTotal} className="font-black text-[#0B1220]" />
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">{t('builder.remaining', 'Remaining')}</span>
                  <span className={`font-black ${remainingBudget >= 0 ? 'text-[#158A6A]' : 'text-rose-600'}`}>
                    ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {canUndo && (
                <button
                  type="button"
                  onClick={undoLastAction}
                  className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1 shadow-xs text-slate-700 hover:text-[#0B1220]"
                  title="Undo last change"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('builder.undo', 'Undo')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setWhatShouldIDoOpen(true)}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>What Should I Do?</span>
              </button>

              <button
                type="button"
                onClick={() => setEditSearchOpen(true)}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('builder.edit_search', 'Edit Search')}</span>
              </button>

              <button
                type="button"
                onClick={() => setStartFreshModalOpen(true)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 flex items-center gap-1.5 transition-colors"
                title="Clear current trip and start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('builder.start_fresh', 'Start Fresh')}</span>
              </button>
            </div>
          </div>

          {/* ─── 2. PROGRESS STEPPER (DESKTOP) ─── */}
          <div className="hidden lg:flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
            {stepDefinitions.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.id;
              const status = stepStatus[step.id];
              const isCompleted = status === 'completed';
              const isSkipped = status === 'skipped';

              return (
                <React.Fragment key={step.id}>
                  <button
                    type="button"
                    onClick={() => setStep(step.id)}
                    className={`relative flex items-center gap-2 py-1.5 px-3 rounded-xl transition-colors duration-200 ${
                      isCurrent
                        ? 'text-white font-bold'
                        : isCompleted
                        ? 'text-[#158A6A] hover:bg-emerald-50/80 font-bold'
                        : isSkipped
                        ? 'text-slate-400 hover:text-slate-700'
                        : 'text-slate-600 hover:text-[#0B1220] hover:bg-slate-100/80'
                    }`}
                  >
                    {isCurrent && (
                      <motion.div
                        layoutId="activePlanStep"
                        className="absolute inset-0 bg-[#0B1220] rounded-xl shadow-xs"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <div className={`relative z-10 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors ${
                      isCurrent
                        ? 'bg-white text-[#0B1220]'
                        : isCompleted
                        ? 'bg-emerald-100 text-[#158A6A]'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className="relative z-10 text-xs">{step.label}</span>
                  </button>

                  {idx < stepDefinitions.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ─── PROGRESS INDICATOR (MOBILE) ─── */}
          <div className="lg:hidden flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-[#0B1220]">
              {t('builder.step_of', { current: currentStepIndex + 1, total: 6, step: stepDefinitions[currentStepIndex]?.label }, `Step ${currentStepIndex + 1} of 6: ${stepDefinitions[currentStepIndex]?.label}`)}
            </span>
            <div className="flex items-center gap-1">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="text-slate-600 font-bold px-2 py-1"
                >
                  ← {t('builder.back', 'Back')}
                </button>
              )}
              {currentStepIndex < stepDefinitions.length - 1 && (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="text-blue-600 font-bold px-2 py-1"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. MAIN WORKSPACE: ACTIVE STEP + STICKY SIDEBAR ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Step Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <DestinationWeatherBanner destination={destination} />
                {currentStep === 'travel' && <GettingThereStep />}
                {currentStep === 'stays' && <StayStep />}
                {currentStep === 'local_transport' && <LocalMobilityStep />}
                {currentStep === 'activities' && <ActivityStep />}
                {currentStep === 'itinerary' && <ItineraryStep />}
                {currentStep === 'review' && <ReviewStep />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky Summary Sidebar (Desktop) */}
          <div className="hidden lg:block lg:col-span-4">
            <TripSummarySidebar />
          </div>
        </div>
      </div>

      {/* ─── 4. MOBILE BOTTOM SUMMARY BAR ─── */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('sidebar.est_total', 'Estimated Total')}</span>
          <CurrencyDisplay amount={estimatedTotal} className="text-base font-black text-[#0B1220]" />
        </div>

        <button
          type="button"
          onClick={() => {
            if (currentStep === 'review') {
              // proceed to review
            } else {
              goToNextStep();
            }
          }}
          className="btn-primary text-xs !py-2 px-4 font-bold shadow-xs flex items-center gap-1"
        >
          <span>
            {currentStep === 'review'
              ? t('step.review.proceed_payment', 'Book Trip')
              : t('sidebar.continue_to', { step: stepDefinitions[currentStepIndex + 1]?.label || 'Next' }, 'Continue Step')}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Edit Search Modal */}
      {editSearchOpen && <EditSearchModal onClose={() => setEditSearchOpen(false)} />}

      {/* Start Fresh Confirmation Dialog */}
      <StartFreshModal
        isOpen={startFreshModalOpen}
        onClose={() => setStartFreshModalOpen(false)}
        onConfirm={resetTripDraft}
      />

      {/* Interactive Undo Toast */}
      <UndoToast
        message={undoNotification?.message || null}
        onUndo={() => {
          undoNotification?.undoFn();
          dismissUndoNotification();
        }}
        onDismiss={dismissUndoNotification}
      />
    </div>
  );
};
