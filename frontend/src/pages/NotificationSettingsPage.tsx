import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Smartphone,
  Sparkles,
  Plane,
  CloudSun,
  Wallet,
  Users,
} from 'lucide-react';
import { useTravelSettings } from '../context/TravelSettingsContext';

export const NotificationSettingsPage: React.FC = () => {
  const { notificationSettings, updateNotificationSettings } = useTravelSettings();

  const handleToggle = (key: keyof typeof notificationSettings) => {
    updateNotificationSettings({ [key]: !notificationSettings[key] });
  };

  const preferenceItems = [
    {
      key: 'price_alert' as const,
      title: 'Price Drop & Fare Alerts',
      desc: 'Instant alerts when tracked flights, hotels or holiday packages drop in price.',
      icon: Wallet,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      key: 'trip_update' as const,
      title: 'Trip Schedule & Gate Updates',
      desc: 'Flight departure changes, delay notifications, and hotel check-in readiness.',
      icon: Plane,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      key: 'weather' as const,
      title: 'Weather & Forecast Advisories',
      desc: 'Rain forecasts and itinerary rescheduling suggestions 24 hours prior to activities.',
      icon: CloudSun,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      key: 'booking_reminder' as const,
      title: 'Booking & Check-in Reminders',
      desc: 'Web check-in opening alerts (48h prior), hotel confirmation vouchers and ticket links.',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      key: 'shared_trip' as const,
      title: 'Shared Trip & Collaborator Suggestions',
      desc: 'When co-travellers suggest activities, split expenses, or comment on the itinerary.',
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/notifications"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Notification Center</span>
      </Link>

      {/* Header */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose which alerts you want to receive across in-app and email channels
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Bell className="w-6 h-6" />
        </div>
      </div>

      {/* Preferences List */}
      <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
          Alert Categories
        </h3>

        <div className="space-y-3">
          {preferenceItems.map((item) => {
            const Icon = item.icon;
            const enabled = notificationSettings[item.key] ?? true;

            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 ${
                    enabled ? 'bg-slate-900' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Channels */}
      <div className="surface-card p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
          Delivery Channels
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-bold text-slate-900 block">In-App Notification Bell</span>
                <span className="text-[11px] text-slate-500">Always active</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-bold text-slate-900 block">Email Trip Summaries</span>
                <span className="text-[11px] text-slate-500">Sent for critical itinerary items</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Enabled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
