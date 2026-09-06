import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Sparkles,
  Check,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Loader2,
  Building2,
  Lock,
  Compass,
  CheckCircle2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { adaptiveWeatherService } from '../../services/adaptiveWeatherService';
import { DayAdaptationProposal } from '../../types/adaptiveWeather';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface WeatherAdaptationReviewModalProps {
  dayNumber: number;
  destination: string;
  departureDate: string;
  onClose: () => void;
}

export const WeatherAdaptationReviewModal: React.FC<WeatherAdaptationReviewModalProps> = ({
  dayNumber,
  destination,
  departureDate,
  onClose,
}) => {
  const { t, travelMode } = useTravelSettings();
  const {
    customItinerary,
    applyDayAdaptation,
    selectedStay,
    budget = 30000,
  } = useTripBuilder();
  const dailyBudget = Math.round(budget / 5);

  // Progressive loading states: 0: Checking weather, 1: Analyzing, 2: Alternatives, 3: Preparing, 4: Ready
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [proposal, setProposal] = useState<DayAdaptationProposal | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Original activities for target day
  const originalDayEvents = customItinerary.filter((ev) => ev.day === dayNumber);

  useEffect(() => {
    let isCancelled = false;

    const runAdaptation = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      // Step 0: Checking weather
      setLoadingStep(0);
      await new Promise((r) => setTimeout(r, 350));
      if (isCancelled) return;

      // Step 1: Analyzing itinerary
      setLoadingStep(1);
      await new Promise((r) => setTimeout(r, 450));
      if (isCancelled) return;

      // Step 2: Finding safer alternatives
      setLoadingStep(2);

      const forecasts = adaptiveWeatherService.getDestinationForecast(destination, departureDate, 10);
      const dayForecast = forecasts.find((f) => f.dayNumber === dayNumber) || forecasts[0];

      try {
        const adapted = await adaptiveWeatherService.generateDayAdaptation({
          destination,
          affectedDayNumber: dayNumber,
          currentDayActivities: originalDayEvents.map((ev) => ({
            time: ev.time,
            activity: ev.title,
            description: ev.description,
            estimated_cost: ev.cost || 0,
            type: ev.type,
            is_booked: (ev as any).is_booked === true || (ev as any).isBooked === true,
          })),
          travelMode,
          weatherForecast: dayForecast,
          hotelLocation: selectedStay ? selectedStay.name : `Hotel in ${destination}`,
          dailyBudget: dailyBudget || 6000,
        });

        if (isCancelled) return;

        // Step 3: Preparing updated day
        setLoadingStep(3);
        await new Promise((r) => setTimeout(r, 400));
        if (isCancelled) return;

        setProposal(adapted);
      } catch {
        if (!isCancelled) {
          setErrorMsg(
            t(
              'weather.err_adapt_failed',
              "We couldn't generate an alternative itinerary right now. Your original itinerary has not been changed."
            )
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    runAdaptation();

    return () => {
      isCancelled = true;
    };
  }, [dayNumber, destination, departureDate, travelMode]);

  const handleApply = () => {
    if (!proposal || !proposal.proposed_activities) return;
    applyDayAdaptation(dayNumber, proposal.proposed_activities, proposal.reason);
    onClose();
  };

  const handleReject = () => {
    // Keep original plan completely untouched
    onClose();
  };

  const loadingMessages = [
    t('weather.loading_step_0', 'Checking live weather forecasts...'),
    t('weather.loading_step_1', 'Analyzing your Day {day} itinerary against weather risks...', { day: dayNumber }),
    t('weather.loading_step_2', 'Finding safer, sheltered alternatives matching {mode} mode...', {
      mode: travelMode.toUpperCase(),
    }),
    t('weather.loading_step_3', 'Preparing your updated Day {day} plan...', { day: dayNumber }),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
      >
        {/* Header Bar */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                  {t('weather.modal_badge', 'WEATHER ADAPTATION PROPOSAL')}
                </span>
                <span className="text-xs text-slate-400 font-semibold">• Day {dayNumber}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {t('weather.modal_title', 'Review Proposed Day {day} Adjustments', { day: dayNumber })}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReject}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Loading State Machine */}
          {isLoading && (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-amber-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-500 absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {loadingMessages[loadingStep]}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t(
                    'weather.loading_sub',
                    'Preserving your budget, travel mode ({mode}), and accommodation.',
                    { mode: travelMode }
                  )}
                </p>
              </div>

              {/* Step dots */}
              <div className="flex items-center gap-1.5 pt-2">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      step === loadingStep
                        ? 'w-6 bg-amber-500'
                        : step < loadingStep
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMsg && (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-200">
                  {t('weather.err_title', 'Adaptation Unavailable')}
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReject}
                className="py-2 px-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300"
              >
                {t('weather.btn_return_original', 'Return to Itinerary')}
              </button>
            </div>
          )}

          {/* Adaptation Content Ready */}
          {!isLoading && proposal && (
            <>
              {/* Preserved Constraints Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {t('weather.preserved_mode', 'Travel Mode')}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {travelMode}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {t('weather.preserved_budget', 'Budget Impact')}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                    {proposal.estimated_budget_change <= 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {proposal.estimated_budget_change === 0
                          ? 'No Budget Increase'
                          : `Saves ₹${Math.abs(proposal.estimated_budget_change)}`}
                      </span>
                    ) : (
                      <span>+₹{proposal.estimated_budget_change}</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {t('weather.preserved_hotel', 'Accommodation')}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedStay?.name || destination}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    {t('weather.preserved_days', 'Trip Scope')}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Day {dayNumber} Only
                  </span>
                </div>
              </div>

              {/* Rationale & Safety Note */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t('weather.adaptation_reason', 'Adaptation Rationale')}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {proposal.reason}
                </p>
                {proposal.safety_notes && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 pt-1 font-medium border-t border-amber-200/50 dark:border-amber-800/40">
                    {proposal.safety_notes}
                  </p>
                )}
              </div>

              {/* Side-by-Side (Desktop) or Stacked (Mobile) Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE: Original Activities */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('weather.col_before', 'ORIGINAL DAY {day}', { day: dayNumber })}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {originalDayEvents.length} activities
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {originalDayEvents.length > 0 ? (
                      originalDayEvents.map((ev, idx) => {
                        const isBooked = (ev as any).is_booked || (ev as any).isBooked;
                        return (
                          <div
                            key={ev.id || idx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {ev.time}
                              </span>
                              {isBooked && (
                                <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  {t('weather.badge_booked', 'BOOKED')}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-slate-800 dark:text-slate-200">
                              {ev.title}
                            </h5>
                            {ev.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {ev.description}
                              </p>
                            )}
                            <div className="text-[10px] text-slate-400 pt-0.5">
                              {t('weather.cost', 'Est. Cost')}: ₹{ev.cost || 0}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        {t('weather.no_activities', 'No activities scheduled for this day.')}
                      </p>
                    )}
                  </div>
                </div>

                {/* AFTER: Proposed Adapted Activities */}
                <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      {t('weather.col_after', 'PROPOSED ADAPTED DAY {day}', { day: dayNumber })}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {proposal.proposed_activities.length} safe activities
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {proposal.proposed_activities.map((act, idx) => {
                      const matchingChange = proposal.changes[idx];
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300/80 dark:border-emerald-800 text-xs space-y-1.5 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {act.time}
                            </span>
                            {act.is_booked ? (
                              <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                {t('weather.badge_booked', 'BOOKED')}
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                                {t('weather.badge_sheltered', 'SHELTERED')}
                              </span>
                            )}
                          </div>

                          <h5 className="font-bold text-slate-900 dark:text-white">
                            {act.activity}
                          </h5>

                          {act.description && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                              {act.description}
                            </p>
                          )}

                          {matchingChange && matchingChange.reason && (
                            <p className="text-[10.5px] text-emerald-800 dark:text-emerald-300/90 font-medium pt-0.5 border-t border-emerald-100 dark:border-emerald-900/50">
                              ✓ {matchingChange.reason}
                            </p>
                          )}

                          {matchingChange?.booking_advisory && (
                            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[10.5px] text-amber-900 dark:text-amber-200 font-medium">
                              {matchingChange.booking_advisory}
                            </div>
                          )}

                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {t('weather.cost', 'Est. Cost')}: ₹{act.estimated_cost}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isLoading && proposal && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t(
                'weather.confirm_notice',
                'Your remaining itinerary days (Days 1–{prev} and {next}–N) will remain strictly untouched.',
                { prev: Math.max(1, dayNumber - 1), next: dayNumber + 1 }
              )}
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={handleReject}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                {t('weather.btn_keep_original', 'KEEP ORIGINAL')}
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex-1 sm:flex-none btn-primary !py-2.5 px-5 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('weather.btn_apply_changes', 'APPLY CHANGES TO DAY {day}', { day: dayNumber })}</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
