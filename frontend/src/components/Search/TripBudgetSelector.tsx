import React, { useState, useEffect } from 'react';
import { Wallet, X, Check, Sparkles } from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';

interface TripBudgetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  budget: number | null;
  onBudgetChange: (val: number | null) => void;
  totalPassengers: number;
}

const PRESET_BUDGETS = [10000, 25000, 40000, 50000, 75000, 100000];

export const TripBudgetSelector: React.FC<TripBudgetSelectorProps> = ({
  isOpen,
  onClose,
  budget,
  onBudgetChange,
  totalPassengers,
}) => {
  const { t } = useTravelSettings();
  if (!isOpen) return null;

  const [mode, setMode] = useState<'total' | 'per_person'>('total');
  const [inputValue, setInputValue] = useState<string>(budget ? String(budget) : '');
  const [perPersonValue, setPerPersonValue] = useState<string>(
    budget ? String(Math.round(budget / Math.max(1, totalPassengers))) : ''
  );

  useEffect(() => {
    if (budget) {
      setInputValue(String(budget));
      setPerPersonValue(String(Math.round(budget / Math.max(1, totalPassengers))));
    } else {
      setInputValue('');
      setPerPersonValue('');
    }
  }, [budget, totalPassengers]);

  const handleTotalChange = (valStr: string) => {
    const numeric = parseInt(valStr.replace(/\D/g, ''), 10);
    setInputValue(valStr);
    if (!isNaN(numeric) && numeric > 0) {
      setPerPersonValue(String(Math.round(numeric / Math.max(1, totalPassengers))));
    } else {
      setPerPersonValue('');
    }
  };

  const handlePerPersonChange = (valStr: string) => {
    const numeric = parseInt(valStr.replace(/\D/g, ''), 10);
    setPerPersonValue(valStr);
    if (!isNaN(numeric) && numeric > 0) {
      setInputValue(String(numeric * Math.max(1, totalPassengers)));
    } else {
      setInputValue('');
    }
  };

  const handleSelectPreset = (amount: number) => {
    if (mode === 'total') {
      setInputValue(String(amount));
      setPerPersonValue(String(Math.round(amount / Math.max(1, totalPassengers))));
    } else {
      setPerPersonValue(String(amount));
      setInputValue(String(amount * Math.max(1, totalPassengers)));
    }
  };

  const handleApply = () => {
    const finalAmount = parseInt(inputValue.replace(/\D/g, ''), 10);
    if (!isNaN(finalAmount) && finalAmount > 0) {
      onBudgetChange(finalAmount);
    } else {
      onBudgetChange(null);
    }
    onClose();
  };

  const handleClear = () => {
    setInputValue('');
    setPerPersonValue('');
    onBudgetChange(null);
    onClose();
  };

  const currentTotal = parseInt(inputValue.replace(/\D/g, ''), 10) || 0;
  const currentPerPerson = parseInt(perPersonValue.replace(/\D/g, ''), 10) || 0;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 z-50 animate-dropdown space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('budget.selector_title', 'Target Trip Budget')}
            </h4>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {t('budget.selector_subtitle', 'Optional AI Constraint')}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Selector: Total Trip vs Per-Person */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl">
        <button
          type="button"
          onClick={() => setMode('total')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'total'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('search.trip_budget', 'Total Trip Budget')}
        </button>
        <button
          type="button"
          onClick={() => setMode('per_person')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            mode === 'per_person'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>{t('search.per_person', 'Per-Person')}</span>
          <span className="text-[10px] text-slate-400 font-mono">({totalPassengers}pax)</span>
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-600 block">
          {mode === 'total'
            ? t('budget.enter_total', 'Enter Total Budget for Entire Trip:')
            : t('budget.enter_per_traveller', { count: totalPassengers }, `Enter Budget per Traveller (${totalPassengers} pax):`)}
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-sm font-bold text-slate-400">₹</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder={mode === 'total' ? 'e.g. 40,000' : 'e.g. 20,000'}
            value={mode === 'total' ? inputValue : perPersonValue}
            onChange={(e) =>
              mode === 'total' ? handleTotalChange(e.target.value) : handlePerPersonChange(e.target.value)
            }
            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
          />
        </div>

        {/* Dynamic Multiplier Hint when in per-person mode */}
        {mode === 'per_person' && currentPerPerson > 0 && (
          <p className="text-[11px] text-blue-700 bg-blue-50 border border-blue-200/60 p-2 rounded-xl flex items-center justify-between">
            <span>₹{currentPerPerson.toLocaleString('en-IN')} × {totalPassengers} {t('builder.travellers_label', 'travellers')}</span>
            <span className="font-bold">= ₹{(currentPerPerson * totalPassengers).toLocaleString('en-IN')} {t('step.travel.total_fare', 'Total')}</span>
          </p>
        )}
      </div>

      {/* Quick Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          {t('budget.preset_amounts', 'Quick Preset Amounts')}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESET_BUDGETS.map((amt) => {
            const isSelected = mode === 'total' ? currentTotal === amt : currentPerPerson === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleSelectPreset(amt)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  isSelected
                    ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optimization Footnote */}
      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="leading-tight">
          {t('budget.ai_footnote', 'TripPilot will orchestrate flights, stays, mobility, and tours to comfortably fit this target.')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
        >
          {t('budget.clear', 'Clear Budget')}
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="btn-primary text-xs !py-2 px-5 font-bold shadow-xs flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{t('action.apply', 'Apply Budget')}</span>
        </button>
      </div>
    </div>
  );
};
