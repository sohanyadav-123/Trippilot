import React from 'react';
import { Filter, RotateCcw, Sunrise, Sun, Sunset, Moon, Check } from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface FlightFilterProps {
  airlines: string[];
  selectedAirlines: string[];
  onAirlineChange: (airline: string) => void;
  selectedStops: string[];
  onStopsChange: (stop: string) => void;
  priceRange: number;
  onPriceChange: (price: number) => void;
  maxPrice: number;
  departureTimeFilter?: string;
  onDepartureTimeFilterChange?: (slot: string) => void;
  onResetFilters: () => void;
}

export const FlightFilter: React.FC<FlightFilterProps> = ({
  airlines,
  selectedAirlines,
  onAirlineChange,
  selectedStops,
  onStopsChange,
  priceRange,
  onPriceChange,
  maxPrice,
  departureTimeFilter = 'all',
  onDepartureTimeFilterChange,
  onResetFilters,
}) => {
  const timeSlots = [
    { id: 'all', label: 'All Times', sub: 'Any Departure', icon: Sun },
    { id: 'early', label: 'Before 6 AM', sub: 'Early Flight', icon: Moon },
    { id: 'morning', label: '6 AM – 12 PM', sub: 'Morning', icon: Sunrise },
    { id: 'afternoon', label: '12 PM – 6 PM', sub: 'Afternoon', icon: Sun },
    { id: 'evening', label: 'After 6 PM', sub: 'Night', icon: Sunset },
  ];

  return (
    <div className="surface-card p-5 rounded-3xl border border-slate-200 space-y-6 sticky top-24 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-blue-600" /> Filters & Criteria
        </h3>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Stops Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Number of Stops</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: '0', label: 'Non-stop' },
            { id: '1', label: '1 Stop' },
            { id: '2+', label: '2+ Stops' },
          ].map((option) => {
            const active = selectedStops.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onStopsChange(option.id)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Departure Time Slots */}
      {onDepartureTimeFilterChange && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Departure Time</h4>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => {
              const Icon = slot.icon;
              const isSelected = departureTimeFilter === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onDepartureTimeFilterChange(slot.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <p className="text-[11px] font-bold block">{slot.label}</p>
                  <span className="text-[9px] text-slate-400 block">{slot.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Max Fare</h4>
          <CurrencyDisplay amount={priceRange} className="text-xs font-black text-blue-600" />
        </div>
        <input
          type="range"
          min="2000"
          max={maxPrice > 2000 ? maxPrice : 50000}
          step="500"
          value={priceRange}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>₹2,000</span>
          <span>₹{maxPrice > 2000 ? maxPrice.toLocaleString('en-IN') : '50,000'}</span>
        </div>
      </div>

      {/* Airlines Checkboxes */}
      {airlines.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Airlines</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
            {airlines.map((airline) => {
              const isChecked = selectedAirlines.includes(airline);
              return (
                <label
                  key={airline}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onAirlineChange(airline)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className={`font-semibold ${isChecked ? 'text-slate-900 font-bold' : ''}`}>
                      {airline}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
