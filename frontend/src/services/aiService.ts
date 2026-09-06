import api from './api';
import { ChatMessage, AIResponse, ApiResponse, Itinerary, AIConversationSummary } from '../types';

export interface AIRecommendationParams {
  origin?: string;
  destination?: string;
  travel_dates?: string;
  travellers?: number;
  interests?: string[];
  accommodation_pref?: string;
  budget?: number;
  transport_pref?: string;
  dietary_reqs?: string;
  language?: string;
}

export const aiService = {
  async getRecommendations(params: AIRecommendationParams) {
    const res = await api.post<ApiResponse<any>>('/ai/recommendations', params);
    return res.data;
  },

  async generateItinerary(params: any) {
    const res = await api.post<ApiResponse<any>>('/ai/itinerary', params);
    return res.data;
  },

  async chat(
    messages: ChatMessage[],
    context?: Record<string, any>,
    conversationId?: string,
    sessionId?: string,
    language?: string
  ) {
    const res = await api.post<ApiResponse<AIResponse>>('/ai/chat', {
      messages,
      context: { ...context, language },
      conversation_id: conversationId,
      session_id: sessionId,
      language,
    });
    return res.data;
  },

  async getConversations(sessionId?: string) {
    const res = await api.get<ApiResponse<{ conversations: AIConversationSummary[] }>>('/ai/conversations', {
      params: { session_id: sessionId },
    });
    return res.data;
  },

  async getConversation(conversationId: string, sessionId?: string) {
    const res = await api.get<ApiResponse<any>>(`/ai/conversations/${conversationId}`, {
      params: { session_id: sessionId },
    });
    return res.data;
  },

  async createConversation(title?: string, sessionId?: string) {
    const res = await api.post<ApiResponse<{ id: string; title: string; messages: ChatMessage[] }>>('/ai/conversations', {
      title,
      session_id: sessionId,
    });
    return res.data;
  },

  async deleteConversation(conversationId: string, sessionId?: string) {
    const res = await api.delete<ApiResponse<any>>(`/ai/conversations/${conversationId}`, {
      params: { session_id: sessionId },
    });
    return res.data;
  },

  async editMessage(conversationId: string, messageId: string, content: string, context?: Record<string, any>, sessionId?: string) {
    const res = await api.put<ApiResponse<{ conversation_id: string; messages: ChatMessage[]; reply: string }>>(
      `/ai/conversations/${conversationId}/messages/${messageId}`,
      {
        content,
        context,
        session_id: sessionId,
      }
    );
    return res.data;
  },

  async deleteMessage(conversationId: string, messageId: string, sessionId?: string) {
    const res = await api.delete<ApiResponse<{ conversation_id: string; messages: ChatMessage[] }>>(
      `/ai/conversations/${conversationId}/messages/${messageId}`,
      {
        params: { session_id: sessionId },
      }
    );
    return res.data;
  },

  async optimizeBudget(budget: any, itinerary: any, language?: string) {
    const res = await api.post<ApiResponse<{
      source: string;
      suggestions: Array<{ category: string; tip: string; potential_saving: number }>;
      alternative_options: string[];
      summary: string;
      estimated_saving: number;
    }>>('/ai/optimize-budget', { budget, itinerary, language });
    return res.data;
  },

  async modifyItinerary(
    itinerary: any,
    modification_type: 'cheaper' | 'adventure' | 'family' | 'reduce_travel' | 'luxury',
    params?: any,
    language?: string
  ) {
    const res = await api.post<ApiResponse<Itinerary & { source: string }>>('/ai/modify-itinerary', {
      itinerary,
      modification_type,
      params,
      language,
    });
    return res.data;
  },
};
