/**
 * Pull to Refresh Component
 * Custom pull-to-refresh with premium animations
 */

import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { colors } from '../../theme';

interface PullToRefreshProps extends Omit<RefreshControlProps, 'colors' | 'tintColor'> {
  color?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  color = colors.accent[500],
  ...props
}) => {
  return (
    <RefreshControl
      colors={[color]}
      tintColor={color}
      progressBackgroundColor={colors.neutral.white}
      {...props}
    />
  );
};

export default PullToRefresh;
