/**
 * Dynamic Styles Hook - Mobile-First Responsive System
 * Creates perfectly scaled fonts and spacing for ANY device size
 * 
 * Uses PixelRatio and Dimensions to calculate:
 * - Device-specific font scaling (small phones to tablets)
 * - Accessibility-aware text sizing (respects user's font scale)
 * - Proportional spacing that looks native on all devices
 */

import { useMemo } from 'react';
import { Dimensions, PixelRatio, Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useResponsive } from './useResponsive';
import { colors, borderRadius } from '../theme';

// Base design dimensions (iPhone 14 Pro - 393x852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

/**
 * Scale a value based on screen width
 * Ensures consistent proportions across devices
 */
const scale = (size: number): number => {
  const { width } = Dimensions.get('window');
  const scaleFactor = width / BASE_WIDTH;
  const newSize = size * scaleFactor;
  
  // Round to nearest pixel for crisp rendering
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Scale with vertical aspect ratio consideration
 * Better for heights, margins, paddings
 */
const verticalScale = (size: number): number => {
  const { height } = Dimensions.get('window');
  const scaleFactor = height / BASE_HEIGHT;
  const newSize = size * scaleFactor;
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Moderate scaling for fonts - prevents extreme sizes
 * Uses a dampening factor to avoid overly large/small text
 */
const moderateScale = (size: number, factor: number = 0.5): number => {
  const { width } = Dimensions.get('window');
  const scaleFactor = width / BASE_WIDTH;
  const newSize = size + (scaleFactor - 1) * size * factor;
  
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Font scale that respects user's accessibility settings
 */
const accessibleFontScale = (baseSize: number): number => {
  const { fontScale } = Dimensions.get('window');
  const scaledSize = moderateScale(baseSize);
  
  // Apply user's font scale with reasonable limits
  const minScale = 0.85;
  const maxScale = 1.4;
  const clampedFontScale = Math.min(Math.max(fontScale, minScale), maxScale);
  
  return Math.round(scaledSize * clampedFontScale);
};

export interface DynamicTypography {
  // Headings
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  h4: TextStyle;
  
  // Body text
  bodyLarge: TextStyle;
  body: TextStyle;
  bodySmall: TextStyle;
  
  // Labels and captions
  label: TextStyle;
  labelSmall: TextStyle;
  caption: TextStyle;
  
  // Special
  hero: TextStyle;
  button: TextStyle;
  buttonSmall: TextStyle;
  
  // Raw font sizes (for custom use)
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
}

export interface DynamicSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  
  // Screen-aware padding
  screenPadding: number;
  cardPadding: number;
  sectionGap: number;
  itemGap: number;
}

export interface DynamicLayout {
  // Icon sizes
  iconSm: number;
  iconMd: number;
  iconLg: number;
  iconXl: number;
  
  // Avatar sizes
  avatarSm: number;
  avatarMd: number;
  avatarLg: number;
  
  // Button heights
  buttonSm: number;
  buttonMd: number;
  buttonLg: number;
  
  // Border radius
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
  radiusXl: number;
  radiusFull: number;
  
  // Card dimensions
  cardMinHeight: number;
  fabSize: number;
}

export const useDynamicStyles = () => {
  const { screenSize, width, height, fontScale, isSmallDevice, isTablet } = useResponsive();
  
  return useMemo(() => {
    // Typography with accessibility support
    const typography: DynamicTypography = {
      // Hero / Display
      hero: {
        fontSize: accessibleFontScale(32),
        fontWeight: '800',
        lineHeight: accessibleFontScale(32) * 1.2,
        letterSpacing: -0.5,
        color: colors.text.primary,
      },
      
      // Headings
      h1: {
        fontSize: accessibleFontScale(28),
        fontWeight: '700',
        lineHeight: accessibleFontScale(28) * 1.25,
        letterSpacing: -0.3,
        color: colors.text.primary,
      },
      h2: {
        fontSize: accessibleFontScale(22),
        fontWeight: '700',
        lineHeight: accessibleFontScale(22) * 1.3,
        letterSpacing: -0.2,
        color: colors.text.primary,
      },
      h3: {
        fontSize: accessibleFontScale(18),
        fontWeight: '600',
        lineHeight: accessibleFontScale(18) * 1.35,
        color: colors.text.primary,
      },
      h4: {
        fontSize: accessibleFontScale(16),
        fontWeight: '600',
        lineHeight: accessibleFontScale(16) * 1.4,
        color: colors.text.primary,
      },
      
      // Body
      bodyLarge: {
        fontSize: accessibleFontScale(16),
        fontWeight: '400',
        lineHeight: accessibleFontScale(16) * 1.5,
        color: colors.text.secondary,
      },
      body: {
        fontSize: accessibleFontScale(14),
        fontWeight: '400',
        lineHeight: accessibleFontScale(14) * 1.5,
        color: colors.text.secondary,
      },
      bodySmall: {
        fontSize: accessibleFontScale(13),
        fontWeight: '400',
        lineHeight: accessibleFontScale(13) * 1.45,
        color: colors.text.tertiary,
      },
      
      // Labels
      label: {
        fontSize: accessibleFontScale(14),
        fontWeight: '600',
        lineHeight: accessibleFontScale(14) * 1.3,
        color: colors.text.primary,
      },
      labelSmall: {
        fontSize: accessibleFontScale(12),
        fontWeight: '600',
        lineHeight: accessibleFontScale(12) * 1.3,
        color: colors.text.secondary,
      },
      caption: {
        fontSize: accessibleFontScale(11),
        fontWeight: '500',
        lineHeight: accessibleFontScale(11) * 1.3,
        color: colors.text.tertiary,
      },
      
      // Buttons
      button: {
        fontSize: accessibleFontScale(15),
        fontWeight: '600',
        lineHeight: accessibleFontScale(15) * 1.2,
        color: colors.neutral.white,
      },
      buttonSmall: {
        fontSize: accessibleFontScale(13),
        fontWeight: '600',
        lineHeight: accessibleFontScale(13) * 1.2,
        color: colors.neutral.white,
      },
      
      // Raw sizes
      sizes: {
        xs: accessibleFontScale(10),
        sm: accessibleFontScale(12),
        md: accessibleFontScale(14),
        lg: accessibleFontScale(16),
        xl: accessibleFontScale(18),
        '2xl': accessibleFontScale(22),
        '3xl': accessibleFontScale(28),
        '4xl': accessibleFontScale(34),
        '5xl': accessibleFontScale(42),
      },
    };
    
    // Dynamic spacing
    const spacing: DynamicSpacing = {
      xs: scale(4),
      sm: scale(8),
      md: scale(12),
      lg: scale(16),
      xl: scale(20),
      '2xl': scale(24),
      '3xl': scale(32),
      '4xl': scale(48),
      
      // Screen-aware values
      screenPadding: isTablet ? scale(24) : scale(16),
      cardPadding: isSmallDevice ? scale(12) : scale(16),
      sectionGap: verticalScale(24),
      itemGap: scale(12),
    };
    
    // Dynamic layout values
    const layout: DynamicLayout = {
      // Icons
      iconSm: scale(16),
      iconMd: scale(20),
      iconLg: scale(24),
      iconXl: scale(32),
      
      // Avatars
      avatarSm: scale(32),
      avatarMd: scale(40),
      avatarLg: scale(56),
      
      // Buttons
      buttonSm: verticalScale(36),
      buttonMd: verticalScale(44),
      buttonLg: verticalScale(52),
      
      // Border radius
      radiusSm: scale(6),
      radiusMd: scale(10),
      radiusLg: scale(14),
      radiusXl: scale(20),
      radiusFull: 9999,
      
      // Other
      cardMinHeight: verticalScale(80),
      fabSize: scale(56),
    };
    
    return {
      typography,
      spacing,
      layout,
      
      // Expose utility functions
      scale,
      verticalScale,
      moderateScale,
      accessibleFontScale,
      
      // Screen info
      screenSize,
      width,
      height,
      fontScale,
      isSmallDevice,
      isTablet,
    };
  }, [screenSize, width, height, fontScale, isSmallDevice, isTablet]);
};

/**
 * Quick access to scaled values without the full hook
 * Useful for StyleSheet definitions
 */
export const dynamicScale = {
  font: accessibleFontScale,
  width: scale,
  height: verticalScale,
  moderate: moderateScale,
};

export default useDynamicStyles;
