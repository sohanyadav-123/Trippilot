import React, { useState } from 'react';
import { Plane, Train, Bus, Car, Building2, Home, BedDouble, Waves, Bike, Compass, Edit3, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, Sparkles, PieChart, Trash2, X } from 'lucide-react';
import { useTripBuilder } from '../../../context/TripBuilderContext';
import { useTravelSettings } from '../../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../Common/CurrencyDisplay';
import { TripBuilderCheckoutModal } from '../TripBuilderCheckoutModal';

export const ReviewStep: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    travellers,
    tripNights,
    budget,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    travelTotal,
    stayTotal,
    mobilityTotal,
    activitiesTotal,
    subtotal,
    taxes,
    estimatedTotal,
    remainingBudget,
    setStep,
    goToPrevStep,
    removeTravel,
    removeStay,
    removeMobility,
    removeActivity,
  } = useTripBuilder();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const getTravelIcon = (mode?: string) => {
    switch (mode) {
      case 'train':
        return <Train className="w-5 h-5" />;
      case 'bus':
        return <Bus className="w-5 h-5" />;
      case 'car':
      case 'cab':
        return <Car className="w-5 h-5" />;
      default:
        return <Plane className="w-5 h-5" />;
    }
  };

  const getStayIcon = (type?: string) => {
    switch (type) {
      case 'Villa':
        return <Home className="w-5 h-5" />;
      case 'Apartment':
        return <BedDouble className="w-5 h-5" />;
      case 'Resort':
        return <Waves className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getMobilityIcon = (type?: string) => {
    switch (type) {
      case 'scooter':
        return <Bike className="w-5 h-5" />;
      default:
        return <Car className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-0.5">
            {t('step.review.header_step', 'Step 6 of 6 • Trip Review & Final Confirmation')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
            {t('step.review.title', { destination }, `Review Your ${destination} Trip`)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {origin} → {destination} • {departureDate} to {returnDate} • {travellers} {t('common.travellers_count', { count: travellers }, travellers > 1 ? 'Travellers' : 'Traveller')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevStep}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('step.review.back_itinerary', '← Back to Itinerary')}
          </button>

          <button
            type="button"
            onClick={() => setCheckoutModalOpen(true)}
            className="btn-primary text-xs sm:text-sm !py-2.5 px-6 font-bold shadow-md flex items-center gap-2"
          >
            <span>{t('step.review.proceed_payment', 'Review & Book Trip')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Budget Allocation Meter */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0B1220]">{t('step.review.budget_allocation', 'Trip Budget Allocation')}</h3>
              <p className="text-[11px] text-slate-400">{t('step.review.budget_desc', 'Total estimated expenses vs your target budget')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('common.target_budget', 'Target Budget')}</span>
              <CurrencyDisplay amount={budget} className="font-bold text-slate-700" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('common.estimated_total', 'Estimated Total')}</span>
              <CurrencyDisplay amount={estimatedTotal} className="font-black text-[#0B1220]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('common.remaining', 'Remaining')}</span>
              <span className={`font-black ${remainingBudget >= 0 ? 'text-[#158A6A]' : 'text-rose-600'}`}>
                {remainingBudget >= 0 ? '+' : '-'}₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Multi-Modal Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
            {travelTotal > 0 && (
              <div
                style={{ width: `${Math.min(100, (travelTotal / budget) * 100)}%` }}
                className="h-full bg-blue-600"
                title={`${t('sidebar.getting_there', 'Getting There')}: ₹${travelTotal}`}
              />
            )}
            {stayTotal > 0 && (
              <div
                style={{ width: `${Math.min(100, (stayTotal / budget) * 100)}%` }}
                className="h-full bg-[#0B1220]"
                title={`${t('sidebar.where_stay', 'Where to Stay')}: ₹${stayTotal}`}
              />
            )}
            {mobilityTotal > 0 && (
              <div
                style={{ width: `${Math.min(100, (mobilityTotal / budget) * 100)}%` }}
                className="h-full bg-emerald-500"
                title={`${t('sidebar.getting_around', 'Getting Around')}: ₹${mobilityTotal}`}
              />
            )}
            {activitiesTotal > 0 && (
              <div
                style={{ width: `${Math.min(100, (activitiesTotal / budget) * 100)}%` }}
                className="h-full bg-[#C8A96B]"
                title={`${t('sidebar.activities', 'Activities')}: ₹${activitiesTotal}`}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> {t('sidebar.getting_there', 'Getting There')} (₹{travelTotal.toLocaleString('en-IN')})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0B1220] inline-block" /> {t('sidebar.where_stay', 'Where to Stay')} (₹{stayTotal.toLocaleString('en-IN')})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {t('sidebar.getting_around', 'Getting Around')} (₹{mobilityTotal.toLocaleString('en-IN')})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C8A96B] inline-block" /> {t('sidebar.activities', 'Activities')} (₹{activitiesTotal.toLocaleString('en-IN')})</span>
          </div>
        </div>
      </div>

      {/* Itemized Components List */}
      <div className="space-y-4">
        {/* 1. GETTING THERE */}
        <div className="surface-card p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              {getTravelIcon(selectedTravel?.mode)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Getting There {selectedTravel ? `(${selectedTravel.mode.toUpperCase()})` : ''}
                </span>
                {selectedTravel ? (
                  <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    Selected ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                    Skipped / Not Selected
                  </span>
                )}
              </div>
              <h4 className="font-bold text-base text-[#0B1220] mt-0.5">
                {selectedTravel ? `${selectedTravel.title}` : `No Intercity Travel Selected`}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedTravel
                  ? `${selectedTravel.operator} • ${selectedTravel.departureTime} → ${selectedTravel.arrivalTime} (${selectedTravel.duration})`
                  : `${origin} → ${destination} • Manage own transportation`}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <CurrencyDisplay amount={travelTotal} className="text-base font-black text-[#0B1220]" />
              <span className="text-[10px] text-slate-400 block">{selectedTravel ? 'Total travel cost' : '₹0'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStep('travel')}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change</span>
              </button>
              {selectedTravel && (
                <button
                  type="button"
                  onClick={removeTravel}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Remove intercity travel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. WHERE TO STAY */}
        <div className="surface-card p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B1220] flex items-center justify-center flex-shrink-0 mt-0.5">
              {getStayIcon(selectedStay?.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Where to Stay {selectedStay ? `(${selectedStay.type.toUpperCase()})` : ''}
                </span>
                {selectedStay ? (
                  <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    Selected ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                    Skipped / Not Selected
                  </span>
                )}
              </div>
              <h4 className="font-bold text-base text-[#0B1220] mt-0.5">
                {selectedStay ? selectedStay.name : 'No Stay Selected'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedStay
                  ? `${selectedStay.selectedRoomName || selectedStay.type} • ${tripNights} Nights (${departureDate} – ${returnDate})`
                  : 'Staying with friends / family or self-arranged'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <CurrencyDisplay amount={stayTotal} className="text-base font-black text-[#0B1220]" />
              <span className="text-[10px] text-slate-400 block">{selectedStay ? `${tripNights} nights total` : '₹0'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStep('stays')}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change</span>
              </button>
              {selectedStay && (
                <button
                  type="button"
                  onClick={removeStay}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Remove stay selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. GETTING AROUND */}
        <div className="surface-card p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#158A6A] flex items-center justify-center flex-shrink-0 mt-0.5">
              {getMobilityIcon(selectedMobility?.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Getting Around {selectedMobility ? `(${selectedMobility.type.replace('_', ' ').toUpperCase()})` : ''}
                </span>
                {selectedMobility ? (
                  <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    Selected ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                    Skipped / Not Selected
                  </span>
                )}
              </div>
              <h4 className="font-bold text-base text-[#0B1220] mt-0.5">
                {selectedMobility ? selectedMobility.title : 'No Local Transport Selected'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedMobility
                  ? `${selectedMobility.vehicleModel} • ${tripNights} Days Local Mobility`
                  : 'Walking / self-hailing on arrival'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-left sm:text-right">
              <CurrencyDisplay amount={mobilityTotal} className="text-base font-black text-[#0B1220]" />
              <span className="text-[10px] text-slate-400 block">{selectedMobility ? 'Full trip mobility' : '₹0'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStep('local_transport')}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>Change</span>
              </button>
              {selectedMobility && (
                <button
                  type="button"
                  onClick={removeMobility}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                  title="Remove local transport"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. ACTIVITIES */}
        <div className="surface-card p-5 rounded-2xl bg-white border border-slate-200/90 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C8A96B] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experiences & Tours</span>
                  {selectedActivities.length > 0 ? (
                    <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                      {selectedActivities.length} Added ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.2 rounded">
                      0 Activities Added
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-base text-[#0B1220] mt-0.5">
                  {selectedActivities.length > 0
                    ? `${selectedActivities.length} Activities Booked`
                    : 'No Activities Added'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedActivities.length > 0
                    ? `For ${travellers} travellers in ${destination}`
                    : 'Watersports, sunset cruises, food & nightlife'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              <div className="text-left sm:text-right">
                <CurrencyDisplay amount={activitiesTotal} className="text-base font-black text-[#0B1220]" />
                <span className="text-[10px] text-slate-400 block">{selectedActivities.length} items</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('activities')}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>{selectedActivities.length > 0 ? 'Edit / Add' : 'Explore'}</span>
              </button>
            </div>
          </div>

          {/* Itemized activity list with individual removals */}
          {selectedActivities.length > 0 && (
            <div className="mt-2 pt-3 border-t border-slate-100 space-y-2">
              {selectedActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B]" />
                    <span className="font-bold text-slate-800">{act.name}</span>
                    <span className="text-slate-400 text-[11px]">({act.duration})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CurrencyDisplay amount={act.price * travellers} className="font-bold text-slate-900" />
                    <button
                      type="button"
                      onClick={() => removeActivity(act.id)}
                      className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                      title={`Remove ${act.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Budget Health & Pre-checkout Review */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        budget > 0 && remainingBudget < 0
          ? 'bg-rose-50/80 border-rose-300'
          : budget > 0
          ? 'bg-emerald-50/80 border-emerald-200'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
            budget > 0 && remainingBudget < 0
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                BUDGET HEALTH CHECK
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.2 rounded ${
                budget > 0 && remainingBudget < 0
                  ? 'bg-rose-200 text-rose-900'
                  : 'bg-emerald-200 text-emerald-900'
              }`}>
                {budget > 0 && remainingBudget < 0 ? 'Exceeds Target' : 'Within Target ✓'}
              </span>
            </div>
            <p className="text-xs font-bold text-[#0B1220] mt-0.5">
              Target Budget: <CurrencyDisplay amount={budget} /> • Planned Total: <CurrencyDisplay amount={estimatedTotal} />
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {budget > 0 && remainingBudget < 0
                ? `This trip exceeds your budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}. You can optimize to lower flight/hotel costs.`
                : `You have ₹${Math.max(0, remainingBudget).toLocaleString('en-IN')} headroom remaining for shopping and dining.`}
            </p>
          </div>
        </div>

        {budget > 0 && remainingBudget < 0 && (
          <a
            href="/budget"
            className="btn-primary text-xs !py-2 px-4 font-bold rounded-xl whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>⚡ Optimize Budget</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Grand Total & Final CTA */}
      <div className="p-6 rounded-3xl bg-[#0B1220] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-luxury">
        <div>
          <span className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider block">Grand Total Estimation</span>

          <div className="flex items-baseline gap-2 mt-1">
            <CurrencyDisplay amount={estimatedTotal} className="text-3xl font-black text-white" />
            <span className="text-xs text-slate-400">incl. 5% GST (₹{taxes.toLocaleString('en-IN')})</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Flexible cancellation • Verified operators • 24/7 Priority Travel Desk
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCheckoutModalOpen(true)}
          className="btn-primary-blue text-sm !py-3.5 px-8 font-bold rounded-xl shadow-lg flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          <span>REVIEW & BOOK TRIP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <TripBuilderCheckoutModal onClose={() => setCheckoutModalOpen(false)} />
      )}
    </div>
  );
};
