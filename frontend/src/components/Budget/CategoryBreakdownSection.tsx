import React from 'react';
import {
  Plane,
  Building2,
  Car,
  Compass,
  Utensils,
  ShoppingBag,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { CategorySpendItem } from '../../types';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const CategoryBreakdownSection: React.FC = () => {
  const { categorySpendBreakdown, baseCurrency, budget } = useTripBuilder();
  const { t } = useTravelSettings();

  const getCategoryIcon = (cat: CategorySpendItem['category']) => {
    switch (cat) {
      case 'flights':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'hotels':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'local_transport':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'activities':
        return <Compass className="w-4 h-4 text-purple-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const totalPlannedSum = categorySpendBreakdown.reduce((sum, c) => sum + c.planned, 0);

  return (
    <div className="surface-card p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3 h-3 text-slate-500" />
            <span>{t('budget.category_breakdown_pill', 'CATEGORY-BY-CATEGORY BREAKDOWN')}</span>
          </div>
          <h3 className="font-bold text-lg text-[#0B1220] tracking-tight">
            {t('budget.allocation_title', 'Planned vs Actual Spend Allocation')}
          </h3>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {t('budget.total_planned', 'Total Planned:')} <CurrencyDisplay amount={totalPlannedSum} currency={baseCurrency} className="font-black text-slate-800" />
        </p>
      </div>

      {/* Grid of Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categorySpendBreakdown.map((item) => {
          const plannedPctOfBudget = budget > 0 ? Math.round((item.planned / budget) * 100) : 0;
          const actualPctOfPlanned = item.planned > 0 ? Math.min(100, Math.round((item.actual / item.planned) * 100)) : 0;

          return (
            <div
              key={item.category}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:border-slate-300 transition-all space-y-3"
            >
              {/* Category Title & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {plannedPctOfBudget}{t('budget.of_trip_budget', '% of trip budget')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block">
                    <CurrencyDisplay amount={item.planned} currency={baseCurrency} />
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{t('budget.planned', 'Planned')}</span>
                </div>
              </div>

              {/* Progress bar (Actual vs Planned) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-slate-500 font-medium">
                    {t('budget.actual_spent_label', 'Actual Spent:')} <strong className="text-emerald-700">₹{item.actual.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-slate-400">
                    {actualPctOfPlanned}{t('budget.confirmed', '% confirmed')}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${actualPctOfPlanned}%` }}
                  />
                </div>
              </div>

              {/* Headroom / Remaining info */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{t('budget.reserved_buffer', 'Reserved Buffer')}</span>
                <span className={`font-bold ${item.remaining > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                  {item.remaining > 0 ? `₹${item.remaining.toLocaleString('en-IN')} ${t('budget.unspent', 'unspent')}` : t('budget.fully_allocated', 'Fully allocated')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
