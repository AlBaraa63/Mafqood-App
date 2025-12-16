/**
 * Mafqood Mobile - API Client
 * Mirrors frontend/src/api/lostFoundApi.ts with React Native adaptations
 */

import { Platform } from 'react-native';
import { API_BASE_URL, ENDPOINTS } from './config';
import {
  SubmitItemPayload,
  LostItemResponse,
  FoundItemResponse,
  HistoryResponse,
} from '../types/itemTypes';

/**
 * Normalize image URL from backend and build full URL.
 * Handles Windows backslashes and prepends base URL.
 */
export function buildImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  
  // Convert backslashes to forward slashes (Windows paths)
  const normalized = imageUrl.replace(/\\/g, '/');
  
  // If already a full URL, return as-is
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }
  
  // Ensure path starts with /
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
  
  // Prepend base URL
  return `${API_BASE_URL}${path}`;
}

/**
 * Build FormData for submitting an item
 * Handles both web and native platforms
 */
async function buildFormData(payload: SubmitItemPayload): Promise<FormData> {
  const formData = new FormData();
  
  // Handle file differently for web vs native
  if (Platform.OS === 'web') {
    // Web: Fetch the blob from the URI and create a File object
    const response = await fetch(payload.file.uri);
    const blob = await response.blob();
    
    // Determine the correct MIME type and extension
    // Use the blob's type if available, otherwise fall back to payload type
    const mimeType = blob.type || payload.file.type || 'image/jpeg';
    
    // Map MIME type to extension (backend only allows these)
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const ext = extMap[mimeType] || '.jpg';
    
    // Ensure filename has correct extension
    let filename = payload.file.name;
    if (!filename.match(/\.(jpg|jpeg|png|webp)$/i)) {
      filename = `photo_${Date.now()}${ext}`;
    }
    
    const file = new File([blob], filename, { type: mimeType });
    formData.append('file', file);
  } else {
    // React Native: Use the { uri, name, type } format
    formData.append('file', {
      uri: payload.file.uri,
      name: payload.file.name,
      type: payload.file.type,
    } as any);
  }
  
  formData.append('title', payload.title);
  
  if (payload.description) {
    formData.append('description', payload.description);
  }
  
  formData.append('location_type', payload.locationType);
  
  if (payload.locationDetail) {
    formData.append('location_detail', payload.locationDetail);
  }
  
  formData.append('time_frame', payload.timeFrame);
  
  return formData;
}

/**
 * Submit a lost item report and get AI-suggested matches.
 */
export async function submitLostItem(payload: SubmitItemPayload): Promise<LostItemResponse> {
  const formData = await buildFormData(payload);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOST}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - let fetch set it automatically with boundary
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to submit lost item: ${response.status} - ${errorText}`);
  }
  
  const data: LostItemResponse = await response.json();
  return data;
}

/**
 * Submit a found item report and get AI-suggested matches.
 */
export async function submitFoundItem(payload: SubmitItemPayload): Promise<FoundItemResponse> {
  const formData = await buildFormData(payload);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.FOUND}`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - let fetch set it automatically with boundary
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to submit found item: ${response.status} - ${errorText}`);
  }
  
  const data: FoundItemResponse = await response.json();
  return data;
}

/**
 * Fetch user's activity history with all lost and found items and their matches.
 */
export async function fetchHistory(): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HISTORY}`);
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch history: ${response.status} - ${errorText}`);
  }
  
  const data: HistoryResponse = await response.json();
  return data;
}

/**
 * Reset/clear the entire database (admin function for testing).
 */
export async function resetDatabase(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.RESET}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to reset database: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string; version: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`);
  
  if (!response.ok) {
    throw new Error('Backend is not reachable');
  }
  
  return response.json();
}
