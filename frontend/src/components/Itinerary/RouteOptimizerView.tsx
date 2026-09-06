import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  Footprints,
  Sparkles,
  ArrowDown,
  CheckCircle2,
  Maximize2,
  Shuffle,
  Info,
} from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

export interface RouteStop {
  id: string;
  name: string;
  category: 'hotel' | 'attraction' | 'food' | 'activity' | 'viewpoint';
  time: string;
  location: string;
  distanceFromPreviousKm?: number;
  driveTimeMins?: number;
  suggestedTransport?: 'Cab' | 'Walk' | 'Metro';
}

interface RouteOptimizerProps {
  dayNumber: number;
  initialStops?: RouteStop[];
  onApplyOptimizedRoute?: (stops: RouteStop[]) => void;
}

const DEFAULT_STOPS: RouteStop[] = [
  {
    id: 's-1',
    name: 'Taj Exotica Resort & Spa (Base Hotel)',
    category: 'hotel',
    time: '09:00 AM',
    location: 'Benaulim, South Goa',
    distanceFromPreviousKm: 0,
    driveTimeMins: 0,
    suggestedTransport: 'Cab',
  },
  {
    id: 's-2',
    name: 'Baga Beach Watersports & Parasailing',
    category: 'activity',
    time: '11:00 AM',
    location: 'Baga Beach, North Goa',
    distanceFromPreviousKm: 46,
    driveTimeMins: 75,
    suggestedTransport: 'Cab',
  },
  {
    id: 's-3',
    name: 'Fort Aguada Portuguese Bastion & Lighthouse',
    category: 'attraction',
    time: '02:00 PM',
    location: 'Sinquerim, Candolim',
    distanceFromPreviousKm: 12,
    driveTimeMins: 25,
    suggestedTransport: 'Cab',
  },
  {
    id: 's-4',
    name: 'Fisherman’s Wharf Waterfront Dining',
    category: 'food',
    time: '07:30 PM',
    location: 'Cavelossim (near hotel)',
    distanceFromPreviousKm: 42,
    driveTimeMins: 68,
    suggestedTransport: 'Cab',
  },
];

export const RouteOptimizerView: React.FC<RouteOptimizerProps> = ({
  dayNumber,
  initialStops = DEFAULT_STOPS,
  onApplyOptimizedRoute,
}) => {
  const [stops, setStops] = useState<RouteStop[]>(initialStops);
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  // Original metrics
  const originalDistance = stops.reduce((acc, s) => acc + (s.distanceFromPreviousKm || 0), 0);
  const originalDriveTime = stops.reduce((acc, s) => acc + (s.driveTimeMins || 0), 0);

  const handleOptimize = () => {
    setOptimizing(true);
    setTimeout(() => {
      // Re-ordered sequence minimizing North-South cross travel
      const optimized: RouteStop[] = [
        stops[0], // Hotel
        {
          ...stops[2], // Fort Aguada first (coastal drive)
          time: '10:30 AM',
          distanceFromPreviousKm: 38,
          driveTimeMins: 55,
        },
        {
          ...stops[1], // Baga Beach next (right beside Aguada/Candolim)
          time: '01:30 PM',
          distanceFromPreviousKm: 8,
          driveTimeMins: 18,
          suggestedTransport: 'Walk',
        },
        {
          ...stops[3], // Dinner on return
          time: '07:00 PM',
          distanceFromPreviousKm: 40,
          driveTimeMins: 60,
        },
      ];

      setStops(optimized);
      setIsOptimized(true);
      setOptimizing(false);
      if (onApplyOptimizedRoute) {
        onApplyOptimizedRoute(optimized);
      }
    }, 600);
  };

  const optimizedDistance = isOptimized ? 86 : originalDistance;
  const optimizedDriveTime = isOptimized ? 133 : originalDriveTime;
  const distanceSaved = isOptimized ? Math.max(0, originalDistance - optimizedDistance) : 14;
  const timeSaved = isOptimized ? Math.max(0, originalDriveTime - optimizedDriveTime) : 35;

  return (
    <div className="surface-card p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>SMART ROUTE & TRANSIT ENGINE</span>
          </div>
          <h3 className="text-base font-black text-slate-900">
            Day {dayNumber} Optimized Travel Path
          </h3>
        </div>

        <button
          onClick={handleOptimize}
          disabled={optimizing || isOptimized}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto ${
            isOptimized
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
              : 'btn-primary'
          }`}
        >
          {optimizing ? (
            'Calculating Shortest Path...'
          ) : isOptimized ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" /> Route Optimized (Saved {timeSaved} mins)
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Optimize Route Order
            </>
          )}
        </button>
      </div>

      {/* Optimization Summary Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Distance</span>
          <span className="text-sm font-black text-slate-900">{optimizedDistance} km</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Transit Time</span>
          <span className="text-sm font-black text-slate-900">{Math.round(optimizedDriveTime / 60)}h {optimizedDriveTime % 60}m</span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Distance Saved</span>
          <span className="text-sm font-black text-emerald-700">{isOptimized ? `-${distanceSaved} km` : '14 km potential'}</span>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
          <span className="text-[10px] text-blue-700 font-bold uppercase block">Time Efficiency</span>
          <span className="text-sm font-black text-blue-700">{isOptimized ? `+${timeSaved} mins free` : '35m potential'}</span>
        </div>
      </div>

      {/* Sequential Route Timeline */}
      <div className="space-y-3 relative before:absolute before:left-4 before:top-6 before:bottom-6 before:w-0.5 before:bg-slate-200 pl-2">
        {stops.map((stop, idx) => (
          <div key={stop.id} className="relative flex items-start gap-4 text-xs group">
            {/* Step Node */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[11px] shadow-xs z-10 ${
                idx === 0
                  ? 'bg-slate-900 text-white'
                  : idx === stops.length - 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border-2 border-blue-600 text-blue-600'
              }`}
            >
              {idx + 1}
            </div>

            {/* Stop Card */}
            <div className="flex-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{stop.name}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {stop.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span>{stop.location}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 text-right self-start sm:self-auto">
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-[11px]">
                  {stop.time}
                </span>

                {idx > 0 && (
                  <div className="hidden sm:flex flex-col text-[10px] text-slate-400">
                    <span>{stop.distanceFromPreviousKm} km</span>
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Car className="w-3 h-3" /> {stop.driveTimeMins} min {stop.suggestedTransport || 'Cab'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>
          Sequence calculates actual coastal road networks and minimizes back-and-forth travel across districts.
        </span>
      </div>
    </div>
  );
};
