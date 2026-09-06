import api from './api';
import { ApiResponse } from '../types';

export interface CreatePaymentPayload {
  amount: number;
  currency?: string;
  idempotency_key?: string;
  metadata?: Record<string, any>;
}

export const paymentService = {
  async createPaymentIntent(payload: CreatePaymentPayload) {
    const res = await api.post<ApiResponse<{
      payment_id: string;
      status: string;
      mode: string;
      mock_reference?: string;
      duplicate?: boolean;
    }>>('/payments/create', payload);
    return res.data;
  },

  async confirmPayment(payment_id: string, payment_method: string = 'mock') {
    const res = await api.post<ApiResponse<{
      status: string;
      mode: string;
      already_confirmed?: boolean;
    }>>('/payments/confirm', { payment_id, payment_method });
    return res.data;
  },

  async getPaymentStatus(payment_id: string) {
    const res = await api.get<ApiResponse<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      mode: string;
      payment_method?: string;
    }>>(`/payments/${payment_id}`);
    return res.data;
  },
};
