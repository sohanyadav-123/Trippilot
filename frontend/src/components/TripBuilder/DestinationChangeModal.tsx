import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, Trash2, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';

interface DestinationChangeModalProps {
  isOpen: boolean;
  newDestination: string;
  pendingParams?: {
    origin?: string;
    departureDate?: string;
    returnDate?: string;
    travellers?: number;
    budget?: number;
  };
  onClose: () => void;
  onConfirm: () => void;
}

export const DestinationChangeModal: React.FC<DestinationChangeModalProps> = ({
  isOpen,
  newDestination,
  pendingParams,
  onClose,
  onConfirm,
}) => {
  const { t } = useTravelSettings();
  const {
    destination,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    customItinerary,
    origin,
    departureDate,
    returnDate,
    travellers,
    budget,
  } = useTripBuilder();

  const [showReviewDetails, setShowReviewDetails] = useState(false);

  if (!isOpen) return null;

  // Compute what will be removed
  const itemsToBeRemoved: string[] = [];
  if (selectedStay) itemsToBeRemoved.push(`${selectedStay.name} (${selectedStay.type}) in ${destination}`);
  if (selectedMobility) itemsToBeRemoved.push(`${selectedMobility.title} (${destination} local transport)`);
  if (selectedActivities.length > 0) {
    itemsToBeRemoved.push(...selectedActivities.map((a) => `${a.name} (${destination})`));
  }
  if (selectedTravel && selectedTravel.destination === destination) {
    itemsToBeRemoved.push(`${selectedTravel.operator} travel to ${destination}`);
  }
  const customEvents = customItinerary.filter((e) => e.type === 'custom' || e.type === 'dining');
  if (customEvents.length > 0) {
    itemsToBeRemoved.push(`${customEvents.length} destination itinerary events`);
  }

  // Items to be kept
  const itemsToBeKept: string[] = [
    `Origin: ${pendingParams?.origin || origin}`,
    `Dates: ${pendingParams?.departureDate || departureDate} to ${pendingParams?.returnDate || returnDate}`,
    `Travellers: ${pendingParams?.travellers || travellers} Guests`,
    `Budget: ₹${(pendingParams?.budget || budget || 0).toLocaleString('en-IN')}`,
    'Trip style, purpose & saved preferences',
    'User account, wishlist & confirmed booking history',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-luxury border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#0B1220]">{t('modal.dest_change.title', 'CHANGE DESTINATION?')}</h3>
              <p className="text-xs text-slate-500">
                {t('modal.dest_change.switching', { origin: destination, destination: newDestination }, `Switching from ${destination} to ${newDestination}`)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {!showReviewDetails ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-2">
              <p className="font-medium leading-relaxed">
                {t('modal.dest_change.active_warning', { destination }, `You currently have active selections associated with ${destination}.`)}
              </p>
              <p className="text-[11.5px] text-amber-900 leading-relaxed">
                {t('modal.dest_change.desc_safe', 'Changing your destination will safely clear destination-specific stays, local mobility, and activities so that your Review & Book step never contains invalid or stale bookings.')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[11px] block">{t('modal.dest_change.items_title', 'Destination-specific items')}</span>
                <span className="font-bold text-slate-800 text-sm">
                  {itemsToBeRemoved.length > 0 ? t('modal.dest_change.items_to_update', { count: itemsToBeRemoved.length }, `${itemsToBeRemoved.length} items will be updated`) : t('modal.dest_change.no_items', 'No destination-specific items')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewDetails(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                {t('modal.dest_change.review_btn', 'Review Changes →')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs max-h-[360px] overflow-y-auto pr-1">
            {/* WILL BE REMOVED */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('modal.dest_change.will_remove', { count: itemsToBeRemoved.length }, `WILL BE REMOVED (${itemsToBeRemoved.length})`)}</span>
              </span>
              {itemsToBeRemoved.length > 0 ? (
                <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
                  {itemsToBeRemoved.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-rose-900 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic pl-1">{t('modal.dest_change.no_items_remove', 'No items to remove.')}</p>
              )}
            </div>

            {/* WILL BE KEPT */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#158A6A] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('modal.dest_change.will_keep', 'WILL BE KEPT')}</span>
              </span>
              <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                {itemsToBeKept.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-emerald-950 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#158A6A]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {showReviewDetails ? (
            <button
              type="button"
              onClick={() => setShowReviewDetails(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              {t('action.back', '← Back')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2.5 px-4 font-semibold rounded-xl"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          )}

          <div className="flex items-center gap-2">
            {!showReviewDetails && (
              <button
                type="button"
                onClick={() => setShowReviewDetails(true)}
                className="btn-secondary text-xs py-2.5 px-4 font-semibold rounded-xl"
              >
                {t('modal.dest_change.review_btn_short', 'Review Changes')}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>{t('modal.dest_change.confirm_btn', 'Confirm Destination Change')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
