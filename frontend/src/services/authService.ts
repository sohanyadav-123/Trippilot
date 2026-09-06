import api from './api';
import { User, ApiResponse } from '../types';

export const authService = {
  async register(name: string, email: string, password: string, phone?: string) {
    const res = await api.post<ApiResponse<{ user: User; access_token: string; refresh_token: string }>>(
      '/auth/register',
      { name, email, password, phone }
    );
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post<ApiResponse<{ user: User; access_token: string; refresh_token: string }>>(
      '/auth/login',
      { email, password }
    );
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  async updateProfile(updates: Partial<User>) {
    const res = await api.put<ApiResponse<User>>('/auth/profile', updates);
    return res.data;
  },

  async changePassword(old_password: string, new_password: string) {
    const res = await api.post<ApiResponse<null>>('/auth/change-password', {
      old_password,
      new_password,
    });
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post<ApiResponse<{ message: string; demo_reset_token?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return res.data;
  },

  async resetPassword(token: string, new_password: string) {
    const res = await api.post<ApiResponse<null>>('/auth/reset-password', {
      token,
      new_password,
    });
    return res.data;
  },

  async deleteAccount(password: string) {
    const res = await api.post<ApiResponse<null>>('/auth/delete-account', {
      password,
    });
    return res.data;
  },

  logout() {
    localStorage.removeItem('trippilot_token');
    localStorage.removeItem('trippilot_refresh_token');
    localStorage.removeItem('trippilot_user');
  },
};

