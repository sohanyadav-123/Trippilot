import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Hospital,
  ShieldAlert,
  HeartHandshake,
  Plane,
  Building2,
  Car,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Headphones,
  Search,
  Sparkles,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { getTravelHelpDirectory } from '../../utils/travelHelpData';
import { TravelHelpContact } from '../../types';

export const TravelHelpView: React.FC = () => {
  const { t } = useTravelSettings();
  const { destination, selectedStay, selectedTravel, selectedMobility } = useTripBuilder();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const contacts = getTravelHelpDirectory({
    destination,
    hotelName: selectedStay?.name,
    hotelAddress: selectedStay?.address,
    airlineName: selectedTravel?.operator,
    flightNumber: selectedTravel?.id,
    transportProvider: selectedMobility?.provider,
  });

  const filterTabs = [
    { id: 'all', label: t('help.filter_all', 'All Contacts') },
    { id: 'emergency', label: t('help.filter_emergency', '🚨 Emergency & Police') },
    { id: 'hospital', label: t('help.filter_hospital', '🏥 Hospitals & Medical') },
    { id: 'embassy', label: t('help.filter_embassy', '🏛️ Embassies & Consular') },
    { id: 'provider', label: t('help.filter_provider', '🏨 Stays, Flights & Cabs') },
    { id: 'support', label: t('help.filter_support', '🛡️ TripPilot Concierge') },
  ];

  const filteredContacts = contacts.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'emergency') return c.type === 'emergency' || c.type === 'police';
    if (activeFilter === 'hospital') return c.type === 'hospital';
    if (activeFilter === 'embassy') return c.type === 'embassy';
    if (activeFilter === 'provider') return c.type === 'hotel' || c.type === 'airline' || c.type === 'transport';
    if (activeFilter === 'support') return c.type === 'trippilot_support';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-rose-950 text-white border border-rose-800 shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('help.badge', '24/7 EMERGENCY & TRAVEL DIRECTORY')}</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight">
            {t('help.title', { destination }, `Travel Help for ${destination}`)}
          </h2>
          <p className="text-xs text-rose-200">
            {t('help.subtitle', 'Official emergency hotlines, nearby 24/7 medical centers, confirmed hotel front desk, and TripPilot assistance.')}
          </p>
        </div>

        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl text-xs text-center space-y-1 min-w-[200px]">
          <span className="text-[10px] uppercase font-bold text-rose-200 block">{t('help.desk_title', 'TripPilot Emergency Desk')}</span>
          <span className="text-lg font-black text-white block">+91 800 8747 745</span>
          <span className="text-[10px] text-rose-300 block">{t('help.desk_toll_free', 'Toll-free 24/7 in-trip support')}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => (
          <motion.button
            key={tab.id}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeFilter === tab.id
                ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Contacts Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredContacts.map((item) => {
            const isOfficial = item.sourceType === 'OFFICIAL';
            const isSupport = item.sourceType === 'TRIPPILOT SUPPORT';

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`surface-card rounded-3xl bg-white border p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-luxury transition-all ${
                  isOfficial
                    ? 'border-rose-200/80 hover:border-rose-300'
                    : isSupport
                    ? 'border-indigo-200 hover:border-indigo-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border inline-block mb-1.5 ${
                        isOfficial
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : isSupport
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.sourceType}
                    </span>
                    <h3 className="font-bold text-base text-[#0B1220] leading-snug">{item.name}</h3>
                  </div>

                  {item.distance && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 whitespace-nowrap">
                      {item.distance}
                    </span>
                  )}
                </div>

                {item.address && (
                  <p className="text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{item.address}</span>
                  </p>
                )}

                {item.availability && (
                  <p className="text-[11px] font-semibold text-emerald-700">
                    🕒 {item.availability}
                  </p>
                )}
              </div>

              {/* Call / Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900">{item.phone}</span>

                <a
                  href={`tel:${item.phone.split('/')[0].trim()}`}
                  className="btn-primary text-xs !py-2 px-4 font-bold rounded-xl flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t('help.call_now', 'Call Now')}</span>
                </a>
              </div>
            </motion.div>
          );
        })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
