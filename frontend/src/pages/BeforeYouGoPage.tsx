import React from 'react';
import { BeforeYouGoDashboard } from '../components/Preparation/BeforeYouGoDashboard';

export const BeforeYouGoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <BeforeYouGoDashboard />
      </div>
    </div>
  );
};
