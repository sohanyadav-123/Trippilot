import api from './api';
import { Itinerary, ApiResponse } from '../types';

export const itineraryService = {
  async createItinerary(payload: Partial<Itinerary>) {
    const res = await api.post<ApiResponse<Itinerary>>('/itineraries', payload);
    return res.data;
  },

  async listItineraries() {
    const res = await api.get<ApiResponse<{ itineraries: Itinerary[] }>>('/itineraries');
    return res.data;
  },

  async getItinerary(id: string) {
    const res = await api.get<ApiResponse<Itinerary>>(`/itineraries/${id}`);
    return res.data;
  },

  async updateItinerary(id: string, updates: Partial<Itinerary>) {
    const res = await api.put<ApiResponse<null>>(`/itineraries/${id}`, updates);
    return res.data;
  },

  async deleteItinerary(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/itineraries/${id}`);
    return res.data;
  },
};
