import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0B1220] selection:text-white pb-16 lg:pb-0 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
