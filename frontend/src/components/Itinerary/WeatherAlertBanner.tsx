import React, { useState } from 'react';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  AlertTriangle,
  Sparkles,
  Check,
  ChevronRight,
  RefreshCw,
  Umbrella,
} from 'lucide-react';

interface WeatherDay {
  dayLabel: string;
  date: string;
  tempC: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Light Rain' | 'Thunderstorm';
  rainProbability: number;
  icon: any;
}

interface WeatherAlertBannerProps {
  destination?: string;
  onApplyAdjustment?: (suggestionText: string) => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  destination = 'Goa',
  onApplyAdjustment,
}) => {
  const [applied, setApplied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const forecast: WeatherDay[] = [
    { dayLabel: 'Day 1', date: 'Tomorrow', tempC: 29, condition: 'Sunny', rainProbability: 10, icon: Sun },
    { dayLabel: 'Day 2', date: 'Wed', tempC: 27, condition: 'Light Rain', rainProbability: 75, icon: CloudRain },
    { dayLabel: 'Day 3', date: 'Thu', tempC: 28, condition: 'Partly Cloudy', rainProbability: 25, icon: CloudSun },
    { dayLabel: 'Day 4', date: 'Fri', tempC: 30, condition: 'Sunny', rainProbability: 15, icon: Sun },
    { dayLabel: 'Day 5', date: 'Sat', tempC: 29, condition: 'Sunny', rainProbability: 10, icon: Sun },
  ];

  const handleApply = () => {
    setApplied(true);
    if (onApplyAdjustment) {
      onApplyAdjustment('Moved Baga watersports to Day 2 Morning and scheduled Indoor Heritage Art Gallery during afternoon showers.');
    }
  };

  if (dismissed) return null;

  return (
    <div className="surface-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900">5-Day Weather Forecast for {destination}</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Estimated Forecast
              </span>
            </div>
            <p className="text-xs text-slate-500">Live meteorological prediction model & adaptive scheduling</p>
          </div>
        </div>

        <span className="text-xs font-bold text-blue-600 self-start sm:self-auto">28°C Average Coastal Climate</span>
      </div>

      {/* 5-Day Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {forecast.map((f) => {
          const Icon = f.icon;
          const isRainy = f.rainProbability > 50;

          return (
            <div
              key={f.dayLabel}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1 transition-all ${
                isRainy
                  ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-900">{f.dayLabel}</span>
              <span className="text-[10px] text-slate-400">{f.date}</span>
              <Icon className={`w-5 h-5 my-1 ${isRainy ? 'text-blue-600' : 'text-amber-500'}`} />
              <span className="text-sm font-black text-slate-900">{f.tempC}°C</span>
              <span
                className={`text-[10px] font-bold ${
                  isRainy ? 'text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded' : 'text-slate-500'
                }`}
              >
                {f.rainProbability}% Rain
              </span>
            </div>
          );
        })}
      </div>

      {/* Weather Adaptation Recommendation Box */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Umbrella className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="font-bold text-xs text-amber-900">
              Weather Suggestion: Afternoon Rain Forecast on Day 2
            </h5>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Shift outdoor water sports to 10:00 AM. Replace 03:00 PM beach session with an indoor visit to{' '}
              <strong>Museum of Goa & Latin Quarter Heritage Café</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold px-2.5 py-1.5"
          >
            Keep Original
          </button>
          <button
            onClick={handleApply}
            disabled={applied}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              applied
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-3.5 h-3.5" /> Schedule Adjusted
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Apply Adaptation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
