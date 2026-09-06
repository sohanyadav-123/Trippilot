import React, { useState } from 'react';
import { Plane, Train, Bus, Car, Building2, Home, BedDouble, Waves, Bike, Compass, Check, ChevronRight, PieChart, RotateCcw, X, Trash2 } from 'lucide-react';
import { useTripBuilder, TripStep } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { StartFreshModal } from './StartFreshModal';

export const TripSummarySidebar: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    travellers,
    tripNights,
    budget,
    currentStep,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    travelTotal,
    stayTotal,
    mobilityTotal,
    activitiesTotal,
    estimatedTotal,
    remainingBudget,
    setStep,
    goToNextStep,
    removeTravel,
    removeStay,
    removeMobility,
    removeActivity,
    resetTripDraft,
  } = useTripBuilder();

  const [startFreshModalOpen, setStartFreshModalOpen] = useState(false);

  const getTravelIcon = (mode?: string) => {
    switch (mode) {
      case 'train':
        return Train;
      case 'bus':
        return Bus;
      case 'car':
      case 'cab':
        return Car;
      default:
        return Plane;
    }
  };

  const getStayIcon = (type?: string) => {
    switch (type) {
      case 'Villa':
        return Home;
      case 'Apartment':
        return BedDouble;
      case 'Resort':
        return Waves;
      default:
        return Building2;
    }
  };

  const getMobilityIcon = (type?: string) => {
    switch (type) {
      case 'scooter':
        return Bike;
      default:
        return Car;
    }
  };

  const TravelIcon = getTravelIcon(selectedTravel?.mode);
  const StayIcon = getStayIcon(selectedStay?.type);
  const MobilityIcon = getMobilityIcon(selectedMobility?.type);

  const sections: { id: TripStep; label: string; icon: any; isSelected: boolean; cost: number; subtitle: string }[] = [
    {
      id: 'travel',
      label: t('sidebar.getting_there', 'Getting There'),
      icon: TravelIcon,
      isSelected: !!selectedTravel,
      cost: travelTotal,
      subtitle: selectedTravel ? `${selectedTravel.title} (${selectedTravel.mode.toUpperCase()})` : t('sidebar.not_selected', 'Not selected'),
    },
    {
      id: 'stays',
      label: t('sidebar.where_to_stay', 'Where to Stay'),
      icon: StayIcon,
      isSelected: !!selectedStay,
      cost: stayTotal,
      subtitle: selectedStay ? `${selectedStay.name} (${selectedStay.type})` : t('sidebar.not_selected', 'Not selected'),
    },
    {
      id: 'local_transport',
      label: t('sidebar.getting_around', 'Getting Around'),
      icon: MobilityIcon,
      isSelected: !!selectedMobility,
      cost: mobilityTotal,
      subtitle: selectedMobility ? selectedMobility.title : t('sidebar.not_selected', 'Not selected'),
    },
    {
      id: 'activities',
      label: t('sidebar.activities', 'Activities'),
      icon: Compass,
      isSelected: selectedActivities.length > 0,
      cost: activitiesTotal,
      subtitle: selectedActivities.length > 0
        ? t('sidebar.items_count', { count: selectedActivities.length }, `${selectedActivities.length} activities selected`)
        : t('sidebar.not_selected', 'Not selected'),
    },
  ];

  return (
    <div className="surface-card p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm sticky top-24 space-y-5">
      {/* Header */}
      <div className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C8A96B]">
            {t('step.review.summary', 'Trip Summary').toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => setStartFreshModalOpen(true)}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors group"
            title="Clear trip and start fresh"
          >
            <RotateCcw className="w-3 h-3 group-hover:-rotate-90 transition-transform" />
            <span>{t('sidebar.start_fresh', 'Start Fresh')}</span>
          </button>
        </div>
        <h3 className="font-editorial text-xl font-bold text-[#0B1220] tracking-tight mt-1">
          {destination ? t('sidebar.trip_title', { destination }, `Your ${destination} Trip`) : 'Custom Trip Plan'}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {departureDate && returnDate ? `${departureDate} – ${returnDate} (${tripNights} ${t('builder.nights', 'Nights')})` : 'Flexible Dates'}
        </p>
      </div>

      {/* Itemized Selection Overview */}
      <div className="space-y-2.5">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isCurrent = currentStep === sec.id;

          const handleRemove = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (sec.id === 'travel') removeTravel();
            else if (sec.id === 'stays') removeStay();
            else if (sec.id === 'local_transport') removeMobility();
            else if (sec.id === 'activities') {
              selectedActivities.forEach((a) => removeActivity(a.id));
            }
          };

          return (
            <div
              key={sec.id}
              onClick={() => setStep(sec.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group/row ${
                isCurrent
                  ? 'bg-slate-50 border-[#0B1220] ring-1 ring-[#0B1220]/10'
                  : 'bg-white border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    sec.isSelected ? 'bg-emerald-50 text-[#158A6A]' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0B1220] flex items-center gap-1.5">
                      <span>{sec.label}</span>
                      {sec.isSelected && <Check className="w-3 h-3 text-[#158A6A]" />}
                    </span>
                    <span className="text-[10.5px] text-slate-500 block truncate max-w-[130px]">
                      {sec.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    {sec.cost > 0 ? (
                      <CurrencyDisplay amount={sec.cost} className="text-xs font-black text-[#0B1220]" />
                    ) : (
                      <span className="text-[10px] text-slate-400">₹0</span>
                    )}
                  </div>
                  {sec.isSelected && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="p-1 rounded-lg hover:bg-rose-100 text-slate-300 hover:text-rose-600 transition-colors"
                      title={`Remove ${sec.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Financials & Budget Meter */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">{t('sidebar.est_total', 'Estimated Total')}</span>
          <CurrencyDisplay amount={estimatedTotal} className="text-lg font-black text-[#0B1220]" />
        </div>

        {budget > 0 ? (
          <>
            <div className="flex items-center justify-between text-slate-500">
              <span>{t('sidebar.target_budget', 'Target Budget')}</span>
              <CurrencyDisplay amount={budget} className="font-semibold text-slate-700" />
            </div>

            {travellers > 1 && (
              <div className="flex items-center justify-between text-slate-400 text-[10.5px]">
                <span>{t('search.per_person', 'Per Person')}</span>
                <span className="font-bold text-slate-600">≈ ₹{Math.round(budget / travellers).toLocaleString('en-IN')} × {travellers}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100/60">
              <span className="font-bold text-slate-700">{t('sidebar.remaining', 'Remaining Budget')}</span>
              <span className={`font-black text-sm ${remainingBudget >= 0 ? 'text-[#158A6A]' : 'text-rose-600'}`}>
                {remainingBudget >= 0 ? '+' : '-'}₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>{t('search.trip_budget', 'Trip Budget')}</span>
            <span className="text-slate-400 font-medium">No budget set (Optional)</span>
          </div>
        )}
      </div>

      {/* Quick Link to Financial Hub */}
      <div className="pt-2">

        <a
          href="/budget"
          className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors group"
        >
          <span className="flex items-center gap-1.5">
            <span>📊 {t('nav.budget_tracker', 'Travel Money Hub')}</span>
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
            Open →
          </span>
        </a>
      </div>

      {/* Planning Progress Tracker */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5">

        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Planning Progress</span>
        {[
          { id: 'travel', label: t('step.travel', 'Flight / Travel'), done: !!selectedTravel },
          { id: 'stays', label: t('step.stays', 'Hotel / Stay'), done: !!selectedStay },
          { id: 'local_transport', label: t('step.local_transport', 'Transport'), done: !!selectedMobility },
          { id: 'activities', label: t('step.activities', 'Activities'), done: selectedActivities.length > 0 },
          { id: 'itinerary', label: t('step.itinerary', 'Itinerary'), done: false },
          { id: 'review', label: t('step.review', 'Final Review'), done: false },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStep(item.id as any)}
            className={`w-full text-left flex items-center gap-2 text-xs px-2 py-1 rounded-lg transition-colors hover:bg-slate-50 ${
              currentStep === item.id ? 'font-bold text-[#0B1220]' : 'text-slate-500'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border text-[9px] font-black ${
              item.done
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : currentStep === item.id
                ? 'bg-[#0B1220] border-[#0B1220] text-white'
                : 'border-slate-200 bg-white'
            }`}>
              {item.done ? '✓' : ''}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Step Next Action Button */}
      <div className="pt-2">
        {currentStep === 'review' ? (
          <button
            type="button"
            onClick={() => setStep('review')}
            className="w-full btn-primary text-xs !py-3 font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <span>{t('sidebar.proceed_checkout', 'Proceed to Checkout')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={goToNextStep}
            className="w-full btn-primary text-xs !py-3 font-bold shadow-md flex items-center justify-center gap-1.5"
          >
            <span>{t('sidebar.continue_to', { step: 'Next' }, 'Continue to Next Step')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Start Fresh Confirmation Dialog */}
      <StartFreshModal
        isOpen={startFreshModalOpen}
        onClose={() => setStartFreshModalOpen(false)}
        onConfirm={resetTripDraft}
      />
    </div>
  );
};
