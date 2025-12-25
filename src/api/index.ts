/**
 * Mafqood App - API Client
 * 
 * This module provides typed functions for communicating with the backend.
 * Currently uses mock data - replace with actual API calls when backend is ready.
 */

import { API_BASE_URL, API_ENDPOINTS } from './config';
import {
  User,
  Item,
  Match,
  MatchGroup,
  ItemFormData,
  LoginCredentials,
  RegisterData,
  ApiResponse,
  ItemSubmitResponse,
  HistoryResponse,
} from '../types';
import {
  mockUser,
  mockLostItems,
  mockFoundItems,
  mockMatches,
  mockLostMatchGroups,
  mockFoundMatchGroups,
  getConfidenceFromSimilarity,
} from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MOCK_DELAY = 800;

// ===== Auth API =====

/**
 * Login user with email and password
 * TODO: Connect to actual backend endpoint
 */
export async function login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  await delay(MOCK_DELAY);
  
  // Mock validation
  if (!credentials.email || !credentials.password) {
    return {
      success: false,
      error: 'Email and password are required',
    };
  }
  
  // Mock successful login
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials),
  // });
  
  return {
    success: true,
    data: {
      user: mockUser,
      token: 'mock-jwt-token-' + Date.now(),
    },
  };
}

/**
 * Register a new user
 * TODO: Connect to actual backend endpoint
 */
export async function register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
  await delay(MOCK_DELAY);
  
  // Mock validation
  if (!data.email || !data.password || !data.fullName) {
    return {
      success: false,
      error: 'All fields are required',
    };
  }
  
  // Mock successful registration
  // TODO: Replace with actual API call
  const newUser: User = {
    id: 'user-' + Date.now(),
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    isVenue: data.isVenue,
    createdAt: new Date().toISOString(),
  };
  
  return {
    success: true,
    data: {
      user: newUser,
      token: 'mock-jwt-token-' + Date.now(),
    },
  };
}

/**
 * Logout current user
 * TODO: Connect to actual backend endpoint
 */
export async function logout(): Promise<ApiResponse<void>> {
  await delay(MOCK_DELAY / 2);
  
  // TODO: Call backend to invalidate token
  // await fetch(`${API_BASE_URL}${API_ENDPOINTS.logout}`, { method: 'POST' });
  
  return { success: true };
}

/**
 * Request password reset
 * TODO: Connect to actual backend endpoint
 */
export async function forgotPassword(email: string): Promise<ApiResponse<void>> {
  await delay(MOCK_DELAY);
  
  // TODO: Replace with actual API call
  // await fetch(`${API_BASE_URL}${API_ENDPOINTS.forgotPassword}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email }),
  // });
  
  return {
    success: true,
    message: 'If this email is registered, you will receive a reset link.',
  };
}

// ===== Items API =====

/**
 * Submit a lost item report
 * TODO: Connect to actual backend endpoint with image upload
 */
