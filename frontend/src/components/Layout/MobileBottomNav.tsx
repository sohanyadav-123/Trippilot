import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Sparkles, Luggage, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useTravelSettings();

  const navItems = [
    { label: t('nav.home', 'Home'), href: '/', icon: Home },
    { label: t('nav.explore', 'Explore'), href: '/destinations', icon: Compass },
    { label: t('nav.plan', 'AI Plan'), href: '/plan', icon: Sparkles, highlight: true },
    { label: t('nav.my_bookings', 'My Trips'), href: '/my-bookings', icon: Luggage },
    { label: t('nav.profile', 'Account'), href: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      aria-label="Mobile navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.highlight) {
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex flex-col items-center -mt-5 group focus:outline-none"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#0B1220] text-white flex items-center justify-center shadow-luxury transition-transform active:scale-95">
                  <Icon className="w-5 h-5 text-[#C8A96B]" />
                </div>
                <span className="text-[10px] font-bold text-[#0B1220] mt-1 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all active:scale-95 focus:outline-none ${
                active ? 'text-[#0B1220] font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-150 ${active ? 'text-[#0B1220] scale-105' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
