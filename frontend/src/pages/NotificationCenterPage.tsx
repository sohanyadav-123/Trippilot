import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Filter,
  Settings,
  Clock,
  Sparkles,
  Plane,
  Building2,
  CloudSun,
  Wallet,
  Users,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useTravelSettings, SmartNotification } from '../context/TravelSettingsContext';

export const NotificationCenterPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  } = useTravelSettings();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Notifications' },
    { id: 'price_alert', label: '💰 Price Alerts' },
    { id: 'trip_update', label: '✈️ Trip Updates' },
    { id: 'weather', label: '🌤️ Weather Advisories' },
    { id: 'booking_reminder', label: '🎫 Booking Reminders' },
    { id: 'shared_trip', label: '👥 Group & Shared' },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    if (priorityFilter !== 'all' && n.priority !== priorityFilter) return false;
    return true;
  });

  const getNotificationIcon = (cat: string) => {
    switch (cat) {
      case 'price_alert':
        return <Wallet className="w-5 h-5 text-emerald-600" />;
      case 'weather':
        return <CloudSun className="w-5 h-5 text-amber-500" />;
      case 'booking_reminder':
        return <Plane className="w-5 h-5 text-blue-600" />;
      case 'shared_trip':
        return <Users className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-700" />;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical':
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">Critical</span>;
      case 'important':
        return <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">Important</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase">Standard</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Notification Center</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Price drop alerts, schedule advisories, weather adjustments & co-traveller suggestions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/notification-settings"
            className="btn-secondary text-xs !py-2 px-3 font-bold flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Preferences</span>
          </Link>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-primary text-xs !py-2 px-3.5 font-bold shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Action Sub-bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredNotifications.length}</strong> notification(s)
          {unreadCount > 0 && ` (${unreadCount} unread)`}
        </span>

        {notifications.some((n) => n.read) && (
          <button
            onClick={clearAllRead}
            className="text-slate-400 hover:text-rose-600 font-semibold transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-3xl border border-slate-200 bg-white space-y-3 shadow-sm">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All caught up!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no notifications in this category. We will notify you when price drops or trip updates happen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`surface-card p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer hover:shadow-md ${
                !notif.read ? 'bg-blue-50/40 border-blue-200 shadow-xs' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                  {getNotificationIcon(notif.category)}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    {getPriorityBadge(notif.priority)}
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{notif.message}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{notif.time}</span>
                    </span>
                    {notif.actionUrl && (
                      <Link
                        to={notif.actionUrl}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>{notif.actionText || 'View Details'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
