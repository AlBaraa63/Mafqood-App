/**
 * HTTP Client for API Requests
 * Handles authentication, error handling, and FormData for image uploads
 */

import { API_BASE_URL, API_TIMEOUT } from './config';
import { logger } from '../utils';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  token?: string | null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Make an HTTP request to the API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT,
    token,
  } = options;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // Add auth token if provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON (unless it's FormData)
  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Build request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body if provided
  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    logger.api(method, endpoint, body);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      
      // Try to extract detailed error message
      if (data?.detail) {
        // FastAPI validation errors
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => 
            `${err.loc?.join('.') || 'Field'}: ${err.msg}`
          ).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else {
          errorMessage = JSON.stringify(data.detail);
        }
      } else if (data?.message) {
        errorMessage = data.message;
      }
      
      logger.error(`API Error ${response.status}:`, errorMessage);
      throw new ApiError(response.status, errorMessage, data);
    }

    logger.info(`API Success: ${method} ${endpoint}`);
    return data as T;

  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Network request failed') {
      throw new ApiError(0, 'Network error. Please check your connection.');
    }

    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown error
    console.error('[API] Error:', error);
    throw new ApiError(500, error.message || 'An unexpected error occurred');
  }
}

/**
 * GET request
 */
export async function get<T>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * PUT request
 */
export async function put<T>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * DELETE request
 */
export async function del<T>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Upload file with FormData
 */
export async function uploadFormData<T>(
  endpoint: string,
  formData: FormData,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiRequest<T>(endpoint, { 
    ...options, 
    method: 'POST', 
    body: formData 
  });
}

export default {
  get,
  post,
  put,
  del,
  uploadFormData,
  apiRequest,
};
