import api from './api';
import { Destination, Flight, Hotel, Booking, User, ApiResponse } from '../types';

export const adminService = {
  async getStats() {
    const res = await api.get<ApiResponse<{
      users: number;
      bookings: number;
      destinations: number;
      flights: number;
      hotels: number;
      confirmed_bookings: number;
      cancelled_bookings: number;
      total_revenue: number;
    }>>('/admin/stats');
    return res.data;
  },

  // Destinations
  async getDestinations() {
    const res = await api.get<ApiResponse<{ destinations: Destination[] }>>('/admin/destinations');
    return res.data;
  },
  async createDestination(data: Partial<Destination>) {
    const res = await api.post<ApiResponse<Destination>>('/admin/destinations', data);
    return res.data;
  },
  async updateDestination(id: string, data: Partial<Destination>) {
    const res = await api.put<ApiResponse<null>>(`/admin/destinations/${id}`, data);
    return res.data;
  },
  async deleteDestination(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/admin/destinations/${id}`);
    return res.data;
  },

  // Flights
  async getFlights() {
    const res = await api.get<ApiResponse<{ flights: Flight[] }>>('/admin/flights');
    return res.data;
  },
  async createFlight(data: Partial<Flight>) {
    const res = await api.post<ApiResponse<Flight>>('/admin/flights', data);
    return res.data;
  },
  async updateFlight(id: string, data: Partial<Flight>) {
    const res = await api.put<ApiResponse<null>>(`/admin/flights/${id}`, data);
    return res.data;
  },
  async deleteFlight(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/admin/flights/${id}`);
    return res.data;
  },

  // Hotels
  async getHotels() {
    const res = await api.get<ApiResponse<{ hotels: Hotel[] }>>('/admin/hotels');
    return res.data;
  },
  async createHotel(data: Partial<Hotel>) {
    const res = await api.post<ApiResponse<Hotel>>('/admin/hotels', data);
    return res.data;
  },
  async updateHotel(id: string, data: Partial<Hotel>) {
    const res = await api.put<ApiResponse<null>>(`/admin/hotels/${id}`, data);
    return res.data;
  },
  async deleteHotel(id: string) {
    const res = await api.delete<ApiResponse<null>>(`/admin/hotels/${id}`);
    return res.data;
  },

  // Bookings
  async getBookings() {
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>('/admin/bookings');
    return res.data;
  },
  async updateBooking(id: string, data: { status?: string; notes?: string }) {
    const res = await api.put<ApiResponse<null>>(`/admin/bookings/${id}`, data);
    return res.data;
  },

  // Users
  async getUsers() {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/admin/users');
    return res.data;
  },

  // Provider Health
  async getProviders() {
    const res = await api.get<ApiResponse<{ providers: Array<{ name: string; status: string; latency_ms: number; last_checked: string }> }>>('/admin/providers');
    return res.data;
  },

  // System Health
  async getSystemHealth() {
    const res = await api.get<ApiResponse<{ database: string; memory_mb: number; uptime_hours: number; audit_logs: number; environment: string }>>('/admin/system-health');
    return res.data;
  },
};
