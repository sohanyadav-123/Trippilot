import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SavedTraveller {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  nationality: string;
  seatPreference: 'window' | 'aisle' | 'no_preference';
  mealPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'no_preference';
  isDefault: boolean;
}

interface TravellersContextType {
  travellers: SavedTraveller[];
  defaultTraveller: SavedTraveller | null;
  addTraveller: (t: Omit<SavedTraveller, 'id' | 'isDefault'>) => void;
  updateTraveller: (id: string, updates: Partial<SavedTraveller>) => void;
  deleteTraveller: (id: string) => void;
  setDefaultTraveller: (id: string) => void;
}

const TravellersContext = createContext<TravellersContextType | undefined>(undefined);
const TRAVELLERS_KEY = 'trippilot_saved_travellers_v2';

const DEFAULT_TRAVELLERS: SavedTraveller[] = [
  {
    id: 'tr-1',
    firstName: 'Sohan',
    lastName: 'Yadav',
    gender: 'male',
    dob: '1998-05-14',
    nationality: 'Indian',
    seatPreference: 'window',
    mealPreference: 'vegetarian',
    isDefault: true,
  },
];

export const TravellersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [travellers, setTravellers] = useState<SavedTraveller[]>(() => {
    try {
      const saved = localStorage.getItem(TRAVELLERS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TRAVELLERS;
    } catch {
      return DEFAULT_TRAVELLERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TRAVELLERS_KEY, JSON.stringify(travellers));
    } catch { /* ignore */ }
  }, [travellers]);

  const defaultTraveller = travellers.find((t) => t.isDefault) || travellers[0] || null;

  const addTraveller = (t: Omit<SavedTraveller, 'id' | 'isDefault'>) => {
    const newT: SavedTraveller = {
      ...t,
      id: `tr-${Date.now()}`,
      isDefault: travellers.length === 0,
    };
    setTravellers((prev) => [...prev, newT]);
  };

  const updateTraveller = (id: string, updates: Partial<SavedTraveller>) => {
    setTravellers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTraveller = (id: string) => {
    setTravellers((prev) => {
      const remaining = prev.filter((t) => t.id !== id);
      // If deleted was default, set first remaining as default
      if (remaining.length > 0 && !remaining.some((t) => t.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  };

  const setDefaultTraveller = (id: string) => {
    setTravellers((prev) =>
      prev.map((t) => ({ ...t, isDefault: t.id === id }))
    );
  };

  return (
    <TravellersContext.Provider
      value={{ travellers, defaultTraveller, addTraveller, updateTraveller, deleteTraveller, setDefaultTraveller }}
    >
      {children}
    </TravellersContext.Provider>
  );
};

export const useTravellers = () => {
  const ctx = useContext(TravellersContext);
  if (!ctx) throw new Error('useTravellers must be used within TravellersProvider');
  return ctx;
};
