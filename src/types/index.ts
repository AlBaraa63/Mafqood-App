/**
 * Mafqood App - TypeScript Types
 * Dubai's AI-Powered Lost & Found Platform
 */

// ===== User & Auth Types =====

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isVenue?: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isVenue?: boolean;
}

// ===== Item Types =====

export type ItemType = 'lost' | 'found';

export type ItemCategory = 
  | 'phone'
  | 'wallet'
  | 'bag'
  | 'id'
  | 'jewelry'
  | 'electronics'
  | 'keys'
  | 'documents'
  | 'other';

export type ItemStatus = 'open' | 'matched' | 'closed';

export type ContactMethod = 'phone' | 'email' | 'in_app';

export interface Item {
  id: string;
  type: ItemType;
  status: ItemStatus;
  title: string;
  description?: string;
  category: ItemCategory;
  brand?: string;
  color?: string;
  imageUrl: string;
  location: string;
  locationDetail?: string;
  dateTime: string;
  contactMethod: ContactMethod;
  contactPhone?: string;
  contactEmail?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  aiProcessed?: boolean; // AI analysis completion status
  aiCategory?: string; // AI-detected category
}

export interface ItemFormData {
  type: ItemType;
  imageUri?: string;
  imageConfirmed: boolean;
  category?: ItemCategory;
  title: string;
  description: string;
  brand?: string;
  color?: string;
  dateTime: string;
  location: string;
  locationDetail: string;
  contactMethod: ContactMethod;
  contactPhone: string;
  contactEmail: string;
  termsAccepted: boolean;
}

// ===== Match Types =====

export type MatchConfidence = 'high' | 'medium' | 'low';

export interface Match {
  id: string;
  userItemId: string;
  matchedItemId: string;
  userItem: Item;
  matchedItem: Item;
  similarity: number; // 0-100
  confidence: MatchConfidence;
  createdAt: string;
}

export interface MatchGroup {
  item: Item;
  matches: Match[];
}

// ===== API Response Types =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ItemSubmitResponse {
  item: Item;
  matches: Match[];
  match_count?: number;
  ai_error?: string | null;
}

export interface HistoryResponse {
  lostItems: MatchGroup[];
  foundItems: MatchGroup[];
}

// ===== Backend API Types =====

// Backend types (matching Python Pydantic schemas)
export interface BackendItem {
  id: string;
  user_id: string;
  type: 'lost' | 'found';
  status: string;
  title: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  color: string | null;
  image_url: string;
  thumbnail_url: string | null;
  location: string;
  location_detail: string | null;
  location_type: string | null;
  latitude: number | null;
  longitude: number | null;
  date_time: string;
  created_at: string;
  contact_method: string;
  contact_phone: string | null;
  contact_email: string | null;
  view_count: number;
  match_count: number;
  ai_processed: boolean;
  ai_category: string | null;
  detected_objects: string | null;
  owner: any | null;
}

export interface BackendMatchResult {
  matched_item: BackendItem; // Backend sends "matched_item" not "item"
  similarity: number; // 0.0 to 1.0 (float from backend)
  confidence: string;
  status: string;
  created_at: string;
}

export interface BackendItemWithMatches {
  item: BackendItem;
  matches: BackendMatchResult[];
}

export interface BackendLostItemResponse {
  item: BackendItem;
  matches: BackendMatchResult[];
}

export interface BackendFoundItemResponse {
  item: BackendItem;
  matches: BackendMatchResult[];
}

export interface BackendHistoryResponse {
  lost_items: BackendItemWithMatches[];
  found_items: BackendItemWithMatches[];
}

export interface BackendItemListResponse {
  items: BackendItem[];
  count: number;
}

// ===== Navigation Types =====

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ReportTab: undefined;
  MatchesTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

export type ReportStackParamList = {
  ReportTypeSelect: undefined;
  ReportPhoto: { type: ItemType };
  ReportDetails: { type: ItemType; imageUri: string };
  ReportWhenWhere: { type: ItemType; imageUri: string; details: Partial<ItemFormData> };
  ReportContact: { type: ItemType; imageUri: string; details: Partial<ItemFormData> };
  ReportReview: { formData: ItemFormData };
  ReportSuccess: { type: ItemType; item: Item; matchCount: number; aiError?: string | null };
};

export type MatchesStackParamList = {
  MatchesList: undefined;
  MatchDetail: { matchId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  MyReports: undefined;
  ReportDetail: { itemId: string };
  About: undefined;
};

// ===== Component Props Types =====

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
  variant?: 'default' | 'elevated' | 'outlined';
}
