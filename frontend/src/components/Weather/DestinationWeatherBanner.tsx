import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { providerService, WeatherData } from '../../services/providerService';

interface DestinationWeatherBannerProps {
  destination: string;
}

export const DestinationWeatherBanner: React.FC<DestinationWeatherBannerProps> = ({ destination }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      if (!destination) return;
      setLoading(true);
      try {
        const res = await providerService.getWeather(destination);
        if (isMounted && res?.data) setWeather(res.data);
      } catch (err) {
        // Silently handle
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [destination]);

  if (loading || !weather) return null;

  const getWeatherIcon = (cond: string = '', rainProb: number = 0) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('storm') || rainProb > 60) return CloudRain;
    if (c.includes('cloud') || c.includes('overcast')) return CloudSun;
    return Sun;
  };

  const Icon = getWeatherIcon(weather.condition, weather.rain_probability);

  return (
    <div className="surface-card p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1220] to-slate-900 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-[#C8A96B] flex items-center justify-center flex-shrink-0 shadow-inner">
          <Icon className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {weather.city} Weather Intelligence
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider">
              Live OpenWeather
            </span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
              weather.suitability === 'optimal'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : weather.suitability === 'moderate'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {weather.suitability === 'optimal' ? 'Optimal for Touring' : 'Moderate Weather'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
            <span className="text-base font-bold text-white">
              {Math.round(weather.temperature)}°C
            </span>
            <span className="text-slate-400 capitalize">{weather.condition}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Droplets className="w-3 h-3 text-sky-400" />
              <span>{weather.humidity}% Hum</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <CloudRain className="w-3 h-3 text-blue-400" />
              <span>{weather.rain_probability}% Rain</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
        <Link
          to={`/weather?city=${encodeURIComponent(weather.city || destination)}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#C8A96B] border border-slate-700 transition-colors shadow-xs"
        >
          <span>5-Day Forecast & Advice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
