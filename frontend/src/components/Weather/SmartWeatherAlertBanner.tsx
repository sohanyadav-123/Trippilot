import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CloudRain,
  Sun,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { adaptiveWeatherService } from '../../services/adaptiveWeatherService';
import { WeatherAdaptationReviewModal } from './WeatherAdaptationReviewModal';

interface SmartWeatherAlertBannerProps {
  destination: string;
  departureDate: string;
  onOpenReviewForDay?: (dayNumber: number) => void;
}

export const SmartWeatherAlertBanner: React.FC<SmartWeatherAlertBannerProps> = ({
  destination = 'Goa',
  departureDate = '2026-09-15',
}) => {
  const { t, travelMode } = useTravelSettings();
  const {
    customItinerary,
    dismissedWeatherDays,
    dismissWeatherAlertForDay,
  } = useTripBuilder();

  const [activeModalDay, setActiveModalDay] = useState<number | null>(null);

  // Get 10-day forecast and detect conflicts against customItinerary
  const forecasts = adaptiveWeatherService.getDestinationForecast(destination, departureDate, 10);
  const conflicts = adaptiveWeatherService.detectItineraryConflicts(
    customItinerary,
    destination,
    departureDate,
    travelMode,
    2
  );

  // Group conflicts by day and filter out dismissed days
  const affectedDays = Array.from(new Set(conflicts.map((c) => c.dayNumber)))
    .filter((d) => !dismissedWeatherDays.includes(d))
    .sort((a, b) => a - b);

  if (affectedDays.length === 0) {
    return null;
  }

  // Determine label and details
  const isSingle = affectedDays.length === 1;
  const primaryDay = affectedDays[0];
  const primaryForecast = forecasts.find((f) => f.dayNumber === primaryDay);
  const conditionText = primaryForecast ? primaryForecast.condition : 'Adverse weather';

  const dayConflicts = conflicts.filter((c) => affectedDays.includes(c.dayNumber));
  const affectedActivityTitles = dayConflicts.slice(0, 3).map((c) => c.eventTitle).join(', ');

  const handleKeepPlan = () => {
    affectedDays.forEach((d) => dismissWeatherAlertForDay(d));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="rounded-3xl p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-slate-900/90 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md">
                  {t('weather.alert_badge', 'Weather Alert')}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isSingle
                    ? t('weather.day_affected', 'Day {day} ({condition})', {
                        day: primaryDay,
                        condition: conditionText,
                      })
                    : t('weather.days_affected', 'Days {days} ({condition})', {
                        days: affectedDays.join(' & '),
                        condition: conditionText,
                      })}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isSingle
                  ? primaryForecast?.confidence === 'low'
                    ? t(
                        'weather.alert_headline_soft',
                        'Precipitation is currently possible on Day {day} (Monitoring). Outdoor activities may be affected.',
                        { day: primaryDay }
                      )
                    : t(
                        'weather.alert_headline_single',
                        '{condition} is expected on Day {day} and may affect your outdoor sightseeing.',
                        { condition: conditionText, day: primaryDay }
                      )
                  : t(
                      'weather.alert_headline_multi',
                      'Adverse weather conditions may affect Days {days}. Each affected day can be reviewed and adapted independently.',
                      { days: affectedDays.join(' and ') }
                    )}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isSingle
                  ? t(
                      'weather.alert_prompt_single',
                      'Would you like Trippilot to create an alternative itinerary for Day {day}?',
                      { day: primaryDay }
                    )
                  : t(
                      'weather.alert_prompt_multi',
                      'Select an affected day to generate a safer alternative proposal, keeping the rest of your trip unchanged.'
                    )}
                {affectedActivityTitles && (
                  <span className="block text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5 font-medium">
                    {t('weather.affected_preview', 'Affected activities: {activities}', {
                      activities: affectedActivityTitles,
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons: YES vs KEEP PLAN */}
          <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap md:flex-nowrap flex-shrink-0">
            {isSingle ? (
              <button
                type="button"
                onClick={() => setActiveModalDay(primaryDay)}
                className="flex-1 md:flex-none btn-primary !py-2.5 px-4 text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <span>{t('weather.btn_update_day', 'YES, UPDATE DAY {day}', { day: primaryDay })}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              affectedDays.map((dayNum) => (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => setActiveModalDay(dayNum)}
                  className="flex-1 md:flex-none btn-primary !py-2 px-3 text-xs font-bold shadow-sm flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <span>{t('weather.btn_update_day', 'YES, UPDATE DAY {day}', { day: dayNum })}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))
            )}

            <button
              type="button"
              onClick={handleKeepPlan}
              className="flex-1 md:flex-none py-2.5 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap shadow-xs"
            >
              {t('weather.btn_keep_plan', 'KEEP PLAN')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Review & Confirmation Modal */}
      {activeModalDay !== null && (
        <WeatherAdaptationReviewModal
          dayNumber={activeModalDay}
          destination={destination}
          departureDate={departureDate}
          onClose={() => setActiveModalDay(null)}
        />
      )}
    </>
  );
};
