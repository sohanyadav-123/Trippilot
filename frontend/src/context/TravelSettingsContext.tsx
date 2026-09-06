import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { TRANSLATIONS } from '../i18n/translations';
import { translatePlace, translateRoute, normalizePlaceKey, PLACE_TRANSLATIONS } from '../i18n/places';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'te'
  | 'ta'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'es'
  | 'fr'
  | 'de'
  | 'ar';
export type TravelMode = 'standard' | 'family' | 'accessibility';

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'flight' | 'hotel' | 'weather' | 'budget' | 'system' | 'group';
  category: 'price_alert' | 'trip_update' | 'weather' | 'booking_reminder' | 'shared_trip' | 'system';
  priority: 'normal' | 'important' | 'critical';
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  relatedTripId?: string;
}

export interface NotificationCategorySettings {
  price_alert: boolean;
  trip_update: boolean;
  weather: boolean;
  booking_reminder: boolean;
  shared_trip: boolean;
}

interface TravelSettingsContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
  notifications: SmartNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllRead: () => void;
  addNotification: (notif: Omit<SmartNotification, 'id' | 'read' | 'time'>) => void;
  notificationSettings: NotificationCategorySettings;
  updateNotificationSettings: (settings: Partial<NotificationCategorySettings>) => void;
  t: (key: string, paramsOrFallback?: Record<string, any> | string, fallback?: string) => string;
  tPlace: (name: string) => string;
  tRoute: (routeOrOrigin: string, dest?: string) => string;
}

const DEFAULT_NOTIFICATIONS: SmartNotification[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Flight Reminder',
    message: 'IndiGo 6E-2041 to Goa departs in 3 days. Web check-in opens 48 hours prior.',
    time: '2 hours ago',
    type: 'flight',
    category: 'booking_reminder',
    priority: 'important',
    read: false,
    actionUrl: '/my-bookings',
    actionText: 'View E-Ticket',
  },
  {
    id: 'notif-2',
    title: 'Weather Advisory: Afternoon Rain in Goa',
    message: '70% chance of showers tomorrow afternoon. We recommended shifting outdoor scuba diving to morning.',
    time: '5 hours ago',
    type: 'weather',
    category: 'weather',
    priority: 'normal',
    read: false,
    actionUrl: '/ai-planner?destination=Goa',
    actionText: 'Apply Schedule Adjustment',
  },
  {
    id: 'notif-3',
    title: 'Smart Budget Alert',
    message: 'Accommodation is currently utilizing 42% of your trip budget. Switch to Taj Benaulim to save ₹4,500.',
    time: '1 day ago',
    type: 'budget',
    category: 'trip_update',
    priority: 'normal',
    read: true,
    actionUrl: '/budget',
    actionText: 'Optimize Budget',
  },
  {
    id: 'notif-4',
    title: '💰 Price Drop: Goa Flight',
    message: 'Your tracked Hyderabad → Goa flight has dropped from ₹6,200 to ₹5,100. DEMO — Simulated price alert.',
    time: '3 hours ago',
    type: 'flight',
    category: 'price_alert',
    priority: 'important',
    read: false,
    actionUrl: '/wishlist',
    actionText: 'View Wishlist',
  },
  {
    id: 'notif-5',
    title: '👥 Shared Trip: New Suggestion',
    message: 'Rahul suggested adding a Sunset Cruise to your Goa trip.',
    time: '30 mins ago',
    type: 'group',
    category: 'shared_trip',
    priority: 'normal',
    read: false,
    actionUrl: '/shared-trips',
    actionText: 'View Suggestion',
  },
];

const DEFAULT_NOTIFICATION_SETTINGS: NotificationCategorySettings = {
  price_alert: true,
  trip_update: true,
  weather: true,
  booking_reminder: true,
  shared_trip: true,
};

const TravelSettingsContext = createContext<TravelSettingsContextType | undefined>(undefined);

