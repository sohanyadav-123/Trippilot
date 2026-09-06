import api from './api';
import { Booking, SelectedItem, TravellerDetail, ContactInfo, ApiResponse } from '../types';

export interface CreateBookingPayload {
  selected_items: SelectedItem[];
  traveller_details: TravellerDetail[];
  contact: ContactInfo;
  payment_id: string;
  booking_reference?: string;
  trip_id?: string;
  destination_title?: string;
  addons?: Array<{ id: string; name: string; price: number; type: string }>;
  total_amount?: number;
  subtotal?: number;
  taxes?: number;
  service_fee?: number;
  currency?: string;
  is_demo?: boolean;
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload) {
    const res = await api.post<ApiResponse<Booking>>('/bookings', payload);
    return res.data;
  },

  async listBookings(status?: string) {
    const url = status ? `/bookings?status=${status}` : '/bookings';
    const res = await api.get<ApiResponse<{ bookings: Booking[] }>>(url);
    return res.data;
  },

  async getBooking(id: string) {
    const res = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id: string, reason?: string) {
    const res = await api.post<ApiResponse<null>>(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  async previewPricing(selected_items: SelectedItem[], travellers = 1) {
    const res = await api.post<ApiResponse<{
      subtotal: number;
      taxes: number;
      service_fee: number;
      total: number;
      currency: string;
      breakdown: any[];
    }>>('/bookings/calculate', { selected_items, travellers });
    return res.data;
  },
};
