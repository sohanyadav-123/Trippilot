import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  Plane,
  Building2,
  Car,
  Compass,
  FileText,
  DollarSign,
  CloudSun,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useTripBuilder, TripStep } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const TripHealthCard: React.FC = () => {
  const { t } = useTravelSettings();
  const {
    tripHealth,
    setStep,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    budgetStatus,
    documentChecklist,
    detectedConflicts,
  } = useTripBuilder();

  const [showChecklist, setShowChecklist] = useState(false);

  const checklistItems = [
    {
      id: 'travel',
      label: t('health.item.travel', 'Intercity Transport'),
      ready: Boolean(selectedTravel),
      detail: selectedTravel ? `${selectedTravel.operator} (${selectedTravel.identifier || 'Confirmed'})` : t('health.detail.no_travel', 'No flight/train selected'),
      step: 'travel' as TripStep,
    },
    {
      id: 'stays',
      label: t('health.item.stays', 'Accommodation'),
      ready: Boolean(selectedStay),
      detail: selectedStay ? `${selectedStay.name} (${selectedStay.type})` : t('health.detail.no_stay', 'No hotel/villa selected'),
      step: 'stays' as TripStep,
    },
    {
      id: 'local_transport',
      label: t('health.item.mobility', 'Local Mobility'),
      ready: Boolean(selectedMobility),
      detail: selectedMobility ? `${selectedMobility.title} (${selectedMobility.vehicleModel})` : t('health.detail.optional_mobility', 'Optional cab/rental transfer'),
      step: 'local_transport' as TripStep,
    },
    {
      id: 'activities',
      label: t('health.item.activities', 'Activities & Experiences'),
      ready: selectedActivities.length > 0,
      detail: selectedActivities.length > 0 ? t('health.detail.activities_count', { count: selectedActivities.length }, `${selectedActivities.length} experiences planned`) : t('health.detail.no_activities', 'No activities selected yet'),
      step: 'activities' as TripStep,
    },
    {
      id: 'budget',
      label: t('health.item.budget', 'Budget Balance'),
      ready: budgetStatus !== 'over_budget',
      detail: budgetStatus === 'over_budget' ? t('health.detail.over_budget', 'Over budget limit') : t('health.detail.budget_maintained', 'Budget target maintained'),
      step: 'review' as TripStep,
    },
    {
      id: 'weather',
      label: t('health.item.weather', 'Weather & Tide Safety'),
      ready: detectedConflicts.length === 0,
      detail: detectedConflicts.length === 0 ? t('health.detail.weather_clear', 'Clear forecast alignment') : t('health.detail.weather_advisories', { count: detectedConflicts.length }, `${detectedConflicts.length} weather advisory active`),
      step: 'itinerary' as TripStep,
    },
    {
      id: 'docs',
      label: t('health.item.docs', 'Travel Documents'),
      ready: documentChecklist.filter((d) => d.required && !d.completed).length === 0,
      detail: `${documentChecklist.filter((d) => d.completed).length}/${documentChecklist.length} documents verified`,
      step: 'review' as TripStep,
    },
  ];

  return (
    <div className="surface-card p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black flex-shrink-0 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#0B1220]">{t('health.title', 'TRIP READINESS & HEALTH')}</h4>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                  tripHealth.readyPercentage >= 90
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : tripHealth.readyPercentage >= 65
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {tripHealth.statusLabel} ({tripHealth.readyPercentage}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('health.subtitle', 'Automated pre-travel intelligence & compliance readiness checks')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowChecklist(!showChecklist)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
        >
          <span>{showChecklist ? t('health.hide_checklist', 'Hide Checklist') : t('health.view_checklist', 'View Checklist')}</span>
          {showChecklist ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Readiness Progress Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              tripHealth.readyPercentage >= 90
                ? 'bg-emerald-600'
                : tripHealth.readyPercentage >= 65
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${tripHealth.readyPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5">
          <span>{t('health.draft_phase', 'Draft Phase')}</span>
          <span>{t('health.in_progress', 'In Progress')}</span>
          <span className="font-bold text-slate-700">{t('health.ready_to_book', '100% Ready to Book')}</span>
        </div>
      </div>

      {/* Critical Issues Banner / Checklist */}
      <div className="space-y-2 pt-1">
        {tripHealth.issues.length === 0 ? (
          <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-xs">
              {t('health.all_passed', 'All readiness checks passed! Your trip is completely configured and ready to book.')}
            </span>
          </div>
        ) : (
          tripHealth.issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                issue.severity === 'error'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : issue.severity === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle
                  className={`w-4 h-4 flex-shrink-0 ${
                    issue.severity === 'error' ? 'text-rose-600' : 'text-amber-600'
                  }`}
                />
                <span className="font-medium text-xs truncate">{issue.message}</span>
              </div>

              {issue.actionStep && (
                <button
                  type="button"
                  onClick={() => setStep(issue.actionStep as TripStep)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px] whitespace-nowrap flex items-center gap-1 shadow-2xs flex-shrink-0 transition-colors"
                >
                  <span>{issue.actionLabel || t('health.fix', 'Fix')}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Itemized 7-Point Readiness Checklist */}
      {showChecklist && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-bold text-slate-900 text-xs">{t('health.checklist_title', '7-Point Pre-Travel Checklist:')}</span>
            <span className="text-[10px] text-slate-400">{t('health.checklist_subtitle', 'Click item to configure')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setStep(item.step)}
                className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-2xs cursor-pointer transition-all flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                      item.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.ready ? '✓' : '•'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-[11px] truncate">{item.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.detail}</p>
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
