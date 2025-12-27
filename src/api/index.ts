/**
 * Mafqood App - API Client
 * 
 * This module provides typed functions for communicating with the backend.
 */

import { Platform } from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import { get, post, uploadFormData } from './client';
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
  BackendItem,
  BackendMatchResult,
  BackendItemWithMatches,
  BackendLostItemResponse,
  BackendFoundItemResponse,
  BackendHistoryResponse,
} from '../types';
import {
  mockUser,
  getConfidenceFromSimilarity,
} from './mockData';

// Simulate network delay for mock functions
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const MOCK_DELAY = 800;

// ===== Helper Functions =====

/**
 * Convert image URI to proper format for FormData
 * Handles both web and native platforms
 */
async function prepareImageForUpload(uri: string, filename: string) {
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(filename);
  
  if (Platform.OS === 'web') {
    // For web, fetch the blob and create a File object
    const response = await fetch(uri);
    const blob = await response.blob();
    const mime = blob.type || 'image/jpeg';
    const extFromMime = mime.split('/')[1] || 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp'].includes(extFromMime) ? extFromMime : 'jpg';
    const safeName = hasExtension ? filename : `upload.${safeExt}`;
    const file = new File([blob], safeName, { type: `image/${safeExt}` });
    return file;
  } else {
    // For native (iOS/Android), use the React Native format
    const match = /\.([\w]+)$/.exec(filename);
    const ext = match ? match[1] : 'jpg';
    const safeExt = ['jpeg', 'jpg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
    const type = `image/${safeExt}`;
    const safeName = hasExtension ? filename : `upload.${safeExt}`;
    
    return {
      uri,
      name: safeName,
      type,
    } as any;
  }
}

/**
 * Transform backend item to frontend format
 */
function transformBackendItem(backendItem: BackendItem): Item {
  // Extract category from title or description (basic heuristic)
  const titleLower = backendItem.title.toLowerCase();
  let category: any = 'other';
  
  if (titleLower.includes('phone') || titleLower.includes('mobile')) category = 'phone';
  else if (titleLower.includes('wallet') || titleLower.includes('purse')) category = 'wallet';
  else if (titleLower.includes('bag') || titleLower.includes('backpack')) category = 'bag';
  else if (titleLower.includes('id') || titleLower.includes('passport')) category = 'id';
  else if (titleLower.includes('key')) category = 'keys';
  else if (titleLower.includes('jewelry') || titleLower.includes('watch')) category = 'jewelry';
  else if (titleLower.includes('laptop') || titleLower.includes('tablet')) category = 'electronics';
  
  return {
    id: String(backendItem.id),
    type: backendItem.type,
    status: 'open',
    title: backendItem.title,
    description: backendItem.description || undefined,
    category,
    imageUrl: backendItem.image_url.startsWith('http') 
      ? backendItem.image_url 
      : `${API_BASE_URL}/${backendItem.image_url.replace(/^\/+/, '')}`,
    location: backendItem.location_type,
    locationDetail: backendItem.location_detail || undefined,
    dateTime: backendItem.time_frame,
    contactMethod: 'in_app',
    userId: 'user-1', // TODO: Get from auth context
    createdAt: backendItem.created_at,
    updatedAt: backendItem.created_at,
  };
}

/**
 * Transform backend match result to frontend format
 */
function transformBackendMatch(backendMatch: BackendMatchResult): Match {
  const matchedItem = transformBackendItem(backendMatch.item);
  const similarityPercent = backendMatch.similarity * 100; // Convert 0-1 to 0-100
  
  return {
    id: `match-${backendMatch.item.id}`,
    userItemId: '', // Will be set by caller
    matchedItemId: String(backendMatch.item.id),
    userItem: matchedItem, // Placeholder, will be filled by caller
    matchedItem,
    similarity: similarityPercent,
    confidence: getConfidenceFromSimilarity(similarityPercent),
    createdAt: backendMatch.item.created_at,
  };
}

/**
 * Transform backend item with matches to frontend format
 */
function transformBackendItemWithMatches(backendItemWithMatches: BackendItemWithMatches): MatchGroup {
  const item = transformBackendItem(backendItemWithMatches.item);
  const matches = backendItemWithMatches.matches.map(m => {
    const match = transformBackendMatch(m);
    match.userItemId = item.id;
    match.userItem = item;
    return match;
  });
  
  return {
    item,
    matches,
  };
}

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
 * Connects to backend endpoint with image upload
 */
export async function createLostItem(formData: ItemFormData): Promise<ApiResponse<ItemSubmitResponse>> {
  try {
    // Validate required fields
    if (!formData.title || !formData.location || !formData.dateTime) {
      return {
        success: false,
        error: 'Missing required fields: title, location, and date/time are required',
      };
    }
    
    if (!formData.imageUri) {
      return {
        success: false,
        error: 'Image is required',
      };
    }
    
    console.log('[API] Submitting lost item:', {
      title: formData.title,
      location: formData.location,
      dateTime: formData.dateTime,
      hasImage: !!formData.imageUri,
      platform: Platform.OS,
    });
    
    // Create FormData for multipart upload
    const form = new FormData();
    
    // Add image file (with platform-specific handling)
    const uri = formData.imageUri;
    const filename = uri.split('/').pop() || 'photo.jpg';
    const file = await prepareImageForUpload(uri, filename);
    
    form.append('file', file);
    
    // Add required fields
    form.append('title', formData.title);
    form.append('location_type', formData.location);
    form.append('time_frame', formData.dateTime);
    
    // Add optional fields
    if (formData.description) {
      form.append('description', formData.description);
    }
    if (formData.locationDetail) {
      form.append('location_detail', formData.locationDetail);
    }
    
    // Make API request
    const response = await uploadFormData<BackendLostItemResponse>(
      API_ENDPOINTS.lostItems,
      form
    );
    
    // Transform backend response to frontend format
    const item = transformBackendItem(response.item);
    const matches = response.matches.map(transformBackendMatch);
    
    console.log('[API] Lost item created successfully:', item.id);
    
    return {
      success: true,
      data: {
        item,
        matches,
      },
    };
    
  } catch (error: any) {
    console.error('[API] Create lost item error:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to report lost item';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Submit a found item report
 * Connects to backend endpoint with image upload
 */
export async function createFoundItem(formData: ItemFormData): Promise<ApiResponse<ItemSubmitResponse>> {
  try {
    // Validate required fields
    if (!formData.title || !formData.location || !formData.dateTime) {
      return {
        success: false,
        error: 'Missing required fields: title, location, and date/time are required',
      };
    }
    
    if (!formData.imageUri) {
      return {
        success: false,
        error: 'Image is required',
      };
    }
    
    console.log('[API] Submitting found item:', {
      title: formData.title,
      location: formData.location,
      dateTime: formData.dateTime,
      hasImage: !!formData.imageUri,
      platform: Platform.OS,
    });
    
    // Create FormData for multipart upload
    const form = new FormData();
    
    // Add image file (with platform-specific handling)
    const uri = formData.imageUri;
    const filename = uri.split('/').pop() || 'photo.jpg';
    const file = await prepareImageForUpload(uri, filename);
    
    form.append('file', file);
    
    // Add required fields
    form.append('title', formData.title);
    form.append('location_type', formData.location);
    form.append('time_frame', formData.dateTime);
    
    // Add optional fields
    if (formData.description) {
      form.append('description', formData.description);
    }
    if (formData.locationDetail) {
      form.append('location_detail', formData.locationDetail);
    }
    
    // Make API request
    const response = await uploadFormData<BackendFoundItemResponse>(
      API_ENDPOINTS.foundItems,
      form
    );
    
    // Transform backend response to frontend format
    const item = transformBackendItem(response.item);
    const matches = response.matches.map(transformBackendMatch);
    
    console.log('[API] Found item created successfully:', item.id);
    
    return {
      success: true,
      data: {
        item,
        matches,
      },
    };
    
  } catch (error: any) {
    console.error('[API] Create found item error:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Failed to report found item';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get user's reported items with their matches
 * Connects to backend /api/history endpoint
 */
export async function getMyItems(): Promise<ApiResponse<HistoryResponse>> {
  try {
    const response = await get<BackendHistoryResponse>('/api/history');
    
    // Transform backend response to frontend format
    const lostItems: MatchGroup[] = response.lost_items.map(transformBackendItemWithMatches);
    const foundItems: MatchGroup[] = response.found_items.map(transformBackendItemWithMatches);
    
    return {
      success: true,
      data: {
        lostItems,
        foundItems,
      },
    };
    
  } catch (error: any) {
    console.error('[API] Get my items error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch items',
    };
  }
}

/**
 * Get a single item by ID
 * Connects to backend /api/items/{id} endpoint
 */
export async function getItemById(itemId: string): Promise<ApiResponse<Item>> {
  try {
    const response = await get<BackendItem>(`/api/items/${itemId}`);
    const item = transformBackendItem(response);
    
    return {
      success: true,
      data: item,
    };
    
  } catch (error: any) {
    console.error('[API] Get item by ID error:', error);
    return {
      success: false,
      error: error.message || 'Item not found',
    };
  }
}

// ===== Matches API =====

/**
 * Get all matches for the current user
 * Uses the same /api/history endpoint as getMyItems
 */
export async function getMatches(): Promise<ApiResponse<{ lostMatches: MatchGroup[]; foundMatches: MatchGroup[] }>> {
  try {
    const response = await get<BackendHistoryResponse>('/api/history');
    
    const lostMatches: MatchGroup[] = response.lost_items.map(transformBackendItemWithMatches);
    const foundMatches: MatchGroup[] = response.found_items.map(transformBackendItemWithMatches);
    
    return {
      success: true,
      data: {
        lostMatches,
        foundMatches,
      },
    };
    
  } catch (error: any) {
    console.error('[API] Get matches error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch matches',
    };
  }
}

/**
 * Get a single match by ID
 * Note: Backend doesn't have a dedicated match endpoint
 * Use getMyItems() or getMatches() instead to get matches
 */
export async function getMatchById(matchId: string): Promise<ApiResponse<Match>> {
  // Backend doesn't have individual match endpoint
  // This would require getting all matches and filtering
  // For now, return an error prompting to use getMatches instead
  
  return {
    success: false,
    error: 'Use getMatches() or getMyItems() to fetch match data',
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
