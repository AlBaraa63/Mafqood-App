declare module '@expo/vector-icons' {
  import * as React from 'react';
  import { TextStyle, ViewStyle } from 'react-native';

  export interface IconProps {
    name: string | number;
    size?: number;
    color?: string;
    style?: TextStyle | ViewStyle;
  }

  export class MaterialCommunityIcons extends React.Component<IconProps> {
    static glyphMap: Record<string, number>;
  }
}

declare module 'react-native-gesture-handler';
