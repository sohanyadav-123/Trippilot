import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, CloudRain, Sun, Waves, AlertTriangle, Sparkles, ChevronRight, Check, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { TravelGroupType } from '../../types/adaptiveWeather';
import { adaptiveWeatherService } from '../../services/adaptiveWeatherService';
import { AdaptiveIntelligenceModal } from './AdaptiveIntelligenceModal';

export const AdaptiveIntelligenceBanner: React.FC = () => {
  const {
    destination,
    departureDate,
    groupType,
    setGroupType,
    detectedConflicts,
    activePlanVersion,
  } = useTripBuilder();

  const [modalOpen, setModalOpen] = useState(false);

  const forecast = adaptiveWeatherService.getDestinationForecast(destination, departureDate, 5);

  const groupTypeLabels: Record<TravelGroupType, string> = {
    solo: 'Solo Traveller',
    couple: 'Couple',
    family: 'Family',
    family_kids: 'Family with Children',
    friends: 'Friends Group',
    group: 'Large Group',
    business: 'Business Trip',
    students: 'Students / Youth',
  };

  return (
    <>
      <div className="surface-card p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs flex-shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#0B1220]">
                  Adaptive Itinerary & Meteorological Telemetry
                </h4>
                <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuously monitors hourly rain windows, marine tide peaks, and suggests tailored Plan B alternatives.
              </p>
            </div>
          </div>

          {/* Group Type Selector Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400">Travelling with:</span>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as TravelGroupType)}
              aria-label="Select travelling group type"
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none"
            >
              {Object.entries(groupTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Day Weather & Tide Forecast Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {forecast.map((f) => {
            const isRainy = f.rainProbability > 50;
            const hasConflict = detectedConflicts.some((c) => c.dayNumber === f.dayNumber);

            return (
              <motion.div
                key={f.dayNumber}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.15 }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                  hasConflict
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40 shadow-xs'
                    : isRainy
                    ? 'bg-blue-50/60 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-bold">
                  <span className="text-slate-800">{f.dayLabel}</span>
                  {hasConflict && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Weather optimization advisory" />
                  )}
                </div>

                <div className="my-1 flex items-center gap-1">
                  {f.condition === 'Sunny' ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : f.condition === 'Heavy Rain' || f.condition === 'Light Rain' ? (
                    <CloudRain className="w-5 h-5 text-blue-600" />
                  ) : (
                    <CloudSun className="w-5 h-5 text-amber-500" />
                  )}
                </div>

                <span className="text-sm font-black text-[#0B1220]">{f.tempC}°C</span>

                <div className="w-full pt-1 mt-1 border-t border-slate-200/50 flex flex-col gap-0.5 text-[9.5px]">
                  <span className={`font-bold ${isRainy ? 'text-blue-700' : 'text-slate-500'}`}>
                    {f.rainProbability}% Rain
                  </span>
                  {f.tide && (
                    <span className="text-slate-400 flex items-center justify-center gap-0.5" title={`High tide: ${f.tide.highTideTime}`}>
                      <Waves className="w-2.5 h-2.5 text-blue-500" />
                      <span>{f.tide.seaCondition} Sea</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Proactive Conflict Advisory Callout */}
        {detectedConflicts.length > 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-xs text-amber-900">
                    {detectedConflicts.length} Weather & Tide Advisories Detected for {destination}
                  </h5>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                    Actionable Plan B Ready
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Heavy rain windows & peak high tide coincide with outdoor activities on{' '}
                  {detectedConflicts.map((c) => `Day ${c.dayNumber} (${c.eventTitle})`).join(', ')}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary text-xs !py-2 px-4 font-bold shadow-xs whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-1.5"
            >
              <span>Review Adaptive Plan B</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#158A6A]" />
              <span className="font-semibold">All planned itinerary activities align with optimal weather conditions.</span>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-[11px] font-bold text-emerald-900 underline hover:text-emerald-950"
            >
              View Full Forecast & Marine Telemetry →
            </button>
          </div>
        )}
      </div>

      {/* Full Modal / Drawer */}
      {modalOpen && (
        <AdaptiveIntelligenceModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};
