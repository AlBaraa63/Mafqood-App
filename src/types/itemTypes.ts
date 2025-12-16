/**
 * Mafqood Mobile - TypeScript Types
 * Matches the backend schemas and web frontend types
 */

// API Response Types (from backend schemas.py)
export interface ItemInDBBase {
  id: number;
  type: 'lost' | 'found';
  title: string;
  description: string | null;
  location_type: string;
  location_detail: string | null;
  time_frame: string;
  image_url: string;
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
  // New API format
  lost_items?: ItemWithMatches[] | ItemInDBBase[];
  found_items?: ItemWithMatches[] | ItemInDBBase[];
  // Legacy format (for backward compatibility)
  lost?: ItemInDBBase[];
  found?: ItemInDBBase[];
}

// Form/Submit Types
export interface SubmitItemPayload {
  file: {
    uri: string;
    name: string;
    type: string;
  };
  title: string;
  description?: string;
  locationType: string;
  locationDetail?: string;
  timeFrame: string;
}

// Frontend UI Types
export interface Item {
  id: string;
  type: 'lost' | 'found';
  imageUrl: string;
  where: string;
  specificPlace?: string;
  when: string;
  description: string;
  timestamp: Date;
  matches?: Match[];
}

export interface Match {
  id: string;
  item: Item;
  similarity: number;
  status: 'possible' | 'high' | 'exact';
}

export interface ItemFormData {
  image: {
    uri: string;
    name: string;
    type: string;
  } | null;
  imagePreview?: string;
  where: string;
  specificPlace: string;
  when: string;
  description: string;
}

// Navigation Types - Consolidated
export type RootStackParamList = {
  MainTabs: undefined;
  MatchDetails: {
    item: Item;
    matches: Match[];
  };
};

export type BottomTabParamList = {
  Home: undefined;
  Report: { type?: 'lost' | 'found' };
  Matches: undefined;
  Settings: undefined;
};

// Option types for dropdowns
export interface SelectOption {
  value: string;
  label: string;
  key: string;
}

// Location options (same as web)
export const whereOptions: SelectOption[] = [
  { value: 'Mall', label: 'Mall', key: 'location_mall' },
  { value: 'Taxi', label: 'Taxi', key: 'location_taxi' },
  { value: 'Metro', label: 'Metro', key: 'location_metro' },
  { value: 'Airport', label: 'Airport', key: 'location_airport' },
  { value: 'School / University', label: 'School / University', key: 'location_school' },
  { value: 'Event / Venue', label: 'Event / Venue', key: 'location_event' },
  { value: 'Street / Public Area', label: 'Street / Public Area', key: 'location_street' },
  { value: 'Other', label: 'Other', key: 'location_other' },
];

// Time frame options (same as web)
export const whenOptions: SelectOption[] = [
  { value: 'Today', label: 'Today', key: 'time_today' },
  { value: 'Yesterday', label: 'Yesterday', key: 'time_yesterday' },
  { value: 'Last 3 days', label: 'Last 3 days', key: 'time_last_3_days' },
  { value: 'Last week', label: 'Last week', key: 'time_last_week' },
  { value: 'Earlier', label: 'Earlier', key: 'time_earlier' },
];
