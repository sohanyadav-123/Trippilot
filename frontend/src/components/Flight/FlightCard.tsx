import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, Luggage, ShieldCheck, ArrowRight, Check, ChevronDown, Sparkles } from 'lucide-react';
import { Flight } from '../../types';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { useCart } from '../../hooks/useCart';
import { FlightDetailsModal } from './FlightDetailsModal';

interface FlightCardProps {
  flight: Flight & {
    origin_code?: string;
    destination_code?: string;
    tags?: string[];
    layover_info?: string;
    is_mock?: boolean;
    refundable?: boolean;
  };
  passengers?: number;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, passengers = 1 }) => {
  const { addFlight, items } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [fareOption, setFareOption] = useState<'saver' | 'flexi'>('saver');

  const isSelected = items.some((item) => item.type === 'flight' && item.item.id === flight.id);

  const handleSelect = (fare: 'saver' | 'flexi') => {
    const selectedFlight: Flight = {
      ...flight,
      price: fare === 'flexi' ? flight.price + 1200 : flight.price,
      fare_type: fare === 'flexi' ? 'Flexi' : 'Saver',
    };
    addFlight(selectedFlight, passengers);
  };

  const getAirlineBadge = (airline: string) => {
    const a = airline.toLowerCase();
    if (a.includes('indigo')) return { bg: 'bg-[#001E82]', text: 'text-white', border: 'border-blue-700' };
    if (a.includes('air india')) return { bg: 'bg-[#D61827]', text: 'text-white', border: 'border-red-700' };
    if (a.includes('akasa')) return { bg: 'bg-[#F26522]', text: 'text-white', border: 'border-orange-600' };
    if (a.includes('vistara')) return { bg: 'bg-[#582C4D]', text: 'text-white', border: 'border-purple-800' };
    if (a.includes('emirates')) return { bg: 'bg-[#D71921]', text: 'text-white', border: 'border-red-700' };
    return { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800' };
  };

  const getAirportCode = (city: string, overrideCode?: string) => {
    if (overrideCode) return overrideCode;
    const map: Record<string, string> = {
      Delhi: 'DEL',
      Goa: 'GOI',
      Mumbai: 'BOM',
      Bengaluru: 'BLR',
      Bangalore: 'BLR',
      Hyderabad: 'HYD',
      Chennai: 'MAA',
      Kolkata: 'CCU',
      Dubai: 'DXB',
      Singapore: 'SIN',
      Bangkok: 'BKK',
      Paris: 'CDG',
      London: 'LHR',
    };
    return map[city] || city.slice(0, 3).toUpperCase();
  };

  const originCode = getAirportCode(flight.origin, flight.origin_code);
  const destCode = getAirportCode(flight.destination, flight.destination_code);
  const flexiPrice = flight.price + 1200;
  const badgeStyle = getAirlineBadge(flight.airline);

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="surface-card p-5 mb-4 border border-slate-200 hover:border-slate-300 rounded-3xl transition-all duration-150 shadow-sm bg-white"
      >
        {/* Top Header Tags */}
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 capitalize">{flight.cabin_class || 'Economy'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{flight.baggage_policy || '7kg Cabin + 15kg Check-in'}</span>

            {/* Smart badges */}
            {(flight.tags || []).map((tag) => (
              <span
                key={tag}
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                  tag === 'CHEAPEST'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : tag === 'FASTEST'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {flight.refundable && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                100% Refundable
              </span>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              Flight Details & Fare Rules
            </button>
          </div>
        </div>

        {/* Flight Main Row: Airline + Timings Timeline + Price */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Airline Column */}
          <div className="md:col-span-3 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${badgeStyle.bg} ${badgeStyle.text}`}
            >
              {flight.airline.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 leading-tight">{flight.airline}</h4>
              <span className="text-xs font-mono text-slate-500">
                {flight.flight_number || '6E-452'}
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Airbus A320neo</p>
            </div>
          </div>

          {/* Timetable Schedule Timeline */}
          <div className="md:col-span-5 flex items-center justify-between gap-2 px-2 sm:px-4">
            {/* Origin Takeoff */}
            <div className="text-left">
              <span className="text-xl font-black text-slate-900 block leading-tight">
                {flight.departure_time || '06:00'}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mt-0.5">
                {originCode}
              </span>
              <p className="text-[10px] text-slate-500 truncate max-w-[80px] sm:max-w-[100px] mt-0.5">
                {flight.origin}
              </p>
            </div>

            {/* Duration / Stops bar */}
            <div className="flex-1 flex flex-col items-center px-2">
              <span className="text-[11px] font-mono text-slate-500 font-semibold mb-1">
                {flight.duration || '2h 15m'}
              </span>
              <div className="w-full h-px bg-slate-300 relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600 absolute" />
              </div>
              <span
                className={`text-[10px] font-bold mt-1.5 ${
                  flight.stops === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop (${flight.layover_info || '1h 10m'})`}
              </span>
            </div>

            {/* Destination Landing */}
            <div className="text-right">
              <span className="text-xl font-black text-slate-900 block leading-tight">
                {flight.arrival_time || '08:15'}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 inline-block mt-0.5">
                {destCode}
              </span>
              <p className="text-[10px] text-slate-500 truncate max-w-[80px] sm:max-w-[100px] mt-0.5">
                {flight.destination}
              </p>
            </div>
          </div>

          {/* Pricing & Add to Cart Action */}
          <div className="md:col-span-4 flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Fare</span>
              <CurrencyDisplay
                amount={fareOption === 'flexi' ? flexiPrice : flight.price}
                className="text-2xl font-black text-slate-900"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                incl. taxes & airport fees
              </span>
            </div>

            <button
              onClick={() => handleSelect(fareOption)}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'btn-primary'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4" /> Added to Trip
                </>
              ) : (
                <>
                  <span>Select Flight</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fare Tier Selector (Saver vs Flexi) */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Saver Tier */}
          <div
            onClick={() => setFareOption('saver')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              fareOption === 'saver'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={fareOption === 'saver'}
                  onChange={() => setFareOption('saver')}
                  className="text-blue-600 focus:ring-0"
                />
                <span className="font-bold text-slate-900">Saver Fare</span>
              </div>
              <p className="text-[10px] text-slate-500">Cabin Bag (7kg) + Check-in (15kg) Included</p>
            </div>
            <CurrencyDisplay amount={flight.price} className="font-extrabold text-slate-900 text-sm" />
          </div>

          {/* Flexi Plus Tier */}
          <div
            onClick={() => setFareOption('flexi')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              fareOption === 'flexi'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={fareOption === 'flexi'}
                  onChange={() => setFareOption('flexi')}
                  className="text-blue-600 focus:ring-0"
                />
                <span className="font-bold text-slate-900">Flexi Plus</span>
                <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Free Seat Selection + Complimentary Meal + Free Date Change</p>
            </div>
            <CurrencyDisplay amount={flexiPrice} className="font-extrabold text-blue-600 text-sm" />
          </div>
        </div>
      </motion.div>

      {/* Flight Details Modal */}
      {modalOpen && (
        <FlightDetailsModal
          flight={flight}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={(fare) => {
            handleSelect(fare);
            setModalOpen(false);
          }}
          isSelected={isSelected}
        />
      )}
    </>
  );
};
