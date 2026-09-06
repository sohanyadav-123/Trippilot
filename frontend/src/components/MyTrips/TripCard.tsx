import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Plane,
  Building2,
  Clock,
  ArrowRight,
  Luggage,
  Sparkles,
  Heart,
  RefreshCw,
  Compass,
  Wallet,
  AlertCircle,
  Users,
} from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export interface TripCardProps {
  id: string;
  reference?: string;
  title: string;
  destination: string;
  origin?: string;
  startDate?: string;
  endDate?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'saved';
  totalAmount?: number;
  itemsCount?: number;
  tripHealthScore?: number;
  dayProgress?: { current: number; total: number };
  items?: Array<{
    type: 'flight' | 'hotel' | 'activity' | 'transport';
    title: string;
    subtitle?: string;
    cost?: number;
  }>;
  onPlanAgain?: (tripId: string) => void;
  onContinuePlanning?: (tripId: string) => void;
  onViewDetails?: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  id,
  reference,
  title,
  destination,
  origin,
  startDate,
  endDate,
  status,
  totalAmount = 0,
  itemsCount = 0,
  tripHealthScore = 92,
  dayProgress,
  items = [],
  onPlanAgain,
  onContinuePlanning,
  onViewDetails,
}) => {
  const { t } = useTravelSettings();

  const getStatusBadge = () => {
    switch (status) {
      case 'upcoming':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-blue-50 text-blue-700 border border-blue-200">
            {t('trips.badge_upcoming', '● Confirmed Upcoming')}
          </span>
        );
      case 'ongoing':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
            {t('trips.badge_ongoing', '● Live Trip (Ongoing)')}
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-slate-100 text-slate-700 border border-slate-200">
            {t('trips.badge_completed', '✓ Journey Completed')}
          </span>
        );
      case 'saved':
        return (
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase bg-amber-50 text-amber-800 border border-amber-200">
            {t('trips.badge_saved', '★ Saved Draft Blueprint')}
          </span>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="surface-card p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap">
          {reference && (
            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              Ref: {reference}
            </span>
          )}
          {getStatusBadge()}
          {tripHealthScore && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Trip Health: {tripHealthScore}%
            </span>
          )}
        </div>

        {totalAmount > 0 && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Spend</span>
            <CurrencyDisplay amount={totalAmount} className="text-lg font-black text-slate-900" />
          </div>
        )}
      </div>

      {/* Main Trip Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-900">{title || `${destination} Trip`}</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {origin && <span>From <strong>{origin}</strong></span>}
            <span>Destination: <strong>{destination}</strong></span>
            {startDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span>{startDate} {endDate ? `→ ${endDate}` : ''}</span>
              </span>
            )}
          </div>
        </div>

        {/* Ongoing Day Tracker */}
        {status === 'ongoing' && dayProgress && (
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
            <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Day {dayProgress.current} of {dayProgress.total}</span>
              <span className="text-[11px] text-emerald-800 block">Enjoy your scheduled day in {destination}!</span>
            </div>
          </div>
        )}
      </div>

      {/* Items Preview */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                {item.type === 'flight' ? (
                  <Plane className="w-4 h-4" />
                ) : item.type === 'hotel' ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                {item.subtitle && <span className="text-[11px] text-slate-500 block truncate">{item.subtitle}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Action Bar */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/before-you-go"
            className="text-slate-900 hover:text-slate-950 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Before You Go</span>
          </Link>
          <Link
            to="/packing-assistant"
            className="text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <Luggage className="w-3.5 h-3.5 text-slate-500" />
            <span>Packing</span>
          </Link>
          <Link
            to="/travel-help"
            className="text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Help Desk</span>
          </Link>
          <Link
            to="/shared-trips"
            className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Co-Travellers</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {status === 'completed' && onPlanAgain && (
            <button
              onClick={() => onPlanAgain(id)}
              className="btn-primary text-xs !py-1.5 px-3.5 font-bold shadow-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Plan Again</span>
            </button>
          )}

          {status === 'saved' && onContinuePlanning && (
            <button
              onClick={() => onContinuePlanning(id)}
              className="btn-primary text-xs !py-1.5 px-3.5 font-bold shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Continue Planning</span>
            </button>
          )}

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(id)}
              className="btn-secondary text-xs !py-1.5 px-3 font-bold"
            >
              Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
