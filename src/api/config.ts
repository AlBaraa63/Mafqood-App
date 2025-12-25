/**
 * Mafqood App - API Configuration
 */

// TODO: Replace with actual backend URL
export const API_BASE_URL = 'https://api.mafqood.ae'; // Placeholder

export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  forgotPassword: '/api/auth/forgot-password',
  refreshToken: '/api/auth/refresh',
  
  // Items
  lostItems: '/api/lost',
  foundItems: '/api/found',
  myItems: '/api/items/me',
  itemDetail: (id: string) => `/api/items/${id}`,
  
  // Matches
  matches: '/api/matches',
  matchDetail: (id: string) => `/api/matches/${id}`,
  claimMatch: (id: string) => `/api/matches/${id}/claim`,
  
  // User
  profile: '/api/users/me',
  updateProfile: '/api/users/me',
  
  // Upload
  uploadImage: '/api/upload/image',
};

export const API_TIMEOUT = 30000; // 30 seconds

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
};
