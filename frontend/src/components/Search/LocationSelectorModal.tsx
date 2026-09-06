import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plane, MapPin, History, Building2, Train, Bus, ChevronRight } from 'lucide-react';
import { LocationItem, LOCATIONS_DATA, searchLocations } from '../../data/locationData';
import { useTravelSettings } from '../../context/TravelSettingsContext';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: LocationItem) => void;
  title?: string;
  placeholder?: string;
  typeFilter?: 'airport' | 'railway_station' | 'bus_station' | 'destination';
  currentSelectedId?: string;
}

const RECENT_KEY = 'trippilot_recent_locations';

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title,
  placeholder,
  typeFilter,
  currentSelectedId,
}) => {
  const { t, tPlace } = useTravelSettings();
  const defaultTitle = t('search.where_to', 'Where are you travelling?');
  const defaultPlaceholder = t('search.placeholder_location', 'Search city, airport, code (e.g. HYD, Delhi, Goa)...');
  const modalTitle = title || defaultTitle;
  const modalPlaceholder = placeholder || defaultPlaceholder;
  const [query, setQuery] = useState('');
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        setRecentLocations(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = searchLocations(query, typeFilter);

  const handleItemClick = (item: LocationItem) => {
    // Save to recent searches
    try {
      const updated = [item, ...recentLocations.filter((r) => r.id !== item.id)].slice(0, 5);
      setRecentLocations(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    onSelect(item);
    onClose();
  };

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentLocations([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const popularCities = LOCATIONS_DATA.filter((l) => l.popular && l.type === 'airport').slice(0, 8);
  const popularAirports = LOCATIONS_DATA.filter((l) => l.airportName && l.popular).slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[750px] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{modalTitle}</h3>
              <p className="text-[11px] text-slate-500">Search over 50+ domestic and international hubs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location selector"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={modalPlaceholder}
              aria-label={modalPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search input"
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results & Categories List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-5 scrollbar-thin bg-white">
          {query.trim() ? (
            /* Filtered Search Results */
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2 px-1">
                Matching Destinations ({filtered.length})
              </span>
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No airports or cities match "<span className="text-slate-900 font-bold">{query}</span>".
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group ${
                        currentSelectedId === item.id ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 group-hover:border-blue-400 flex items-center justify-center text-blue-600 flex-shrink-0">
                          {item.type === 'airport' ? (
                            <Plane className="w-4 h-4" />
                          ) : item.type === 'railway_station' ? (
                            <Train className="w-4 h-4" />
                          ) : item.type === 'bus_station' ? (
                            <Bus className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {item.city}
                            </span>
                            {item.airportCode && (
                              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                {item.airportCode}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {item.airportName || `${item.state}, ${item.country}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold group-hover:text-slate-700 transition-colors">
                        {item.country === 'India' ? item.state : item.country}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Categorized Views: Recent Searches + Popular Cities + Popular Airports */
            <>
              {/* 1. Recent Searches */}
              {recentLocations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-600" /> Recent Searches
                    </span>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentLocations.map((item) => (
                      <button
                        key={`rec-${item.id}`}
                        onClick={() => handleItemClick(item)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Plane className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 truncate">{tPlace(item.city)}</p>
                            <p className="text-[10px] text-slate-500 truncate">{tPlace(item.state)}</p>
                          </div>
                        </div>
                        {item.airportCode && (
                          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {item.airportCode}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Popular Cities Quick Chips */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2 px-1">
                  {t('search.popular_cities', 'Popular Cities')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {popularCities.map((item) => (
                    <button
                      key={`pop-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs group"
                    >
                      <span>{tPlace(item.city)}</span>
                      {item.airportCode && (
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">
                          ({item.airportCode})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Major Airports List */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-2 px-1">
                  {t('search.major_airports', 'Major Airports')}
                </span>
                <div className="space-y-1.5">
                  {popularAirports.map((item) => (
                    <button
                      key={`air-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      className="w-full p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Plane className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {item.airportName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {item.city}, {item.state}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex-shrink-0 ml-2">
                        {item.airportCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
