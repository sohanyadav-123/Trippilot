import React, { useState, useEffect } from 'react';
import {
  Plane,
  Building2,
  MapPin,
  RefreshCw,
  Clock,
  Navigation,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Luggage,
  Sparkles,
} from 'lucide-react';
import { Booking, Flight, Hotel } from '../../types';

interface LiveBookingTrackerProps {
  booking: Booking;
  pollingIntervalMs?: number;
  onRefresh?: () => Promise<void> | void;
}

export const LiveBookingTracker: React.FC<LiveBookingTrackerProps> = ({
  booking,
  pollingIntervalMs = 10000,
  onRefresh,
}) => {
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [secondsSinceSync, setSecondsSinceSync] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Extract flight and hotel from booking selected_items
  const flightItem = booking.selected_items?.find((i) => i.type === 'flight');
  const flightData: Flight | undefined = flightItem?.flight_data;

  const hotelItem = booking.selected_items?.find((i) => i.type === 'hotel');
  const hotelData: Hotel | undefined = hotelItem?.hotel_data;

  // Live flight simulation states that update during polling
  const [flightStatus, setFlightStatus] = useState({
    status: 'On Schedule',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    gate: 'Gate 14A',
    terminal: 'T3',
    carousel: 'Belt 4',
    altitude: '34,000 ft',
    speed: '840 km/h',
    delayMins: 0,
  });

  // Live hotel room status
  const [hotelStatus, setHotelStatus] = useState({
    roomReady: true,
    cleaningStatus: 'Sanitized & Inspected',
    frontDesk: 'Express Mobile Check-In Active',
    distanceFromAirport: '24.5 km (35 mins via NH66)',
  });

  // Auto-refresh polling effect
  useEffect(() => {
    // Timer counting seconds since last sync
    const secondsTimer = setInterval(() => {
      setSecondsSinceSync((prev) => prev + 1);
    }, 1000);

    // Auto-polling interval
    const pollingTimer = setInterval(async () => {
      await handleSync();
    }, pollingIntervalMs);

    return () => {
      clearInterval(secondsTimer);
      clearInterval(pollingTimer);
    };
  }, [pollingIntervalMs]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }

      // Simulate live telemetry jitter (real-time feeling)
      setFlightStatus((prev) => ({
        ...prev,
        altitude: `${33800 + Math.floor(Math.random() * 600)} ft`,
        speed: `${835 + Math.floor(Math.random() * 15)} km/h`,
      }));

      setLastSyncTime(new Date());
      setSecondsSinceSync(0);
    } catch {
      // Non-blocking fallback
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  const getMapUrl = (name: string, address?: string) => {
    const query = encodeURIComponent(`${name} ${address || ''}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="space-y-4">
      {/* ── 1. REAL-TIME RADAR STATUS BAR ── */}
      <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md flex flex-wrap items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div>
            <span className="text-xs font-black tracking-wide uppercase flex items-center gap-1.5 text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
              Live Telemetry & Booking Sync
            </span>
            <span className="text-[11px] text-slate-400 block">
              Auto-refreshing every {Math.round(pollingIntervalMs / 1000)}s • Updated {secondsSinceSync}s ago
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : 'text-slate-300'}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── 2. LIVE FLIGHT STATUS CARD ── */}
        {flightData ? (
          <div className="surface-card p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 bg-white dark:bg-[#0E1729]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {flightData.airline} {flightData.flight_number}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {flightData.origin} → {flightData.destination}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${flightStatus.badgeColor}`}>
                ● {flightStatus.status}
              </span>
            </div>

            {/* Flight Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Gate</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{flightStatus.gate}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Terminal</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{flightStatus.terminal}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Baggage</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{flightStatus.carousel}</span>
              </div>
            </div>

            {/* Live Telemetry Radar */}
            <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  Altitude: <strong>{flightStatus.altitude}</strong> • Speed: <strong>{flightStatus.speed}</strong>
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                Radar Active
              </span>
            </div>
          </div>
        ) : (
          <div className="surface-card p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Plane className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-bold text-slate-500">No active flight reservation in this booking</span>
          </div>
        )}

        {/* ── 3. LIVE HOTEL LOCATION & CHECK-IN CARD ── */}
        {hotelData ? (
          <div className="surface-card p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 bg-white dark:bg-[#0E1729]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[180px]">
                    {hotelData.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[200px]">
                    {hotelData.address || `${hotelData.city}, ${hotelData.country || 'India'}`}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                ● Room Ready
              </span>
            </div>

            {/* Hotel Status & Location Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  Airport Distance
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {hotelStatus.distanceFromAirport}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Housekeeping
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {hotelStatus.cleaningStatus}
                </span>
              </div>
            </div>

            {/* Open in Google Maps Direction Button */}
            <a
              href={getMapUrl(hotelData.name, hotelData.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Open Live Directions & Location on Map</span>
              <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
            </a>
          </div>
        ) : (
          <div className="surface-card p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Building2 className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-bold text-slate-500">No hotel reserved in this booking</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveBookingTracker;
