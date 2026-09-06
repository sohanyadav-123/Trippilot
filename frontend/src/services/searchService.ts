import api from './api';
import { Flight, Hotel, Destination, ApiResponse, PaginatedResponse } from '../types';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  passengers?: number;
  cabin_class?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  airline?: string[];
  stops?: number;
  max_price?: number;
  min_price?: number;
}

export interface HotelSearchParams {
  city: string;
  country?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  rooms?: number;
  page?: number;
  per_page?: number;
  sort_by?: string;
  max_price?: number;
  min_price?: number;
  min_rating?: number;
  amenities?: string[];
}

export interface TrainSearchParams {
  origin: string;
  destination: string;
  departure_date?: string;
  passengers?: number;
  class?: string;
}

export interface BusSearchParams {
  origin: string;
  destination: string;
  departure_date?: string;
  passengers?: number;
}

export const searchService = {
  async searchFlights(params: FlightSearchParams) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          val.forEach((item) => query.append(key, item));
        } else {
          query.append(key, String(val));
        }
      }
    });
    const res = await api.get<ApiResponse<PaginatedResponse<Flight>>>(`/search/flights?${query.toString()}`);
    return res.data;
  },

  async searchHotels(params: HotelSearchParams) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          val.forEach((item) => query.append(key, item));
        } else {
          query.append(key, String(val));
        }
      }
    });
    const res = await api.get<ApiResponse<PaginatedResponse<Hotel>>>(`/search/hotels?${query.toString()}`);
    return res.data;
  },

  async searchTrains(params: TrainSearchParams) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await api.get<ApiResponse<{ trains: any[]; total: number; is_mock: boolean }>>(`/search/trains?${query.toString()}`);
    return res.data;
  },

  async searchBuses(params: BusSearchParams) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await api.get<ApiResponse<{ buses: any[]; total: number; is_mock: boolean }>>(`/search/buses?${query.toString()}`);
    return res.data;
  },

  async getDestinations(q?: string, featured?: boolean, page = 1, per_page = 20) {
    const query = new URLSearchParams();
    if (q) query.append('q', q);
    if (featured !== undefined) query.append('featured', String(featured));
    query.append('page', String(page));
    query.append('per_page', String(per_page));
    const res = await api.get<ApiResponse<{ destinations: Destination[]; total: number }>>(`/destinations?${query.toString()}`);
    return res.data;
  },

  async getDestinationById(id: string) {
    const res = await api.get<ApiResponse<Destination>>(`/destinations/${id}`);
    return res.data;
  },

  async searchActivities(params: { destination?: string; category?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const res = await api.get<ApiResponse<{ activities: any[]; total: number }>>(`/activities?${query.toString()}`);
    return res.data;
  },
};
