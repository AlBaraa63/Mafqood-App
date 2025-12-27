/**
 * Mafqood App - Theme Configuration
 * Mirrors the Mafqood web palette (deep navy + turquoise with warm highlights)
 */

export const colors = {
  // Primary - Deep Navy (matches web gradient start)
  primary: {
    50: '#EEF4F8',
    100: '#D6E3EB',
    200: '#B2C8D6',
    300: '#88A6BA',
    400: '#5F829B',
    500: '#0B2D3A', // Main primary
    600: '#092532',
    700: '#071D29',
    800: '#051521',
    900: '#020D16',
  },

  // Accent - Turquoise (matches web gradient end)
  accent: {
    50: '#E9FBF7',
    100: '#C6F3E9',
    200: '#9EEAD9',
    300: '#6FD9C4',
    400: '#47CCB3',
    500: '#28B3A3', // Main accent
    600: '#21968A',
    700: '#1B7A72',
    800: '#155F5A',
    900: '#0E403C',
  },

  // Highlight - warm gold for subtle accents
  highlight: {
    50: '#FFF8EC',
    100: '#FFEFD4',
    200: '#FBDFA9',
    300: '#F5C77C',
    400: '#E8AB4A',
    500: '#D18B1E',
    600: '#B47315',
    700: '#8F5910',
    800: '#69400B',
    900: '#412807',
  },
  
  // Semantic colors
  success: {
    light: '#E8F5E9',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  warning: {
    light: '#FFF3E0',
    main: '#FF9800',
    dark: '#F57C00',
  },
  error: {
    light: '#FFECEF',
    main: '#E53935',
    dark: '#B71C1C',
  },
  info: {
    light: '#E6F3FF',
    main: '#1E88E5',
    dark: '#0D47A1',
  },
  
  // Neutrals
  neutral: {
    white: '#FFFFFF',
    50: '#F6F8FB',
    100: '#EEF2F7',
    200: '#E2E8F0',
    300: '#CAD5E1',
    400: '#9BA9BC',
    500: '#6B7A90',
    600: '#4B596F',
    700: '#343F51',
    800: '#1F2733',
    900: '#0F141C',
    black: '#040608',
  },
  
  // Background
  background: {
    primary: '#FFFFFF',
    secondary: '#F4F7FB',
    tertiary: '#E8EEF5',
    surface: '#FFFFFF',
  },
  // Semantic aliases for legacy UI components
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#E53935',
    info: '#1E88E5',
  },
  
  // Text
  text: {
    primary: '#0B2D3A',
    secondary: '#35455A',
    tertiary: '#6B7A90',
    inverse: '#FFFFFF',
    link: '#28B3A3',
  },
  
  // Status chips
  status: {
    open: '#28B3A3',
    matched: '#F5C77C',
    closed: '#9BA9BC',
  },
  
  // Match confidence
  confidence: {
    high: '#4CAF50',
    medium: '#FF9800',
    low: '#9E9E9E',
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
    '4xl': 38,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 52,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0B2D3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  md: {
    shadowColor: '#0B2D3A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: '#0B2D3A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  xl: {
    shadowColor: '#0B2D3A',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 14,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
export default theme;
