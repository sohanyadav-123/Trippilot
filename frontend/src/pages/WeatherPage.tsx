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
    <div className="min-h-screen bg-[#0B1220] text-slate-100 pb-20">
      {/* ─── Top Glow & Hero Ambient Gradient ─── */}
      <div className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[320px] bg-gradient-to-b from-[#2563EB]/20 via-[#C8A96B]/15 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <Link to="/plan" className="hover:text-white transition-colors">Plan</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#C8A96B]">Live Destination Weather</span>
          </div>

          {/* Main Title & Live Badge */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-sky-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span>OpenWeatherMap Live Global Feed</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Destination Weather Intelligence
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Plan confident travels with real-time meteorological forecasts, rain radar alerts, and smart packing intelligence.
              </p>
            </div>

            {weather && (
              <button
                type="button"
                onClick={() => fetchWeather(selectedCity)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors shadow-xs self-start md:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
                <span>Refresh Feed</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search any destination (e.g. Goa, Manali, Paris, Tokyo, London)..."
                className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/90 text-white placeholder-slate-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#C8A96B] transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-md"
              >
                Forecast
              </button>
            </div>
          </form>

          {/* Quick Select Destination Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Trending Destinations:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectQuickCity(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    selectedCity.toLowerCase() === c.toLowerCase()
                      ? 'bg-[#C8A96B] text-[#0B1220] border-[#C8A96B] font-bold shadow-md shadow-[#C8A96B]/20'
                      : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content Section ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto text-sky-400 animate-pulse shadow-xl">
              <CloudSun className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Fetching Live Meteorological Satellite Feed...</h3>
              <p className="text-xs text-slate-400">Connecting to OpenWeatherMap Global Observatories for {selectedCity}</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-rose-900/50 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Location Forecast Unavailable</h3>
              <p className="text-xs text-rose-300 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectQuickCity('Goa')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              Try Popular Destination (Goa)
            </button>
          </div>
        ) : weather ? (
          <>
            {/* ─── Hero Weather Card ─── */}
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Left: Temp & Condition */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-slate-300 text-xs font-semibold border border-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>{weather.city}</span>
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      weather.suitability === 'optimal'
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
                        : weather.suitability === 'moderate'
                        ? 'bg-amber-950/70 text-amber-300 border-amber-800/80'
                        : 'bg-rose-950/70 text-rose-300 border-rose-800/80'
                    }`}>
                      {weather.suitability === 'optimal' ? '☀️ Optimal for Sightseeing' : weather.suitability === 'moderate' ? '⛅ Moderate Conditions' : '🌧️ Indoor Safe Recommended'}
                    </span>

                    <span className="text-xs text-slate-500">
                      Updated {new Date(weather.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4">
                    <div className="text-6xl sm:text-8xl font-black tracking-tighter text-white font-editorial">
                      {Math.round(weather.temperature)}°<span className="text-3xl sm:text-4xl font-normal text-slate-400">C</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl sm:text-2xl font-bold text-white capitalize flex items-center gap-2">
                        <span>{weather.condition}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-400">
                        Feels like <span className="text-white font-bold">{Math.round(weather.feels_like)}°C</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary / Tagline */}
                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    Atmospheric conditions in <strong className="text-white">{weather.city}</strong> are currently {weather.condition.toLowerCase()}.
                    {weather.rain_probability >= 50
                      ? ' Expect intermittent rain showers during your travel. Keep an umbrella on hand.'
                      : ' Excellent visibility and mild winds make this a wonderful time for exploration.'}
                  </p>
                </div>

                {/* Right: Weather Icon Visual Box */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-md text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2563EB]/20 to-[#C8A96B]/20 border border-slate-700 flex items-center justify-center shadow-lg">
                    <WeatherIcon className="w-14 h-14 text-[#C8A96B] animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atmospheric Mode</span>
                    <h4 className="text-base font-bold text-white">{weather.summary || weather.condition}</h4>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Source: <span className="text-sky-400 font-semibold">{weather.provider}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-800/80">
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weather.humidity}%</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weather.wind_speed_kmh} <span className="text-xs font-normal text-slate-400">km/h</span></div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                    <span>Rain Chance</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weather.rain_probability}%</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>UV Index</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weather.uv_index} <span className="text-xs font-normal text-slate-400">{weather.uv_index >= 8 ? '(High)' : '(Moderate)'}</span></div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Rain Volume</span>
                  </div>
                  <div className="text-lg font-bold text-white">{weather.precipitation_mm} <span className="text-xs font-normal text-slate-400">mm</span></div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                    <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                    <span>Coordinates</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {weather.coordinates.lat.toFixed(2)}°, {weather.coordinates.lon.toFixed(2)}°
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Active Weather Alerts & Advisories ─── */}
            {weather.alerts && weather.alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Active Travel Weather Advisories</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weather.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                        alert.severity === 'warning'
                          ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                          : 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                      }`}
                    >
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-white">{alert.title}</div>
                        <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 5-Day Extended Meteorological Forecast ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#C8A96B]" />
                    <span>5-Day Extended Meteorological Forecast</span>
                  </h3>
                  <p className="text-xs text-slate-400">Daily temperature trends, atmospheric conditions, and rain likelihood.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {weather.forecast.map((day, idx) => {
                  const DayIcon = getWeatherIcon(day.condition, day.rain_probability);
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">{day.day_name}</span>
                          <span className="text-[11px] text-slate-400">{day.date}</span>
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">{day.condition}</div>
                      </div>

                      <div className="py-2 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
                          <DayIcon className="w-8 h-8 text-[#C8A96B]" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-white">{Math.round(day.max_temp)}°</span>
                          <span className="text-sm font-semibold text-slate-500">{Math.round(day.min_temp)}°C</span>
                        </div>

                        {/* Rain probability bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <CloudRain className="w-3 h-3 text-sky-400" />
                              <span>Rain</span>
                            </span>
                            <span className={`font-bold ${day.rain_probability > 50 ? 'text-sky-400' : 'text-slate-400'}`}>
                              {day.rain_probability}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
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

            {/* ─── Smart Weather Packing & Travel Advice ─── */}
            <div className="space-y-4 pt-2">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-sky-400" />
                  <span>Recommended Weather Packing Checklist</span>
                </h3>
                <p className="text-xs text-slate-400">Tailored gear & clothing recommendations based on current destination temperatures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getPackingRecommendations().map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-[#C8A96B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-[#C8A96B] border border-slate-700">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── One-Click CTA: Plan Trip to this Destination ─── */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0B1220] to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-[#C8A96B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ready to Journey?</span>
                </div>
                <h4 className="text-xl font-bold text-white">
                  Build Your Trip to {weather.city} with TripPilot AI
                </h4>
                <p className="text-xs text-slate-400 max-w-lg">
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
