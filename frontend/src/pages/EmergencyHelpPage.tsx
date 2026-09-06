import React from 'react';
import { TravelHelpView } from '../components/Preparation/TravelHelpView';

export const EmergencyHelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <TravelHelpView />
      </div>
    </div>
  );
};
