import React, { useState, useEffect, useRef } from 'react';
import { TripPilotLogo } from '../Brand/TripPilotLogo';
import toast from 'react-hot-toast';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plane,
  Building2,
  Sparkles,
  Luggage,
  PieChart,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  MapPin,
  Train,
  Bell,
  Check,
  ChevronDown,
  Globe2,
  Compass,
  Heart,
  ShieldCheck,
  ArrowRight,
  Briefcase,
  UtensilsCrossed,
  Baby,
  Accessibility,
  Route,
  Users,
  Sun,
  Moon,
  CloudSun,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../context/WishlistContext';
import { useTravelSettings, TravelMode } from '../../context/TravelSettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggleSwitch } from '../Common/ThemeToggleSwitch';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const {
    travelMode,
    setTravelMode,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    t,
  } = useTravelSettings();

  const [activeDropdown, setActiveDropdown] = useState<'explore' | 'plan' | 'book' | 'trips' | 'budget' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click or route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const travelModes: { mode: TravelMode; key: string; icon: React.FC<{ className?: string }>; descKey: string }[] = [
    { mode: 'standard', key: 'mode.standard', icon: Globe2, descKey: 'mode.standard_desc' },
    { mode: 'family', key: 'mode.family', icon: Baby, descKey: 'mode.family_desc' },
    { mode: 'accessibility', key: 'mode.accessibility', icon: Accessibility, descKey: 'mode.accessibility_desc' },
  ];

  const exploreLinks = [
    { label: t('nav.destinations', 'Destinations'), desc: t('nav.destinations_desc', 'Curated global holiday spots & seasonal guides'), href: '/destinations', icon: Luggage },
    { label: t('nav.inspiration', 'Travel Inspiration'), desc: t('nav.inspiration_desc', 'Trending escapes, weekend getaways & seasonal picks'), href: '/inspiration', icon: Sparkles },
    { label: t('nav.flexible', 'I’m Flexible'), desc: t('nav.flexible_desc', 'Discover destinations matching your budget & style'), href: '/flexible-destinations', icon: Compass },
    { label: t('nav.cheapest', 'Cheapest Finder'), desc: t('nav.cheapest_desc', 'Where can I go for ₹30,000 budget search'), href: '/cheapest-destinations', icon: PieChart },
    { label: t('nav.nearby', 'Nearby Discovery'), desc: t('nav.nearby_desc', 'Restaurants, ATMs, pharmacies & fuel stations'), href: '/nearby', icon: MapPin },
    { label: t('nav.restaurants', 'Dining & Cafés'), desc: t('nav.restaurants_desc', 'Curated breakfast, dining & seafood lounges'), href: '/restaurant-planner', icon: UtensilsCrossed },
    { label: t('nav.activities', 'Tours & Activities'), desc: t('nav.activities_desc', 'Excursions, water sports, cruises & private tours'), href: '/activities', icon: Compass },
  ];

  const planLinks = [
    { label: t('nav.plan', 'Trip Builder'), desc: t('nav.plan_desc', 'Build flights, stays, transport & activities in one flow'), href: '/plan', icon: Sparkles },
    { label: t('nav.planner', 'AI Travel Planner'), desc: t('nav.planner_desc', 'Tailored day-by-day itineraries with smart reasoning'), href: '/ai-planner', icon: Compass },
    { label: t('nav.compare', 'Compare Trips'), desc: t('nav.compare_desc', 'Side-by-side comparison for 2–4 destinations'), href: '/compare-trips', icon: Route },
    { label: t('nav.itinerary', 'Itinerary Builder'), desc: t('nav.itinerary_desc', 'Interactive timeline scheduler with custom stops'), href: '/itinerary', icon: Route },
    { label: t('nav.weather', 'Destination Weather'), desc: t('nav.weather_desc', 'Live atmospheric forecasts, rain radar & packing advice'), href: '/weather', icon: CloudSun },
  ];

  const bookLinks = [
    { label: t('nav.flights', 'Flight Tickets'), desc: t('nav.flights_desc', 'Non-stop and direct fares with leading airlines'), href: '/flights', icon: Plane },
    { label: t('nav.hotels', 'Hotel Bookings'), desc: t('nav.hotels_desc', 'Verified luxury hotels with flexible cancellation'), href: '/hotels', icon: Building2 },
    { label: t('nav.packages', 'Holiday Packages'), desc: t('nav.packages_desc', 'All-inclusive multi-day vacation packages'), href: '/destinations', icon: Luggage },
    { label: t('nav.trains_buses', 'Railway & Buses'), desc: t('nav.trains_buses_desc', 'Express train & AC bus tickets'), href: '/flights?mode=trains', icon: Train },
  ];

  const tripsLinks = [
    { label: t('nav.my_bookings', 'My Bookings'), desc: t('nav.my_bookings_desc', 'Confirmed trips, tickets & vouchers'), href: '/my-bookings', icon: Luggage },
    { label: t('nav.shared_trips', 'Shared Trips'), desc: t('nav.shared_trips_desc', 'Group trip co-planning & invitation manager'), href: '/shared-trips', icon: Users },
    { label: t('nav.packing', 'Packing Assistant'), desc: t('nav.packing_desc', 'Weather & style aware luggage checklist'), href: '/packing-assistant', icon: ShoppingBag },
    { label: t('nav.documents', 'Documents Checklist'), desc: t('nav.documents_desc', 'Flight tickets, ID & insurance readiness'), href: '/documents-checklist', icon: ShieldCheck },
    { label: t('nav.travel_help', 'Emergency & Help'), desc: t('nav.travel_help_desc', 'Verified helpline numbers, hospital & airline support'), href: '/travel-help', icon: ShieldCheck },
  ];

  const budgetLinks = [
    { label: t('nav.budget_tracker', 'Budget Tracker'), desc: t('nav.budget_tracker_desc', 'Live expense breakdown & remaining budget'), href: '/budget', icon: PieChart },
    { label: t('nav.expense_splitter', 'Expense Splitter'), desc: t('nav.expense_splitter_desc', 'Shared dinners, cabs & balance calculations'), href: '/expense-splitter', icon: Users },
  ];

  const isLinkActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const isGroupActive = (links: { href: string }[]) => {
    return links.some((l) => isLinkActive(l.href));
  };

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white ${
        isScrolled
          ? 'border-b border-slate-200/90 shadow-sm py-3'
          : 'border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 min-h-[50px]">
          {/* ─── 1. LEFT: LUXURY BRAND LOGO ─── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <TripPilotLogo size={50} className="group-hover:scale-105 transition-transform duration-200" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-[#0B1220] leading-none">
                  TripPilot
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] mb-0.5" />
              </div>
              <span className="text-[8.5px] tracking-[0.2em] text-slate-500 uppercase font-bold mt-1">
                INTELLIGENT TRAVEL
              </span>
            </div>
          </Link>

          {/* ─── 2. CENTER: STREAMLINED 4-PILLAR NAVIGATION ─── */}
          <nav className="hidden xl:flex items-center gap-2">
            {/* EXPLORE Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('explore')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'explore' ? null : 'explore')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm sm:text-[15px] font-bold transition-all ${
                  activeDropdown === 'explore' || isGroupActive(exploreLinks)
                    ? 'text-[#0B1220] bg-slate-50 font-extrabold'
                    : 'text-slate-600 hover:text-[#0B1220] hover:bg-slate-50/80'
                }`}
              >
                <span>{t('nav.explore', 'Explore')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'explore' ? 'rotate-180 text-[#0B1220]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'explore' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl shadow-luxury border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    {exploreLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            active ? 'bg-slate-50 text-[#0B1220]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0B1220] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0B1220]">{item.label}</div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* PLAN Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('plan')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'plan' ? null : 'plan')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm sm:text-[15px] font-bold transition-all ${
                  activeDropdown === 'plan' || isGroupActive(planLinks)
                    ? 'text-[#0B1220] bg-slate-50 font-extrabold'
                    : 'text-slate-600 hover:text-[#0B1220] hover:bg-slate-50/80'
                }`}
              >
                <span>{t('nav.plan', 'Plan')}</span>
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'plan' ? 'rotate-180 text-[#0B1220]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'plan' && (
                <div className="absolute top-full left-0 mt-1 w-84 bg-white rounded-2xl shadow-luxury border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    {planLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            active ? 'bg-slate-50 text-[#0B1220]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0B1220] flex items-center gap-1.5">
                              <span>{item.label}</span>
                              {item.label.includes('AI') && (
                                <span className="text-[9px] font-bold text-[#C8A96B] uppercase tracking-wider">
                                  Smart
                                </span>
                              )}
                              {item.href === '/weather' && (
                                <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-sky-200/60">
                                  Live
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BOOK Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('book')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'book' ? null : 'book')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm sm:text-[15px] font-bold transition-all ${
                  activeDropdown === 'book' || isGroupActive(bookLinks)
                    ? 'text-[#0B1220] bg-slate-50 font-extrabold'
                    : 'text-slate-600 hover:text-[#0B1220] hover:bg-slate-50/80'
                }`}
              >
                <span>{t('nav.book', 'Book')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'book' ? 'rotate-180 text-[#0B1220]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'book' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl shadow-luxury border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    {bookLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            active ? 'bg-slate-50 text-[#0B1220]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0B1220] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0B1220]">{item.label}</div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* TRIPS Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('trips')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'trips' ? null : 'trips')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm sm:text-[15px] font-bold transition-all ${
                  activeDropdown === 'trips' || isGroupActive(tripsLinks)
                    ? 'text-[#0B1220] bg-slate-50 font-extrabold'
                    : 'text-slate-600 hover:text-[#0B1220] hover:bg-slate-50/80'
                }`}
              >
                <span>{t('nav.trips', 'Trips')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'trips' ? 'rotate-180 text-[#0B1220]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'trips' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl shadow-luxury border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    {tripsLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            active ? 'bg-slate-50 text-[#0B1220]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#0B1220] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0B1220]">{item.label}</div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* BUDGET Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('budget')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === 'budget' ? null : 'budget')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm sm:text-[15px] font-bold transition-all ${
                  activeDropdown === 'budget' || isGroupActive(budgetLinks)
                    ? 'text-[#0B1220] bg-slate-50 font-extrabold'
                    : 'text-slate-600 hover:text-[#0B1220] hover:bg-slate-50/80'
                }`}
              >
                <span>{t('nav.budget', 'Budget')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'budget' ? 'rotate-180 text-[#0B1220]' : 'text-slate-400'}`} />
              </button>

              {activeDropdown === 'budget' && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-2xl shadow-luxury border border-slate-200/90 p-2.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1">
                    {budgetLinks.map((item) => {
                      const Icon = item.icon;
                      const active = isLinkActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            active ? 'bg-slate-50 text-[#0B1220]' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#0B1220]">{item.label}</div>
                            <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* ─── 3. RIGHT: REFINED USER UTILITIES ─── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Smart Notifications Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title={t('notif.title', 'Smart Travel Alerts')}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-luxury border border-slate-200 p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{t('notif.title', 'Smart Travel Alerts')}</h4>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-bold"
                      >
                        {t('notif.mark_all_read', 'Mark all read')}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">{t('notif.empty', 'No notifications')}</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 rounded-2xl border transition-all text-xs space-y-1 cursor-pointer ${
                            !n.read ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                          {n.actionUrl && (
                            <Link
                              to={n.actionUrl}
                              onClick={() => setNotificationsOpen(false)}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 pt-1"
                            >
                              <span>{n.actionText || t('action.view_details', 'View Details')}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Saved Items"
            >
              <Heart className="w-4 h-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0B1220] text-white text-[9px] font-black flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Cart / Checkout"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[9px] font-black flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle Slide Switch (Light / Dark) */}
            <div className="flex items-center">
              <ThemeToggleSwitch />
            </div>

            {/* User Profile / Auth Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-bold text-slate-900"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#0B1220] text-white flex items-center justify-center text-[10px]">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-bold truncate max-w-[85px]">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>{t('nav.profile', 'My Profile')}</span>
                    </Link>

                    <Link
                      to="/my-bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <Luggage className="w-3.5 h-3.5" />
                      <span>{t('nav.my_bookings', 'My Trips & Journeys')}</span>
                    </Link>

                    <Link
                      to="/travel-preferences"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>Travel Preferences</span>
                    </Link>

                    <Link
                      to="/saved-travellers"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Saved Co-Travellers</span>
                    </Link>

                    <Link
                      to="/notification-settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      <span>Notification Settings</span>
                    </Link>

                    <Link
                      to="/agency"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-700 font-bold hover:bg-blue-50 border-t border-slate-100"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('nav.agency', 'Travel Agency Portal')}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-900 font-bold hover:bg-slate-50 border-t border-slate-100"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t('nav.admin', 'Admin Console')}</span>
                      </Link>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav.logout', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-secondary text-sm !py-2 px-4 font-bold rounded-xl"
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex btn-primary text-sm !py-2 px-4.5 font-bold shadow-xs rounded-xl"
                >
                  {t('nav.signup', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-4 pb-4 animate-in fade-in">
            {/* Mobile Theme Toggle Slide Switch */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Theme Mode
              </span>
              <ThemeToggleSwitch showLabel />
            </div>

            {/* Mobile Travel Mode Selection */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {t('mode.title', 'Travel Experience Mode')}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {travelModes.map((m) => {
                  const Icon = m.icon;
                  const isSelected = travelMode === m.mode;
                  const activeClass =
                    m.mode === 'family'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : m.mode === 'accessibility'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-blue-600 text-white border-blue-600 shadow-sm';

                  return (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => {
                        setTravelMode(m.mode);
                        toast.success(`Active Mode: ${t(m.key, m.mode)}`, {
                          duration: 2500,
                          id: 'travel-mode',
                          icon: m.mode === 'family' ? '👨‍👩‍👧' : m.mode === 'accessibility' ? '♿' : '✈️',
                        });
                      }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border transition-all flex flex-col items-center gap-1 ${
                        isSelected ? activeClass : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate w-full">{t(m.key, m.mode)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                {t('nav.explore', 'Explore Destinations & Stays')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {exploreLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs font-bold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                {t('nav.plan', 'Plan Your Trip')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {planLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-blue-50/60 text-blue-900 text-xs font-bold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                {t('nav.book', 'Book Tickets')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {bookLinks.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs font-bold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
