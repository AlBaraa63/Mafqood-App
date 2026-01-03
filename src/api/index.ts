/**
 * Mafqood App - API Client
 * 
 * This module provides typed functions for communicating with the backend.
 */

import { Platform } from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from './config';
import { get, post, uploadFormData, del } from './client';
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

// Notification types
type NotificationType = 'match' | 'message' | 'update' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionId?: string;
}

import {
  getConfidenceFromSimilarity,
} from './mockData';

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
function transformBackendItem(backendItem: BackendItem, currentUserId?: string): Item {
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
    status: backendItem.status || 'open',
    title: backendItem.title,
    description: backendItem.description || undefined,
    category,
    imageUrl: backendItem.image_url.startsWith('http') 
      ? backendItem.image_url 
      : `${API_BASE_URL}/${backendItem.image_url.replace(/^\/+/, '')}`,
    location: backendItem.location || backendItem.location_type || '',
    locationDetail: backendItem.location_detail || undefined,
    dateTime: backendItem.date_time,
    contactMethod: backendItem.contact_method || 'in_app',
    userId: backendItem.user_id || currentUserId || String(backendItem.id),
    createdAt: backendItem.created_at,
    updatedAt: backendItem.created_at,
    aiProcessed: backendItem.ai_processed,
    aiCategory: backendItem.ai_category,
  };
}

/**
 * Transform backend match result to frontend format
 */
function transformBackendMatch(backendMatch: BackendMatchResult): Match | null {
  // Safety check: ensure matched_item exists
  if (!backendMatch.matched_item || !backendMatch.matched_item.id) {
    console.warn('[API] Invalid match data - missing matched_item:', backendMatch);
    return null;
  }
  
  const matchedItem = transformBackendItem(backendMatch.matched_item);
  const similarityPercent = backendMatch.similarity * 100; // Convert 0-1 to 0-100
  
  return {
    id: `match-${backendMatch.matched_item.id}`,
    userItemId: '', // Will be set by caller
    matchedItemId: String(backendMatch.matched_item.id),
    userItem: matchedItem, // Placeholder, will be filled by caller
    matchedItem,
    similarity: similarityPercent,
    confidence: getConfidenceFromSimilarity(similarityPercent),
    createdAt: backendMatch.matched_item.created_at,
  };
}

/**
 * Transform backend item with matches to frontend format
 */
function transformBackendItemWithMatches(backendItemWithMatches: BackendItemWithMatches): MatchGroup {
  const item = transformBackendItem(backendItemWithMatches.item);
  const matches = backendItemWithMatches.matches
    .map(m => transformBackendMatch(m))
    .filter((match): match is Match => match !== null) // Filter out null matches
    .map(match => {
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
 */
export async function login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    const response = await post<{ user: User; token: string }>(
      API_ENDPOINTS.login,
      credentials
    );
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
  try {
    // Convert camelCase to snake_case for backend
    const backendData = {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      phone: data.phone,
      is_venue: data.isVenue || false,
    };
    
    const response = await post<{ user: User; token: string }>(
      API_ENDPOINTS.register,
      backendData
    );
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
}

/**
 * Admin/Test: Reset database (delete old data)
 */
export async function resetDatabase(token?: string | null): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await del<{ message: string }>(API_ENDPOINTS.reset, { token });
    return { success: true, data: response };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Reset failed',
    };
  }
}

/**
 * Logout current user
 */
