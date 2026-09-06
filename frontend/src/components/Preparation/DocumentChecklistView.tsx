import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
  Plus,
  Bell,
  Sparkles,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { DocumentCheckItem, DocumentSourceType } from '../../types';
import { generateSmartDocumentChecklist } from '../../utils/documentIntelligence';

export const DocumentChecklistView: React.FC = () => {
  const navigate = useNavigate();
  const {
    destination,
    selectedTravel,
    selectedStay,
    selectedMobility,
    selectedActivities,
    documentChecklist,
    toggleDocumentItem,
  } = useTripBuilder();

  const isInternational = ['dubai', 'bali', 'singapore', 'paris'].some((c) =>
    destination.toLowerCase().includes(c)
  );

  const totalDocs = documentChecklist.length;
  const readyDocs = documentChecklist.filter((d) => d.completed).length;
  const progress = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0;
  const isAllReady = totalDocs > 0 && readyDocs === totalDocs;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-[#0B1220] text-white shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 text-[#C8A96B] text-xs font-bold border border-[#C8A96B]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TRAVEL DOCUMENT READINESS</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold tracking-tight">
            Documents for {destination} Trip
          </h2>
          <p className="text-xs text-slate-300">
            {isInternational ? (
              <span className="text-purple-300 font-bold">International Trip • Passport & Entry Rules Apply</span>
            ) : (
              <span className="text-emerald-300 font-bold">Domestic Travel • Government Photo ID & Boarding Vouchers</span>
            )}
          </p>
        </div>

        {/* Readiness Ring Card */}
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/15 p-5 rounded-2xl text-xs space-y-2 min-w-[220px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Readiness</span>
            <span className="font-black text-sm text-white">
              {readyDocs} / {totalDocs} Ready
            </span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllReady ? 'bg-emerald-400' : 'bg-[#C8A96B]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-[#C8A96B]">{progress}% Complete</span>
            {isAllReady ? (
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">
                ✓ All Documents Ready
              </span>
            ) : (
              <span className="text-[10px] text-amber-300 font-bold">
                {totalDocs - readyDocs} item needs attention
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="text-blue-900 block font-bold">Privacy-First Document Tracking</strong>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            TripPilot helps you track document preparation and validity without requiring you to upload scans, passport numbers, or sensitive government IDs.
          </p>
        </div>
      </div>

      {/* Document Items List */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="space-y-3">
          {documentChecklist.map((doc) => {
            const isOfficial = doc.sourceType === 'OFFICIAL REQUIREMENT' || doc.required;

            return (
              <div
                key={doc.id}
                onClick={() => toggleDocumentItem(doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  doc.completed
                    ? 'bg-emerald-50/70 border-emerald-300/80'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {doc.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`font-bold text-sm leading-tight ${
                          doc.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {doc.title}
                      </h4>

                      {isOfficial ? (
                        <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                          Official Requirement
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                          TripPilot Recommendation
                        </span>
                      )}
                    </div>

                    {doc.note && (
                      <p className="text-xs text-slate-500 leading-relaxed">{doc.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end flex-shrink-0">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                      doc.completed
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {doc.completed ? '✓ Ready' : '⚠️ Incomplete'}
                  </span>

                  {doc.actionLink && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(doc.actionLink!);
                      }}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                      title="View Booking"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
