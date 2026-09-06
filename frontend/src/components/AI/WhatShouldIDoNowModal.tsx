import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  MapPin,
  X,
  ArrowRight,
  Compass,
  CheckCircle2,
  Filter,
  DollarSign,
  Sun,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';
import { getContextualRecommendations } from '../../utils/aiOptimizationEngine';

interface WhatShouldIDoNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDay?: number;
}

export const WhatShouldIDoNowModal: React.FC<WhatShouldIDoNowModalProps> = ({
  isOpen,
  onClose,
  defaultDay = 1,
}) => {
  const {
    destination,
    interests,
    remainingBudget,
    tripNights,
    addCustomItineraryEvent,
  } = useTripBuilder();

  const [selectedDay, setSelectedDay] = useState<number>(defaultDay);
  const [selectedDuration, setSelectedDuration] = useState<number>(90); // minutes
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedItemTitle, setAddedItemTitle] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDays = Math.max(2, tripNights || 4);

  // Fetch AI contextual recommendations based on parameters
  const rawRecommendations = getContextualRecommendations(
    destination,
    selectedDuration,
    remainingBudget,
    interests,
    15 // 3 PM simulated current hour
  );

  const filteredRecommendations = rawRecommendations.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'food') return item.type === 'dining';
    if (selectedCategory === 'culture') return item.type === 'culture';
    if (selectedCategory === 'activity') return item.type === 'activity';
    return true;
  });

  const handleAddStop = (rec: (typeof rawRecommendations)[0]) => {
    const timeSlots: Record<number, string> = {
      1: '03:30 PM',
      2: '04:00 PM',
      3: '02:30 PM',
      4: '05:00 PM',
      5: '03:00 PM',
    };

    addCustomItineraryEvent(selectedDay, {
      date: '2026-09-15',
      time: timeSlots[selectedDay] || '04:00 PM',
      title: rec.title,
      type: rec.type === 'dining' ? 'dining' : 'activity',
      location: `${destination} (${rec.distance})`,
      cost: rec.cost,
      description: `${rec.whyItFits} • Category: ${rec.category}`,
    });

    setAddedItemTitle(rec.title);
    setTimeout(() => {
      setAddedItemTitle(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-luxury border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#0B1220] text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#C8A96B]">
                In-Trip Travel Copilot
              </div>
              <h3 className="font-bold text-xl text-white">What Should I Do Now?</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant smart recommendations for your free gaps in {destination}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Success toast */}
          {addedItemTitle && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Added "{addedItemTitle}" to Day {selectedDay} itinerary!</span>
            </div>
          )}

          {/* Context Controls: Day selector & Time window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            {/* Target Day */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Target Day
              </label>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedDay === d
                        ? 'bg-[#0B1220] text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    Day {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Window Duration */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Available Free Time
              </label>
              <div className="flex items-center gap-1">
                {[
                  { label: '45m', mins: 45 },
                  { label: '1.5h', mins: 90 },
                  { label: '2.5h+', mins: 150 },
                ].map((slot) => (
                  <button
                    key={slot.mins}
                    type="button"
                    onClick={() => setSelectedDuration(slot.mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedDuration === slot.mins
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'all', label: '🌟 All Suggestions' },
              { id: 'activity', label: '🏄 Outdoor & Scenic' },
              { id: 'food', label: '☕ Food & Drinks' },
              { id: 'culture', label: '🏛️ Culture & Heritage' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recommendations List */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredRecommendations.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-600">No suggestions match the current filters.</p>
                <p className="text-[11px] text-slate-400 mt-1">Try expanding your available time window or budget.</p>
              </div>
            ) : (
              filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all space-y-2.5 text-xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {rec.category}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                          ⏱ {rec.estDuration}
                        </span>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {rec.distance}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                        {rec.title}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {rec.cost === 0 ? (
                        <span className="text-xs font-black text-emerald-600 uppercase">Free</span>
                      ) : (
                        <CurrencyDisplay amount={rec.cost} className="font-black text-slate-900 text-sm" />
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C8A96B] flex-shrink-0 mt-0.5" />
                    <span><strong>Why it fits:</strong> {rec.whyItFits}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      {rec.weatherSuitability === 'indoor_safe' ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-500" />
                      )}
                      {rec.weatherSuitability === 'indoor_safe'
                        ? 'Indoor safe / Rainproof'
                        : 'Optimal for clear skies'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAddStop(rec)}
                      className="btn-primary text-xs !py-1.5 px-3.5 font-bold rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <span>+ Add to Day {selectedDay}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>TripPilot AI uses real travel gaps & weather data</span>
            <span className="font-bold text-slate-700">Remaining Budget: ₹{remainingBudget.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
