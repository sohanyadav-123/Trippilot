import api from './api';
import { ApiResponse } from '../types';

export interface ProviderMeta {
  name: string;
  category: string;
  status: string;
  data_type: 'LIVE' | 'DEMO' | 'ESTIMATED';
  is_live: boolean;
  last_checked: string;
  description?: string;
}

export interface WeatherData {
  provider: string;
  source: string;
  data_type: 'LIVE' | 'DEMO';
  is_live: boolean;
  city: string;
  coordinates: { lat: number; lon: number };
  temperature: number;
  feels_like: number;
  humidity: number;
  condition: string;
  summary: string;
  suitability: 'optimal' | 'moderate' | 'indoor_safe';
  wind_speed_kmh: number;
  rain_probability: number;
  uv_index: number;
  precipitation_mm: number;
  alerts: Array<{
    severity: 'warning' | 'info' | 'critical';
    title: string;
    message: string;
    affected_category?: string;
  }>;
  forecast: Array<{
    date: string;
    day_name: string;
    max_temp: number;
    min_temp: number;
    rain_probability: number;
    uv_index: number;
    condition: string;
  }>;
  last_updated: string;
}

export interface CurrencyConversionResult {
  amount: number;
  from_currency: string;
  to_currency: string;
  converted_amount: number;
  exchange_rate: number;
  data_type: 'LIVE' | 'DEMO';
  provider: string;
  last_updated: string;
}

export interface RoadDistanceResult {
  origin: string;
  destination: string;
  origin_coords: { lat: number; lon: number };
  destination_coords: { lat: number; lon: number };
  distance_km: number;
  duration_minutes: number;
  formatted_duration: string;
  provider: string;
  data_type: 'LIVE' | 'ESTIMATED';
  is_live: boolean;
  source: string;
  last_updated: string;
}

export interface NearbyPlaceItem {
  id: string;
  name: string;
  category: string;
  city: string;
  area: string;
  address: string;
  cuisine: string;
  rating: number;
  price_level: string;
  cost_for_two: number;
  opening_status: string;
  phone: string;
  distance_km: number;
  formatted_distance: string;
  tags: string[];
  image_url?: string;
  provider: string;
  data_type: 'LIVE' | 'DEMO';
  last_updated: string;
}

export const providerService = {
  async getProviderStatuses() {
    const res = await api.get<ApiResponse<{ providers: ProviderMeta[] }>>('/providers/status');
    return res.data;
  },

  async getWeather(city: string, lat?: number, lon?: number) {
    let url = `/providers/weather?city=${encodeURIComponent(city)}`;
    if (lat !== undefined && lon !== undefined) {
      url += `&lat=${lat}&lon=${lon}`;
    }
    const res = await api.get<ApiResponse<WeatherData>>(url);
    return res.data;
  },

  async getCurrencyRates(base = 'INR') {
    const res = await api.get<ApiResponse<{ rates: any[]; base_currency: string; data_type: string; last_updated: string }>>(
      `/providers/currency/rates?base=${base}`
    );
    return res.data;
  },

  async convertCurrency(amount: number, from = 'INR', to = 'USD') {
    const res = await api.get<ApiResponse<CurrencyConversionResult>>(
      `/providers/currency/convert?amount=${amount}&from=${from}&to=${to}`
    );
    return res.data;
  },

  async getDistance(origin: string, destination: string) {
    const res = await api.get<ApiResponse<RoadDistanceResult>>(
      `/providers/maps/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    );
    return res.data;
  },

  async getNearbyPlaces(location: string, category = 'all', radius = 5.0) {
    const res = await api.get<ApiResponse<{ places: NearbyPlaceItem[]; total: number; location: string }>>(
      `/providers/places/nearby?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}&radius=${radius}`
    );
    return res.data;
  },

  async searchTrains(origin: string, destination: string, date: string) {
    const res = await api.get<ApiResponse<{ trains: any[]; total: number }>>(
      `/providers/trains/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`
    );
    return res.data;
  },

  async searchBuses(origin: string, destination: string, date: string) {
    const res = await api.get<ApiResponse<{ buses: any[]; total: number }>>(
      `/providers/buses/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`
    );
    return res.data;
  },

  async searchTransport(origin: string, destination: string, date: string, type = 'all') {
    const res = await api.get<ApiResponse<{ transport_options: any[]; total: number }>>(
      `/providers/transport/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&type=${type}`
    );
    return res.data;
  },
};
