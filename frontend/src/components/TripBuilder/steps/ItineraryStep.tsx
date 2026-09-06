import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Plus, Trash2, Edit2, RotateCcw, ChevronRight, Check, Sparkles, Plane, Car, Building2, Utensils, AlertTriangle, ArrowRight, ArrowLeftRight, MoveRight, X, Compass, RefreshCw, Zap } from 'lucide-react';
import { useTripBuilder, ItineraryEvent } from '../../../context/TripBuilderContext';
import { useTravelSettings } from '../../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../Common/CurrencyDisplay';
import { WeatherMonitoringDashboard } from '../../Weather/WeatherMonitoringDashboard';
import { SmartWeatherAlertBanner } from '../../Weather/SmartWeatherAlertBanner';
import { AdaptiveIntelligenceModal } from '../../Itinerary/AdaptiveIntelligenceModal';
import { TravelTimeOptimizationBanner } from '../../Itinerary/TravelTimeOptimizationBanner';
import { SmartTripTimeline } from '../../Itinerary/SmartTripTimeline';
import { OptimizeDayModal } from '../../Itinerary/OptimizeDayModal';
import { WhatShouldIDoNowModal } from '../../AI/WhatShouldIDoNowModal';

export const ItineraryStep: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    destination,
    departureDate,
    returnDate,
    tripNights,
    customItinerary,
    detectedConflicts,
    updateItineraryEvent,
    moveItineraryEvent,
    addCustomItineraryEvent,
    removeItineraryEvent,
    regenerateItinerary,
    lastWeatherSnapshot,
    undoWeatherAdaptation,
    goToNextStep,
    goToPrevStep,
  } = useTripBuilder();

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [newEventModalOpen, setNewEventModalOpen] = useState(false);
  const [editEventModalOpen, setEditEventModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [adaptiveModalOpen, setAdaptiveModalOpen] = useState(false);
  const [optimizeDayModalDay, setOptimizeDayModalDay] = useState<number | null>(null);
  const [whatShouldIDoNowOpen, setWhatShouldIDoNowOpen] = useState(false);

  // Add event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('04:00 PM');
  const [newEventLocation, setNewEventLocation] = useState(destination);
  const [newEventCost, setNewEventCost] = useState<number>(0);
  const [newEventType, setNewEventType] = useState<'activity' | 'dining' | 'custom'>('activity');

  // Edit event state
  const [activeEditingEvent, setActiveEditingEvent] = useState<ItineraryEvent | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCost, setEditCost] = useState<number>(0);
  const [editDescription, setEditDescription] = useState('');

  // Move event state
  const [activeMovingEvent, setActiveMovingEvent] = useState<ItineraryEvent | null>(null);
  const [targetDay, setTargetDay] = useState<number>(1);

  // Replace event state
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [activeReplacingEvent, setActiveReplacingEvent] = useState<ItineraryEvent | null>(null);

  // Active tab: day schedule or smart timeline
  const [activeItinTab, setActiveItinTab] = useState<'schedule' | 'timeline'>('schedule');

  // Replace alternatives catalogue
  const replaceAlternatives = [
    { id: 'rep-1', title: 'Museum & Heritage Walk', type: 'activity', cost: 800, desc: 'Curated cultural & history tour with expert local guide.' },
    { id: 'rep-2', title: 'Food Tour & Market Crawl', type: 'dining', cost: 1200, desc: 'Street food discovery across 5–6 authentic local stalls.' },
    { id: 'rep-3', title: 'Spa & Wellness Session', type: 'activity', cost: 1500, desc: 'Ayurvedic 60-minute rejuvenation package.' },
    { id: 'rep-4', title: 'Sunset Cruise', type: 'activity', cost: 1800, desc: 'Private sunset catamaran cruise with onboard refreshments.' },
    { id: 'rep-5', title: 'Shopping & Craft Bazaar', type: 'activity', cost: 500, desc: 'Local artisan marketplace — textiles, spices, and souvenirs.' },
    { id: 'rep-6', title: 'Beach Relaxation & Water Sports', type: 'activity', cost: 900, desc: 'Jet ski, parasailing and open beach time at uncrowded sands.' },
  ];

  const handleOpenReplaceModal = (ev: ItineraryEvent) => {
    setActiveReplacingEvent(ev);
    setReplaceModalOpen(true);
  };

  const handleReplaceWithAlternative = (alt: typeof replaceAlternatives[0]) => {
    if (!activeReplacingEvent) return;
    updateItineraryEvent(activeReplacingEvent.id, {
      title: alt.title,
      type: alt.type as any,
      description: alt.desc,
      cost: alt.cost,
    });
    setReplaceModalOpen(false);
    setActiveReplacingEvent(null);
  };

  const totalDays = Math.max(2, tripNights || 4);

  // Group events by day
  const eventsByDay = Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => ({
    day: dayNum,
    events: customItinerary.filter((ev) => ev.day === dayNum),
  }));

  const handleOpenAddModal = (presetType: 'activity' | 'dining' | 'custom' = 'activity') => {
    setNewEventType(presetType);
    if (presetType === 'dining') {
      setNewEventTitle('Dinner at Coastal Sunset Bistro');
      setNewEventTime('08:00 PM');
    } else {
      setNewEventTitle('');
      setNewEventTime('03:30 PM');
    }
    setNewEventLocation(destination);
    setNewEventCost(0);
    setNewEventModalOpen(true);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    addCustomItineraryEvent(selectedDay, {
      date: departureDate,
      time: newEventTime,
      title: newEventTitle.trim(),
      type: newEventType,
      location: newEventLocation,
      cost: newEventCost || 0,
      description: `${newEventType === 'dining' ? 'Dining & culinary stop' : 'Custom added experience'} in ${destination}`,
    });

    setNewEventTitle('');
    setNewEventModalOpen(false);
  };

  const handleOpenEditModal = (ev: ItineraryEvent) => {
    setActiveEditingEvent(ev);
    setEditTitle(ev.title);
    setEditTime(ev.time);
    setEditLocation(ev.location || destination);
    setEditCost(ev.cost || 0);
    setEditDescription(ev.description || '');
    setEditEventModalOpen(true);
  };

  const handleEditEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEditingEvent || !editTitle.trim()) return;

    updateItineraryEvent(activeEditingEvent.id, {
      title: editTitle.trim(),
      time: editTime,
      location: editLocation,
      cost: editCost,
      description: editDescription,
    });

    setEditEventModalOpen(false);
    setActiveEditingEvent(null);
  };

  const handleOpenMoveModal = (ev: ItineraryEvent) => {
    setActiveMovingEvent(ev);
    setTargetDay(ev.day);
    setMoveModalOpen(true);
  };

  const handleMoveEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMovingEvent) return;

    moveItineraryEvent(activeMovingEvent.id, targetDay);
    setMoveModalOpen(false);
    setActiveMovingEvent(null);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'travel':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'transport':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'stay':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'dining':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      default:
        return <Compass className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96B] block mb-0.5">
            {t('step.itinerary.header_step', 'Step 5 of 6 • Automated Daily Timeline')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B1220] tracking-tight">
            {t('step.itinerary.title', { destination }, `Review & Customize Daily Itinerary for ${destination}`)}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('step.itinerary.subtitle', { destination }, 'Every item can be edited, moved across days, replaced, or removed without breaking other plans.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPrevStep}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {t('step.itinerary.back_activities', '← Back to Activities')}
          </button>
          <button
            type="button"
            onClick={goToNextStep}
            className="btn-primary text-xs !py-2 px-4.5 font-bold shadow-sm flex items-center gap-1.5"
          >
            <span>{t('sidebar.continue_to', { step: t('step.review', 'Review & Book') }, 'Continue to Review')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Smart Proactive Weather Alert Banner */}
      <SmartWeatherAlertBanner destination={destination} departureDate={departureDate} />

      {/* Weather Monitoring Dashboard */}
      <WeatherMonitoringDashboard
        destination={destination}
        departureDate={departureDate}
        totalDays={totalDays}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      {/* Undo Weather Adaptation Toast */}
      {lastWeatherSnapshot && (
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">
              {t('weather.undo_available', 'Weather adaptation was applied to Day {day}.', {
                day: lastWeatherSnapshot.dayNumber,
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={undoWeatherAdaptation}
            className="font-bold text-blue-700 dark:text-blue-300 underline hover:text-blue-900"
          >
            {t('weather.undo_btn', 'Undo & Revert to Original Day {day}', {
              day: lastWeatherSnapshot.dayNumber,
            })}
          </button>
        </div>
      )}

      {/* Smart Travel Time Optimization Banner */}
      <TravelTimeOptimizationBanner />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() => setActiveItinTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeItinTab === 'schedule' ? 'bg-[#0B1220] text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('step.itinerary.tab_schedule', '📋 Day-by-Day Schedule')}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() => setActiveItinTab('timeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeItinTab === 'timeline' ? 'bg-[#0B1220] text-white shadow-xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('step.itinerary.tab_timeline', '🗓 Smart Trip Timeline')}
        </motion.button>
      </div>

      {activeItinTab === 'timeline' ? (
        <SmartTripTimeline />
      ) : (
        <>
          {/* Day Selector Pills & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {eventsByDay.map(({ day, events }) => {
                const hasConflict = detectedConflicts.some((c) => c.dayNumber === day);
                return (
                  <motion.button
                    key={day}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      selectedDay === day
                        ? 'bg-[#0B1220] text-white shadow-xs'
                        : hasConflict
                        ? 'bg-amber-50 text-amber-900 border border-amber-300'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <span>{t('step.itinerary.day', { day }, `Day ${day}`)}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      selectedDay === day ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {events.length}
                    </span>
                    {hasConflict && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title={t('step.itinerary.weather_advisory', 'Weather advisory on this day')} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={regenerateItinerary}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                title={t('step.itinerary.reset_tooltip', 'Reset timeline from selections')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('step.itinerary.sync_blueprint', 'Sync Blueprint')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddModal('activity')}
                className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('step.itinerary.add_stop', '+ Add Stop')}</span>
              </button>
            </div>
          </div>

          {/* Active Day Timeline */}
          <div className="surface-card p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-[#0B1220] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C8A96B]" />
                  <span>{t('step.itinerary.day_schedule', { day: selectedDay }, `Day ${selectedDay} Schedule`)}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('step.itinerary.stops_planned', { count: eventsByDay.find((d) => d.day === selectedDay)?.events.length || 0 }, `${eventsByDay.find((d) => d.day === selectedDay)?.events.length || 0} stops planned for this day`)}
                </p>
              </div>

              {/* Quick-add category shortcuts + Optimize Day */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setOptimizeDayModalDay(selectedDay)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0B1220] hover:bg-[#1a2440] text-[#C8A96B] border border-[#C8A96B]/30 flex items-center gap-1 transition-colors"
                  title="AI: Optimize today's schedule for best flow"
                >
                  <Zap className="w-3 h-3" />
                  <span>{t('step.itinerary.optimize_day', '⚡ Optimize Day')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWhatShouldIDoNowOpen(true)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 transition-colors"
                  title="AI: Get smart suggestions for free gaps"
                >
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>{t('step.itinerary.what_now', '💡 What to do now?')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('activity')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('step.itinerary.add_activity', '+ Activity')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('dining')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 transition-colors"
                >
                  <Utensils className="w-3 h-3" />
                  <span>{t('step.itinerary.add_dining', '+ Dining')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal('custom')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{t('step.itinerary.add_note', '+ Note')}</span>
                </button>
              </div>
            </div>

          {/* Events Schedule for Active Day */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {eventsByDay.find((d) => d.day === selectedDay)?.events.length === 0 ? (
                <div className="py-12 text-center space-y-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                  <div className="w-10 h-10 rounded-2xl bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">{t('step.itinerary.empty_day_title', { day: selectedDay }, `No scheduled activities for Day ${selectedDay}.`)}</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">{t('step.itinerary.empty_day_desc', 'Add a custom sight, dining reservation, beach time, or excursion.')}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModal('activity')}
                    className="btn-primary text-xs !py-2 px-4 font-bold"
                  >
                    {t('step.itinerary.add_first_event', '+ Add First Event')}
                  </button>
                </div>
              ) : (
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {eventsByDay
                  .find((d) => d.day === selectedDay)
                  ?.events.map((ev) => {
                    const eventConflict = detectedConflicts.find((c) => c.eventId === ev.id);
                    return (
                      <div key={ev.id} className="relative group">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[31px] top-1.5 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-xs ${
                          eventConflict ? 'border-amber-500 ring-2 ring-amber-200' : 'border-[#0B1220]'
                        }`}>
                          {getEventIcon(ev.type)}
                        </div>

                        <div className={`p-4 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                          eventConflict
                            ? 'bg-amber-50/70 border border-amber-300 ring-1 ring-amber-200'
                            : 'bg-slate-50 border border-slate-200/90 group-hover:border-slate-300 group-hover:bg-white shadow-xs'
                        }`}>
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#0B1220] bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
                                {ev.time}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {ev.type}
                              </span>
                              {eventConflict && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-200/90 text-amber-900 px-2 py-0.2 rounded border border-amber-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-800" />
                                  <span>{t('step.itinerary.weather_advisory', 'Weather / Tide Advisory')}</span>
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-[#0B1220] pt-0.5">{ev.title}</h4>

                            {eventConflict && (
                              <div className="p-2.5 my-1.5 rounded-lg bg-white/90 border border-amber-200 text-xs text-amber-900 space-y-1">
                                <p className="leading-relaxed font-medium">⚠️ {eventConflict.impactExplanation}</p>
                                <button
                                  type="button"
                                  onClick={() => setAdaptiveModalOpen(true)}
                                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 mt-1"
                                >
                                  <span>{t('step.itinerary.review_adaptive', '⚡ Review Adaptive Resolution & Plan B')}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {ev.description && (
                              <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                            )}
                            {ev.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>{ev.location}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Controls: Edit, Move Day, Replace, Remove */}
                          <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 w-full sm:w-auto justify-end">
                            {ev.cost && ev.cost > 0 ? (
                              <CurrencyDisplay amount={ev.cost} className="text-xs font-black text-slate-800 mr-1" />
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(ev)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-[#0B1220] bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                              title={t('step.itinerary.action_edit', 'Edit this stop')}
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>{t('step.itinerary.action_edit', 'Edit')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenMoveModal(ev)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-[#0B1220] bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1"
                              title={t('step.itinerary.action_move', 'Move to another day')}
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              <span>{t('step.itinerary.action_move', 'Move')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReplaceModal(ev)}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                              title={t('step.itinerary.action_replace', 'Replace with alternative')}
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{t('step.itinerary.action_replace', 'Replace')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => removeItineraryEvent(ev.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                              title={t('step.itinerary.remove_stop', 'Remove from timeline')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            </motion.div>
          </AnimatePresence>
          </div>
        </>
      )}

      {/* Adaptive Modal */}

      {adaptiveModalOpen && (
        <AdaptiveIntelligenceModal onClose={() => setAdaptiveModalOpen(false)} />
      )}

      {/* Replace Activity Modal */}
      {replaceModalOpen && activeReplacingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-base text-[#0B1220]">{t('step.itinerary.replace_modal_title', 'Replace Activity')}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t('step.itinerary.replacing', 'Replacing:')} <strong>{activeReplacingEvent.title}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => { setReplaceModalOpen(false); setActiveReplacingEvent(null); }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">{t('step.itinerary.replace_desc', 'Select an alternative from curated options below. Your approval is required before any change is applied.')}</p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {replaceAlternatives.map((alt) => (
                <div key={alt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="font-bold text-sm text-slate-900 block">{alt.title}</span>
                    <span className="text-xs text-slate-500">{alt.desc}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <CurrencyDisplay amount={alt.cost} className="text-xs font-bold text-slate-800" />
                      <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">{alt.type}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReplaceWithAlternative(alt)}
                    className="btn-primary text-xs !py-2 px-3 font-bold rounded-xl whitespace-nowrap"
                  >
                    {t('step.itinerary.confirm_replace', '✓ Replace')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editEventModalOpen && activeEditingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-[#0B1220]">{t('step.itinerary.edit_modal_title', 'Edit Timeline Stop')}</h4>
              <button
                type="button"
                onClick={() => setEditEventModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditEventSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_title', 'Title')}</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_time', 'Time Slot')}</label>
                  <input
                    type="text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_cost', 'Estimated Cost (₹)')}</label>
                  <input
                    type="number"
                    min={0}
                    value={editCost || ''}
                    onChange={(e) => setEditCost(Number(e.target.value))}
                    placeholder="0"
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_location', 'Location')}</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_notes', 'Notes / Description')}</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditEventModalOpen(false)}
                  className="btn-secondary text-xs !py-2 px-4"
                >
                  {t('modal.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold">
                  {t('step.itinerary.update_stop', 'Update Stop')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Event Modal */}
      {moveModalOpen && activeMovingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-[#0B1220]">{t('step.itinerary.move_modal_title', 'Move Stop to Another Day')}</h4>
              <button
                type="button"
                onClick={() => setMoveModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {t('step.itinerary.move_desc', 'Select which day you would like to move')} <span className="font-bold text-slate-900">{activeMovingEvent.title}</span> {t('step.itinerary.move_to', 'to:')}
            </p>

            <form onSubmit={handleMoveEventSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTargetDay(d)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      targetDay === d
                        ? 'bg-[#0B1220] text-white border-[#0B1220] ring-1 ring-[#0B1220]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('step.itinerary.day', { day: d }, `Day ${d}`)} {d === activeMovingEvent.day && `(${t('step.itinerary.current', 'Current')})`}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveModalOpen(false)}
                  className="btn-secondary text-xs !py-2 px-4"
                >
                  {t('modal.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold">
                  {t('step.itinerary.confirm_move', 'Confirm Move')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Event Modal */}
      {newEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-[#0B1220]">{t('step.itinerary.add_modal_title', { day: selectedDay }, `Add Stop to Day ${selectedDay}`)}</h4>
              <button
                type="button"
                onClick={() => setNewEventModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_event_name', 'Event / Activity Name')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('step.itinerary.event_placeholder', 'e.g., Sunset Drinks at Vagator Cliff')}
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_time', 'Time Slot')}</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_category', 'Category')}</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="input-field text-xs"
                  >
                    <option value="activity">{t('step.itinerary.cat_activity', 'Activity / Tour')}</option>
                    <option value="dining">{t('step.itinerary.cat_dining', 'Dining & Cafés')}</option>
                    <option value="custom">{t('step.itinerary.cat_custom', 'Custom Stop / Note')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_location', 'Location / Landmark')}</label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('step.itinerary.field_cost', 'Estimated Cost (₹)')}</label>
                  <input
                    type="number"
                    min={0}
                    value={newEventCost || ''}
                    placeholder="0"
                    onChange={(e) => setNewEventCost(Number(e.target.value))}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewEventModalOpen(false)}
                  className="btn-secondary text-xs !py-2 px-4"
                >
                  {t('modal.cancel', 'Cancel')}
                </button>
                <button type="submit" className="btn-primary text-xs !py-2 px-5 font-bold">
                  {t('step.itinerary.save_stop', 'Save Stop')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Optimize Day Modal */}
      {optimizeDayModalDay !== null && (
        <OptimizeDayModal
          dayNumber={optimizeDayModalDay}
          onClose={() => setOptimizeDayModalDay(null)}
        />
      )}

      {/* What Should I Do Now Modal */}
      {whatShouldIDoNowOpen && (
        <WhatShouldIDoNowModal
          isOpen={whatShouldIDoNowOpen}
          onClose={() => setWhatShouldIDoNowOpen(false)}
          defaultDay={selectedDay}
        />
      )}
    </div>
  );
};


