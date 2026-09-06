import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Trash2,
  Share2,
  Download,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plane,
  Building2,
  Calendar,
} from 'lucide-react';
import { itineraryService } from '../services/itineraryService';
import { Itinerary, ItineraryDay } from '../types';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';
import { EmptyState } from '../components/Common/EmptyState';
import { CurrencyDisplay } from '../components/Common/CurrencyDisplay';
import { Modal } from '../components/Common/Modal';

export const ItineraryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  // New Activity Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newActivity, setNewActivity] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(1000);

  const fallbackItineraries: Itinerary[] = [
    {
      id: 'itin-goa-5d',
      title: '5-Day Goa Coastal & Heritage Blueprint',
      destination: 'Goa',
      start_date: '2026-09-15',
      end_date: '2026-09-20',
      travellers: 2,
      estimated_cost: 32000,
      estimated_total_cost: 32000,
      ai_generated: true,
      summary: 'A balanced blend of North Goa vibrant beach life, Fort Aguada heritage, Dudhsagar falls excursion, and authentic Goan seafood dining.',
      days: [
        {
          day: 1,
          date: 'Day 1',
          accommodation: 'Taj Exotica Resort & Spa',
          daily_budget: 6500,
          activities: [
            { time: '08:45 AM', activity: 'Arrival at Goa (GOI) Airport', description: 'Prepaid cab to Benaulim resort check-in.', estimated_cost: 1200, type: 'transport' },
            { time: '01:00 PM', activity: 'Seafood Lunch at Martin’s Corner', description: 'Famous coastal lunch with Kingfish rava fry.', estimated_cost: 1800, type: 'food' },
            { time: '05:00 PM', activity: 'Sunset at Colva Beach', description: 'Relaxed beach walk and coconut water by the shore.', estimated_cost: 200, type: 'sightseeing' },
          ],
        },
        {
          day: 2,
          date: 'Day 2',
          accommodation: 'Taj Exotica Resort & Spa',
          daily_budget: 7000,
          activities: [
            { time: '09:30 AM', activity: 'Fort Aguada & Lighthouse Tour', description: 'Historical Portuguese bastion overlooking the Arabian Sea.', estimated_cost: 400, type: 'sightseeing' },
            { time: '02:00 PM', activity: 'Baga Beach Watersports', description: 'Parasailing and jet ski combo package.', estimated_cost: 2800, type: 'adventure' },
            { time: '08:00 PM', activity: 'Dinner & Music at Curlies Anjuna', description: 'Iconic beach shack with live acoustic melodies.', estimated_cost: 2200, type: 'food' },
          ],
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const fetchItineraries = async () => {
    setLoading(true);
    try {
      const res = await itineraryService.listItineraries();
      if (res.success && res.data && res.data.itineraries && res.data.itineraries.length > 0) {
        setItineraries(res.data.itineraries);
        setSelectedItinerary(res.data.itineraries[0]);
      } else {
        setItineraries(fallbackItineraries);
        setSelectedItinerary(fallbackItineraries[0]);
      }
    } catch {
      setItineraries(fallbackItineraries);
      setSelectedItinerary(fallbackItineraries[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, []);

  const handleAddActivity = () => {
    if (!selectedItinerary || !newActivity) return;
    const updated = { ...selectedItinerary };
    if (!updated.days[selectedDayIdx]) return;

    updated.days[selectedDayIdx].activities.push({
      time: newTime,
      activity: newActivity,
      description: newDesc,
      estimated_cost: newCost,
      type: 'adventure',
    });

    setSelectedItinerary(updated);
    setModalOpen(false);
    setNewActivity('');
    setNewDesc('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>TRIPPILOT ITINERARY BUILDER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {selectedItinerary ? selectedItinerary.title : 'Trip Itineraries'}
            </h1>
            {selectedItinerary && (
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedItinerary.destination} • {selectedItinerary.days.length} Days • Total Budget:{' '}
                <CurrencyDisplay amount={selectedItinerary.estimated_total_cost || 30000} className="font-bold text-slate-900" />
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/ai-planner"
              className="btn-primary-blue text-xs py-2 px-4 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Plan New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : selectedItinerary ? (
        <div className="space-y-6">
          {/* Day Cards Stream */}
          {selectedItinerary.days.map((day, dIdx) => (
            <motion.div
              key={dIdx}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="surface-card p-6 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    0{day.day}
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Day {day.day}</h3>
                    <p className="text-xs text-slate-500">{day.accommodation}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDayIdx(dIdx);
                    setModalOpen(true);
                  }}
                  className="btn-secondary text-xs !py-1.5 px-3 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slot
                </button>
              </div>

              {/* Activities Stream */}
              <div className="space-y-3">
                {day.activities.map((act, aIdx) => (
                  <motion.div
                    key={aIdx}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px] flex-shrink-0">
                        {act.time}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{act.activity}</p>
                        {act.description && <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>}
                      </div>
                    </div>

                    {act.estimated_cost && (
                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Est. Cost</span>
                        <CurrencyDisplay amount={act.estimated_cost} className="font-bold text-slate-900 text-xs" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No itineraries saved"
          description="Create your first smart itinerary with our AI Travel Architect."
          actionLabel="Launch AI Planner"
          onAction={() => navigate('/ai-planner')}
        />
      )}

      {/* Add Slot Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Activity to Itinerary" maxWidth="md">
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Time</label>
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="input-field text-xs py-2"
              placeholder="e.g. 11:30 AM"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Activity Title</label>
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              className="input-field text-xs py-2"
              placeholder="e.g. Scuba diving in Grand Island"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Notes / Description</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input-field text-xs py-2"
              placeholder="Optional notes or details"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Estimated Cost (INR)</label>
            <input
              type="number"
              value={newCost}
              onChange={(e) => setNewCost(Number(e.target.value))}
              className="input-field text-xs py-2"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary text-xs !py-2 px-3 font-bold">
              Cancel
            </button>
            <button onClick={handleAddActivity} className="btn-primary text-xs !py-2 px-5 font-bold shadow-sm">
              Save Activity
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
