import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Edit2,
  Users,
  Sparkles,
  Info,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { formatCurrencyAmount } from '../../utils/currencyUtils';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const BudgetOverviewCard: React.FC = () => {
  const {
    destination,
    budget,
    plannedCost,
    actualSpent,
    remainingBudget,
    budgetStatus,
    budgetUsedPercentage,
    budgetRemainingPercentage,
    travellers,
    baseCurrency,
    setBudget,
  } = useTripBuilder();
  const { t } = useTravelSettings();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(budget);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempBudget >= 0) {
      setBudget(tempBudget);
      setIsEditingBudget(false);
    }
  };

  const perPersonBudget = travellers > 0 && budget > 0 ? Math.round(budget / travellers) : 0;
  const perPersonPlanned = travellers > 0 ? Math.round(plannedCost / travellers) : 0;

  // Actual vs Planned progress percentages relative to total budget
  const plannedProgressPct = budget > 0 ? Math.min(100, Math.round((plannedCost / budget) * 100)) : 0;
  const actualProgressPct = budget > 0 ? Math.min(100, Math.round((actualSpent / budget) * 100)) : 0;

  const getStatusBadge = () => {
    switch (budgetStatus) {
      case 'over_budget':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{t('budget.status_over', 'OVER BUDGET')} (+₹{Math.abs(remainingBudget).toLocaleString('en-IN')})</span>
          </span>
        );
      case 'near_limit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('budget.status_near', 'NEAR LIMIT')} ({budgetUsedPercentage}% {t('budget.used', 'Used')})</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('budget.status_within', 'WITHIN BUDGET')} ({budgetRemainingPercentage}% {t('budget.left', 'Left')})</span>
          </span>
        );
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-luxury space-y-6">
      {/* Top Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C8A96B]">
              {t('budget.kpi_banner', 'TRIP FINANCIAL INTELLIGENCE')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-slate-500">{destination || t('budget.custom', 'Custom')} {t('budget.trip', 'Trip')}</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B1220] tracking-tight">
            {t('budget.dashboard_title', 'Trip Budget & Money Dashboard')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <button
            type="button"
            onClick={() => {
              setTempBudget(budget);
              setIsEditingBudget(!isEditingBudget);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0B1220] bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={t('budget.edit_target_tooltip', 'Edit Total Target Budget')}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('budget.adjust_target', 'Adjust Target')}</span>
          </button>
        </div>
      </div>

      {/* Target Budget Editor Modal/Bar */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudget} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-3 animate-fade-in">
          <label className="text-xs font-bold text-slate-700">{t('budget.update_target_label', 'Update Trip Target Budget')} ({baseCurrency}):</label>
          <input
            type="number"
            min={0}
            step={500}
            value={tempBudget || ''}
            onChange={(e) => setTempBudget(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold font-mono focus:ring-2 focus:ring-[#0B1220]"
          />
          <button type="submit" className="btn-primary text-xs !py-1.5 px-4 font-bold rounded-xl">
            {t('budget.save_target', 'Save Target')}
          </button>
          <button
            type="button"
            onClick={() => setIsEditingBudget(false)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5"
          >
            {t('action.cancel', 'Cancel')}
          </button>
        </form>
      )}

      {/* Primary KPI Grid (4 Pillars: Total Budget, Planned Cost, Actual Spent, Remaining) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Target Budget */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('budget.total_trip_budget', 'TOTAL TRIP BUDGET')}</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#0B1220]">
            <CurrencyDisplay amount={budget} currency={baseCurrency} />
          </div>
          {travellers > 1 && (
            <p className="text-[10.5px] text-slate-400 font-medium">
              ≈ ₹{perPersonBudget.toLocaleString('en-IN')} / {t('budget.per_person', 'person')} ({travellers} {t('builder.travellers', 'travellers')})
            </p>
          )}
        </div>

        {/* 2. Planned Cost */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-1">
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('budget.planned_reserved', 'PLANNED (RESERVED)')}</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-950">
            <CurrencyDisplay amount={plannedCost} currency={baseCurrency} />
          </div>
          <p className="text-[10.5px] text-indigo-700/80 font-semibold">
            {budgetUsedPercentage}% {t('budget.of_target', 'of target')} ({travellers > 1 ? `₹${perPersonPlanned.toLocaleString('en-IN')}/${t('budget.pax', 'pax')}` : t('budget.draft_selections', 'Draft Selections')})
          </p>
        </div>

        {/* 3. Actual Spent */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">{t('budget.actual_spent', 'ACTUAL SPENT')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950">
            <CurrencyDisplay amount={actualSpent} currency={baseCurrency} />
          </div>
          <p className="text-[10.5px] text-emerald-700/80 font-semibold">
            {budget > 0 ? `${Math.round((actualSpent / budget) * 100)}% ${t('budget.confirmed_payments', 'Confirmed Payments')}` : t('budget.logged_expenses', 'Logged Expenses')}
          </p>
        </div>

        {/* 4. Remaining Budget */}
        <div className={`p-4 sm:p-5 rounded-2xl border space-y-1 ${
          remainingBudget >= 0
            ? 'bg-emerald-50/40 border-emerald-200/70'
            : 'bg-rose-50/70 border-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              remainingBudget >= 0 ? 'text-emerald-800' : 'text-rose-700'
            }`}>
              {remainingBudget >= 0 ? t('budget.remaining_budget', 'REMAINING BUDGET') : t('budget.budget_overrun', 'BUDGET OVERRUN')}
            </span>
            {remainingBudget >= 0 ? (
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className={`text-xl sm:text-2xl font-black ${
            remainingBudget >= 0 ? 'text-[#158A6A]' : 'text-rose-600'
          }`}>
            {remainingBudget >= 0 ? '+' : '-'}₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
          </div>
          <p className={`text-[10.5px] font-semibold ${
            remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            {remainingBudget >= 0 ? `${budgetRemainingPercentage}% ${t('budget.available_headroom', 'Available headroom')}` : t('budget.exceeds_target', 'Exceeds target limit')}
          </p>
        </div>
      </div>

      {/* Dual-Track Visual Progress Bar */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
              <span>{t('budget.planned_selections', 'Planned Selections:')} <CurrencyDisplay amount={plannedCost} /> ({plannedProgressPct}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
              <span>{t('budget.actual_spent_label', 'Actual Spent:')} <CurrencyDisplay amount={actualSpent} /> ({actualProgressPct}%)</span>
            </span>
          </div>
          <span className="text-slate-500">{t('budget.target_label', 'Target:')} <CurrencyDisplay amount={budget} /></span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
          {/* Planned Track */}
          <div
            className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
              plannedCost > budget ? 'bg-rose-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, (plannedCost / (budget || 1)) * 100)}%` }}
          />
          {/* Actual Spent Overlay Strip */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-emerald-400/90 transition-all duration-500 border-r-2 border-white"
            style={{ width: `${Math.min(100, (actualSpent / (budget || 1)) * 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>₹0</span>
          <span>50% (₹{(budget / 2).toLocaleString('en-IN')})</span>
          <span>100% (₹{budget.toLocaleString('en-IN')})</span>
        </div>
      </div>

      {/* Dynamic AI Budget Insights */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{t('budget.insights_title', 'TripPilot Budget Insights')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950 font-medium">
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span>
              {plannedCost > budget
                ? `You are ₹${Math.abs(remainingBudget).toLocaleString('en-IN')} over target. Use the Optimizer below to recover savings.`
                : `Your planned spend is comfortably ₹${remainingBudget.toLocaleString('en-IN')} below your maximum target.`}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span>
              Actual confirmed spending stands at {formatCurrencyAmount(actualSpent, baseCurrency)} ({Math.round((actualSpent / (budget || 1)) * 100)}% of total).
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
