import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  Loader2,
  Zap,
  Hotel,
  MapPin,
  ArrowRight,
  RefreshCw,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { ChatMessage } from '../../types';
import { AICopilotActionCard } from '../../types';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { DestinationChangeModal } from '../TripBuilder/DestinationChangeModal';
import { StartFreshModal } from '../TripBuilder/StartFreshModal';
import { useTravelSettings } from '../../context/TravelSettingsContext';

// Pattern matching for intents that generate action cards
type IntentType =
  | 'cheaper_hotel'
  | 'cheaper_flight'
  | 'optimize_day'
  | 'change_destination'
  | 'start_fresh'
  | 'budget_help'
  | 'general';

function detectIntent(text: string): IntentType {
  const lower = text.toLowerCase();
  if (/cheaper hotel|find.*hotel|hotel.*under|replace hotel/.test(lower)) return 'cheaper_hotel';
  if (/cheaper flight|find.*flight|flight.*under/.test(lower)) return 'cheaper_flight';
  if (/optimize.*day|optimize today|optimize itinerary/.test(lower)) return 'optimize_day';
  if (/change.*destination|go to|switch to|change to/.test(lower)) return 'change_destination';
  if (/start fresh|new trip|forget this trip|reset|start over/.test(lower)) return 'start_fresh';
  if (/save|budget|afford|over budget|how much/.test(lower)) return 'budget_help';
  return 'general';
}

function buildActionCard(
  intent: IntentType,
  context: { destination: string; budget: number; selectedStay?: any; remainingBudget: number }
): AICopilotActionCard | null {
  switch (intent) {
    case 'cheaper_hotel':
      return {
        id: `ac-${Date.now()}`,
        actionType: 'replace_hotel',
        title: `💡 Cheaper Hotel Found in ${context.destination}`,
        description: `The Horizon View Hotel (4.6★, Beachside) is available at ₹${(
          (context.selectedStay?.price_per_night || 4500) * 0.72
        ).toFixed(0)}/night — saving approximately ₹${Math.round(
          (context.selectedStay?.price_per_night || 4500) * 0.28
        ).toLocaleString('en-IN')} over your stay.`,
        buttonLabel: 'Review & Replace Hotel',
        status: 'pending',
      };
    case 'cheaper_flight':
      return {
        id: `ac-${Date.now()}`,
        actionType: 'add_activity',
        title: '✈️ Budget Flight Option Found',
        description: `IndiGo 6E-2041 (6:10 AM Non-Stop) is available at ₹3,899/person — potentially saving ₹1,400+ vs peak evening slots. No checked baggage included.`,
        buttonLabel: 'Review Flight Option',
        status: 'pending',
      };
    case 'optimize_day':
      return {
        id: `ac-${Date.now()}`,
        actionType: 'optimize_day',
        title: '⚡ Optimize Today\'s Itinerary',
        description: 'TripPilot will analyze opening hours, travel time, weather, and activity priority to suggest a better daily sequence.',
        buttonLabel: 'Open Optimize Day',
        status: 'pending',
      };
    case 'change_destination':
      return {
        id: `ac-${Date.now()}`,
        actionType: 'change_destination',
        title: '🗺️ Change Trip Destination',
        description: 'This will open the destination change confirmation. You\'ll see exactly which items are affected before anything changes.',
        buttonLabel: 'Start Destination Change',
        status: 'pending',
      };
    case 'start_fresh':
      return {
        id: `ac-${Date.now()}`,
        actionType: 'start_fresh',
        title: '🔄 Start a New Trip',
        description: 'This will open the Start Fresh confirmation. Your current draft will be cleared after your explicit approval.',
        buttonLabel: 'Open Start Fresh',
        status: 'pending',
      };
    case 'budget_help':
      return {
        id: `ac-${Date.now()}`,
        actionType: 'budget_optimizer',
        title: '💰 AI Budget Optimization Available',
        description: `You have ₹${context.remainingBudget.toLocaleString('en-IN')} remaining. The Budget Optimizer has 3 smart swaps that could save up to ₹7,500 without downgrading your experience.`,
        buttonLabel: 'Open Budget Optimizer',
        status: 'pending',
      };
    default:
      return null;
  }
}

