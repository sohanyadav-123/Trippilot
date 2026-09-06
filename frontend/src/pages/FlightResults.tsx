import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  Plane,
  Clock,
  ArrowUpDown,
  Filter,
  Train,
  Bus,
  SlidersHorizontal,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Check,
  Wallet,
  Baby,
  Accessibility,
} from 'lucide-react';
import { searchService } from '../services/searchService';
import { Flight } from '../types';
import { FlightCard } from '../components/Flight/FlightCard';
import { FlightFilter } from '../components/Flight/FlightFilter';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { EmptyState } from '../components/Common/EmptyState';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { useCart } from '../hooks/useCart';
import { useTripBuilder } from '../context/TripBuilderContext';
import { LocationSelectorModal } from '../components/Search/LocationSelectorModal';
import { CustomDatePicker } from '../components/Search/CustomDatePicker';
import { LOCATIONS_DATA } from '../data/locationData';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const FlightResults: React.FC = () => {
  const { travelMode, setTravelMode, t, tPlace } = useTravelSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const { budget: savedBudget } = useTripBuilder();
  const activeBudget = Number(searchParams.get('budget')) || savedBudget || 0;

  // Search parameters
  const origin = searchParams.get('origin') || 'Hyderabad';
  const destination = searchParams.get('destination') || 'Goa';
  const departureDate = searchParams.get('departure_date') || '2026-09-15';
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);
  const cabinClass = searchParams.get('cabin_class') || 'economy';
  const mode = searchParams.get('mode') || 'flights';

  // Data states
  const [flights, setFlights] = useState<Flight[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<{
    status: 'connected' | 'demo';
    provider_name: string;
    label: string;
  }>({
    status: 'demo',
    provider_name: 'TripPilot Direct Engine',
    label: 'TripPilot Search Engine',
  });

  // Filter states
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'earliest'>('cheapest');
  const [departureTimeFilter, setDepartureTimeFilter] = useState<string>('all');

  // Modify Search Drawer state
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [editOrigin, setEditOrigin] = useState(origin);
  const [editDestination, setEditDestination] = useState(destination);
  const [editDate, setEditDate] = useState(departureDate);
  const [isEditFromOpen, setIsEditFromOpen] = useState(false);
  const [isEditToOpen, setIsEditToOpen] = useState(false);
  const [isEditDateOpen, setIsEditDateOpen] = useState(false);

  const { addFlight } = useCart();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'trains') {
        const res = await searchService.searchTrains({
          origin,
          destination,
          departure_date: departureDate,
          passengers,
        });
        if (res.success && res.data && res.data.trains) {
          setTrains(res.data.trains);
          if ((res.data as any).provider_status) {
            setProviderStatus((res.data as any).provider_status);
          }
        }
      } else if (mode === 'buses') {
        const res = await searchService.searchBuses({
          origin,
          destination,
          departure_date: departureDate,
          passengers,
        });
        if (res.success && res.data && res.data.buses) {
          setBuses(res.data.buses);
          if ((res.data as any).provider_status) {
            setProviderStatus((res.data as any).provider_status);
          }
        }
      } else {
        const res = await searchService.searchFlights({
          origin,
          destination,
          departure_date: departureDate,
          passengers,
          cabin_class: cabinClass,
          sort_by: sortBy === 'cheapest' ? 'price' : sortBy === 'fastest' ? 'duration' : 'price',
        });

        if (res.success && res.data && res.data.flights && res.data.flights.length > 0) {
          setFlights(res.data.flights);
          if ((res.data as any).provider_status) {
            setProviderStatus((res.data as any).provider_status);
          }
        } else {
          throw new Error('No flight options returned.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load travel options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchParams, sortBy]);

  // Unique airlines from results
  const allAirlines = useMemo(() => {
    const set = new Set<string>();
    flights.forEach((f) => set.add(f.airline));
    return Array.from(set);
  }, [flights]);

  // Max price found
  const maxAvailablePrice = useMemo(() => {
    if (flights.length === 0) return 50000;
    return Math.max(...flights.map((f) => f.price));
  }, [flights]);

  useEffect(() => {
    if (maxAvailablePrice > 0) {
      setPriceRange(maxAvailablePrice);
    }
  }, [maxAvailablePrice]);

  const handleAirlineChange = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    );
  };

  const handleStopsChange = (stop: string) => {
    setSelectedStops((prev) =>
      prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]
    );
  };

  const handleResetFilters = () => {
    setSelectedAirlines([]);
    setSelectedStops([]);
    setPriceRange(maxAvailablePrice);
    setDepartureTimeFilter('all');
  };

  // Filter and sort flights
  const filteredFlights = useMemo(() => {
    return flights
      .filter((flight) => {
        // Airline filter
        if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) {
          return false;
        }

        // Stops filter
        if (selectedStops.length > 0) {
          const stopsCount = flight.stops ?? 0;
          const stopMatch =
            (selectedStops.includes('0') && stopsCount === 0) ||
            (selectedStops.includes('1') && stopsCount === 1) ||
            (selectedStops.includes('2+') && stopsCount >= 2);
          if (!stopMatch) return false;
        }

        // Price filter
        if (flight.price > priceRange) {
          return false;
        }

        // Departure time slot filter
        if (departureTimeFilter !== 'all') {
          const depTime = flight.departure_time || '00:00';
          const hour = parseInt(depTime.split(':')[0], 10);
          if (departureTimeFilter === 'morning' && (hour < 6 || hour >= 12)) return false;
          if (departureTimeFilter === 'afternoon' && (hour < 12 || hour >= 18)) return false;
          if (departureTimeFilter === 'evening' && (hour < 18 || hour >= 24)) return false;
          if (departureTimeFilter === 'early' && hour >= 6) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'cheapest') return a.price - b.price;
        if (sortBy === 'fastest') {
          return (Number(a.duration) || 0) - (Number(b.duration) || 0);
        }
        if (sortBy === 'earliest') {
          return (a.departure_time || '').localeCompare(b.departure_time || '');
        }
        return 0;
      });
  }, [flights, selectedAirlines, selectedStops, priceRange, sortBy, departureTimeFilter]);

  const handleModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      origin: editOrigin,
      destination: editDestination,
      departure_date: editDate,
      passengers: String(passengers),
      cabin_class: cabinClass,
      mode,
    });
    setIsModifyOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Travel Experience Mode Banner */}
      {travelMode !== 'standard' && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 border animate-fade-in ${
            travelMode === 'family'
              ? 'bg-amber-50 border-amber-200 text-amber-950 shadow-xs'
              : 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                travelMode === 'family' ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-900'
              }`}
            >
              {travelMode === 'family' ? <Baby className="w-4 h-4" /> : <Accessibility className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-extrabold uppercase tracking-wide block">
                {travelMode === 'family' ? 'Family with Kids Mode Active' : 'Accessibility Mode Active'}
              </span>
              <span className="text-[11px] opacity-80 block mt-0.5">
                {travelMode === 'family'
                  ? 'Adjacent family seating priority and flexible family baggage allowances applied.'
                  : 'Complimentary airport wheelchair assistance, aisle-chair transfer & priority boarding included.'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTravelMode('standard')}
            className={`text-xs font-bold underline whitespace-nowrap self-end sm:self-auto ${
              travelMode === 'family' ? 'text-amber-800 hover:text-amber-950' : 'text-indigo-800 hover:text-indigo-950'
            }`}
          >
            Switch to Standard
          </button>
        </div>
      )}

      {/* ─── Search Summary & Modify Header ─── */}
      <div className="surface-card p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
              {mode === 'trains' ? (
                <Train className="w-6 h-6" />
              ) : mode === 'buses' ? (
                <Bus className="w-6 h-6" />
              ) : (
                <Plane className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {tPlace(origin)} → {tPlace(destination)}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {mode === 'trains'
                    ? t('flight.trains_found', { count: trains.length }, `${trains.length} Trains Found`)
                    : mode === 'buses'
                    ? t('flight.buses_found', { count: buses.length }, `${buses.length} Buses Found`)
                    : t('flight.flights_found', { count: filteredFlights.length }, `${filteredFlights.length} Flights Found`)}
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  {providerStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('flight.departure_label', 'Departure:')} {departureDate} • {passengers} {passengers > 1 ? t('builder.travellers_label', 'Travellers') : t('builder.traveller_label', 'Traveller')} •{' '}
                <span className="capitalize">{mode === 'trains' ? t('step.travel.train', 'Railway Transport') : mode === 'buses' ? t('step.travel.bus', 'Bus Transport') : cabinClass}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {[
                { id: 'flights', label: t('search.tab_flights', 'Flights'), icon: Plane },
                { id: 'trains', label: t('search.tab_trains', 'Trains'), icon: Train },
                { id: 'buses', label: t('search.tab_buses', 'Buses'), icon: Bus },
              ].map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSearchParams({
                        mode: m.id,
                        origin,
                        destination,
                        departure_date: departureDate,
                        passengers: String(passengers),
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsModifyOpen(!isModifyOpen)}
              className="btn-secondary text-xs py-2 px-3.5 font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isModifyOpen ? t('action.close', 'Hide') : t('builder.edit_search', 'Modify Search')}
            </button>
          </div>
        </div>

        {/* Active Trip Target Budget Context */}
        {activeBudget > 0 && (
          <div className="mt-3 p-3 px-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>{t('budget.target_budget', 'Total Trip Budget:')}</strong> <CurrencyDisplay amount={activeBudget} className="font-bold" /> • {passengers} {t('builder.travellers_label', 'travellers')} (₹{Math.round(activeBudget / Math.max(1, passengers)).toLocaleString('en-IN')}/pax)
              </span>
            </div>
            <span className="text-[11px] text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-lg border border-amber-200 font-medium">
              {t('budget.flights_note', 'Flight fares contribute to your overall trip budget')}
            </span>
          </div>
        )}

        {/* Modify Search Drawer */}
        {isModifyOpen && (
          <form
            onSubmit={handleModifySubmit}
            className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in"
          >
            <div
              onClick={() => setIsEditFromOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">{t('search.where_from', 'From')}</label>
              <span className="text-xs font-bold text-slate-900 block truncate">{editOrigin}</span>
            </div>

            <div
              onClick={() => setIsEditToOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">{t('search.where_to', 'To')}</label>
              <span className="text-xs font-bold text-slate-900 block truncate">{editDestination}</span>
            </div>

            <div
              onClick={() => setIsEditDateOpen(true)}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-500 cursor-pointer"
            >
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">{t('search.travel_date', 'Date')}</label>
              <span className="text-xs font-bold text-slate-900 block truncate">{editDate}</span>
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full btn-primary text-xs py-2.5 font-bold shadow-sm">
                {t('modal.edit_search.save', 'Update Search')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Sorting Bar ─── */}
      {mode === 'flights' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" /> {t('booking.sort_by', 'Sort by:')}
            </span>
            {[
              { id: 'cheapest', label: t('flight.sort_cheapest', 'Cheapest Fare') },
              { id: 'fastest', label: t('flight.sort_fastest', 'Fastest Route') },
              { id: 'earliest', label: t('flight.sort_earliest', 'Earliest Takeoff') },
            ].map((sort) => (
              <motion.button
                key={sort.id}
                onClick={() => setSortBy(sort.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sortBy === sort.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {sort.label}
              </motion.button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-semibold">
            {t('flight.showing_count', { filtered: filteredFlights.length, total: flights.length }, `Showing ${filteredFlights.length} of ${flights.length} flights`)}
          </span>
        </div>
      )}

      {/* ─── Main Two-Column Content Layout ─── */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-bold text-slate-600">{t('flight.loading', 'Retrieving flight schedules & real-time seat availability...')}</p>
        </div>
      ) : error ? (
        <EmptyState
          title={t('common.error', 'Search encountered an issue')}
          description={error}
          actionLabel={t('action.retry', 'Try Again')}
          onAction={fetchData}
        />
      ) : mode === 'trains' ? (
        /* Trains View */
        <div className="space-y-4">
          {trains.length === 0 ? (
            <EmptyState
              title={t('flight.no_trains_title', 'No direct trains available')}
              description={t('flight.no_trains_desc', { origin, destination, date: departureDate }, `No train routes found between ${origin} and ${destination} on ${departureDate}.`)}
              actionLabel={t('flight.search_flights_instead', 'Search Flights Instead')}
              onAction={() => setSearchParams({ mode: 'flights', origin, destination, departure_date: departureDate })}
            />
          ) : (
            trains.map((train) => (
              <div
                key={train.train_number}
                className="surface-card p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{train.name}</span>
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      #{train.train_number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {train.departure_time} ({train.origin}) → {train.arrival_time} ({train.destination}) • {train.duration}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">{t('flight.fare_from', 'Fare from')}</span>
                    <CurrencyDisplay amount={train.price} className="text-lg font-black text-slate-900" />
                  </div>
                  <button
                    onClick={() => {
                      addFlight({
                        id: `train-${train.train_number}`,
                        airline: 'Indian Railways',
                        flight_number: train.train_number,
                        origin: train.origin,
                        destination: train.destination,
                        departure_time: train.departure_time,
                        arrival_time: train.arrival_time,
                        duration: train.duration,
                        price: train.price,
                        seats_available: 45,
                        stops: 0,
                        cabin_class: 'Sleeper/3AC',
                        baggage_policy: 'Standard baggage allowed',
                        cancellation_policy: 'Railway cancellation rules apply',
                      });
                    }}
                    className="btn-primary text-xs py-2 px-4 font-bold shadow-sm"
                  >
                    {t('flight.select_train', 'Select Train')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : mode === 'buses' ? (
        /* Buses View */
        <div className="space-y-4">
          {buses.length === 0 ? (
            <EmptyState
              title={t('flight.no_buses_title', 'No direct buses available')}
              description={t('flight.no_buses_desc', { origin, destination, date: departureDate }, `No bus departures found between ${origin} and ${destination} on ${departureDate}.`)}
              actionLabel={t('flight.search_flights_instead', 'Search Flights Instead')}
              onAction={() => setSearchParams({ mode: 'flights', origin, destination, departure_date: departureDate })}
            />
          ) : (
            buses.map((bus) => (
              <div
                key={bus.operator + bus.departure_time}
                className="surface-card p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{bus.operator}</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {bus.bus_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {bus.departure_time} ({bus.origin}) → {bus.arrival_time} ({bus.destination}) • {bus.duration}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">{t('flight.fare_from', 'Fare from')}</span>
                    <CurrencyDisplay amount={bus.price} className="text-lg font-black text-slate-900" />
                  </div>
                  <button
                    onClick={() => {
                      addFlight({
                        id: `bus-${bus.operator}-${bus.departure_time}`,
                        airline: bus.operator,
                        flight_number: 'BUS-EXP',
                        origin: bus.origin,
                        destination: bus.destination,
                        departure_time: bus.departure_time,
                        arrival_time: bus.arrival_time,
                        duration: bus.duration,
                        price: bus.price,
                        seats_available: 22,
                        stops: 0,
                        cabin_class: 'AC Sleeper',
                        baggage_policy: '15kg luggage allowed',
                        cancellation_policy: 'Free cancellation up to 6 hours prior',
                      });
                    }}
                    className="btn-primary text-xs py-2 px-4 font-bold shadow-sm"
                  >
                    {t('flight.select_bus', 'Select Bus')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Flights Two-Column View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sticky Filters Sidebar */}
          <div className="lg:col-span-3">
            <FlightFilter
              airlines={allAirlines}
              selectedAirlines={selectedAirlines}
              onAirlineChange={handleAirlineChange}
              selectedStops={selectedStops}
              onStopsChange={handleStopsChange}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              maxPrice={maxAvailablePrice}
              departureTimeFilter={departureTimeFilter}
              onDepartureTimeFilterChange={setDepartureTimeFilter}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Right Column: Flight Cards Stream */}
          <div className="lg:col-span-9 space-y-4">
            {filteredFlights.length === 0 ? (
              <EmptyState
                title={t('flight.empty_title', 'No flights match your filters')}
                description={t('flight.empty_desc', 'Try broadening your price range, stop criteria, or airline filters.')}
                actionLabel={t('flight.reset_filters', 'Reset Filters')}
                onAction={handleResetFilters}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${sortBy}-${selectedAirlines.join(',')}-${selectedStops.join(',')}-${priceRange}-${departureTimeFilter || ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {filteredFlights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} passengers={passengers} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {/* Location & Date Modals for Edit Drawer */}
      <LocationSelectorModal
        isOpen={isEditFromOpen}
        onClose={() => setIsEditFromOpen(false)}
        onSelect={(item) => setEditOrigin(item.city)}
        title={t('modal.location.change_departure', 'Change Departure City')}
        placeholder={t('search.where_from', 'Search origin...')}
      />
      <LocationSelectorModal
        isOpen={isEditToOpen}
        onClose={() => setIsEditToOpen(false)}
        onSelect={(item) => setEditDestination(item.city)}
        title={t('modal.location.change_destination', 'Change Destination')}
        placeholder={t('search.where_to', 'Search destination...')}
      />
      <CustomDatePicker
        isOpen={isEditDateOpen}
        onClose={() => setIsEditDateOpen(false)}
        departureDate={editDate}
        onSelectDeparture={setEditDate}
      />
    </div>
  );
};
