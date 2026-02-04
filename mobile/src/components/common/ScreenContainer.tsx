/**
 * Responsive Screen Container
 * Provides consistent padding and safe areas across all screens
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  /**
   * Safe area edges to respect
   */
  edges?: Edge[];
  /**
   * Additional custom styles
   */
  style?: ViewStyle;
  /**
   * Use ScrollView-safe padding (no bottom padding)
   */
  scrollable?: boolean;
  /**
   * Custom background color class
   */
  bgColor?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  edges = ['top', 'left', 'right'],
  style,
  scrollable = false,
  bgColor = 'bg-background-primary',
}) => {
  const paddingClass = scrollable 
    ? 'px-4 md:px-6 lg:px-8 pt-4 md:pt-6' 
    : 'px-4 md:px-6 lg:px-8 py-4 md:py-6';

  return (
    <SafeAreaView 
      edges={edges}
      className={`flex-1 ${bgColor}`}
      style={style}
    >
      <View className={paddingClass}>
        {children}
      </View>
    </SafeAreaView>
  );
};
