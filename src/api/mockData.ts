/**
 * Mafqood App - Minimal Mock Data & Helper Functions
 * 
 * Only contains mock data for auth (since backend auth not implemented yet)
 * and helper utility functions.
 */

import { User, ItemStatus, MatchConfidence } from '../types';

// ===== Mock User (for auth until backend implements user authentication) =====

export const mockUser: User = {
  id: 'user-1',
  email: 'guest@mafqood.ae',
  fullName: 'Guest User',
  phone: '+971501234567',
  createdAt: new Date().toISOString(),
};

// ===== Helper Functions =====

/**
 * Convert similarity score (0-100) to confidence level
 */
export function getConfidenceFromSimilarity(similarity: number): MatchConfidence {
  if (similarity >= 80) return 'high';
  if (similarity >= 60) return 'medium';
  return 'low';
}

/**
 * Get color for item status badge
 */
export function getStatusColor(status: ItemStatus): string {
  switch (status) {
    case 'open': return '#4CAF50';
    case 'matched': return '#FF9800';
    case 'closed': return '#9E9E9E';
    default: return '#9E9E9E';
  }
}

export default {
  mockUser,
  getConfidenceFromSimilarity,
  getStatusColor,
};
