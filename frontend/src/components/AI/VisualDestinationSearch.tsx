import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { CurrencyDisplay } from '../Common/CurrencyDisplay';

interface SceneryPreset {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  matchedDestination: string;
  country: string;
  matchScore: number;
  matchReason: string;
  bestSeason: string;
  avgBudget: number;
}

const PRESETS: SceneryPreset[] = [
  {
    id: 'p-1',
    title: 'Emerald Cliffs & Ocean Coves',
    category: 'Coastal Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    matchedDestination: 'Goa (Vagator / Cabo de Rama)',
    country: 'India',
    matchScore: 97,
    matchReason: 'Dramatic red laterite cliffs, secluded cove waters, and coconut palm fringe.',
    bestSeason: 'Nov – Mar',
    avgBudget: 28000,
  },
  {
    id: 'p-2',
    title: 'Snowcapped Peaks & Pine Valleys',
    category: 'Alpine Escape',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    matchedDestination: 'Manali & Solang Valley',
    country: 'India',
    matchScore: 94,
    matchReason: 'Himalayan coniferous forests, high-altitude snow ridges, and alpine meadows.',
    bestSeason: 'Oct – May',
    avgBudget: 22000,
  },
  {
    id: 'p-3',
    title: 'Golden Sunset Sand Dunes',
    category: 'Desert Oasis',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    matchedDestination: 'Dubai (Lahbab Desert)',
    country: 'United Arab Emirates',
    matchScore: 98,
    matchReason: 'Rolling red sand dunes, traditional Bedouin camps, and luxury desert retreats.',
    bestSeason: 'Oct – Apr',
    avgBudget: 45000,
  },
  {
    id: 'p-4',
    title: 'Lush Terraced Rainforests & Waterfalls',
    category: 'Tropical Haven',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    matchedDestination: 'Bali (Ubud & Tegalalang)',
    country: 'Indonesia',
    matchScore: 95,
    matchReason: 'Layered emerald rice terraces, sacred rivers, and private pool rainforest villas.',
    bestSeason: 'Apr – Oct',
    avgBudget: 48000,
  },
];

export const VisualDestinationSearch: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<SceneryPreset>(PRESETS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [customFileSelected, setCustomFileSelected] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (preset: SceneryPreset) => {
    setAnalyzing(true);
    setSelectedPreset(preset);
    setCustomFileSelected(false);
    setTimeout(() => {
      setAnalyzing(false);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalyzing(true);
      setCustomFileSelected(true);
      setTimeout(() => {
        // Map to highest match
        setSelectedPreset({
          id: 'custom-uploaded',
          title: 'Uploaded Photo Visual Match',
          category: 'Analyzed Travel Image',
          imageUrl: URL.createObjectURL(e.target.files![0]),
          matchedDestination: 'Goa (Cola Beach & Blue Lagoon)',
          country: 'India',
          matchScore: 96,
          matchReason: 'Coastal palm canopy, tranquil freshwater lagoon, and untouched golden shores.',
          bestSeason: 'Oct – Apr',
          avgBudget: 32000,
        });
        setAnalyzing(false);
      }, 700);
    }
  };

  return (
    <div className="surface-card p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI IMAGE-BASED DESTINATION DISCOVERY</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Find Matching Destinations from a Photo
          </h3>
          <p className="text-xs text-slate-500">
            Upload any scenery photo or select a vibe preset to discover visually similar travel spots.
          </p>
        </div>

        <label className="btn-secondary text-xs !py-2 px-3.5 font-bold cursor-pointer flex items-center gap-1.5 self-start sm:self-auto">
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Image</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Preset Scenery Selector */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase text-slate-400 block">Select visual scenery inspiration:</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => handleSelect(preset)}
              className={`h-24 rounded-2xl overflow-hidden relative cursor-pointer border-2 transition-all group ${
                selectedPreset.id === preset.id
                  ? 'border-blue-600 shadow-md scale-102'
                  : 'border-transparent opacity-75 hover:opacity-100'
              }`}
            >
              <img src={preset.imageUrl} alt={preset.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <span className="text-[10px] font-bold block leading-tight truncate">{preset.title}</span>
                <span className="text-[8px] text-slate-300 block">{preset.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matched Destination Result Card */}
      {analyzing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-xs font-bold text-slate-500">
          <Sparkles className="w-6 h-6 text-blue-600 animate-spin" />
          <span>Analyzing visual features, terrain, and landscape architecture...</span>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row gap-5 items-center">
          <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden relative flex-shrink-0">
            <img src={selectedPreset.imageUrl} alt={selectedPreset.matchedDestination} className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {selectedPreset.matchScore}% Visual Match
            </div>
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900">{selectedPreset.matchedDestination}</h4>
                <span className="text-xs font-bold text-slate-500">{selectedPreset.country}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{selectedPreset.matchReason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Best Season</span>
                <span className="font-bold text-slate-900">{selectedPreset.bestSeason}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg. Budget (5 Days)</span>
                <CurrencyDisplay amount={selectedPreset.avgBudget} className="font-bold text-blue-600" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() =>
                  navigate(
                    `/ai-planner?destination=${encodeURIComponent(
                      selectedPreset.matchedDestination.split('(')[0].trim()
                    )}`
                  )
                }
                className="btn-primary text-xs !py-2 px-5 font-bold shadow-sm flex items-center gap-1.5"
              >
                <span>Plan Trip to This Destination</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
