import React, { useState } from 'react';
import {
  TrendingDown,
  Sparkles,
  Building2,
  Plane,
  Compass,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { BudgetOptimizationRecommendation } from '../../types';

export const BudgetOptimizerSection: React.FC = () => {
  const {
    optimizationRecommendations,
    applyOptimizationRecommendation,
    revertOptimizationRecommendation,
    budget,
    plannedCost,
    remainingBudget,
    baseCurrency,
  } = useTripBuilder();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const unapplied = optimizationRecommendations.filter((r) => !r.applied);
  const applied = optimizationRecommendations.filter((r) => r.applied);
  const potentialSavings = unapplied.reduce((sum, r) => sum + r.savings, 0);
  const achievedSavings = applied.reduce((sum, r) => sum + r.savings, 0);

  const getCategoryIcon = (cat: BudgetOptimizationRecommendation['category']) => {
    switch (cat) {
      case 'hotel':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'flight':
        return <Plane className="w-4 h-4 text-blue-600" />;
      default:
        return <Compass className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-luxury space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI BUDGET OPTIMIZATION ENGINE</span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#0B1220] tracking-tight">
            Smart Swaps & Budget Optimizer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            TripPilot analyzed your selected flights, stays, and activities to find high-value alternatives with transparent trade-offs.
          </p>
        </div>

        {/* Savings Metric Header Badge */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {potentialSavings > 0 && (
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-right">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Potential Savings
              </span>
              <span className="text-base font-black text-emerald-800">
                +₹{potentialSavings.toLocaleString('en-IN')}
              </span>
            </div>
          )}
          {achievedSavings > 0 && (
            <div className="px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-right">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                Applied Savings
              </span>
              <span className="text-base font-black text-indigo-800">
                ₹{achievedSavings.toLocaleString('en-IN')} Saved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Complete Trip Optimization Summary Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0B1220] text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C8A96B] block">
              COMPLETE TRIP OPTIMIZATION SUMMARY
            </span>
            <h4 className="text-base font-bold text-white mt-0.5">
              Projected Trip Cost Comparison
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Current Total:</span>
              <span className="font-black text-base text-slate-200">
                <CurrencyDisplay amount={plannedCost} />
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C8A96B]" />
            <div>
              <span className="text-emerald-400 block text-[10px]">Optimized Total:</span>
              <span className="font-black text-base text-emerald-300">
                <CurrencyDisplay amount={Math.max(0, plannedCost - potentialSavings)} />
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Applying all vetted suggestions lowers your estimated spend by{' '}
          <strong className="text-emerald-300 font-bold">₹{potentialSavings.toLocaleString('en-IN')}</strong> while maintaining 94%+ trip convenience and 4.7★+ stay quality.
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {optimizationRecommendations.map((rec) => {
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl border transition-all ${
                rec.applied
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rec.category.toUpperCase()} SWAP
                      </span>
                      {rec.scoreImpact && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {rec.scoreImpact}
                        </span>
                      )}
                      {rec.applied && (
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Applied to Trip</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[#0B1220] mt-1">
                      {rec.recommendedTitle}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 line-through block">
                      ₹{rec.currentCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      ₹{rec.recommendedCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {rec.applied ? (
                    <button
                      type="button"
                      onClick={() => revertOptimizationRecommendation(rec.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revert</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => applyOptimizationRecommendation(rec.id)}
                      className="btn-primary text-xs !py-1.5 px-4 font-bold shadow-xs flex items-center gap-1 rounded-xl"
                    >
                      <span>✓ Apply Swap (Save ₹{rec.savings.toLocaleString('en-IN')})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpand(rec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    title="View Trade-offs and Details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Details & Trade-offs */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3 text-xs animate-fade-in">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700 block flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C8A96B]" />
                      <span>Why TripPilot recommends this swap:</span>
                    </span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {rec.reasoning}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 block">Transparent Trade-offs & Comparisons:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {rec.tradeoffs.map((t, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
