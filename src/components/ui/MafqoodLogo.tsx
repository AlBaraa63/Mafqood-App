/**
 * Mafqood Logo Component
 * Uses the official Mafqood logo image
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface MafqoodLogoProps {
  size?: number;
  showText?: boolean;
}

// Import the logo image
const logoImage = require('../../../assets/Mafqood.png');

export function MafqoodLogo({ size = 40, showText = false }: MafqoodLogoProps) {
  return (
    <Image 
      source={logoImage}
      style={[
        styles.logo,
        { 
          width: showText ? size * 2.5 : size, 
          height: size,
        }
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // Default styles
  },
});
