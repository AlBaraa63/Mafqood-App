/**
 * Mafqood App - Helper Functions & Utilities
 * 
 * Contains utility functions for the application.
 * Mock data has been removed - now using real backend authentication.
 */

import { ItemStatus, MatchConfidence } from '../types';

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
  getConfidenceFromSimilarity,
  getStatusColor,
};
