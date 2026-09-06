import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  CloudSun,
  Plane,
  Building2,
  Car,
  ShoppingBag,
  ShieldCheck,
  PieChart,
  Bell,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { CurrencyDisplay } from '../../components/Common/CurrencyDisplay';
import { PreDepartureReminder } from '../../types';

export const BeforeYouGoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTravelSettings();
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    tripNights,
    travellers,
    budget,
    plannedCost,
    actualSpent,
    remainingBudget,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    packingList,
    documentChecklist,
  } = useTripBuilder();

  // Calculated packing & documents progress
  const totalPacking = packingList.length;
  const packedCount = packingList.filter((i) => i.checked).length;
  const packingPercentage = totalPacking > 0 ? Math.round((packedCount / totalPacking) * 100) : 0;

  const totalDocs = documentChecklist.length;
  const readyDocs = documentChecklist.filter((d) => d.completed).length;
  const docsPercentage = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0;

  // Evidence-based Trip Readiness Score (Calculated from actual items)
  const readinessScore = useMemo(() => {
    let score = 0;
    if (selectedTravel) score += 20;
    if (selectedStay) score += 20;
    if (selectedMobility) score += 10;
    if (totalPacking > 0) score += Math.round((packedCount / totalPacking) * 25);
    if (totalDocs > 0) score += Math.round((readyDocs / totalDocs) * 20);
    if (budget > 0 && remainingBudget >= 0) score += 5;
    return Math.min(100, score);
  }, [selectedTravel, selectedStay, selectedMobility, totalPacking, packedCount, totalDocs, readyDocs, budget, remainingBudget]);

  const reminders: PreDepartureReminder[] = [
    {
      id: 'rem-7d',
      timeframe: '7_days',
      timeframeLabel: '7 Days Before',
      title: 'Review Documents & Packing List',
      message: `${readyDocs}/${totalDocs} documents ready. ${totalPacking - packedCount} packing items pending.`,
      actionLabel: 'Review Packing',
      actionRoute: '/packing-assistant',
    },
    {
      id: 'rem-3d',
      timeframe: '3_days',
      timeframeLabel: '3 Days Before',
      title: 'Weather Outlook in ' + destination,
      message: '28°C Pleasant & Sunny forecast with mild coastal breeze.',
    },
    {
      id: 'rem-1d',
      timeframe: '1_day',
      timeframeLabel: '1 Day Before',
      title: 'Airport Transfer Scheduled',
      message: selectedMobility
        ? `Confirmed ${selectedMobility.vehicleModel} pickup from airport.`
        : 'Airport transfer not yet arranged.',
      actionLabel: selectedMobility ? undefined : 'Plan Transfer',
      actionRoute: selectedMobility ? undefined : '/trip-builder',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Readiness Banner */}
      <div className="surface-card p-6 sm:p-10 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
            <Compass className="w-3.5 h-3.5" />
            <span>{t('prep.badge', 'BEFORE YOU GO • PRE-DEPARTURE READINESS')}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight">
            {t('prep.ready_title', { destination }, `Ready to Travel to ${destination}?`)}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t('prep.departure_info', { departureDate, origin, nights: tripNights || 4, travellers }, `Departure on ${departureDate} from ${origin} • ${tripNights || 4} Nights for ${travellers} Guests.`)}
          </p>
        </div>

        {/* Master Trip Readiness Score */}
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-2xl text-center space-y-2 min-w-[240px]">
          <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider block">
            {t('prep.readiness_score', 'Trip Readiness Score')}
          </span>
          <div className="text-4xl sm:text-5xl font-black font-editorial text-white tracking-tight">
            {readinessScore}%
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                readinessScore >= 85
                  ? 'bg-emerald-400'
                  : readinessScore >= 60
                  ? 'bg-[#C8A96B]'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#C8A96B] block">
            {readinessScore >= 85 ? t('prep.ready_status', '✓ Ready for Departure') : t('prep.pending_status', '⚠️ Action items pending')}
          </span>
        </div>
      </div>

      {/* 6 Essential Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. WEATHER CARD */}
        <div className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-[#0B1220]">{t('prep.weather_title', 'Weather Forecast')}</h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                {t('prep.weather_tag', 'Lush & Pleasant')}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {t('prep.weather_desc', 'Expected temperatures around 28°C with clear sunny mornings and coastal breeze.')}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('itinerary.day', { number: 1 }, 'Day 1')}</span>
                <strong className="text-slate-900">28°C</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('itinerary.day', { number: 2 }, 'Day 2')}</span>
                <strong className="text-slate-900">27°C</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">{t('itinerary.day', { number: 3 }, 'Day 3')}</span>
                <strong className="text-slate-900">29°C</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/itinerary')}
            className="w-full btn-secondary text-xs !py-2 font-bold flex items-center justify-center gap-1"
          >
            <span>{t('prep.view_forecast', 'View Itinerary Forecast')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. RESERVATIONS CARD */}
        <div className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-[#0B1220]">{t('prep.reservations_title', 'Reservations')}</h3>
              </div>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                {t('prep.components_tag', 'Components')}
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Plane className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('prep.flight_booking', 'Flight Booking:')}</span>
                </span>
                <strong className={selectedTravel ? 'text-emerald-700' : 'text-amber-600'}>
                  {selectedTravel ? t('prep.selected', '✓ Selected') : t('prep.pending', '⚠️ Pending')}
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('prep.hotel_stay', 'Hotel Stay:')}</span>
                </span>
                <strong className={selectedStay ? 'text-emerald-700' : 'text-amber-600'}>
                  {selectedStay ? t('prep.selected', '✓ Selected') : t('prep.pending', '⚠️ Pending')}
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('nav.activities', 'Activities:')}</span>
                </span>
                <strong className="text-emerald-700">
                  {selectedActivities.length} {t('prep.experiences_count', 'Experiences')}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/trip-builder')}
            className="w-full btn-secondary text-xs !py-2 font-bold flex items-center justify-center gap-1"
          >
            <span>{t('prep.manage_components', 'Manage Components')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. PACKING CARD */}
        <div className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C8A96B]" />
                <h3 className="font-bold text-base text-[#0B1220]">Packing Checklist</h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                {packingPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-600">
              <strong>{packedCount}</strong> of <strong>{totalPacking}</strong> items packed. Duration-aware for {tripNights || 4} nights.
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C8A96B] h-full transition-all duration-300"
                style={{ width: `${packingPercentage}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/packing-assistant')}
            className="w-full btn-primary text-xs !py-2 font-bold flex items-center justify-center gap-1 shadow-xs"
          >
            <span>Continue Packing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. TRANSFERS CARD */}
        <div className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-[#0B1220]">Airport Transfer</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                Transit
              </span>
            </div>
            {selectedMobility ? (
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <strong className="text-emerald-950 block">{selectedMobility.vehicleModel}</strong>
                <p className="text-[11px] text-emerald-800">{selectedMobility.route} • {selectedMobility.provider}</p>
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">✓ Confirmed Transfer</span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <p className="text-amber-900 font-medium">No airport pickup scheduled yet.</p>
                <span className="text-[10px] text-amber-700 block">Arrange transfer to avoid terminal surge pricing.</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate('/trip-builder')}
            className="w-full btn-secondary text-xs !py-2 font-bold flex items-center justify-center gap-1"
          >
            <span>{selectedMobility ? 'View Transfer' : 'Plan Transfer'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5. BUDGET CARD */}
        <div className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-[#0B1220]">Budget & Money</h3>
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                Financials
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Total Target:</span>
                <CurrencyDisplay amount={budget} className="font-bold text-slate-900" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Planned Cost:</span>
                <CurrencyDisplay amount={plannedCost} className="font-bold text-slate-900" />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Remaining Buffer:</span>
                <CurrencyDisplay
                  amount={remainingBudget}
                  className={`font-black ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/budget')}
            className="w-full btn-secondary text-xs !py-2 font-bold flex items-center justify-center gap-1"
          >
            <span>Open Budget Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6. DOCUMENTS CARD */}
        <div className="surface-card rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-luxury transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-[#0B1220]">Documents</h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                {docsPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-600">
              <strong>{readyDocs}</strong> of <strong>{totalDocs}</strong> required documents marked ready.
            </p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${docsPercentage}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/documents-checklist')}
            className="w-full btn-primary text-xs !py-2 font-bold flex items-center justify-center gap-1 shadow-xs"
          >
            <span>Review Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pre-Departure Timed Reminders */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#C8A96B]" />
          <h3 className="font-bold text-lg text-[#0B1220] font-editorial">Pre-Departure Timed Reminders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reminders.map((rem) => (
            <div key={rem.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  {rem.timeframeLabel}
                </span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{rem.title}</h4>
              <p className="text-slate-600 text-xs leading-relaxed">{rem.message}</p>
              {rem.actionRoute && (
                <button
                  type="button"
                  onClick={() => navigate(rem.actionRoute!)}
                  className="text-xs text-blue-600 font-bold hover:underline inline-block pt-1"
                >
                  {rem.actionLabel} →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Quick Help Bar */}
      <div className="surface-card p-6 rounded-3xl bg-rose-950 text-white border border-rose-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-rose-300" />
            <h4 className="font-bold text-sm text-white">Emergency & Travel Support Directory</h4>
          </div>
          <p className="text-xs text-rose-200">
            Official emergency hotlines, nearby 24/7 hospitals, police stations, and TripPilot concierge.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/travel-help')}
          className="btn-primary !bg-white !text-rose-950 hover:!bg-rose-100 text-xs !py-2.5 px-5 font-bold rounded-xl whitespace-nowrap shadow-xs"
        >
          Open Travel Help
        </button>
      </div>
    </div>
  );
};
