/**
 * Mafqood Mobile - Theme Configuration
 * Native-first design system tokens
 */

import { Platform } from 'react-native';

export const colors = {
  // Primary colors (brand)
  primary: {
    dark: '#0B2D3A',      // Main dark teal
    darkHover: '#0d3847', // Dark teal hover
    accent: '#28B3A3',    // Teal accent
    accentHover: '#36C2B2', // Teal accent hover
    accentLight: 'rgba(40, 179, 163, 0.1)', // Accent with opacity
  },
  
  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',  // gray-50
    tertiary: '#F3F4F6',   // gray-100
  },
  
  // Text colors
  text: {
    primary: '#111827',    // gray-900
    secondary: '#4B5563',  // gray-600
    tertiary: '#6B7280',   // gray-500
    light: '#9CA3AF',      // gray-400
    white: '#FFFFFF',
    inverse: '#FFFFFF',    // For dark backgrounds
  },
  
  // Border colors
  border: {
    light: '#E5E7EB',      // gray-200
    default: '#D1D5DB',    // gray-300
    dark: '#9CA3AF',       // gray-400
  },
  
  // Status colors
  status: {
    success: '#10B981',    // green-500
    successBg: '#D1FAE5',  // green-100
    error: '#EF4444',      // red-500
    errorBg: '#FEE2E2',    // red-100
    warning: '#F59E0B',    // amber-500
    warningBg: '#FEF3C7',  // amber-100
    info: '#3B82F6',       // blue-500
    infoBg: '#DBEAFE',     // blue-100
  },
  
  // Match badge colors
  match: {
    high: '#28B3A3',
    highBg: 'rgba(40, 179, 163, 0.1)',
    possible: '#0B2D3A',
    possibleBg: 'rgba(11, 45, 58, 0.1)',
  },
};

// Spacing scale (mobile-optimized)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Layout constants (semantic spacing)
export const layout = {
  screenPadding: 16,      // Standard horizontal padding for screens
  cardPadding: 12,        // Internal card padding
  sectionGap: 16,         // Gap between sections
  itemGap: 8,             // Gap between list items
  tabBarHeight: Platform.OS === 'ios' ? 88 : 64,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Typography (mobile-optimized sizes)
export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 28,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Legacy fontSize export for backwards compatibility
export const fontSize = typography.sizes;
export const fontWeight = typography.weights;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Icon sizes (standardized)
export const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

export const theme = {
  colors,
  spacing,
  layout,
  borderRadius,
  typography,
  fontSize,
  fontWeight,
  shadows,
  iconSizes,
};

export default theme;
