import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>
      <div className="space-y-2">
        <span className="text-blue-600 font-mono text-xs uppercase tracking-widest font-bold">Error 404</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Lost in Exploration?</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          The page or travel route you are looking for has been moved or does not exist.
        </p>
      </div>
      <Link to="/" className="btn-primary flex items-center gap-2 font-bold text-xs !py-3 px-6 shadow-sm">
        Return to Home <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
