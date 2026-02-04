/**
 * Dubai AI Lost & Found - API Client
 * 
 * This module provides typed functions for communicating with the FastAPI backend.
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ===== TypeScript Types =====

export interface ItemInDBBase {
  id: number;
  type: "lost" | "found";
  title: string;
  description: string | null;
  location_type: string;
  location_detail: string | null;
  time_frame: string;
  image_url: string;  // Backend returns image_url, not image_path
  created_at: string;
}

export interface MatchResult {
  item: ItemInDBBase;
  similarity: number; // 0-1
}

export interface LostItemResponse {
  item: ItemInDBBase;
  matches: MatchResult[];
}

export interface FoundItemResponse {
  item: ItemInDBBase;
  matches: MatchResult[];
}

export interface ItemWithMatches {
  item: ItemInDBBase;
  matches: MatchResult[];
}

export interface HistoryResponse {
  lost_items: ItemWithMatches[];
  found_items: ItemWithMatches[];
}

export interface SubmitItemPayload {
  file: File;
  title: string;
  description?: string;
  locationType: string;
  locationDetail?: string;
  timeFrame: string;
}

// ===== Helper Functions =====

/**
 * Normalize image URL from backend and build full URL.
 * Handles Windows backslashes and prepends base URL.
 */
export function buildImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";

  // Convert backslashes to forward slashes (Windows paths)
  const normalized = imageUrl.replace(/\\/g, "/");

  // If already a full URL, return as-is
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  // Prepend base URL
  return `${API_BASE_URL}${normalized}`;
}

/**
 * Build FormData for submitting an item.
 */
function buildFormData(payload: SubmitItemPayload): FormData {
  const formData = new FormData();

  formData.append("file", payload.file);
  formData.append("title", payload.title);

  if (payload.description) {
    formData.append("description", payload.description);
  }

  formData.append("location_type", payload.locationType);

  if (payload.locationDetail) {
    formData.append("location_detail", payload.locationDetail);
  }

  formData.append("time_frame", payload.timeFrame);

  return formData;
}

// ===== API Functions =====

/**
 * Submit a lost item report and get AI-suggested matches.
 * 
 * @param payload - Item details and image file
 * @returns Response with created item and matches from found items
 * @throws Error if the request fails
 */
export async function submitLostItem(payload: SubmitItemPayload): Promise<LostItemResponse> {
  const formData = buildFormData(payload);

  const response = await fetch(`${API_BASE_URL}/api/lost`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to submit lost item: ${response.status} - ${errorText}`);
  }

  const data: LostItemResponse = await response.json();
  return data;
}

/**
 * Submit a found item report and get AI-suggested matches.
 * 
 * @param payload - Item details and image file
 * @returns Response with created item and matches from lost items
 * @throws Error if the request fails
 */
export async function submitFoundItem(payload: SubmitItemPayload): Promise<FoundItemResponse> {
  const formData = buildFormData(payload);

  const response = await fetch(`${API_BASE_URL}/api/found`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to submit found item: ${response.status} - ${errorText}`);
  }

  const data: FoundItemResponse = await response.json();
  return data;
}

/**
 * Fetch user's activity history with all lost and found items and their matches.
 * 
 * @returns History response with lost and found items
 * @throws Error if the request fails
 */
export async function fetchHistory(): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/history`);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to fetch history: ${response.status} - ${errorText}`);
  }

  const data: HistoryResponse = await response.json();
  return data;
}

/**
 * Reset/clear the entire database (admin function for testing).
 * 
 * @returns Success message with count of deleted items
 * @throws Error if the request fails
 */
export async function resetDatabase(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/reset`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to reset database: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}
