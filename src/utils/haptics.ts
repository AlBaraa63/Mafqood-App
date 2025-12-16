/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type FeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Trigger haptic feedback
 * @param type - Type of haptic feedback
 */
export async function hapticFeedback(type: FeedbackType = 'light'): Promise<void> {
  // Haptics only work on iOS and Android (not web)
  if (Platform.OS === 'web') return;

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail if haptics aren't available
    console.log('Haptics not available:', error);
  }
}

/**
 * Pre-defined haptic patterns for common actions
 */
export const haptics = {
  /** Light tap - for button presses */
  tap: () => hapticFeedback('light'),
  
  /** Medium impact - for significant actions */
  impact: () => hapticFeedback('medium'),
  
  /** Heavy impact - for important confirmations */
  heavy: () => hapticFeedback('heavy'),
  
  /** Success notification - for completed actions */
  success: () => hapticFeedback('success'),
  
  /** Warning notification - for alerts */
  warning: () => hapticFeedback('warning'),
  
  /** Error notification - for failures */
  error: () => hapticFeedback('error'),
  
  /** Selection feedback - for picker/toggle changes */
  selection: () => hapticFeedback('selection'),
};

export default haptics;
