import React, { useState } from 'react';
import { X, Calendar, Users, MapPin, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { LOCATIONS_DATA } from '../../data/locationData';
import { DestinationChangeModal } from './DestinationChangeModal';
import { TravelStyle } from '../../types';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const EditSearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTravelSettings();
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    travellers,
    cabin,
    budget,
    travelStyle,
    setTravelStyle,
    tripPurpose,
    setTripPurpose,
    dateFlexibility,
    setDateFlexibility,
    interests,
    toggleInterest,
    changeDestination,
    setTripSearch,
  } = useTripBuilder();

  const [editOrigin, setEditOrigin] = useState(origin);
  const [editDestination, setEditDestination] = useState(destination);
  const [editDepDate, setEditDepDate] = useState(departureDate);
  const [editRetDate, setEditRetDate] = useState(returnDate);
  const [editTravellers, setEditTravellers] = useState(travellers);
  const [editCabin, setEditCabin] = useState(cabin);
  const [editBudget, setEditBudget] = useState(budget);
  const [destModalOpen, setDestModalOpen] = useState(false);

  const availableStyles: TravelStyle[] = ['budget', 'balanced', 'comfort', 'luxury', 'custom'];
  const availablePurposes = [
    'Solo',
    'Couple',
    'Family',
    'Family with children',
    'Friends',
    'Business',
    'Honeymoon',
    'Weekend getaway',
    'Celebration',
    'Other',
  ];
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
  ];

  const isDestinationChanged = editDestination !== destination;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDestinationChanged) {
      setDestModalOpen(true);
      return;
    }
    setTripSearch({
      origin: editOrigin,
      destination: editDestination,
      departureDate: editDepDate,
      returnDate: editRetDate,
      travellers: editTravellers,
      cabin: editCabin,
      budget: editBudget,
      travelStyle,
      tripPurpose,
      dateFlexibility,
      interests,
    });
    onClose();
  };

  const handleConfirmDestinationChange = () => {
    changeDestination(
      editDestination,
      editOrigin,
      editDepDate,
      editRetDate,
      editTravellers,
      editBudget
    );
    setDestModalOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-luxury border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-[#0B1220]">{t('modal.edit_search.title', 'Edit Trip Criteria')}</h3>
            <p className="text-xs text-slate-500">{t('modal.edit_search.subtitle', 'Update destination, style, purpose, dates, or budget')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit search modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDestinationChanged && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-950">{t('modal.edit_search.dest_changed_title', 'Destination Changed')}</span>
              <span className="text-[11px] text-amber-800">
                {t('modal.edit_search.dest_changed_desc', { newDest: editDestination, oldDest: destination }, `Switching to ${editDestination} will automatically clear ${destination}-specific stays, local transport, and activities to prevent stale selections in Review & Book.`)}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Origin & Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.departing_from', 'Departure City')}</label>
              <select
                value={editOrigin}
                onChange={(e) => setEditOrigin(e.target.value)}
                className="input-field text-xs"
              >
                {LOCATIONS_DATA.map((loc) => (
                  <option key={loc.id} value={loc.city}>
                    {loc.city} ({loc.airportCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.destination', 'Destination City')}</label>
              <select
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
                className="input-field text-xs"
              >
                {LOCATIONS_DATA.map((loc) => (
                  <option key={loc.id} value={loc.city}>
                    {loc.city} ({loc.airportCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.travel_style', 'Travel Style')}</label>
            <div className="flex flex-wrap gap-1.5">
              {availableStyles.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTravelStyle(style)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                    travelStyle === style
                      ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t(`builder.style_${style}`, style)}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Purpose & Date Flexibility */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.trip_purpose', 'Trip Purpose')}</label>
              <select
                value={tripPurpose}
                onChange={(e) => setTripPurpose(e.target.value)}
                className="input-field text-xs"
              >
                {availablePurposes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('modal.edit_search.date_flex', 'Date Flexibility')}</label>
              <select
                value={dateFlexibility}
                onChange={(e) => setDateFlexibility(e.target.value as any)}
                className="input-field text-xs"
              >
                <option value="exact">{t('modal.edit_search.flex_exact', 'Exact Dates')}</option>
                <option value="1day">{t('modal.edit_search.flex_1day', '±1 Day')}</option>
                <option value="3days">{t('modal.edit_search.flex_3days', '±3 Days')}</option>
                <option value="7days">{t('modal.edit_search.flex_7days', '±7 Days')}</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.departure_date', 'Departure Date')}</label>
              <input
                type="date"
                value={editDepDate}
                onChange={(e) => setEditDepDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.return_date', 'Return Date')}</label>
              <input
                type="date"
                value={editRetDate}
                onChange={(e) => setEditRetDate(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('modal.edit_search.interests', 'Travel Interests')}</label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl">
              {allInterests.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-[#0B1220] text-white border-[#0B1220]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {interest} {isSelected ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Travellers & Cabin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('modal.edit_search.travellers_count', 'Travellers Count')}</label>
              <select
                value={editTravellers}
                onChange={(e) => setEditTravellers(Number(e.target.value))}
                className="input-field text-xs"
              >
                <option value={1}>{t('traveller.single', '1 Traveller')}</option>
                <option value={2}>{t('traveller.plural', { count: 2 }, '2 Travellers')}</option>
                <option value={3}>{t('traveller.plural', { count: 3 }, '3 Travellers')}</option>
                <option value={4}>{t('traveller.plural', { count: 4 }, '4 Travellers')}</option>
                <option value={5}>{t('traveller.plural', { count: 5 }, '5+ Travellers')}</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('traveller.cabin_class', 'Cabin Class')}</label>
              <select
                value={editCabin}
                onChange={(e) => setEditCabin(e.target.value)}
                className="input-field text-xs"
              >
                <option value="Economy">{t('traveller.economy', 'Economy')}</option>
                <option value="Premium Economy">{t('traveller.premium_economy', 'Premium Economy')}</option>
                <option value="Business">{t('traveller.business', 'Business')}</option>
                <option value="First">{t('traveller.first', 'First Class')}</option>
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">{t('builder.target_budget', 'Target Trip Budget (₹)')}</label>
            <input
              type="number"
              min={0}
              step={5000}
              value={editBudget || ''}
              placeholder="e.g. 50000"
              onChange={(e) => setEditBudget(Number(e.target.value))}
              className="input-field text-xs font-mono font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs !py-2 px-4"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary text-xs !py-2 px-5 font-bold"
            >
              {isDestinationChanged ? t('modal.dest_change.review_btn_short', 'Review & Change Destination') : t('modal.edit_search.save', 'Update Search')}
            </button>
          </div>
        </form>
      </div>

      {/* Destination Change Review Modal */}
      <DestinationChangeModal
        isOpen={destModalOpen}
        newDestination={editDestination}
        pendingParams={{
          origin: editOrigin,
          departureDate: editDepDate,
          returnDate: editRetDate,
          travellers: editTravellers,
          budget: editBudget,
        }}
        onClose={() => setDestModalOpen(false)}
        onConfirm={handleConfirmDestinationChange}
      />
    </div>
  );
};
