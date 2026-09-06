import React from 'react';
import { Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';

export const TravelTimeOptimizationBanner: React.FC = () => {
  const { customItinerary, moveItineraryEvent, removeItineraryEvent } = useTripBuilder();

  // Detect potential schedule transitions with short gaps
  const conflicts = customItinerary.filter((ev, idx) => {
    if (idx === 0) return false;
    const prev = customItinerary[idx - 1];
    return prev.day === ev.day && ev.time === prev.time;
  });

  if (conflicts.length === 0) return null;

  const conflictEvent = conflicts[0];

  return (
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold uppercase tracking-wider text-amber-900 text-[10px] block">
            SCHEDULE CONFLICT DETECTED
          </span>
          <p className="font-bold text-[#0B1220] mt-0.5">
            "{conflictEvent.title}" overlaps or has tight transit time on Day {conflictEvent.day}.
          </p>
          <p className="text-[11px] text-amber-800 mt-0.5">
            Estimated travel time between locations may cause you to miss or rush this stop.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={() => moveItineraryEvent(conflictEvent.id, Math.min(5, conflictEvent.day + 1))}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
        >
          Move to Next Day
        </button>
        <button
          type="button"
          onClick={() => removeItineraryEvent(conflictEvent.id)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-amber-900 font-bold border border-amber-300 text-xs transition-colors"
        >
          Remove Stop
        </button>
      </div>
    </div>
  );
};
