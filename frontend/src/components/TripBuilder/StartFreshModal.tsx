import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';

interface StartFreshModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StartFreshModal: React.FC<StartFreshModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTravelSettings();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-luxury border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{t('modal.start_fresh.title', 'Start Fresh?')}</h3>
              <p className="text-xs text-slate-500">{t('modal.start_fresh.desc', 'This will clear all selected travel, stays, and activities for this trip draft.')}</p>
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

        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
          <span className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>What happens when you start fresh:</span>
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-amber-900 pl-1 text-[11px]">
            <li>Selected flights, stays, transport & activities are cleared.</li>
            <li>Custom timeline & itinerary events will be reset.</li>
            <li>Your account, wishlist, and past confirmed bookings remain safe.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2.5 px-4 font-semibold rounded-xl"
          >
            {t('modal.start_fresh.cancel', 'Keep My Trip')}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('modal.start_fresh.confirm', 'Yes, Start Fresh')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
