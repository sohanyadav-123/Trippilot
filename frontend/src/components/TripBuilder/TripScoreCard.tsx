import React, { useState } from 'react';
import {
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useTripBuilder, TripStep } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const TripScoreCard: React.FC = () => {
  const { t } = useTravelSettings();
  const { tripScore, setStep, remainingBudget, detectedConflicts } = useTripBuilder();
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (val >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getBarColor = (val: number) => {
    if (val >= 85) return 'bg-emerald-500';
    if (val >= 70) return 'bg-blue-500';
    if (val >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const scoreItems = [
    {
      label: t('score.factor.budget', 'Budget Fit'),
      weight: '35%',
      value: tripScore.budgetFit,
      desc: remainingBudget < 0 ? t('score.budget_over', 'Over budget target') : t('score.budget_ok', 'Within budget'),
      action: remainingBudget < 0 ? () => setStep('review' as TripStep) : undefined,
      actionLabel: t('score.fix_budget', 'Fix Budget'),
    },
    {
      label: t('score.factor.convenience', 'Convenience'),
      weight: '25%',
      value: tripScore.convenience,
      desc: t('score.convenience_desc', 'Travel & stay alignment'),
      action: () => setStep('travel' as TripStep),
      actionLabel: t('action.edit', 'Review'),
    },
    {
      label: t('score.factor.weather', 'Weather Fit'),
      weight: '20%',
      value: tripScore.weatherFit,
      desc: detectedConflicts.length > 0 ? t('score.weather_conflicts', { count: detectedConflicts.length }, `${detectedConflicts.length} weather conflict`) : t('score.weather_optimal', 'Optimal forecast'),
      action: detectedConflicts.length > 0 ? () => setStep('itinerary' as TripStep) : undefined,
      actionLabel: t('score.view_advisory', 'View Advisory'),
    },
    {
      label: t('score.factor.interests', 'Interests'),
      weight: '20%',
      value: tripScore.interestMatch,
      desc: t('score.interests_desc', 'Style & activity match'),
      action: () => setStep('activities' as TripStep),
      actionLabel: t('score.add_activities', 'Add Activities'),
    },
  ];

  return (
    <div className="surface-card p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1220] text-[#C8A96B] flex items-center justify-center font-black text-xl shadow-xs border border-[#C8A96B]/20">
            {tripScore.total}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#0B1220] tracking-tight">{t('score.title', 'TRIPPILOT QUALITY SCORE')}</h4>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getScoreColor(
                  tripScore.total
                )}`}
              >
                {tripScore.total >= 85
                  ? t('score.excellent', '🌟 Excellent Plan')
                  : tripScore.total >= 70
                  ? t('score.good', '👍 Good Plan')
                  : t('score.needs_opt', '⚠️ Needs Optimization')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('score.subtitle', 'Explainable AI score calculated across 4 weighted trip dimensions')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
        >
          <span>{expanded ? t('score.hide_factors', 'Hide Details') : t('score.why_score', 'Why this score?')}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Category breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
        {scoreItems.map((item) => (
          <div
            key={item.label}
            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold">{item.weight}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-black text-slate-900 text-sm">{item.value}/100</span>
              <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{item.desc}</span>
            </div>

            {/* Score Mini-Bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.value)}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded explanation */}
      {expanded && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
              Explainable Dimension Breakdown:
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Weighted Formula</span>
          </div>

          <div className="space-y-2">
            {tripScore.explanation.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Score recalculates dynamically with every itinerary and booking change.</span>
          </div>
        </div>
      )}
    </div>
  );
};
