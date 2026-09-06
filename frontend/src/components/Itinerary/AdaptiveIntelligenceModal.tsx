import React, { useState } from 'react';
import {
  X,
  CloudSun,
  CloudRain,
  Sun,
  Waves,
  Wind,
  AlertTriangle,
  Sparkles,
  Check,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Bell,
  Users,
  Eye,
  Info,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { TravelGroupType, NotificationSettings } from '../../types/adaptiveWeather';
import { adaptiveWeatherService } from '../../services/adaptiveWeatherService';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

export const AdaptiveIntelligenceModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    destination,
    departureDate,
    travellers,
    groupType,
    setGroupType,
    detectedConflicts,
    applyConflictOptimization,
    activePlanVersion,
    togglePlanVersion,
    notificationSettings,
    updateNotificationSettings,
  } = useTripBuilder();

  const [activeTab, setActiveTab] = useState<'conflicts' | 'plan_ab' | 'telemetry' | 'notifications'>('conflicts');
  const [selectedDayPlanB, setSelectedDayPlanB] = useState<number>(4);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const forecast = adaptiveWeatherService.getDestinationForecast(destination, departureDate, 5);
  const planBScenario = adaptiveWeatherService.getPlanBScenario(selectedDayPlanB, destination, departureDate, groupType, travellers);

  const groupTypeLabels: Record<TravelGroupType, string> = {
    solo: 'Solo Traveller',
    couple: 'Couple',
    family: 'Family',
    family_kids: 'Family with Children',
    friends: 'Friends Group',
    group: 'Large Group',
    business: 'Business Trip',
    students: 'Students / Youth',
  };

  const handleApplyOptimization = (conflictId: string, choice: 'time_shift' | 'alternative') => {
    applyConflictOptimization(conflictId, choice);
    setSuccessToast(
      choice === 'time_shift'
        ? '✓ Schedule adjusted: Moved outdoor excursion to optimal morning clear window.'
        : '✓ Itinerary optimized: Replaced with indoor sheltered experience and updated trip budget.'
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleTogglePlanB = (dayNum: number, version: 'A' | 'B') => {
    togglePlanVersion(dayNum, version);
    setSuccessToast(`✓ Activated Plan ${version} for Day ${dayNum}.`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-luxury border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-[#0B1220] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-[#C8A96B] flex items-center justify-center font-bold">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#C8A96B] text-[#0B1220] uppercase tracking-wider">
                  ADAPTIVE ITINERARY INTELLIGENCE
                </span>
                <span className="text-xs text-slate-300">• {destination}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                Meteorological Impact Analysis & Plan B
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close adaptive intelligence modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{successToast}</span>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-Header Tabs & Group Type Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            {[
              { id: 'conflicts', label: `Impact Advisories (${detectedConflicts.length})` },
              { id: 'plan_ab', label: 'Plan A vs Plan B' },
              { id: 'telemetry', label: 'Marine & Tide Forecast' },
              { id: 'notifications', label: 'Alert Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#0B1220] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Group Profile:</span>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as TravelGroupType)}
              aria-label="Select travelling group profile"
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 text-[11px] focus:outline-none"
            >
              {Object.entries(groupTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="p-5 sm:p-7 max-h-[70vh] overflow-y-auto space-y-6 text-slate-800">
          {/* ─── TAB 1: CONFLICTS & AI REASONING ─── */}
          {activeTab === 'conflicts' && (
            <div className="space-y-5">
              {detectedConflicts.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <ShieldCheck className="w-10 h-10 text-[#158A6A] mx-auto" />
                  <h4 className="font-bold text-base text-[#0B1220]">No Weather Disruptions Detected</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All scheduled outdoor, coastal, and sightseeing activities are well aligned with clear weather and calm marine tide windows.
                  </p>
                </div>
              ) : (
                detectedConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-amber-300 shadow-sm space-y-4"
                  >
                    {/* Conflict Title & Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                          {conflict.conflictType === 'rain'
                            ? 'HEAVY PRECIPITATION ALERT'
                            : conflict.conflictType === 'rough_sea'
                            ? 'MARINE SWELL ADVISORY'
                            : 'WEATHER IMPACT NOTICE'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">Day {conflict.dayNumber}</span>
                      </div>

                      <span className="text-xs font-mono font-bold text-slate-600">
                        Original Time: {conflict.originalTime}
                      </span>
                    </div>

                    {/* Conflict Event Details */}
                    <div>
                      <h4 className="font-editorial text-lg font-bold text-[#0B1220]">
                        Disruption Detected: {conflict.eventTitle}
                      </h4>
                    </div>

                    {/* AI Explanation Box */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>WHY TRIPPILOT RECOMMENDS AN ADJUSTMENT:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{conflict.impactExplanation}</p>
                    </div>

                    {/* Adaptation Options */}
                    <div className="space-y-3 pt-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Choose Recommended Resolution:
                      </label>

                      {/* Option 1: Time Shift */}
                      {conflict.suggestedTimeShift && (
                        <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-bold text-[#0B1220]">
                                Shift Time Slot to {conflict.suggestedTimeShift.newTime}
                              </span>
                              <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.2 rounded">
                                Zero Cost Change
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{conflict.suggestedTimeShift.reason}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyOptimization(conflict.id, 'time_shift')}
                            className="btn-primary text-xs !py-1.5 px-4 font-bold shadow-xs whitespace-nowrap self-end sm:self-auto"
                          >
                            Apply Time Shift
                          </button>
                        </div>
                      )}

                      {/* Option 2: Group-Aware Alternative Activity */}
                      {conflict.suggestedAlternative && (
                        <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                              <span className="text-xs font-bold text-[#0B1220]">
                                Replace with: {conflict.suggestedAlternative.name}
                              </span>
                              {conflict.suggestedAlternative.priceDifference < 0 && (
                                <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.2 rounded">
                                  Saves ₹{Math.abs(conflict.suggestedAlternative.priceDifference)}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {conflict.suggestedAlternative.reason} •{' '}
                              <CurrencyDisplay amount={conflict.suggestedAlternative.cost} className="font-bold text-slate-700" />
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplyOptimization(conflict.id, 'alternative')}
                            className="btn-primary-blue text-xs !py-1.5 px-4 font-bold shadow-xs whitespace-nowrap self-end sm:self-auto"
                          >
                            Replace Activity
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── TAB 2: PLAN A VS PLAN B MODE ─── */}
          {activeTab === 'plan_ab' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-[#0B1220]">Day {selectedDayPlanB} Comparative Blueprints</h4>
                  <p className="text-xs text-slate-500">
                    Switch between original outdoor schedule and weather-adapted sheltered blueprint.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[2, 4].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDayPlanB(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedDayPlanB === d ? 'bg-white text-[#0B1220] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plan A (Original) */}
                <div
                  className={`p-5 rounded-3xl border transition-all ${
                    activePlanVersion[selectedDayPlanB] === 'A'
                      ? 'bg-white border-[#0B1220] ring-2 ring-[#0B1220]/10 shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        ORIGINAL ITINERARY
                      </span>
                      <h5 className="font-bold text-sm text-[#0B1220]">Plan A (Outdoor Schedule)</h5>
                    </div>
                    {activePlanVersion[selectedDayPlanB] === 'A' && (
                      <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                      <span className="font-mono text-[10px] text-slate-400 font-bold block">10:00 AM</span>
                      <span className="font-bold text-slate-800">Relaxed Resort Morning & Breakfast</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                      <span className="font-mono text-[10px] text-amber-700 font-bold block">02:30 PM (Rain Risk)</span>
                      <span className="font-bold text-amber-900">Palolem Beach & Ocean Swimming</span>
                      <span className="text-[10px] text-amber-700 block mt-0.5">⚠️ Rain probability 85% & High tide 4:20 PM</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                      <span className="font-mono text-[10px] text-slate-400 font-bold block">07:00 PM</span>
                      <span className="font-bold text-slate-800">Beachfront Dinner</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleTogglePlanB(selectedDayPlanB, 'A')}
                      className={`w-full text-xs font-bold py-2 rounded-xl transition-all ${
                        activePlanVersion[selectedDayPlanB] === 'A'
                          ? 'bg-slate-200 text-slate-700 cursor-default'
                          : 'btn-secondary'
                      }`}
                    >
                      {activePlanVersion[selectedDayPlanB] === 'A' ? 'Plan A Active' : 'Keep Original Plan A'}
                    </button>
                  </div>
                </div>

                {/* Plan B (Weather-Adapted) */}
                <div
                  className={`p-5 rounded-3xl border transition-all ${
                    activePlanVersion[selectedDayPlanB] === 'B'
                      ? 'bg-white border-[#0B1220] ring-2 ring-[#0B1220]/10 shadow-md'
                      : 'bg-emerald-50/60 border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#158A6A]">
                        ADAPTIVE BLUEPRINT
                      </span>
                      <h5 className="font-bold text-sm text-[#0B1220]">{planBScenario.title}</h5>
                    </div>
                    {activePlanVersion[selectedDayPlanB] === 'B' && (
                      <span className="text-[10px] font-bold text-[#158A6A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 pt-2 italic leading-relaxed">
                    "{planBScenario.rationale}"
                  </p>

                  <div className="space-y-2 pt-3 text-xs">
                    {planBScenario.events.map((ev, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-100 space-y-0.5">
                        <span className="font-mono text-[10px] text-blue-600 font-bold block">{ev.time}</span>
                        <span className="font-bold text-slate-800">{ev.title}</span>
                        <span className="text-[10px] text-slate-500 block">{ev.description}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleTogglePlanB(selectedDayPlanB, 'B')}
                      className={`w-full text-xs font-bold py-2 rounded-xl transition-all shadow-xs ${
                        activePlanVersion[selectedDayPlanB] === 'B'
                          ? 'bg-[#158A6A] text-white cursor-default'
                          : 'btn-primary'
                      }`}
                    >
                      {activePlanVersion[selectedDayPlanB] === 'B' ? 'Plan B Active' : 'Activate Adaptive Plan B'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 3: MARINE & TIDE TELEMETRY ─── */}
          {activeTab === 'telemetry' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <Waves className="w-4 h-4 text-blue-600" />
                  <span className="font-bold">Coastal Marine & Tide Telemetry Source:</span>
                  <span>National Maritime Safety & Marine Weather Cell</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-200/80 px-2 py-0.5 rounded text-blue-900">
                  Verified Sensor Feeds
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {forecast.map((f) => (
                  <div key={f.dayNumber} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-[#0B1220]">
                        {f.dayLabel} ({f.date})
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{f.tempC}°C • {f.condition}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Rainfall Window:</span>
                        <span className="font-bold text-slate-800">{f.rainTimeWindow || 'Clear'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Wind Speed:</span>
                        <span className="font-bold text-slate-800">{f.windSpeedKmh} km/h</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">High Tide Peak:</span>
                        <span className="font-bold text-slate-800">{f.tide?.highTideTime || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Sea Condition:</span>
                        <span className="font-bold text-blue-700">{f.tide?.seaCondition} ({f.tide?.waveHeightMeters}m waves)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 4: NOTIFICATION SETTINGS ─── */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#0B1220] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#C8A96B]" />
                  <span>Proactive Alert Delivery Timing</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Configure when TripPilot should notify you about real-world weather or tide changes.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                {[
                  { key: 'sevenDaysBefore', label: '7 Days Before Trip', desc: 'Long-range meteorological outlook update' },
                  { key: 'threeDaysBefore', label: '3 Days Before Trip', desc: 'Forecast stabilization and outdoor activity audit' },
                  { key: 'twentyFourHoursBefore', label: '24 Hours Before Activity', desc: 'High-probability rain & marine tide notices' },
                  { key: 'twoHoursBefore', label: '2 Hours Real-Time Alert', desc: 'Immediate cloudburst / severe condition warnings' },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() =>
                      updateNotificationSettings({
                        [item.key]: !(notificationSettings as any)[item.key],
                      })
                    }
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[#0B1220] block">{item.label}</span>
                      <span className="text-[11px] text-slate-500">{item.desc}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-colors ${
                        (notificationSettings as any)[item.key] ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      {(notificationSettings as any)[item.key] && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">
            TripPilot Weather Engine • Proactive & Transparent
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs !py-2 px-5 font-bold"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
