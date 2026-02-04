/**
 * Responsive Screen Container
 * Adaptive layout with safe areas and responsive padding
 */

import React from 'react';
import { View, ScrollView, ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive, useResponsiveSpacing } from '../../hooks/useResponsive';
import { colors } from '../../theme';

interface ResponsiveContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  centered?: boolean;
  maxWidth?: number;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  noPadding?: boolean;
  style?: ViewStyle;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  scrollable = true,
  centered = false,
  maxWidth,
  backgroundColor = colors.background.primary,
  edges = ['top', 'bottom'],
  noPadding = false,
  style,
  ...scrollViewProps
}) => {
  const { width, isTablet, isDesktop } = useResponsive();
  const responsiveSpacing = useResponsiveSpacing();

  const containerPadding = noPadding ? 0 : responsiveSpacing.lg;
  
  const contentMaxWidth = maxWidth || (isDesktop ? 1280 : isTablet ? 960 : width);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: containerPadding,
    paddingVertical: containerPadding,
    ...(centered && {
      maxWidth: contentMaxWidth,
      alignSelf: 'center',
      width: '100%',
    }),
  };

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        <ScrollView
          style={[{ flex: 1 }, style]}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      <View style={[{ flex: 1 }, contentStyle, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ResponsiveContainer;
