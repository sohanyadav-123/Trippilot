import React from 'react';
import { PackingAssistantView } from '../components/Preparation/PackingAssistantView';

export const PackingAssistantPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <PackingAssistantView />
      </div>
    </div>
  );
};
