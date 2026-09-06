import api from './api';
import { Budget, Expense, PriceAlert, CurrencyRate, ApiResponse } from '../types';

export const budgetService = {
  async createBudget(payload: Partial<Budget>) {
    const res = await api.post<ApiResponse<Budget>>('/budgets', payload);
    return res.data;
  },

  async getBudget(id: string) {
    const res = await api.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return res.data;
  },

  async updateBudget(id: string, updates: Partial<Budget>) {
    const res = await api.put<ApiResponse<null>>(`/budgets/${id}`, updates);
    return res.data;
  },

  async addExpense(budgetId: string, expense: Omit<Expense, 'id'>) {
    const res = await api.post<ApiResponse<{ expense: Expense }>>(`/budgets/${budgetId}/expenses`, expense);
    return res.data;
  },

  async updateExpense(budgetId: string, expenseId: string, updates: Partial<Expense>) {
    const res = await api.put<ApiResponse<{ expense: Expense }>>(`/budgets/${budgetId}/expenses/${expenseId}`, updates);
    return res.data;
  },

  async deleteExpense(budgetId: string, expenseId: string) {
    const res = await api.delete<ApiResponse<null>>(`/budgets/${budgetId}/expenses/${expenseId}`);
    return res.data;
  },

  async toggleExpenseSettle(budgetId: string, expenseId: string) {
    const res = await api.patch<ApiResponse<{ settlement_status: string }>>(`/budgets/${budgetId}/expenses/${expenseId}/settle`);
    return res.data;
  },

  async getPriceAlerts(budgetId: string) {
    const res = await api.get<ApiResponse<{ price_alerts: PriceAlert[] }>>(`/budgets/${budgetId}/price-alerts`);
    return res.data;
  },

  async addPriceAlert(budgetId: string, alert: Omit<PriceAlert, 'id' | 'createdAt'>) {
    const res = await api.post<ApiResponse<{ price_alert: PriceAlert }>>(`/budgets/${budgetId}/price-alerts`, alert);
    return res.data;
  },

  async deletePriceAlert(budgetId: string, alertId: string) {
    const res = await api.delete<ApiResponse<null>>(`/budgets/${budgetId}/price-alerts/${alertId}`);
    return res.data;
  },

  async getCurrencyRates() {
    const res = await api.get<ApiResponse<{ rates: CurrencyRate[]; last_updated: string }>>('/budgets/currency/rates');
    return res.data;
  },

  async getBudgetByTrip(tripId: string) {
    const res = await api.get<ApiResponse<Budget>>(`/budgets/trip/${tripId}`);
    return res.data;
  },
};
