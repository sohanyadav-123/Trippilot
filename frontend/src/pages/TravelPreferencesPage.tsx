import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Armchair,
  Utensils,
  Hotel,
  Activity,
  DollarSign,
  Sparkles,
  Save,
  CheckCircle2,
  Sliders,
  Baby,
  Accessibility,
  Globe2,
} from 'lucide-react';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const TravelPreferencesPage: React.FC = () => {
  const {
    travelStyle,
    setTravelStyle,
    interests,
    setInterests,
    tripPace,
    setTripPace,
    seatPreference,
    setSeatPreference,
    mealPreference,
    setMealPreference,
    hotelStarPreference,
    setHotelStarPreference,
    baseCurrency,
    setBaseCurrency,
  } = useTripBuilder();

  const { travelMode, setTravelMode } = useTravelSettings();

  const [savedMessage, setSavedMessage] = useState(false);

  const availableStyles: Array<'budget' | 'balanced' | 'comfort' | 'luxury'> = [
    'budget',
    'balanced',
    'comfort',
    'luxury',
  ];

  const availableInterests = [
    'Beach & Coastal',
    'Historical Monuments',
    'Hiking & Nature',
    'Culinary & Street Food',
    'Nightlife & Lounges',
    'Scuba & Water Sports',
    'Wellness & Ayurveda',
    'Family Theme Parks',
    'Shopping & Bazaars',
  ];

  const handleToggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation breadcrumb */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Profile Hub</span>
      </Link>

      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Travel Preferences & AI Tuning</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalize flight seat selections, dietary needs, hotel ratings, and AI itinerary generation
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary text-xs !py-2.5 px-5 font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Travel preferences saved and synced with your TripPilot AI Planner!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 0. Travel Experience Mode Selector */}
        <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" /> Travel Experience Mode
            </h3>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
              Active: {travelMode === 'family' ? 'Family with Kids' : travelMode === 'accessibility' ? 'Accessibility Mode' : 'Standard Travel'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                mode: 'standard' as const,
                title: 'Standard Travel',
                desc: 'Full interactive catalog, standard seats & AI itinerary builder',
                icon: Globe2,
                color: 'blue',
              },
              {
                mode: 'family' as const,
                title: 'Family with Kids',
                desc: 'Kid-safe resorts, adjacent family flight seats & play zones',
                icon: Baby,
                color: 'amber',
              },
              {
                mode: 'accessibility' as const,
                title: 'Accessibility Mode',
                desc: 'Wheelchair access, step-free hotels, elevators & mobility cabs',
                icon: Accessibility,
                color: 'indigo',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = travelMode === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setTravelMode(item.mode)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? item.color === 'family'
                        ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                        : item.color === 'accessibility'
                        ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-400/40 shadow-sm'
                        : 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-400/40 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? item.color === 'family'
                            ? 'bg-amber-200 text-amber-900'
                            : item.color === 'accessibility'
                            ? 'bg-indigo-200 text-indigo-900'
                            : 'bg-blue-200 text-blue-900'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.color === 'family'
                            ? 'bg-amber-600 text-white'
                            : item.color === 'accessibility'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold block text-slate-900">{item.title}</span>
                  <span className="text-[11px] text-slate-500 block mt-1 leading-snug">{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. Travel Style Tier */}
        <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> Travel Budget & Luxury Tier
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableStyles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setTravelStyle(style)}
                className={`p-4 rounded-2xl border text-center transition-all capitalize ${
                  travelStyle === style
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm block">{style}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {style === 'budget' && 'Cost-efficient stays'}
                  {style === 'balanced' && 'Best value hotels'}
                  {style === 'comfort' && '4-Star verified stays'}
                  {style === 'luxury' && '5-Star bespoke resorts'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Vacation Interests Multi-Select */}
        <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" /> Vacation Interests & Themes
          </h3>

          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleToggleInterest(interest)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    selected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. In-Flight & Hospitality Preferences */}
        <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Armchair className="w-4 h-4 text-indigo-600" /> Seating, Dining & Stay Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Seat Preference
              </label>
              <select
                value={seatPreference}
                onChange={(e) => setSeatPreference(e.target.value as any)}
                className="input-field text-xs py-2.5"
              >
                <option value="window">Window Seat</option>
                <option value="aisle">Aisle Seat</option>
                <option value="no_preference">No Preference</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Dietary & Meal Choice
              </label>
              <select
                value={mealPreference}
                onChange={(e) => setMealPreference(e.target.value as any)}
                className="input-field text-xs py-2.5"
              >
                <option value="vegetarian">Vegetarian / Jain</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan / Plant-Based</option>
                <option value="no_preference">No Preference</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Minimum Hotel Rating
              </label>
              <select
                value={hotelStarPreference}
                onChange={(e) => setHotelStarPreference(Number(e.target.value) as any)}
                className="input-field text-xs py-2.5"
              >
                <option value={0}>Any Star Rating</option>
                <option value={3}>3-Star & Above</option>
                <option value={4}>4-Star & Above (Recommended)</option>
                <option value={5}>5-Star Luxury Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Itinerary Pace & Currency */}
        <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" /> Itinerary Pace & Base Currency
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Trip Scheduling Pace
              </label>
              <select
                value={tripPace}
                onChange={(e) => setTripPace(e.target.value as any)}
                className="input-field text-xs py-2.5"
              >
                <option value="relaxed">Relaxed (1–2 key activities/day + leisure)</option>
                <option value="balanced">Balanced (2–3 activities + dining)</option>
                <option value="packed">Packed (Explore maximum landmarks)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                Display Currency
              </label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as any)}
                className="input-field text-xs py-2.5"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn-primary text-xs py-3 px-8 font-bold shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
