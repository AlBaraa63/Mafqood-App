/**
 * Mafqood App - Mock Data for Development
 */

import { Item, Match, User, MatchGroup, ItemStatus, MatchConfidence } from '../types';

// Mock User
export const mockUser: User = {
  id: 'user-1',
  email: 'ahmed@example.com',
  fullName: 'Ahmed Al Maktoum',
  phone: '+971501234567',
  createdAt: '2024-01-15T10:00:00Z',
};

// Mock Items
export const mockLostItems: Item[] = [
  {
    id: 'lost-1',
    type: 'lost',
    status: 'open',
    title: 'Black iPhone 14 Pro',
    description: 'Black iPhone 14 Pro with a red silicone case. Has a small crack on the top left corner of the screen.',
    category: 'phone',
    brand: 'Apple',
    color: 'Black',
    imageUrl: 'https://picsum.photos/400/300?random=1',
    location: 'Dubai Mall',
    locationDetail: 'Near the fountain, lower ground floor food court',
    dateTime: '2024-12-05T14:30:00Z',
    contactMethod: 'phone',
    contactPhone: '+971501234567',
    contactEmail: 'ahmed@example.com',
    userId: 'user-1',
    createdAt: '2024-12-05T15:00:00Z',
    updatedAt: '2024-12-05T15:00:00Z',
  },
  {
    id: 'lost-2',
    type: 'lost',
    status: 'matched',
    title: 'Brown Leather Wallet',
    description: 'Louis Vuitton brown leather wallet with Emirates ID and credit cards inside.',
    category: 'wallet',
    brand: 'Louis Vuitton',
    color: 'Brown',
    imageUrl: 'https://picsum.photos/400/300?random=2',
    location: 'Dubai Marina',
    locationDetail: 'Marina Walk, near Pier 7',
    dateTime: '2024-12-03T19:00:00Z',
    contactMethod: 'email',
    contactPhone: '+971501234567',
    contactEmail: 'ahmed@example.com',
    userId: 'user-1',
    createdAt: '2024-12-03T20:00:00Z',
    updatedAt: '2024-12-04T10:00:00Z',
  },
];

export const mockFoundItems: Item[] = [
  {
    id: 'found-1',
    type: 'found',
    status: 'open',
    title: 'Silver Keys with BMW Key Fob',
    description: 'Set of keys with a BMW key fob and 3 other keys on a silver keyring.',
    category: 'keys',
    brand: 'BMW',
    color: 'Silver',
    imageUrl: 'https://picsum.photos/400/300?random=3',
    location: 'JBR Beach',
    locationDetail: 'Found near the beach showers, Roxy building area',
    dateTime: '2024-12-06T16:00:00Z',
    contactMethod: 'in_app',
    userId: 'user-1',
    createdAt: '2024-12-06T16:30:00Z',
    updatedAt: '2024-12-06T16:30:00Z',
  },
  {
    id: 'found-2',
    type: 'found',
    status: 'open',
    title: 'Black Laptop Bag',
    description: 'Black Samsonite laptop bag with a laptop inside. Found at Metro station.',
    category: 'bag',
    brand: 'Samsonite',
    color: 'Black',
    imageUrl: 'https://picsum.photos/400/300?random=4',
    location: 'Dubai Metro - Mall of Emirates Station',
    locationDetail: 'On the train, Gold class cabin',
    dateTime: '2024-12-07T08:30:00Z',
    contactMethod: 'phone',
    contactPhone: '+971501234567',
    userId: 'user-1',
    createdAt: '2024-12-07T09:00:00Z',
    updatedAt: '2024-12-07T09:00:00Z',
  },
];

// Mock matched items (items from other users)
export const mockOtherFoundItems: Item[] = [
  {
    id: 'other-found-1',
    type: 'found',
    status: 'open',
    title: 'Black iPhone with Red Case',
    description: 'Found a black iPhone with a red case near the Dubai Mall fountain.',
    category: 'phone',
    brand: 'Apple',
    color: 'Black, Red',
    imageUrl: 'https://picsum.photos/400/300?random=5',
    location: 'Dubai Mall',
    locationDetail: 'Water fountain area',
    dateTime: '2024-12-05T16:00:00Z',
    contactMethod: 'in_app',
    userId: 'user-2',
    createdAt: '2024-12-05T16:30:00Z',
    updatedAt: '2024-12-05T16:30:00Z',
  },
  {
    id: 'other-found-2',
    type: 'found',
    status: 'open',
    title: 'Brown Designer Wallet',
    description: 'Found an expensive-looking brown leather wallet near Marina.',
    category: 'wallet',
    brand: 'Unknown',
    color: 'Brown',
    imageUrl: 'https://picsum.photos/400/300?random=6',
    location: 'Dubai Marina',
    locationDetail: 'Near Marina Mall entrance',
    dateTime: '2024-12-04T10:00:00Z',
    contactMethod: 'phone',
    contactPhone: '+971509876543',
    userId: 'user-3',
    createdAt: '2024-12-04T10:30:00Z',
    updatedAt: '2024-12-04T10:30:00Z',
  },
];

// Mock Matches
export const mockMatches: Match[] = [
  {
    id: 'match-1',
    userItemId: 'lost-1',
    matchedItemId: 'other-found-1',
    userItem: mockLostItems[0],
    matchedItem: mockOtherFoundItems[0],
    similarity: 87,
    confidence: 'high',
    createdAt: '2024-12-05T17:00:00Z',
  },
  {
    id: 'match-2',
    userItemId: 'lost-2',
    matchedItemId: 'other-found-2',
    userItem: mockLostItems[1],
    matchedItem: mockOtherFoundItems[1],
    similarity: 72,
    confidence: 'medium',
    createdAt: '2024-12-04T12:00:00Z',
  },
];

// Mock Match Groups (for display)
export const mockLostMatchGroups: MatchGroup[] = [
  {
    item: mockLostItems[0],
    matches: [mockMatches[0]],
  },
  {
    item: mockLostItems[1],
    matches: [mockMatches[1]],
  },
];

export const mockFoundMatchGroups: MatchGroup[] = [
  {
    item: mockFoundItems[0],
    matches: [],
  },
  {
    item: mockFoundItems[1],
    matches: [],
  },
];

// Helper functions
export function getConfidenceFromSimilarity(similarity: number): MatchConfidence {
  if (similarity >= 80) return 'high';
  if (similarity >= 60) return 'medium';
  return 'low';
}

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
  mockLostItems,
  mockFoundItems,
  mockOtherFoundItems,
  mockMatches,
  mockLostMatchGroups,
  mockFoundMatchGroups,
};
