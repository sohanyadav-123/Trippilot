import React, { useState } from 'react';
import { Modal } from '../Common/Modal';
import { Flight } from '../../types';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { Plane, Luggage, ShieldCheck, Clock, Check, AlertCircle, Utensils, Armchair, ChevronRight } from 'lucide-react';

interface FlightDetailsModalProps {
  flight: Flight;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fare: 'saver' | 'flexi') => void;
  isSelected: boolean;
}

export const FlightDetailsModal: React.FC<FlightDetailsModalProps> = ({
  flight,
  isOpen,
  onClose,
  onSelect,
  isSelected,
}) => {
  const [selectedFare, setSelectedFare] = useState<'saver' | 'flexi'>('saver');

  const flexiPrice = flight.price + 1200;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Flight Itinerary & Fare Rules" maxWidth="lg">
      <div className="space-y-5">
        {/* Header summary */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white shadow-sm">
              {flight.airline.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{flight.airline}</h4>
              <p className="text-xs text-slate-500 font-mono">
                {flight.flight_number} • {flight.cabin_class.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <CurrencyDisplay
              amount={selectedFare === 'flexi' ? flexiPrice : flight.price}
              className="text-xl font-black text-slate-900"
            />
            <span className="text-[10px] text-slate-400 block">incl. all taxes & surcharges</span>
          </div>
        </div>

        {/* Timetable Segment */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Flight Schedule</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {flight.stops === 0 ? 'Direct Non-stop Flight' : `${flight.stops} Stop Route`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-l-2 border-blue-600 pl-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Departure</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{flight.origin}</p>
              <p className="text-xs text-slate-500">{flight.departure_time}</p>
              <span className="text-[11px] text-slate-400">Terminal 3, Domestic Gates</span>
            </div>

            <div className="border-l-2 border-emerald-600 pl-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Arrival</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{flight.destination}</p>
              <p className="text-xs text-slate-500">{flight.arrival_time}</p>
              <span className="text-[11px] text-slate-400">Main Arrival Terminal</span>
            </div>
          </div>
        </div>

        {/* Fare Tier Selector in Modal */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">Choose Fare Option</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Saver Fare */}
            <div
              onClick={() => setSelectedFare('saver')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedFare === 'saver'
                  ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-slate-900">Saver</span>
                <CurrencyDisplay amount={flight.price} className="font-extrabold text-slate-900 text-sm" />
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> 7kg Cabin + 15kg Check-in
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600" /> Standard Paid Rescheduling
                </li>
              </ul>
            </div>

            {/* Flexi Plus Fare */}
            <div
              onClick={() => setSelectedFare('flexi')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedFare === 'flexi'
                  ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-slate-900">Flexi Plus</span>
                <CurrencyDisplay amount={flexiPrice} className="font-extrabold text-blue-600 text-sm" />
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Free Seat Selection
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Free Meal & Beverage
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Zero Date Change Penalty
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary text-xs !py-2.5 px-4 font-bold">
            Close
          </button>
          <button
            onClick={() => onSelect(selectedFare)}
            className="btn-primary text-xs !py-2.5 px-6 font-bold shadow-sm"
          >
            {isSelected ? 'Update Flight Selection' : 'Confirm & Add to Trip'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
