import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  MapPin,
  Sunrise,
  Info,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { optimizeDaySequence } from '../../utils/aiOptimizationEngine';
import { adaptiveWeatherService } from '../../services/adaptiveWeatherService';
import { DayOptimizationResult, OptimizedStopItem } from '../../types';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface OptimizeDayModalProps {
  dayNumber: number;
  onClose: () => void;
}

const StopRow: React.FC<{ stop: OptimizedStopItem; index: number; isOptimized?: boolean }> = ({
  stop,
  index,
  isOptimized,
}) => {
  const typeColors: Record<string, string> = {
    travel: 'bg-blue-100 text-blue-700',
    stay: 'bg-indigo-100 text-indigo-700',
    dining: 'bg-amber-100 text-amber-800',
    activity: 'bg-emerald-100 text-emerald-800',
    custom: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition-all ${
      isOptimized ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
    }`}>
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shadow-xs ${
          isOptimized ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
        }`}>
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-[#0B1220] text-xs">{stop.time}</span>
          {stop.openingHours && isOptimized && (
            <span className="text-[10px] text-slate-400 font-medium">({stop.openingHours})</span>
          )}
        </div>
        <p className="font-bold text-slate-800 mt-0.5 truncate">{stop.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${typeColors[stop.type] || 'bg-slate-100 text-slate-600'}`}>
            {stop.type}
          </span>
          <span className="text-[10px] text-slate-400">{stop.duration}</span>
          {stop.location && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />{stop.location}
            </span>
          )}
        </div>
      </div>
      {stop.cost != null && stop.cost > 0 && (
        <CurrencyDisplay amount={stop.cost} className="font-bold text-slate-700 text-xs flex-shrink-0" />
      )}
    </div>
  );
};

export const OptimizeDayModal: React.FC<OptimizeDayModalProps> = ({ dayNumber, onClose }) => {
  const {
    customItinerary,
    departureDate,
    destination,
    applyDayOptimization,
  } = useTripBuilder();

  const dayEvents = customItinerary.filter((ev) => ev.day === dayNumber);

  // Get day weather conditions for context-aware optimization
  const forecast = adaptiveWeatherService.getDestinationForecast(destination, departureDate, 7);
  const dayForecast = forecast.find((f) => f.dayNumber === dayNumber);

  const result: DayOptimizationResult = optimizeDaySequence(
    dayNumber,
    dayEvents,
    dayForecast?.tempC,
    dayForecast?.rainProbability
  );

  const [showFactors, setShowFactors] = useState(false);
  const [applied, setApplied] = useState(false);

  const hasChanges = result.currentStops.some((s, i) => {
    const opt = result.optimizedStops[i];
    return opt && s.time !== opt.time;
  });

  const handleApply = () => {
    applyDayOptimization(dayNumber, result.optimizedStops);
    setApplied(true);
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-luxury border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#0B1220] text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C8A96B]/20 text-[#C8A96B] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B]">AI Optimization</div>
              <h2 className="font-bold text-xl text-white">Optimize Day {dayNumber}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{destination} • Multi-factor intelligent sequencing</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Applied Success State */}
          {applied && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-bold text-emerald-900">
                ✓ Day {dayNumber} schedule optimized! Returning to itinerary...
              </span>
            </div>
          )}

          {/* Weather Context Badge */}
          {dayForecast && (
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs flex items-center gap-2.5 text-blue-900">
              <Sunrise className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Day {dayNumber} Forecast: <strong>{dayForecast.condition}</strong> •{' '}
                <strong>{dayForecast.tempC}°C</strong> •{' '}
                {dayForecast.rainProbability}% rain probability —
                {dayForecast.rainProbability > 60
                  ? ' Outdoor activities shifted to morning clear window.'
                  : dayForecast.tempC > 34
                  ? ' High heat — outdoor activities moved to cooler morning slot.'
                  : ' No weather concerns for this day.'}
              </span>
            </div>
          )}

          {/* Reasoning Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#C8A96B] flex-shrink-0 mt-0.2" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">WHY TRIPPILOT RECOMMENDS THIS</span>
                <p className="text-xs font-medium text-slate-800 mt-0.5 leading-relaxed">{result.reasoning}</p>
              </div>
            </div>
            {result.estimatedTimeSavedMinutes > 0 && (
              <div className="flex items-center gap-2 pl-6">
                <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-700">
                  Estimated ~{result.estimatedTimeSavedMinutes} min less idle time
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowFactors(!showFactors)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 ml-6 flex items-center gap-1"
            >
              <Info className="w-3 h-3" />
              {showFactors ? 'Hide factors' : 'See factors considered'}
              {showFactors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showFactors && (
              <div className="ml-6 space-y-1 animate-fade-in">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Factors considered:</p>
                {result.factorsConsidered.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {result.tradeoffs[0] !== 'None — all activity priorities maintained.' && (
                  <>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mt-2">Trade-offs:</p>
                    {result.tradeoffs.map((t, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Side-by-side comparison */}
          {dayEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Plan */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Current Order</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.2 rounded">
                    {result.currentStops.length} stops
                  </span>
                </div>
                <div className="space-y-2">
                  {result.currentStops.map((stop, i) => (
                    <StopRow key={stop.id} stop={stop} index={i} />
                  ))}
                </div>
              </div>

              {/* Arrow divider on mobile */}
              <div className="hidden sm:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </div>

              {/* Optimized Sequence */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">✨ Optimized Sequence</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.2 rounded">
                    {result.optimizedStops.length} stops
                  </span>
                </div>
                <div className="space-y-2">
                  {result.optimizedStops.map((stop, i) => (
                    <StopRow key={stop.id} stop={stop} index={i} isOptimized />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-500">No activities scheduled for Day {dayNumber} yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Add stops to this day to use the optimizer.</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Keep Current Plan
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => alert('Edit mode: Drag and drop itinerary events to reorder manually.')}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Edit Myself
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!hasChanges || applied || dayEvents.length < 2}
                className="flex-1 sm:flex-none btn-primary text-sm !py-2.5 px-6 font-bold rounded-xl shadow-md flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                <span>Apply Optimization</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Your trip only changes when you click "Apply Optimization". This is always reversible from the itinerary editor.
          </p>
        </div>
      </div>
    </div>
  );
};