export const AIAssistantWidget: React.FC = () => {
  const { language, travelMode, setTravelMode, t } = useTravelSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    destination,
    travellers,
    departureDate,
    returnDate,
    budget,
    currentStep,
    selectedStay,
    remainingBudget,
    selectedTravel,
    selectedActivities,
    budgetStatus,
    tripScore,
    tripHealth,
    changeDestination,
    resetTrip,
  } = useTripBuilder();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your TripPilot AI co-pilot. I can see your ${destination || 'Goa'} trip and I'm ready to help optimize it, find savings, or answer any travel questions.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionCards, setActionCards] = useState<AICopilotActionCard[]>([]);
  const [showDestinationChange, setShowDestinationChange] = useState(false);
  const [showStartFresh, setShowStartFresh] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Dynamic contextual suggestions based on current page + trip state
  const getContextSuggestions = (): string[] => {
    const path = location.pathname;
    if (path.includes('trip-builder') || path.includes('plan')) {
      if (currentStep === 'travel') return [
        `Find cheapest non-stop flight to ${destination}`,
        `Compare morning vs evening departure prices`,
        'Which airline has the best baggage policy?',
      ];
      if (currentStep === 'stays') return [
        `Find private pool villa in ${destination} under ₹6,000/night`,
        `Top-rated beachfront hotels in ${destination}`,
        'Compare breakfast-included vs self-catering options',
      ];
      if (currentStep === 'itinerary') return [
        'Optimize today\'s itinerary',
        `What should I do in ${destination} on Day 2?`,
        'Find a sunset cruise for tomorrow evening',
      ];
      return [
        `How can I save ₹5,000 on this trip?`,
        `What am I missing in my ${destination} plan?`,
        'What\'s the best time for outdoor activities?',
      ];
    }
    if (path.includes('budget')) return [
      `I'm over budget — how can I save ₹${Math.abs(Math.min(0, remainingBudget)).toLocaleString('en-IN')}?`,
      'Find a cheaper hotel alternative',
      'Which activity should I skip to save money?',
    ];
    if (path.includes('flights')) return [
      `Find non-stop morning flights to ${destination} under ₹4,500`,
      'Compare IndiGo vs Air India baggage policies',
      'Cheapest travel day this month',
    ];
    if (path.includes('hotels')) return [
      `Top beachfront stays in ${destination} with pool`,
      'Show me boutique villas with free cancellation',
      'What\'s included in the room rate?',
    ];
    return [
      `Plan a 5-day ${destination} trip under ₹${budget.toLocaleString('en-IN')}`,
      'Compare Goa vs Kerala for couples',
      'What\'s the best time to visit?',
    ];
  };

  const [suggestions, setSuggestions] = useState<string[]>(getContextSuggestions());

  useEffect(() => {
    setSuggestions(getContextSuggestions());
  }, [location.pathname, currentStep, destination]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const buildTripContext = () => ({
    destination,
    origin: 'Hyderabad',
    budget: `₹${budget.toLocaleString('en-IN')}`,
    remainingBudget: `₹${remainingBudget.toLocaleString('en-IN')}`,
    budgetStatus,
    tripScore: tripScore.total,
    tripHealth: tripHealth.statusLabel,
    travellers,
    departureDate,
    returnDate,
    currentStep,
    travelExperienceMode: travelMode,
    travel_mode: travelMode,
    selectedFlight: selectedTravel?.title || 'Not yet selected',
    selectedHotel: selectedStay?.name || 'Not yet selected',
    activitiesCount: selectedActivities.length,
    currentPage: location.pathname,
    currentBuilderStep: currentStep,
  });

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const intent = detectIntent(query);
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: query.trim() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Generate action card for structured intents (before API call)
    const card = buildActionCard(intent, { destination, budget, selectedStay, remainingBudget });

    try {
      const res = await aiService.chat(newMessages, { tripContext: buildTripContext(), language }, undefined, language);
      let replyText = '';
      if (res.success && res.data) {
        replyText =
          (res.data as any)?.reply ||
          (res.data as any)?.message ||
          (res.data as any)?.text ||
          '';
      }

      // Build context-aware fallback if no AI reply
      if (!replyText) {
        switch (intent) {
          case 'cheaper_hotel':
            replyText = `I found a comparable hotel in ${destination} at about 28% less than your current selection. Here's a review card below — check the trade-offs before deciding.`;
            break;
          case 'optimize_day':
            replyText = `I can re-sequence today's activities based on opening hours, weather, and travel time. Click the action card below to review the suggested order before applying.`;
            break;
          case 'change_destination':
            replyText = `To change your destination, I'll open the destination change flow. It'll show you exactly which selections are affected. Click "Start Destination Change" below.`;
            break;
          case 'start_fresh':
            replyText = `I'll open the Start Fresh confirmation. Your current draft will only be cleared after you approve. Your profile and past trips remain safe.`;
            break;
          case 'budget_help':
            replyText = `Based on your current trip, your Budget Optimizer has 3 smart swaps ready: a cheaper hotel alternative, a cheaper flight slot, and a lower-cost activity replacement — all with transparent trade-offs.`;
            break;
          default:
            replyText = `I'm analyzing your ${destination} trip with ${travellers} travellers and a ₹${budget.toLocaleString('en-IN')} budget. What specifically would you like help with?`;
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: replyText }]);
      if (res.data && Array.isArray(res.data.suggestions) && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `For your ${destination} trip, I can help find cheaper alternatives, optimize your itinerary, or answer any travel questions. What would you like?` },
      ]);
      if (card) setActionCards((prev) => [...prev.slice(-3), card]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionCardClick = (card: AICopilotActionCard) => {
    switch (card.actionType) {
      case 'change_destination':
        setShowDestinationChange(true);
        break;
      case 'start_fresh':
        setShowStartFresh(true);
        break;
      case 'optimize_day':
        setIsOpen(false);
        navigate('/trip-builder');
        break;
      case 'budget_optimizer':
        setIsOpen(false);
        navigate('/budget');
        break;
      case 'replace_hotel':
        setIsOpen(false);
        navigate('/trip-builder');
        break;
      default:
        setIsOpen(false);
        navigate('/trip-builder');
    }
    setActionCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, status: 'applied' } : c))
    );
  };

  const dismissActionCard = (id: string) => {
    setActionCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'dismissed' } : c))
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0B1220] hover:bg-[#1a2440] text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 border border-slate-700 group"
          title="Open AI Travel Co-Pilot"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[11px] font-bold leading-tight">{t('ai.copilot', 'AI Co-Pilot')}</span>
            <span className="text-[9px] text-emerald-400 font-semibold">● {t('ai.live_context', 'Live Context')}</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[570px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-5 py-4 bg-[#0B1220] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">{t('ai.copilot', 'TripPilot AI Co-Pilot')}</h3>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  ● {t('ai.live_context', 'Context')}: {destination || 'Your Trip'} • {currentStep || 'Overview'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trip Context Snapshot */}
          <div className="px-4 py-2 bg-slate-900/5 border-b border-slate-100 flex items-center gap-3 text-[10px] font-bold overflow-x-auto scrollbar-none">
            <span className="text-slate-400">CONTEXT:</span>
            <span className="text-slate-700">📍 {destination}</span>
            <span className="text-slate-400">•</span>
            <span
              className={`px-1.5 py-0.5 rounded-full font-bold ${
                travelMode === 'family'
                  ? 'bg-amber-100 text-amber-900'
                  : travelMode === 'accessibility'
                  ? 'bg-indigo-100 text-indigo-900'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {travelMode === 'family'
                ? '👨‍👩‍👧 Family Mode'
                : travelMode === 'accessibility'
                ? '♿ Accessibility Mode'
                : '✈️ Standard'}
            </span>
            <span className="text-slate-400">•</span>
            <span className={`${budgetStatus === 'over_budget' ? 'text-rose-600' : 'text-emerald-700'}`}>
              💰 {budgetStatus === 'over_budget' ? 'Over Budget' : `₹${remainingBudget.toLocaleString('en-IN')} left`}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-blue-700">⭐ Score {tripScore.total}/100</span>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-[#0B1220] text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0B1220] text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Action Cards */}
            {actionCards
              .filter((c) => c.status === 'pending')
              .map((card) => (
                <div key={card.id} className="ml-9 bg-white rounded-2xl border border-blue-200 p-3 text-xs shadow-xs space-y-2 animate-fade-in">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#0B1220] leading-snug">{card.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{card.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dismissActionCard(card.id)}
                      className="text-slate-300 hover:text-slate-500 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleActionCardClick(card)}
                    className="w-full btn-primary text-[11px] !py-1.5 px-3 font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>{card.buttonLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs pl-9">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>{t('ai.thinking', 'TripPilot is analyzing your trip...')}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Contextual Suggestions */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
            {suggestions.slice(0, 3).map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold whitespace-nowrap hover:bg-slate-100 hover:text-slate-900 transition-colors flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about your ${destination} trip...`}
              className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#0B1220] text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Destination Change Modal triggered by AI */}
      {showDestinationChange && (
        <DestinationChangeModal
          isOpen={showDestinationChange}
          newDestination="Kerala"
          onClose={() => setShowDestinationChange(false)}
          onConfirm={() => {
            changeDestination('Kerala');
            setShowDestinationChange(false);
          }}
        />
      )}

      {/* Start Fresh Modal triggered by AI */}
      {showStartFresh && (
        <StartFreshModal
          isOpen={showStartFresh}
          onClose={() => setShowStartFresh(false)}
          onConfirm={() => {
            resetTrip();
            setShowStartFresh(false);
          }}
        />
      )}
    </div>
  );
};
