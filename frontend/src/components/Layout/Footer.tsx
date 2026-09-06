import React from 'react';
import { TripPilotLogo } from '../Brand/TripPilotLogo';
import { Link } from 'react-router-dom';
import {
  Compass,
  ShieldCheck,
  CreditCard,
  Headphones,
  FileCheck2,
  Mail,
  ArrowRight,
  Plane,
  Building2,
  Luggage,
} from 'lucide-react';
import { useTravelSettings } from '../../context/TravelSettingsContext';

export const Footer: React.FC = () => {
  const { t } = useTravelSettings();

  return (
    <footer className="bg-[#0B1220] text-slate-400 mt-24">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <TripPilotLogo size={36} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-white leading-none">
                    TripPilot
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] mb-0.5" />
                </div>
                <span className="text-[8.5px] tracking-[0.2em] text-[#C8A96B] uppercase font-bold mt-1">
                  INTELLIGENT TRAVEL
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              {t('footer.brandDesc', 'Your comprehensive intelligent travel platform. Direct flights with leading airlines, verified boutique and luxury stays, day-by-day AI scheduling, and real-time trip optimization.')}
            </p>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-200 block mb-2">
                {t('footer.newsletterLabel', 'Get fare drop alerts & weekend escape blueprints:')}
              </label>
              <div className="flex items-center max-w-sm">
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder', 'Enter your email address')}
                  className="bg-[#1E293B] border border-slate-700 rounded-l-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C8A96B] w-full"
                />
                <button className="bg-[#C8A96B] hover:bg-[#B39355] text-[#0B1220] text-xs font-bold px-4 py-2 rounded-r-xl transition-colors flex items-center gap-1">
                  {t('footer.subscribe', 'Subscribe')}
                </button>
              </div>
            </div>
          </div>

          {/* Column 1: Explore & Book */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t('footer.exploreBook', 'Explore & Book')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/flights" className="hover:text-white transition-colors">
                  {t('nav.flights', 'Flight Tickets')}
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-white transition-colors">
                  {t('nav.hotels', 'Hotels & Resorts')}
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  {t('nav.packages', 'Holiday Packages')}
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-white transition-colors">
                  {t('nav.activities', 'Tours & Activities')}
                </Link>
              </li>
              <li>
                <Link to="/flights?mode=trains" className="hover:text-white transition-colors">
                  {t('nav.trains', 'Railway Transport')}
                </Link>
              </li>
              <li>
                <Link to="/hidden-gems" className="hover:text-white transition-colors">
                  {t('nav.hiddenGems', 'Hidden Gems Discovery')}
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="hover:text-white transition-colors">
                  {t('nav.dining', 'Dining & Cafés')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Trip Planning */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t('footer.tripPlanning', 'Trip Planning')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/ai-planner" className="hover:text-white transition-colors">
                  {t('nav.aiCopilot', 'AI Travel Co-Pilot')}
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="hover:text-white transition-colors">
                  {t('nav.itinerary', 'Itinerary & Route Optimizer')}
                </Link>
              </li>
              <li>
                <Link to="/budget" className="hover:text-white transition-colors">
                  {t('nav.budget', 'Smart Budget Optimizer')}
                </Link>
              </li>
              <li>
                <Link to="/agency" className="text-[#C8A96B] font-bold hover:underline transition-colors">
                  {t('footer.agencyPortal', 'Travel Agency Portal (B2B)')}
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  {t('nav.wishlist', 'Saved Wishlist')}
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  {t('nav.myTrips', 'Manage My Trips')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">{t('footer.companyTrust', 'Company & Trust')}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('footer.aboutUs', 'About TripPilot')}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('footer.support', 'Customer Support Desk')}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('footer.cancellation', 'Cancellation & Refund Policy')}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('footer.terms', 'Terms of Service')}
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  {t('footer.privacy', 'Privacy Policy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TripPilot Technologies Inc. {t('footer.rightsReserved', 'All rights reserved.')}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">{t('footer.security', 'Security & Encryption')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('footer.protection', 'Traveler Protection')}</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('footer.cookies', 'Cookie Preferences')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
