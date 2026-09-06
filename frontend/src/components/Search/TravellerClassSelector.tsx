import React from 'react';
import { Users, X, Check, AlertCircle } from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First Class';

interface TravellerClassSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  onAdultsChange: (val: number) => void;
  onChildrenChange: (val: number) => void;
  onInfantsChange: (val: number) => void;
  onCabinClassChange: (val: CabinClass) => void;
}

export const TravellerClassSelector: React.FC<TravellerClassSelectorProps> = ({
  isOpen,
  onClose,
  adults,
  children,
  infants,
  cabinClass,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  onCabinClassChange,
}) => {
  const { t } = useTravelSettings();
  if (!isOpen) return null;

  const totalPassengers = adults + children + infants;
  const maxAllowed = 9;

  const handleAddAdult = () => {
    if (totalPassengers < maxAllowed) {
      onAdultsChange(adults + 1);
    }
  };

  const handleSubAdult = () => {
    if (adults > 1) {
      const newAdults = adults - 1;
      onAdultsChange(newAdults);
      // Ensure infants do not exceed adults
      if (infants > newAdults) {
        onInfantsChange(newAdults);
      }
    }
  };

  const handleAddChild = () => {
    if (totalPassengers < maxAllowed) {
      onChildrenChange(children + 1);
    }
  };

  const handleSubChild = () => {
    if (children > 0) {
      onChildrenChange(children - 1);
    }
  };

  const handleAddInfant = () => {
    // Infants cannot exceed adults
    if (infants < adults && totalPassengers < maxAllowed) {
      onInfantsChange(infants + 1);
    }
  };

  const handleSubInfant = () => {
    if (infants > 0) {
      onInfantsChange(infants - 1);
    }
  };

  const cabinOptions: { id: CabinClass; labelKey: string }[] = [
    { id: 'Economy', labelKey: 'traveller.economy' },
    { id: 'Premium Economy', labelKey: 'traveller.premium_economy' },
    { id: 'Business', labelKey: 'traveller.business' },
    { id: 'First Class', labelKey: 'traveller.first' },
  ];

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 z-50 animate-dropdown space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {t('traveller.title', 'Travellers & Cabin Class')}
          </h4>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steppers */}
      <div className="space-y-3.5">
        {/* Adults */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{t('traveller.adults', 'Adults')}</p>
            <p className="text-[10px] text-slate-500">{t('traveller.adults_desc', '12+ years')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={adults <= 1}
              onClick={handleSubAdult}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="text-sm font-black text-slate-900 w-4 text-center">{adults}</span>
            <button
              type="button"
              disabled={totalPassengers >= maxAllowed}
              onClick={handleAddAdult}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{t('traveller.children', 'Children')}</p>
            <p className="text-[10px] text-slate-500">{t('traveller.children_desc', '2–12 years')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={children <= 0}
              onClick={handleSubChild}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="text-sm font-black text-slate-900 w-4 text-center">{children}</span>
            <button
              type="button"
              disabled={totalPassengers >= maxAllowed}
              onClick={handleAddChild}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{t('traveller.infants', 'Infants')}</p>
            <p className="text-[10px] text-slate-500">{t('traveller.infants_desc', 'Under 2 years')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={infants <= 0}
              onClick={handleSubInfant}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="text-sm font-black text-slate-900 w-4 text-center">{infants}</span>
            <button
              type="button"
              disabled={infants >= adults || totalPassengers >= maxAllowed}
              onClick={handleAddInfant}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={infants >= adults ? 'Infants cannot exceed number of adults' : ''}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {infants >= adults && (
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center gap-1.5 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
          <span>Number of infants cannot exceed number of adult travellers.</span>
        </div>
      )}

      {/* Cabin Class Grid */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] font-bold uppercase text-slate-500 mb-2">
          {t('traveller.cabin_class', 'Cabin Class')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {cabinOptions.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => onCabinClassChange(cls.id)}
              className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between border ${
                cabinClass === cls.id
                  ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{t(cls.labelKey, cls.id)}</span>
              {cabinClass === cls.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Done Button */}
      <button
        type="button"
        onClick={onClose}
        className="w-full btn-primary text-xs py-2.5 font-bold shadow-sm"
      >
        {t('action.apply', 'Apply Selection')} ({totalPassengers === 1 ? t('traveller.single', '1 Traveller') : t('traveller.plural', { count: totalPassengers }, `${totalPassengers} Travellers`)})
      </button>
    </div>
  );
};