export async function createLostItem(formData: ItemFormData): Promise<ApiResponse<ItemSubmitResponse>> {
  await delay(MOCK_DELAY * 2); // Simulate longer upload time
  
  // TODO: Replace with actual API call using FormData for image upload
  // const form = new FormData();
  // form.append('file', { uri: formData.imageUri, type: 'image/jpeg', name: 'photo.jpg' });
  // form.append('title', formData.title);
  // ... other fields
  // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.lostItems}`, {
  //   method: 'POST',
  //   body: form,
  // });
  
  const newItem: Item = {
    id: 'lost-' + Date.now(),
    type: 'lost',
    status: 'open',
    title: formData.title,
    description: formData.description,
    category: formData.category!,
    brand: formData.brand,
    color: formData.color,
    imageUrl: formData.imageUri || 'https://picsum.photos/400/300',
    location: formData.location,
    locationDetail: formData.locationDetail,
    dateTime: formData.dateTime,
    contactMethod: formData.contactMethod,
    contactPhone: formData.contactPhone,
    contactEmail: formData.contactEmail,
    userId: mockUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Mock matches (simulate AI finding similar items)
  const potentialMatches: Match[] = mockFoundItems.slice(0, 1).map((foundItem, index) => ({
    id: 'match-new-' + index,
    userItemId: newItem.id,
    matchedItemId: foundItem.id,
    userItem: newItem,
    matchedItem: foundItem,
    similarity: 65 + Math.random() * 30,
    confidence: getConfidenceFromSimilarity(65 + Math.random() * 30),
    createdAt: new Date().toISOString(),
  }));
  
  return {
    success: true,
    data: {
      item: newItem,
      matches: potentialMatches,
    },
  };
}

/**
 * Submit a found item report
 * TODO: Connect to actual backend endpoint with image upload
 */
export async function createFoundItem(formData: ItemFormData): Promise<ApiResponse<ItemSubmitResponse>> {
  await delay(MOCK_DELAY * 2);
  
  // TODO: Replace with actual API call
  
  const newItem: Item = {
    id: 'found-' + Date.now(),
    type: 'found',
    status: 'open',
    title: formData.title,
    description: formData.description,
    category: formData.category!,
    brand: formData.brand,
    color: formData.color,
    imageUrl: formData.imageUri || 'https://picsum.photos/400/300',
    location: formData.location,
    locationDetail: formData.locationDetail,
    dateTime: formData.dateTime,
    contactMethod: formData.contactMethod,
    contactPhone: formData.contactPhone,
    contactEmail: formData.contactEmail,
    userId: mockUser.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Mock matches (simulate AI finding potential owners)
  const potentialMatches: Match[] = mockLostItems.slice(0, 1).map((lostItem, index) => ({
    id: 'match-new-' + index,
    userItemId: newItem.id,
    matchedItemId: lostItem.id,
    userItem: newItem,
    matchedItem: lostItem,
    similarity: 60 + Math.random() * 35,
    confidence: getConfidenceFromSimilarity(60 + Math.random() * 35),
    createdAt: new Date().toISOString(),
  }));
  
  return {
    success: true,
    data: {
      item: newItem,
      matches: potentialMatches,
    },
  };
}

/**
 * Get user's reported items with their matches
 * TODO: Connect to actual backend endpoint
 */
export async function getMyItems(): Promise<ApiResponse<HistoryResponse>> {
  await delay(MOCK_DELAY);
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.myItems}`, {
  //   headers: { 'Authorization': `Bearer ${token}` },
  // });
  
  return {
    success: true,
    data: {
      lostItems: mockLostMatchGroups,
      foundItems: mockFoundMatchGroups,
    },
  };
}

/**
 * Get a single item by ID
 * TODO: Connect to actual backend endpoint
 */
export async function getItemById(itemId: string): Promise<ApiResponse<Item>> {
  await delay(MOCK_DELAY);
  
  const allItems = [...mockLostItems, ...mockFoundItems];
  const item = allItems.find(i => i.id === itemId);
  
  if (!item) {
    return {
      success: false,
      error: 'Item not found',
    };
  }
  
  return {
    success: true,
    data: item,
  };
}

// ===== Matches API =====

/**
 * Get all matches for the current user
 * TODO: Connect to actual backend endpoint
 */
export async function getMatches(): Promise<ApiResponse<{ lostMatches: MatchGroup[]; foundMatches: MatchGroup[] }>> {
  await delay(MOCK_DELAY);
  
  // TODO: Replace with actual API call
  
  return {
    success: true,
    data: {
      lostMatches: mockLostMatchGroups,
      foundMatches: mockFoundMatchGroups,
    },
  };
}

/**
 * Get a single match by ID
 * TODO: Connect to actual backend endpoint
 */
export async function getMatchById(matchId: string): Promise<ApiResponse<Match>> {
  await delay(MOCK_DELAY);
  
  const match = mockMatches.find(m => m.id === matchId);
  
  if (!match) {
    return {
      success: false,
      error: 'Match not found',
    };
  }
  
  return {
    success: true,
    data: match,
  };
}

/**
 * Claim a match (user confirms the matched item is theirs)
 * TODO: Connect to actual backend endpoint
 */
export async function claimMatch(matchId: string): Promise<ApiResponse<void>> {
  await delay(MOCK_DELAY);
  
  // TODO: Implement actual claim flow with backend
  // This would typically:
  // 1. Update match status
  // 2. Notify the other party
  // 3. Potentially exchange contact info (mediated)
  
  return {
    success: true,
    message: 'Contact request sent! The other party will be notified.',
  };
}

// ===== User API =====

/**
 * Get current user profile
 * TODO: Connect to actual backend endpoint
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  await delay(MOCK_DELAY);
  
  // TODO: Replace with actual API call
  
  return {
    success: true,
    data: mockUser,
  };
}

/**
 * Update user profile
 * TODO: Connect to actual backend endpoint
 */
export async function updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
  await delay(MOCK_DELAY);
  
  // TODO: Replace with actual API call
  
  const updatedUser: User = {
    ...mockUser,
    ...data,
  };
  
  return {
    success: true,
    data: updatedUser,
  };
}

// ===== Image Upload =====

/**
 * Upload an image and get the URL
 * TODO: Connect to actual backend endpoint with optional blur processing
 */
export async function uploadImage(imageUri: string): Promise<ApiResponse<{ url: string }>> {
  await delay(MOCK_DELAY);
  
  // TODO: Replace with actual API call
  // const form = new FormData();
  // form.append('file', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });
  // const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.uploadImage}`, {
  //   method: 'POST',
  //   body: form,
  // });
  
  return {
    success: true,
    data: {
      url: imageUri, // In real implementation, this would be the server URL
    },
  };
}

export default {
  // Auth
  login,
  register,
  logout,
  forgotPassword,
  
  // Items
  createLostItem,
  createFoundItem,
  getMyItems,
  getItemById,
  
  // Matches
  getMatches,
  getMatchById,
  claimMatch,
  
  // User
  getProfile,
  updateProfile,
  
  // Upload
  uploadImage,
};
