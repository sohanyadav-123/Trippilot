import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Waves,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { WeatherDayForecast } from '../../types/adaptiveWeather';
import { adaptiveWeatherService } from '../../services/adaptiveWeatherService';

interface WeatherMonitoringDashboardProps {
  destination: string;
  departureDate: string;
  totalDays?: number;
  onSelectDay?: (dayNumber: number) => void;
  selectedDay?: number;
}

export const WeatherMonitoringDashboard: React.FC<WeatherMonitoringDashboardProps> = ({
  destination = 'Goa',
  departureDate = '2026-09-15',
  totalDays = 6,
  onSelectDay,
  selectedDay,
}) => {
  const { t, travelMode } = useTravelSettings();
  const [forecasts, setForecasts] = useState<WeatherDayForecast[]>(() =>
    adaptiveWeatherService.getDestinationForecast(destination, departureDate, Math.max(5, totalDays))
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    adaptiveWeatherService.fetchLiveForecast(destination, departureDate).then((live) => {
      if (isMounted && live && live.length > 0) {
        setForecasts(live.slice(0, Math.max(5, totalDays)));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [destination, departureDate, totalDays]);

  const getWeatherIcon = (cond: string, rainProb: number) => {
    const lower = cond.toLowerCase();
    if (rainProb >= 70 || lower.includes('thunder') || lower.includes('heavy rain')) {
      return <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
    if (rainProb >= 40 || lower.includes('rain') || lower.includes('shower')) {
      return <CloudRain className="w-5 h-5 text-sky-500 dark:text-sky-400" />;
    }
    if (lower.includes('heat') || lower.includes('clear') || lower.includes('sunny')) {
      return <Sun className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
    }
    return <CloudSun className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
  };

  return (
    <div className="surface-card rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {t('weather.dashboard_title', 'Weather Monitoring Overview')}
              </h4>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                {t('weather.live_active', 'Live Telemetry')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t(
                'weather.dashboard_subtitle',
                'Continuous 5–10 day rolling meteorological monitoring for {destination}',
                { destination }
              )}
            </p>
          </div>
        </div>

        {/* Confidence Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('weather.conf_high', '1–2d: High Confidence')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {t('weather.conf_mod', '3–5d: Moderate')}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            {t('weather.conf_low', '6d+: Monitoring')}
          </span>
        </div>
      </div>

      {/* Forecast Strip Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {forecasts.map((f) => {
          const isSelected = selectedDay === f.dayNumber;
          const isExpanded = expandedDay === f.dayNumber;
          const isHigh = f.impactLevel === 'high';
          const isMod = f.impactLevel === 'moderate';

          return (
            <motion.div
              key={f.dayNumber}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                setExpandedDay(isExpanded ? null : f.dayNumber);
                if (onSelectDay) onSelectDay(f.dayNumber);
              }}
              className={`p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                  : isHigh
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : isMod
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Day & Confidence Indicator */}
              <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-800 dark:text-slate-200">
                <span>{f.dayLabel}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    f.confidence === 'high'
                      ? 'bg-emerald-500'
                      : f.confidence === 'moderate'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  title={f.confidenceLabel}
                />
              </div>

              {/* Weather Icon & Temp */}
              <div className="my-1.5 flex flex-col items-center">
                {getWeatherIcon(f.condition, f.rainProbability)}
                <span className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  {f.tempC}°C
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                  {f.condition}
                </span>
              </div>

              {/* Rain & Impact Badge */}
              <div className="pt-1 mt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {f.rainProbability}% {t('weather.rain', 'Rain')}
                </span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                    isHigh
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                      : isMod
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                  }`}
                >
                  {isHigh
                    ? t('weather.impact_high', 'High Impact')
                    : isMod
                    ? t('weather.impact_mod', 'Moderate')
                    : t('weather.impact_low', 'Low Impact')}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Meteorological Telemetry Drawer */}
      <AnimatePresence>
        {expandedDay !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 overflow-hidden"
          >
            {(() => {
              const day = forecasts.find((f) => f.dayNumber === expandedDay);
              if (!day) return null;
              return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {day.dayLabel} • {day.date}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                        {day.confidenceLabel}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {day.condition} with max temperature {day.tempC}°C (feels like{' '}
                      {day.feelsLikeC || day.tempC + 2}°C), low {day.tempMinC}°C.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 self-stretch sm:self-auto text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">{t('weather.wind', 'Wind')}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {day.windSpeedKmh} km/h
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">{t('weather.uv', 'UV Index')}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {day.uvIndex}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">{t('weather.sea', 'Marine Tide')}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {day.tide?.seaCondition || 'Calm'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
