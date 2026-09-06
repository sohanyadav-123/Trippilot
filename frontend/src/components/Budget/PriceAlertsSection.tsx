import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Play,
  Pause,
  Trash2,
  TrendingDown,
  Plane,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { PriceAlert } from '../../types';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const PriceAlertsSection: React.FC = () => {
  const {
    priceAlerts,
    addPriceAlert,
    togglePriceAlert,
    deletePriceAlert,
    simulatePriceDrop,
    destination,
    origin,
  } = useTripBuilder();
  const { t } = useTravelSettings();

  // Create Alert Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [alertType, setAlertType] = useState<'flight' | 'hotel' | 'trip'>('flight');
  const [alertTitle, setAlertTitle] = useState(`${origin || 'Hyderabad'} → ${destination || 'Goa'} Flight Alert`);
  const [alertCurrentPrice, setAlertCurrentPrice] = useState<number>(6200);
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(5000);
  const [alertDetails, setAlertDetails] = useState('Non-stop flight tracking');

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || alertTargetPrice <= 0) return;

    addPriceAlert({
      type: alertType,
      title: alertTitle.trim(),
      currentPrice: Number(alertCurrentPrice),
      targetPrice: Number(alertTargetPrice),
      lowestObserved: Number(alertCurrentPrice),
      currency: 'INR',
      status: 'active',
      lastChecked: 'Just now',
      routeOrDetails: alertDetails.trim(),
      isSimulatedPriceDrop: false,
    });

    setModalOpen(false);
  };

  const getAlertIcon = (type: PriceAlert['type']) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  const activeDropAlerts = priceAlerts.filter((a) => a.isSimulatedPriceDrop);

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-luxury space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-1">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('alerts.badge', 'FARE MONITORING & PRICE WATCH')}</span>
          </div>
          <h3 className="font-editorial text-2xl font-bold text-[#0B1220] tracking-tight">
            {t('alerts.title', 'Live Price Drop Alerts')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('alerts.subtitle', 'TripPilot monitors flight, hotel, and package pricing. When prices hit your target, you\'ll receive immediate notifications.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs !py-2.5 px-4 font-bold rounded-xl shadow-md flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('alerts.create', '+ Create Price Alert')}</span>
        </button>
      </div>

      {/* Active Price Drop Banner (If triggered) */}
      {activeDropAlerts.map((drop) => (
        <div
          key={drop.id}
          className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 ring-2 ring-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded">
                ⚡ PRICE DROP DETECTED!
              </span>
              <h4 className="font-bold text-sm text-emerald-950 mt-1">
                {drop.title} dropped to ₹{drop.droppedPrice?.toLocaleString('en-IN')}!
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                You can now save approximately <strong>₹{drop.savingsEstimate?.toLocaleString('en-IN')}</strong> on this booking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => alert(`Price update applied for ${drop.title}. Saved ₹${drop.savingsEstimate}!`)}
              className="btn-primary text-xs !py-2 px-4 font-bold shadow-xs rounded-xl whitespace-nowrap"
            >
              Update Trip Now
            </button>
          </div>
        </div>
      ))}

      {/* Tracked Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {priceAlerts.map((alert) => {
          const isTriggered = alert.isSimulatedPriceDrop;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                alert.status === 'paused'
                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {alert.routeOrDetails || 'Active Tracker'}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  alert.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {alert.status}
                </span>
              </div>

              {/* Price Metrics */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Current Price</span>
                  <span className="font-black text-slate-900">
                    <CurrencyDisplay amount={alert.currentPrice} />
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Target Price</span>
                  <span className="font-black text-emerald-700">
                    <CurrencyDisplay amount={alert.targetPrice} />
                  </span>
                </div>
              </div>

              {/* Card Footer: Simulation trigger & Controls */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => simulatePriceDrop(alert.id, Math.round(alert.targetPrice * 0.95))}
                  className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline"
                  title="Simulate price drop event for testing"
                >
                  ⚡ Simulate Price Drop
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => togglePriceAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title={alert.status === 'active' ? 'Pause Alert' : 'Resume Alert'}
                  >
                    {alert.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePriceAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Alert Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-base text-[#0B1220]">Set Price Drop Alert</h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Alert Category</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="flight">✈️ Flight Fare Alert</option>
                  <option value="hotel">🏨 Hotel Room Rate Alert</option>
                  <option value="trip">📦 Complete Trip Package Alert</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={alertCurrentPrice}
                    onChange={(e) => setAlertCurrentPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Details (Optional)</label>
                <input
                  type="text"
                  value={alertDetails}
                  onChange={(e) => setAlertDetails(e.target.value)}
                  placeholder="e.g. Non-stop, Indigo, Sea View room"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs !py-2 px-5 font-bold rounded-xl shadow-xs"
                >
                  Start Tracking Fare
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
