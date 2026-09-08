import { useColorScheme } from 'react-native';
import { colors } from '@/constants/colors';

/**
 * Returns the design tokens for the current color scheme.
 *
 * OUTSMART is a dark-mode only app. We return the global colors.
 */
export function useColors() {
  return { ...colors, radius: 16 };
}