export async function logout(refreshToken?: string): Promise<ApiResponse<void>> {
  try {
    if (refreshToken) {
      await post(API_ENDPOINTS.logout, { refresh_token: refreshToken });
    }
    return { success: true };
  } catch (error: any) {
    // Even if backend fails, we still clear local session
    return { success: true };
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<ApiResponse<void>> {
  try {
    await post(API_ENDPOINTS.forgotPassword, { email });
    return {
      success: true,
      message: 'If this email is registered, you will receive a reset link.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send reset email',
    };
  }
}

// ===== Items API =====

/**
 * Submit a lost item report
 * Connects to backend endpoint with image upload
 */
export async function createLostItem(formData: ItemFormData, token?: string | null): Promise<ApiResponse<ItemSubmitResponse>> {
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
    
    form.append('image', file);
    
    // Add required fields
    form.append('title', formData.title);
    form.append('location', formData.location);
    form.append('date_time', formData.dateTime);
    
    // Add optional fields
    if (formData.location) {
      form.append('location_type', formData.location);
    }
    if (formData.description) {
      form.append('description', formData.description);
    }
    if (formData.locationDetail) {
      form.append('location_detail', formData.locationDetail);
    }
    
    // Make API request
    const response = await uploadFormData<BackendLostItemResponse>(
      API_ENDPOINTS.lostItems,
      form,
      { token }
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
export async function createFoundItem(formData: ItemFormData, token?: string | null): Promise<ApiResponse<ItemSubmitResponse>> {
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
    
    form.append('image', file);
    
    // Add required fields
    form.append('title', formData.title);
    form.append('location', formData.location);
    form.append('date_time', formData.dateTime);
    
    // Add optional fields
    if (formData.location) {
      form.append('location_type', formData.location);
    }
    if (formData.description) {
      form.append('description', formData.description);
    }
    if (formData.locationDetail) {
      form.append('location_detail', formData.locationDetail);
    }
    
    // Make API request
    const response = await uploadFormData<BackendFoundItemResponse>(
      API_ENDPOINTS.foundItems,
      form,
      { token }
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
 * Connects to backend /api/v1/history endpoint
 */
export async function getMyItems(token?: string | null): Promise<ApiResponse<HistoryResponse>> {
  try {
    const response = await get<BackendHistoryResponse>(API_ENDPOINTS.history, { token });
    
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
 * Connects to backend /api/v1/items/{id} endpoint
 */
export async function getItemById(itemId: string): Promise<ApiResponse<Item>> {
  try {
    const response = await get<BackendItem>(API_ENDPOINTS.itemDetail(itemId));
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
 * Uses the same /api/v1/history endpoint as getMyItems
 */
export async function getMatches(token?: string | null): Promise<ApiResponse<{ lostMatches: MatchGroup[]; foundMatches: MatchGroup[] }>> {
  try {
    const response = await get<BackendHistoryResponse>(API_ENDPOINTS.history, { token });
    
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
 */
export async function claimMatch(matchId: string): Promise<ApiResponse<void>> {
  try {
    await post(`${API_ENDPOINTS.matches}/${matchId}/claim`);
    return {
      success: true,
      message: 'Contact request sent! The other party will be notified.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to claim match',
    };
  }
}

// ===== User API =====

/**
 * Get current user profile
 */
export async function getProfile(token?: string | null): Promise<ApiResponse<User>> {
  try {
    const response = await get<User>(API_ENDPOINTS.profile, { token });
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch profile',
    };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
  try {
    const response = await post<User>(API_ENDPOINTS.updateProfile, data);
    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
}

// ===== Image Upload =====

/**
 * Upload an image and get the URL
 * TODO: Connect to actual backend endpoint with optional blur processing
 */
export async function uploadImage(imageUri: string): Promise<ApiResponse<{ url: string }>> {
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

// ===== Notification APIs =====

/**
 * Get all notifications for current user
 */
export async function getNotifications(): Promise<ApiResponse<Notification[]>> {
  try {
    const response = await get<{ notifications: any[] }>(API_ENDPOINTS.notifications);
    
    // Transform backend notifications to frontend format
    const notifications: Notification[] = response.notifications.map((notif: any) => ({
      id: String(notif.id),
      type: notif.type || 'system',
      title: notif.title,
      message: notif.message,
      timestamp: notif.created_at,
      read: notif.is_read || false,
      actionId: notif.item_id ? String(notif.item_id) : undefined,
    }));
    
    return {
      success: true,
      data: notifications,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch notifications',
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
  try {
    await post(API_ENDPOINTS.markNotificationRead(notificationId));
    
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark notification as read',
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
  try {
    await post(API_ENDPOINTS.markAllNotificationsRead);
    
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to mark all notifications as read',
    };
  }
}

// ===== User Stats =====

interface UserStats {
  reports: number;
  matches: number;
  successRate: number;
  memberSince: string;
}

/**
 * Get user statistics (calculated from user's items and matches)
 */
export async function getUserStats(): Promise<ApiResponse<UserStats>> {
  try {
    // Fetch user's items history to calculate stats
    const historyResponse = await get<BackendHistoryResponse>(API_ENDPOINTS.history);
    
    const totalReports = historyResponse.lost_items.length + historyResponse.found_items.length;
    
    // Count items with matches
    const itemsWithMatches = [
      ...historyResponse.lost_items.filter(item => item.matches && item.matches.length > 0),
      ...historyResponse.found_items.filter(item => item.matches && item.matches.length > 0),
    ];
    
    const totalMatches = itemsWithMatches.length;
    
    // Calculate success rate (items with matches / total items)
    const successRate = totalReports > 0 ? Math.round((totalMatches / totalReports) * 100) : 0;
    
    // Get member since year from oldest item or current year
    let memberSince = new Date().getFullYear().toString();
    if (historyResponse.lost_items.length > 0 || historyResponse.found_items.length > 0) {
      const allDates = [
        ...historyResponse.lost_items.map(item => new Date(item.created_at)),
        ...historyResponse.found_items.map(item => new Date(item.created_at)),
      ];
      const oldestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      memberSince = oldestDate.getFullYear().toString();
    }
    
    return {
      success: true,
      data: {
        reports: totalReports,
        matches: totalMatches,
        successRate,
        memberSince,
      },
    };
  } catch (error: any) {
    console.error('[API] Get user stats error:', error);
    // Return default stats on error
    return {
      success: true,
      data: {
        reports: 0,
        matches: 0,
        successRate: 0,
        memberSince: new Date().getFullYear().toString(),
      },
    };
  }
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
  
  // Notifications
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  
  // User Stats
  getUserStats,
  
  // Upload
  uploadImage,
};
