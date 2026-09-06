// Phase 7 — Collaboration types for Shared Trips

export interface TripSuggestion {
  id: string;
  suggestedBy: string;
  suggestedByEmail: string;
  type: 'activity' | 'restaurant' | 'hotel' | 'itinerary_change';
  title: string;
  description: string;
  cost?: number;
  destinationNote?: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionNote?: string;
  createdAt: string;
}

export interface TripActivityEntry {
  id: string;
  actor: string;
  action: string;
  detail?: string;
  timestamp: string;
  type: 'hotel' | 'flight' | 'activity' | 'budget' | 'itinerary' | 'member' | 'system';
}

export interface TripComment {
  id: string;
  authorName: string;
  authorEmail: string;
  itemId: string;
  itemType: 'activity' | 'hotel' | 'restaurant' | 'itinerary' | 'general';
  text: string;
  createdAt: string;
}
