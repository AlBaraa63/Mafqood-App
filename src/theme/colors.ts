/**
 * Mafqood Premium Color Palette (2025)
 * Dubai Smart City Aesthetic: Premium, Modern, Trustworthy
 * Optimized for both Light and Dark modes
 */

export const lightColors = {
  // Primary: Deep Teal/Navy (Smart City Tech)
  primary: {
    50: '#E0F2F7',
    100: '#B3D9E8',
    200: '#80BDD6',
    300: '#4DA1C5',
    400: '#2685B8',
    500: '#0B5FA8', // Deep Teal - Premium Tech Feel
    600: '#094E8A',
    700: '#073D6B',
    800: '#052A4D',
  },
  // Accent: Luxury Gold/Bronze
  accent: {
    50: '#FEF8F0',
    100: '#FDE8D0',
    200: '#FBD4A0',
    300: '#F9C070',
    400: '#F7AC40',
    500: '#D4A574', // Soft Gold - Luxury Touch
    600: '#B8905A',
    700: '#9C7B40',
    800: '#806626',
  },
  // Highlight: Vibrant Teal Accent
  highlight: {
    50: '#E0F9F7',
    100: '#B3F0ED',
    200: '#80E6E2',
    300: '#4DDCD7',
    400: '#1AD2CC',
    500: '#00B8B3', // Vibrant Teal - Action/Success
    600: '#009B96',
    700: '#007E79',
    800: '#00615C',
  },
  // Neutral: Clean, High-Contrast
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#2D3748',
    800: '#1A202C',
    900: '#0F1419',
    white: '#FFFFFF',
  },
  // Text: High Contrast for Readability
  text: {
    primary: '#0F1419',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    inverse: '#FFFFFF',
  },
  // Background: Clean & Modern
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0B5FA8',
  },
};

// Dark Mode Palette (Premium, High-Contrast)
export const darkColors = {
  primary: {
    50: '#E0F2F7',
    100: '#B3D9E8',
    200: '#80BDD6',
    300: '#4DA1C5',
    400: '#2685B8',
    500: '#4FA3D1', // Lighter for dark mode
    600: '#6BB5E0',
    700: '#87C7EF',
    800: '#A3D9FF',
  },
  accent: {
    50: '#FEF8F0',
    100: '#FDE8D0',
    200: '#FBD4A0',
    300: '#F9C070',
    400: '#F7AC40',
    500: '#FFB84D', // Brighter for dark mode
    600: '#FFC966',
    700: '#FFD47F',
    800: '#FFDF99',
  },
  highlight: {
    50: '#E0F9F7',
    100: '#B3F0ED',
    200: '#80E6E2',
    300: '#4DDCD7',
    400: '#1AD2CC',
    500: '#00D9D1', // Brighter for dark mode
    600: '#33E5DC',
    700: '#66F1E7',
    800: '#99FDF2',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#2D3748',
    800: '#1A202C',
    900: '#0F1419',
    white: '#FFFFFF',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    tertiary: '#9CA3AF',
    inverse: '#0F1419',
  },
  background: {
    primary: '#0F1419',
    secondary: '#1A202C',
    tertiary: '#2D3748',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#4FA3D1',
  },
};

export type LightColors = typeof lightColors;
