import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building2,
  Plane,
  Layers,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface BudgetSwap {
  id: string;
  category: 'hotel' | 'flight' | 'activity';
  currentTitle: string;
  currentCost: number;
  recommendedTitle: string;
  recommendedCost: number;
  savings: number;
  reasoning: string;
}

interface BudgetOptimizerCardProps {
  totalBudget?: number;
  onApplySwap?: (swap: BudgetSwap) => void;
}

export const BudgetOptimizerCard: React.FC<BudgetOptimizerCardProps> = ({
  totalBudget = 40000,
  onApplySwap,
}) => {
  const [swaps, setSwaps] = useState<BudgetSwap[]>([
    {
      id: 'swap-1',
      category: 'hotel',
      currentTitle: '5★ Luxury Beach Villa (₹18,500 for 3 Nights)',
      currentCost: 18500,
      recommendedTitle: 'Heritage Boutique Resort & Spa (₹14,000 for 3 Nights)',
      recommendedCost: 14000,
      savings: 4500,
      reasoning: 'Same 4.8★ guest rating and beachfront location with complimentary breakfast included.',
    },
    {
      id: 'swap-2',
      category: 'flight',
      currentTitle: 'Peak Evening Indigo Flight (₹6,200/person)',
      currentCost: 12400,
      recommendedTitle: 'Early Morning Non-stop Flight 06:15 AM (₹4,600/person)',
      recommendedCost: 9200,
      savings: 3200,
      reasoning: 'Depart 2.5 hours earlier and unlock early check-in at the resort with free airport cab.',
    },
  ]);

  const [appliedSwaps, setAppliedSwaps] = useState<string[]>([]);

  const handleApply = (swap: BudgetSwap) => {
    setAppliedSwaps((prev) => [...prev, swap.id]);
    if (onApplySwap) {
      onApplySwap(swap);
    }
  };

  const totalEstimatedSavings = swaps
    .filter((s) => !appliedSwaps.includes(s.id))
    .reduce((acc, s) => acc + s.savings, 0);

  return (
    <div className="surface-card p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <TrendingDown className="w-3 h-3 text-emerald-600" />
            <span>AI BUDGET OPTIMIZER & SMART SWAPS</span>
          </div>
          <h3 className="text-base font-black text-slate-900">
            Intelligent Cost Reduction Engine
          </h3>
        </div>

        {totalEstimatedSavings > 0 && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Potential Estimated Savings: <CurrencyDisplay amount={totalEstimatedSavings} className="font-black text-emerald-700" />
          </span>
        )}
      </div>

      {/* Rationale Overview */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
          <span>Current Budget Utilization:</span>
          <span><CurrencyDisplay amount={totalBudget} /> Target</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Our algorithm identified that Stays and Peak Flight slots account for <strong>74%</strong> of your total budget. Switching to the vetted alternatives below lowers your overall spend without degrading quality.
        </p>
      </div>

      {/* Actionable Swaps List */}
      <div className="space-y-3">
        {swaps.map((swap) => {
          const isApplied = appliedSwaps.includes(swap.id);
          const Icon = swap.category === 'hotel' ? Building2 : Plane;

          return (
            <div
              key={swap.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                isApplied
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{swap.recommendedTitle}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                        Save <CurrencyDisplay amount={swap.savings} className="font-bold" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{swap.reasoning}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApply(swap)}
                  disabled={isApplied}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-auto whitespace-nowrap ${
                    isApplied
                      ? 'bg-emerald-600 text-white'
                      : 'btn-primary'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Swapped in Trip
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Apply Alternative
                    </>
                  )}
                </button>
              </div>

              {/* Comparison Row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="line-through">Original: {swap.currentTitle}</span>
                <span className="font-bold text-slate-900">
                  New: <CurrencyDisplay amount={swap.recommendedCost} className="font-bold text-blue-600" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span>Estimated savings calculated against standard published seasonal averages.</span>
      </div>
    </div>
  );
};