export const TravelSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('trippilot_language') as LanguageCode) || 'en';
  });

  const [travelMode, setTravelModeState] = useState<TravelMode>(() => {
    return (localStorage.getItem('trippilot_travel_mode') as TravelMode) || 'standard';
  });

  const [notifications, setNotifications] = useState<SmartNotification[]>(() => {
    try {
      const saved = localStorage.getItem('trippilot_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  // Apply RTL direction and document language automatically
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  // Sync with authenticated user preferences on mount / login
  useEffect(() => {
    const syncUserPreferences = async () => {
      const token = localStorage.getItem('trippilot_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data && res.data.preferences) {
            const prefs = res.data.preferences as any;
            if (prefs.language && ['en', 'hi', 'es', 'fr', 'de', 'ar', 'ta', 'te'].includes(prefs.language)) {
              setLanguageState(prefs.language);
              localStorage.setItem('trippilot_language', prefs.language);
            }
            if (prefs.travelExperienceMode && ['standard', 'family', 'accessibility'].includes(prefs.travelExperienceMode)) {
              setTravelModeState(prefs.travelExperienceMode);
              localStorage.setItem('trippilot_travel_mode', prefs.travelExperienceMode);
            }
          }
        } catch {
          // Fallback gracefully to localStorage
        }
      }
    };
    syncUserPreferences();
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('trippilot_language', lang);

    // Persist to user profile in MongoDB if authenticated
    const token = localStorage.getItem('trippilot_token');
    if (token) {
      try {
        const rawUser = localStorage.getItem('trippilot_user');
        const currentUser = rawUser ? JSON.parse(rawUser) : {};
        const updatedPrefs = {
          ...(currentUser.preferences || {}),
          language: lang,
        };
        authService.updateProfile({ preferences: updatedPrefs }).catch(() => {
          // Non-blocking fallback
        });
        localStorage.setItem(
          'trippilot_user',
          JSON.stringify({ ...currentUser, preferences: updatedPrefs })
        );
      } catch {
        // Non-blocking
      }
    }
  }, []);

  const setTravelMode = useCallback((mode: TravelMode) => {
    setTravelModeState(mode);
    localStorage.setItem('trippilot_travel_mode', mode);

    // Persist to user profile in MongoDB if authenticated
    const token = localStorage.getItem('trippilot_token');
    if (token) {
      try {
        const rawUser = localStorage.getItem('trippilot_user');
        const currentUser = rawUser ? JSON.parse(rawUser) : {};
        const updatedPrefs = {
          ...(currentUser.preferences || {}),
          travelExperienceMode: mode,
        };
        authService.updateProfile({ preferences: updatedPrefs }).catch(() => {
          // Non-blocking fallback
        });
        localStorage.setItem(
          'trippilot_user',
          JSON.stringify({ ...currentUser, preferences: updatedPrefs })
        );
      } catch {
        // Non-blocking
      }
    }
  }, []);

  const [notificationSettings, setNotificationSettings] = useState<NotificationCategorySettings>(() => {
    try {
      const saved = localStorage.getItem('trippilot_notif_settings');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem('trippilot_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('trippilot_notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('trippilot_notifications', JSON.stringify(updated));
  };

  const clearAllRead = () => {
    const updated = notifications.filter((n) => !n.read);
    setNotifications(updated);
    localStorage.setItem('trippilot_notifications', JSON.stringify(updated));
  };

  const addNotification = (notif: Omit<SmartNotification, 'id' | 'read' | 'time'>) => {
    const newNotif: SmartNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      time: 'Just now',
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('trippilot_notifications', JSON.stringify(updated));
  };

  const updateNotificationSettings = (settings: Partial<NotificationCategorySettings>) => {
    const updated = { ...notificationSettings, ...settings };
    setNotificationSettings(updated);
    localStorage.setItem('trippilot_notif_settings', JSON.stringify(updated));
  };

  const tPlace = useCallback(
    (name: string): string => {
      return translatePlace(name, language);
    },
    [language]
  );

  const tRoute = useCallback(
    (routeOrOrigin: string, dest?: string): string => {
      if (dest) {
        const transOrigin = translatePlace(routeOrOrigin, language);
        const transDest = translatePlace(dest, language);
        return `${transOrigin} → ${transDest}`;
      }
      return translateRoute(routeOrOrigin, language);
    },
    [language]
  );

  const t = (key: string, paramsOrFallback?: Record<string, any> | string, fallback?: string): string => {
    // 1. Direct key match in chosen language or English
    let template = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key];

    // 2. Check if key is a place key e.g. "place.goa" or "place.delhi"
    if (!template && key.startsWith('place.')) {
      const rawPlace = key.replace('place.', '');
      template = translatePlace(rawPlace, language);
    }

    // 3. Check if key itself matches a known place name (e.g. "Goa", "Delhi", "Hyderabad")
    if (!template && PLACE_TRANSLATIONS[normalizePlaceKey(key)]) {
      template = translatePlace(key, language);
    }

    let params: Record<string, any> | undefined;
    let fallbackText: string | undefined;

    if (typeof paramsOrFallback === 'string') {
      fallbackText = paramsOrFallback;
    } else if (paramsOrFallback && typeof paramsOrFallback === 'object') {
      params = paramsOrFallback;
      fallbackText = fallback;
    } else {
      fallbackText = fallback;
    }

    if (!template) {
      template = fallbackText || key;
    }

    if (params && typeof template === 'string') {
      return template.replace(/\{(\w+)\}/g, (_, varName) => {
        return params?.[varName] !== undefined ? String(params[varName]) : `{${varName}}`;
      });
    }

    return template;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <TravelSettingsContext.Provider
      value={{
        language,
        setLanguage,
        travelMode,
        setTravelMode,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllRead,
        addNotification,
        notificationSettings,
        updateNotificationSettings,
        t,
        tPlace,
        tRoute,
      }}
    >
      {children}
    </TravelSettingsContext.Provider>
  );
};

export const useTravelSettings = () => {
  const context = useContext(TravelSettingsContext);
  if (!context) {
    throw new Error('useTravelSettings must be used within a TravelSettingsProvider');
  }
  return context;
};
