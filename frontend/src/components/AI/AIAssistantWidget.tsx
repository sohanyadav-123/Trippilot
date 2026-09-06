import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  Loader2,
  ArrowRight,
  Plus,
  Clock,
  Trash2,
  Pencil,
  Maximize2,
  Minimize2,
  ChevronRight,
  MessageSquare,
  Check,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { ChatMessage, AICopilotActionCard, AIConversationSummary } from '../../types';
import { useTripBuilder } from '../../context/TripBuilderContext';
import { DestinationChangeModal } from '../TripBuilder/DestinationChangeModal';
import { StartFreshModal } from '../TripBuilder/StartFreshModal';
import { useTravelSettings } from '../../context/TravelSettingsContext';
import { MarkdownMessage } from './MarkdownMessage';

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  role: 'assistant',
  content: 'Hey! 👋 How can I help you?',
};

export const AIAssistantWidget: React.FC = () => {
  const { language, travelMode, t } = useTravelSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

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
    addCustomItineraryEvent,
  } = useTripBuilder();

  // Session and Conversation State
  const [sessionId, setSessionId] = useState<string>(() => {
    let sid = localStorage.getItem('trippilot_ai_session_id');
    if (!sid) {
      sid = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('trippilot_ai_session_id', sid);
    }
    return sid;
  });

  const [conversationId, setConversationId] = useState<string>(() => {
    return localStorage.getItem('trippilot_ai_conversation_id') || `conv_${Date.now()}`;
  });

  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionCards, setActionCards] = useState<AICopilotActionCard[]>([]);

  // Editing state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);

  // Modals
  const [showDestinationChange, setShowDestinationChange] = useState(false);
  const [showStartFresh, setShowStartFresh] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const loadConversations = async (sid: string) => {
    try {
      const res = await aiService.getConversations(sid);
      if (res.success && res.data?.conversations) {
        setConversations(res.data.conversations);
      }
    } catch (e) {
      console.warn('Could not load AI conversations list:', e);
    }
  };

  // Load specific conversation messages
  const loadActiveConversation = async (convId: string, sid: string) => {
    try {
      const res = await aiService.getConversation(convId, sid);
      if (res.success && res.data?.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        setMessages([DEFAULT_WELCOME_MESSAGE]);
      }
    } catch (e) {
      console.warn('Could not fetch active conversation:', e);
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  };

  // Initial load on mount
  useEffect(() => {
    const savedConvId = localStorage.getItem('trippilot_ai_conversation_id');
    if (savedConvId) {
      loadActiveConversation(savedConvId, sessionId);
    }
    loadConversations(sessionId);
  }, []);

  // Scroll to bottom when messages or loading changes
  useEffect(() => {
    if (isOpen && !showHistory) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading, showHistory]);

  const buildTripContext = () => ({
    destination: destination || 'Goa',
    origin: 'Hyderabad',
    budget: `₹${budget.toLocaleString('en-IN')}`,
    remainingBudget: `₹${remainingBudget.toLocaleString('en-IN')}`,
    budgetStatus,
    tripScore: tripScore?.total || 75,
    tripHealth: tripHealth?.statusLabel || 'Good',
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
  });

  // Dynamic suggestions
  const getContextSuggestions = (): string[] => {
    return [
      'Find hidden places in Goa',
      'Cheapest flights from Hyderabad',
      "What's my trip budget?",
      'Top beach resorts with pool',
    ];
  };

  const [suggestions, setSuggestions] = useState<string[]>(getContextSuggestions());

  // Start New Chat
  const handleNewChat = async () => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setConversationId(newId);
    localStorage.setItem('trippilot_ai_conversation_id', newId);
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setActionCards([]);
    setShowHistory(false);
    setInput('');
    setEditingMessageId(null);

    try {
      await aiService.createConversation('New Trip Consultation', sessionId);
      await loadConversations(sessionId);
    } catch (e) {
      console.warn('Failed to register new conversation on backend:', e);
    }
  };

  // Switch Conversation
  const handleSelectConversation = (conv: AIConversationSummary) => {
    setConversationId(conv.id);
    localStorage.setItem('trippilot_ai_conversation_id', conv.id);
    loadActiveConversation(conv.id, sessionId);
    setShowHistory(false);
    setActionCards([]);
    setEditingMessageId(null);
  };

  // Delete Conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(convId, sessionId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (convId === conversationId) {
        handleNewChat();
      }
    } catch (err) {
      console.warn('Failed to delete conversation:', err);
    }
  };

  // Send Message
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };

    const updatedThread = [...messages, userMsg];
    setMessages(updatedThread);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(
        updatedThread,
        buildTripContext(),
        conversationId,
        sessionId,
        language
      );

      let replyText = '';
      let serverActions: AICopilotActionCard[] = [];
      let newSuggestions: string[] = [];

      if (res.success && res.data) {
        replyText = res.data.reply || res.data.message || '';
        serverActions = res.data.actions || [];
        newSuggestions = res.data.suggestions || [];
      }

      if (!replyText) {
        replyText = "I'm here to help with your trip! What would you like to explore or optimize?";
      }

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        created_at: new Date().toISOString(),
        actions: serverActions,
      };

      setMessages([...updatedThread, assistantMsg]);
      if (serverActions.length > 0) {
        setActionCards((prev) => [...prev, ...serverActions]);
      }
      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions);
      }

      // Refresh sidebar titles
      loadConversations(sessionId);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I had trouble retrieving that information. Please try asking again!",
        created_at: new Date().toISOString(),
      };
      setMessages([...updatedThread, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Edit Message
  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id || null);
    setEditingText(msg.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim() || editingLoading) return;
    setEditingLoading(true);

    try {
      const res = await aiService.editMessage(
        conversationId,
        msgId,
        editingText.trim(),
        buildTripContext(),
        sessionId
      );

      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        // Fallback local truncation
        const idx = messages.findIndex((m) => m.id === msgId);
        if (idx !== -1) {
          const truncated = messages.slice(0, idx);
          const editedMsg: ChatMessage = {
            ...messages[idx],
            content: editingText.trim(),
          };
          setMessages([...truncated, editedMsg]);
          handleSend(editingText.trim());
        }
      }
      setEditingMessageId(null);
      setEditingText('');
      loadConversations(sessionId);
    } catch (err) {
      console.warn('Failed to edit message:', err);
    } finally {
      setEditingLoading(false);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (msgId: string) => {
    try {
      await aiService.deleteMessage(conversationId, msgId, sessionId);
      setMessages((prev) => {
        const targetIdx = prev.findIndex((m) => m.id === msgId);
        if (targetIdx === -1) return prev;
        // If user message followed by assistant, remove both
        if (
          prev[targetIdx].role === 'user' &&
          targetIdx + 1 < prev.length &&
          prev[targetIdx + 1].role === 'assistant'
        ) {
          return [...prev.slice(0, targetIdx), ...prev.slice(targetIdx + 2)];
        }
        return prev.filter((m) => m.id !== msgId);
      });
    } catch (err) {
      console.warn('Failed to delete message:', err);
    }
  };

  // Action Card Click
  const handleActionCardClick = (card: AICopilotActionCard) => {
    if (card.actionType === 'add_activity' && card.payload?.activity) {
      const dayNum = card.payload.day || 1;
      addCustomItineraryEvent(dayNum, {
        date: `Day ${dayNum}`,
        time: card.payload.time || '10:30 AM',
        title: card.payload.activity,
        type: 'activity',
        description: `Added via AI Co-Pilot (${card.payload.activity})`,
        cost: card.payload.cost || 0,
      });

      // Mark applied
      setActionCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, status: 'applied' } : c))
      );
      return;
    }

    switch (card.actionType) {
      case 'change_destination':
        setShowDestinationChange(true);
        break;
      case 'start_fresh':
        setShowStartFresh(true);
        break;
      case 'optimize_day':
      case 'replace_hotel':
        setIsOpen(false);
        navigate('/trip-builder');
        break;
      case 'budget_optimizer':
        setIsOpen(false);
        navigate('/budget');
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
          title="Open AI Co-Pilot"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-[#C8A96B]" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold leading-tight tracking-wide">{t('ai.copilot', 'AI Co-Pilot')}</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all duration-300 ${
            isExpanded
              ? 'fixed inset-4 sm:inset-10 md:inset-x-auto md:right-8 md:bottom-8 md:top-8 md:w-[680px] z-50 rounded-3xl'
              : 'w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header - CLEAN WITH NO VISIBLE CONTEXT BAR */}
          <div className="px-5 py-3.5 bg-[#0B1220] text-white flex items-center justify-between flex-shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
                  <span>{t('ai.copilot', 'TripPilot AI Co-Pilot')}</span>
                </h3>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                type="button"
                onClick={handleNewChat}
                className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1 text-xs font-semibold px-2"
                title="Start a new chat"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">New</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-xl transition-colors ${
                  showHistory ? 'bg-[#C8A96B] text-[#0B1220]' : 'hover:text-white hover:bg-slate-800/80'
                }`}
                title="Chat history"
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-1.5 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:text-white hover:bg-slate-800/80 transition-colors ml-1"
                title="Close Co-Pilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sliding Chat History View */}
          {showHistory ? (
            <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Previous Conversations</span>
                <button
                  onClick={handleNewChat}
                  className="btn-primary text-xs !py-1 px-3 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Chat</span>
                </button>
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No previous conversations found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        c.id === conversationId
                          ? 'bg-[#0B1220] text-white border-[#0B1220] shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${c.id === conversationId ? 'text-[#C8A96B]' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${c.id === conversationId ? 'text-white' : 'text-[#0B1220]'}`}>
                            {c.title || 'Trip Consultation'}
                          </p>
                          <p className={`text-[10px] truncate ${c.id === conversationId ? 'text-slate-300' : 'text-slate-400'}`}>
                            {c.message_count} messages
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(c.id, e)}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                          c.id === conversationId ? 'text-slate-300 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Main Conversation View */
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70">
                {messages.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`flex gap-2.5 group relative ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-[#0B1220] text-[#C8A96B] flex items-center justify-center flex-shrink-0 text-xs mt-0.5 shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="max-w-[85%] relative">
                      {/* User Message Edit & Delete Bar */}
                      {m.role === 'user' && editingMessageId !== m.id && (
                        <div className="absolute -top-3.5 right-1 hidden group-hover:flex items-center gap-1 bg-white border border-slate-200 rounded-full px-1.5 py-0.5 shadow-xs text-[10px] z-10 animate-fade-in">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(m)}
                            className="text-slate-500 hover:text-[#0B1220] p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-0.5"
                            title="Edit message"
                          >
                            <Pencil className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m.id || '')}
                            className="text-slate-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-0.5"
                            title="Delete message"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}

                      {/* Inline Message Editor */}
                      {editingMessageId === m.id ? (
                        <div className="bg-white p-3 rounded-2xl border border-blue-300 shadow-md space-y-2 text-xs">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            rows={3}
                            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl p-2 focus:bg-white focus:border-blue-600 focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(m.id || '')}
                              disabled={editingLoading}
                              className="btn-primary text-[11px] !py-1 px-3 rounded-lg flex items-center gap-1 font-bold"
                            >
                              {editingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              <span>Save & Regenerate</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Message Bubble */
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                            m.role === 'user'
                              ? 'bg-[#0B1220] text-white rounded-br-none shadow-xs font-medium'
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-none shadow-xs'
                          }`}
                        >
                          {m.role === 'assistant' ? (
                            <MarkdownMessage content={m.content} />
                          ) : (
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Interactive Action Cards */}
                {actionCards
                  .filter((c) => c.status === 'pending')
                  .map((card) => (
                    <div
                      key={card.id}
                      className="ml-9 bg-white rounded-2xl border border-blue-200 p-3.5 text-xs shadow-xs space-y-2.5 animate-fade-in"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-[#0B1220] leading-snug">{card.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{card.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => dismissActionCard(card.id)}
                          className="text-slate-300 hover:text-slate-500 flex-shrink-0 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleActionCardClick(card)}
                        className="w-full btn-primary text-[11px] !py-1.5 px-3 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>{card.buttonLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                {loading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs pl-9 py-1 animate-fade-in">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8A96B]" />
                    <span>TripPilot AI is thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Contextual Suggestions Carousel */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
                {suggestions.slice(0, 4).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold whitespace-nowrap hover:bg-slate-100 hover:text-slate-900 transition-colors flex-shrink-0"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything or plan your trip..."
                  className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-[#0B1220] text-white hover:bg-slate-800 disabled:opacity-35 transition-colors shadow-xs flex-shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4 text-[#C8A96B]" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Destination Change Modal */}
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

      {/* Start Fresh Modal */}
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
