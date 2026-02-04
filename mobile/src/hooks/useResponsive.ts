/**
 * Advanced Responsive Hook
 * Provides comprehensive screen size detection and adaptive styling
 */

import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Orientation = 'portrait' | 'landscape';

interface ResponsiveConfig {
  screenSize: ScreenSize;
  orientation: Orientation;
  width: number;
  height: number;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  scale: number;
  fontScale: number;
}

// Breakpoints (mobile-first approach)
const BREAKPOINTS = {
  xs: 0,    // Tiny phones
  sm: 360,  // Small phones (iPhone SE, Galaxy S10)
  md: 390,  // Medium phones (iPhone 13/14 Pro)
  lg: 428,  // Large phones (iPhone 14 Pro Max)
  xl: 768,  // Tablets
  '2xl': 1024, // Large tablets / Desktop
};

const getScreenSize = (width: number): ScreenSize => {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
};

const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? 'landscape' : 'portrait';
};

export const useResponsive = (): ResponsiveConfig => {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }) => {
        setDimensions(window);
      }
    );

    return () => subscription?.remove();
  }, []);

  const { width, height, scale, fontScale } = dimensions;
  const screenSize = getScreenSize(width);
  const orientation = getOrientation(width, height);

  return {
    screenSize,
    orientation,
    width,
    height,
    isSmallDevice: screenSize === 'xs' || screenSize === 'sm',
    isMediumDevice: screenSize === 'md' || screenSize === 'lg',
    isLargeDevice: screenSize === 'xl' || screenSize === '2xl',
    isTablet: width >= BREAKPOINTS.xl && width < BREAKPOINTS['2xl'],
    isDesktop: width >= BREAKPOINTS['2xl'],
    scale,
    fontScale,
  };
};

/**
 * Responsive value selector
 * Returns appropriate value based on screen size
 */
export const useResponsiveValue = <T,>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
  default: T;
}): T => {
  const { screenSize } = useResponsive();
  
  // Return the most specific value available for current screen size
  if (values[screenSize] !== undefined) return values[screenSize]!;
  
  // Fallback logic for missing breakpoints
  const fallbackOrder: ScreenSize[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = fallbackOrder.indexOf(screenSize);
  
  for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
    const size = fallbackOrder[i];
    if (values[size] !== undefined) return values[size]!;
  }
  
  return values.default;
};

/**
 * Spacing calculator based on screen size
 */
export const useResponsiveSpacing = () => {
  const { screenSize } = useResponsive();
  
  const multipliers: Record<ScreenSize, number> = {
    'xs': 0.8,
    'sm': 0.9,
    'md': 1.0,
    'lg': 1.1,
    'xl': 1.2,
    '2xl': 1.4,
  };
  
  const multiplier = multipliers[screenSize];
  
  return {
    xs: 4 * multiplier,
    sm: 8 * multiplier,
    md: 12 * multiplier,
    lg: 16 * multiplier,
    xl: 20 * multiplier,
    '2xl': 24 * multiplier,
    '3xl': 32 * multiplier,
    '4xl': 40 * multiplier,
    multiplier,
  };
};

/**
 * Font size calculator with accessibility support
 */
export const useResponsiveFontSize = () => {
  const { screenSize, fontScale } = useResponsive();
  
  const baseSizes: Record<ScreenSize, number> = {
    'xs': 0.85,
    'sm': 0.9,
    'md': 1.0,
    'lg': 1.05,
    'xl': 1.1,
    '2xl': 1.15,
  };
  
  const baseMultiplier = baseSizes[screenSize];
  const accessibilityMultiplier = Math.min(fontScale, 1.3); // Cap at 130%
  
  return {
    xs: 12 * baseMultiplier * accessibilityMultiplier,
    sm: 14 * baseMultiplier * accessibilityMultiplier,
    md: 16 * baseMultiplier * accessibilityMultiplier,
    lg: 18 * baseMultiplier * accessibilityMultiplier,
    xl: 22 * baseMultiplier * accessibilityMultiplier,
    '2xl': 26 * baseMultiplier * accessibilityMultiplier,
    '3xl': 32 * baseMultiplier * accessibilityMultiplier,
    '4xl': 38 * baseMultiplier * accessibilityMultiplier,
    multiplier: baseMultiplier * accessibilityMultiplier,
  };
};

/**
 * Grid system for responsive layouts
 */
export const useResponsiveGrid = (columns: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
  default: number;
}) => {
  const { width } = useResponsive();
  const numColumns = useResponsiveValue(columns);
  const spacing = useResponsiveSpacing();
  
  const gutterSize = spacing.md;
  const availableWidth = width - (gutterSize * 2);
  const columnWidth = (availableWidth - (gutterSize * (numColumns - 1))) / numColumns;
  
  return {
    numColumns,
    columnWidth,
    gutterSize,
  };
};

export default useResponsive;
