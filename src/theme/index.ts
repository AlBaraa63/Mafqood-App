/**
 * Mafqood App - Premium Theme Configuration (2025)
 * Dubai Smart City Aesthetic: Premium, Modern, Trustworthy
 * Optimized for accessibility and high-end visual hierarchy
 */

export const colors = {
  // Primary - Deep Teal (Smart City Tech)
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
    900: '#031A2F',
  },

  // Accent - Luxury Gold/Bronze
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
    900: '#64510C',
  },

  // Highlight - Vibrant Teal Accent
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
    900: '#00443F',
  },

  // Semantic colors
  success: {
    light: '#D4EDDA',
    main: '#10B981',
    dark: '#0D8A5F',
  },
  warning: {
    light: '#FFF3CD',
    main: '#F59E0B',
    dark: '#D97706',
  },
  error: {
    light: '#F8D7DA',
    main: '#EF4444',
    dark: '#DC2626',
  },
  info: {
    light: '#D1E7F7',
    main: '#0B5FA8',
    dark: '#094E8A',
  },

  // Neutrals - Clean, High-Contrast
  neutral: {
    white: '#FFFFFF',
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
    black: '#000000',
  },

  // Background - Clean & Modern
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    surface: '#FFFFFF',
  },

  // Semantic aliases for legacy UI components
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#0B5FA8',
  },

  // Text - High Contrast for Readability
  text: {
    primary: '#0F1419',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    inverse: '#FFFFFF',
    link: '#0B5FA8',
  },

  // Status chips
  status: {
    open: '#00B8B3',
    matched: '#F59E0B',
    closed: '#9CA3AF',
  },

  // Match confidence
  confidence: {
    high: '#10B981',
    medium: '#F59E0B',
    low: '#9CA3AF',
  },

  // Dark mode support (future enhancement)
  dark: {
    primary: '#4FA3D1',
    accent: '#FFB84D',
    highlight: '#00D9D1',
    background: '#0F1419',
    text: '#F9FAFB',
  },
};

export const typography = {
  fontFamily: {
    // Using system fonts for optimal performance and native feel
    regular: 'System',
    medium: 'System',
    semibold: 'System',
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
    '5xl': 48,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Predefined text styles for consistency
  styles: {
    h1: {
      fontSize: 38,
      fontWeight: '700' as const,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.25,
    },
    h3: {
      fontSize: 26,
      fontWeight: '600' as const,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 1.4,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.4,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.5,
    },
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
  '6xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
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
  // Subtle shadow for cards
  sm: {
    shadowColor: '#0B5FA8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  // Medium shadow for elevated elements
  md: {
    shadowColor: '#0B5FA8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  // Large shadow for modals/overlays
  lg: {
    shadowColor: '#0B5FA8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  // Extra large shadow for prominent elements
  xl: {
    shadowColor: '#0B5FA8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
  },
  // Premium shadow for hero elements
  premium: {
    shadowColor: '#0B5FA8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
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
