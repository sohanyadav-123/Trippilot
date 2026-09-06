import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Umbrella,
  Compass,
  MapPin,
  Thermometer,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  ChevronRight,
  Shirt,
  Sunrise,
} from 'lucide-react';
import { providerService, WeatherData } from '../services/providerService';
import { useTripBuilder } from '../context/TripBuilderContext';
import { useTravelSettings } from '../context/TravelSettingsContext';

const POPULAR_DESTINATIONS = [
  'Goa',
  'Mumbai',
  'Delhi',
  'Manali',
  'Jaipur',
  'Kerala',
  'Paris',
  'Tokyo',
  'Dubai',
  'London',
  'Bali',
];

export const WeatherPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { destination: activeTripDest } = useTripBuilder();
  const { t } = useTravelSettings();

  const queryCity = searchParams.get('city') || activeTripDest || 'Goa';

  const [cityInput, setCityInput] = useState(queryCity);
  const [selectedCity, setSelectedCity] = useState(queryCity);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (targetCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await providerService.getWeather(targetCity);
      if (res && res.data) {
        setWeather(res.data);
      } else {
        setError('No meteorological data returned for this location.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to fetch weather forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const clean = cityInput.trim();
    setSelectedCity(clean);
    setSearchParams({ city: clean });
  };

  const handleSelectQuickCity = (city: string) => {
    setCityInput(city);
    setSelectedCity(city);
    setSearchParams({ city });
  };

  const getWeatherIcon = (cond: string = '', rainProb: number = 0) => {
    const c = cond.toLowerCase();
    if (c.includes('thunder') || c.includes('storm')) return CloudRain;
    if (c.includes('rain') || c.includes('drizzle') || rainProb > 60) return CloudRain;
    if (c.includes('cloud') || c.includes('overcast')) return CloudSun;
    if (c.includes('snow')) return CloudSun;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon(weather?.condition, weather?.rain_probability);

  // Clothing & packing recommendations based on weather metrics
  const getPackingRecommendations = () => {
    if (!weather) return [];
    const items = [];
    const temp = weather.temperature;
    const rain = weather.rain_probability;

    if (rain >= 40) {
      items.push({
        title: 'Compact Umbrella or Rain Shell',
        desc: `Rain likelihood is ${rain}%. Essential for outdoor excursions.`,
        tag: 'Essential',
        icon: Umbrella,
      });
    }

    if (temp >= 28) {
      items.push({
        title: 'Breathable Linens & Cottons',
        desc: `High temperature of ${temp}°C requires light, airy garments.`,
        tag: 'Warm Climate',
        icon: Shirt,
      });
      items.push({
        title: 'Sun Protection & UV Sunglasses',
        desc: `UV index is ${weather.uv_index}. Protect against peak midday sun.`,
        tag: 'Skin Safety',
        icon: Sun,
      });
    } else if (temp <= 18) {
      items.push({
        title: 'Warm Fleece or Light Puffer Jacket',
        desc: `Cooler temperatures (${temp}°C) especially during early mornings & evenings.`,
        tag: 'Cool Climate',
        icon: Shirt,
      });
    } else {
      items.push({
        title: 'Versatile Layers & Casual Walkers',
        desc: `Moderate temperature (${temp}°C) perfect for layered casual streetwear.`,
        tag: 'Comfort',
        icon: Shirt,
      });
    }

    items.push({
      title: 'Comfortable All-Terrain Footwear',
      desc: 'Walking-friendly shoes suited for cobblestones, beaches, or trails.',
      tag: 'Mobility',
      icon: Compass,
    });

    return items;
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* ─── Top Hero ─── */}
      <div className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8" style={{ borderBottom: '1px solid var(--border-base)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[320px] bg-gradient-to-b from-[#2563EB]/10 via-[#C8A96B]/08 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
            <Link to="/plan" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>Plan</Link>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
            <span style={{ color: 'var(--gold)' }}>Live Destination Weather</span>
          </div>

          {/* Title & Refresh */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border" style={{ backgroundColor: 'var(--bg-surface-3)', borderColor: 'var(--border-base)', color: '#38BDF8' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span>OpenWeatherMap Live Global Feed</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Destination Weather Intelligence
              </h1>
              <p className="text-sm sm:text-base max-w-2xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Plan confident travels with real-time meteorological forecasts, rain radar alerts, and smart packing intelligence.
              </p>
            </div>

            {weather && (
              <button
                type="button"
                onClick={() => fetchWeather(selectedCity)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm self-start md:self-auto"
                style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
                <span>Refresh Feed</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none" style={{ color: 'var(--text-faint)' }}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search any destination (e.g. Goa, Manali, Paris, Tokyo, London)..."
                className="w-full pl-12 pr-32 py-3.5 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                }}
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-md"
              >
                Forecast
              </button>
            </div>
          </form>

          {/* Quick Select Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Trending Destinations:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectQuickCity(c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={
                    selectedCity.toLowerCase() === c.toLowerCase()
                      ? { backgroundColor: 'var(--gold)', color: '#0B1220', border: '1px solid var(--gold)', fontWeight: 700 }
                      : { backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center mx-auto text-sky-400 animate-pulse shadow-xl" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-base)' }}>
              <CloudSun className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Fetching Live Meteorological Satellite Feed...</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Connecting to OpenWeatherMap Global Observatories for {selectedCity}</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl text-center space-y-4 max-w-xl mx-auto" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--danger-border)' }}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Location Forecast Unavailable</h3>
              <p className="text-xs mt-1 text-rose-500">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectQuickCity('Goa')}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border-base)' }}
            >
              Try Popular Destination (Goa)
            </button>
          </div>
        ) : weather ? (
          <>
            {/* ─── Hero Weather Card ─── */}
            <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/05 to-amber-500/05 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Left: Temp & Condition */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-base)', color: 'var(--text-secondary)' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                      <span>{weather.city}</span>
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      weather.suitability === 'optimal'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80'
                        : weather.suitability === 'moderate'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80'
                    }`}>
                      {weather.suitability === 'optimal' ? '☀️ Optimal for Sightseeing' : weather.suitability === 'moderate' ? '⛅ Moderate Conditions' : '🌧️ Indoor Safe Recommended'}
                    </span>

                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      Updated {new Date(weather.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <div className="text-6xl sm:text-8xl font-black tracking-tighter font-editorial" style={{ color: 'var(--text-primary)' }}>
                      {Math.round(weather.temperature)}°<span className="text-3xl sm:text-4xl font-normal" style={{ color: 'var(--text-muted)' }}>C</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl sm:text-2xl font-bold capitalize" style={{ color: 'var(--text-primary)' }}>
                        {weather.condition}
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Feels like <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(weather.feels_like)}°C</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                    Atmospheric conditions in <strong style={{ color: 'var(--text-primary)' }}>{weather.city}</strong> are currently {weather.condition.toLowerCase()}.
                    {weather.rain_probability >= 50
                      ? ' Expect intermittent rain showers during your travel. Keep an umbrella on hand.'
                      : ' Excellent visibility and mild winds make this a wonderful time for exploration.'}
                  </p>
                </div>

                {/* Right: Icon Box */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl text-center space-y-3" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-base)' }}>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2563EB]/10 to-[#C8A96B]/10 flex items-center justify-center shadow-lg" style={{ border: '1px solid var(--border-base)' }}>
                    <WeatherIcon className="w-14 h-14 animate-pulse" style={{ color: 'var(--gold)' }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Atmospheric Mode</span>
                    <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{weather.summary || weather.condition}</h4>
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                    Source: <span className="text-sky-500 font-semibold">{weather.provider}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6" style={{ borderTop: '1px solid var(--border-base)' }}>
                {[
                  { label: 'Humidity', value: `${weather.humidity}%`, icon: Droplets, iconColor: '#38BDF8' },
                  { label: 'Wind Speed', value: `${weather.wind_speed_kmh} km/h`, icon: Wind, iconColor: '#2DD4BF' },
                  { label: 'Rain Chance', value: `${weather.rain_probability}%`, icon: CloudRain, iconColor: '#60A5FA' },
                  { label: 'UV Index', value: `${weather.uv_index} ${weather.uv_index >= 8 ? '(High)' : '(Mod)'}`, icon: Sun, iconColor: '#FBBF24' },
                  { label: 'Rain Volume', value: `${weather.precipitation_mm} mm`, icon: Thermometer, iconColor: '#FB7185' },
                  { label: 'Coordinates', value: `${weather.coordinates.lat.toFixed(2)}°, ${weather.coordinates.lon.toFixed(2)}°`, icon: Compass, iconColor: 'var(--gold)' },
                ].map(({ label, value, icon: Icon, iconColor }) => (
                  <div key={label} className="p-3.5 rounded-2xl space-y-1" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-base)' }}>
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                      <span>{label}</span>
                    </div>
                    <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Active Alerts ─── */}
            {weather.alerts && weather.alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Active Travel Weather Advisories</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weather.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        alert.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/60'
                          : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60'
                      }`}
                    >
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                      <div className="space-y-1">
                        <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{alert.title}</div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 5-Day Forecast ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                    <span>5-Day Extended Meteorological Forecast</span>
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily temperature trends, atmospheric conditions, and rain likelihood.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {weather.forecast.map((day, idx) => {
                  const DayIcon = getWeatherIcon(day.condition, day.rain_probability);
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 shadow-sm"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{day.day_name}</span>
                          <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{day.date}</span>
                        </div>
                        <div className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)' }}>{day.condition}</div>
                      </div>

                      <div className="py-2 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border-subtle)' }}>
                          <DayIcon className="w-8 h-8" style={{ color: 'var(--gold)' }} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(day.max_temp)}°</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{Math.round(day.min_temp)}°C</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                              <CloudRain className="w-3 h-3 text-sky-500" />
                              <span>Rain</span>
                            </span>
                            <span className={`font-bold ${day.rain_probability > 50 ? 'text-sky-500' : ''}`} style={day.rain_probability <= 50 ? { color: 'var(--text-muted)' } : {}}>
                              {day.rain_probability}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600"
                              style={{ width: `${day.rain_probability}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Packing Checklist ─── */}
            <div className="space-y-4 pt-2">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Shirt className="w-5 h-5 text-sky-500" />
                  <span>Recommended Weather Packing Checklist</span>
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tailored gear & clothing recommendations based on current destination temperatures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getPackingRecommendations().map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl flex items-start gap-3.5 shadow-sm"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--gold)' }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--gold)', border: '1px solid var(--border-base)' }}>
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── CTA ─── */}
            <div className="p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5" style={{ color: 'var(--gold)' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready to Journey?</span>
                </div>
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Build Your Trip to {weather.city} with TripPilot AI
                </h4>
                <p className="text-xs max-w-lg" style={{ color: 'var(--text-muted)' }}>
                  Integrate flights, accommodations, transport, and weather-optimized daily itineraries in a unified planning workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/plan`)}
                className="btn-primary text-xs font-bold !py-3.5 px-6 rounded-xl shadow-luxury flex items-center gap-2 flex-shrink-0"
              >
                <span>Launch Trip Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default WeatherPage;
