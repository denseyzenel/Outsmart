import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface TypographyProps extends TextProps {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'kicker' | 'mono';
}

export function Typography({ variant = 'body', style, ...props }: TypographyProps) {
  const getStyles = () => {
    switch (variant) {
      case 'display': return styles.display;
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'body': return styles.body;
      case 'kicker': return styles.kicker;
      case 'mono': return styles.mono;
    }
  };

  return <Text style={[getStyles(), style]} {...props} />;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 48,
    lineHeight: 48,
    color: colors.foreground,
    letterSpacing: -1.5,
  },
  h1: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 32,
    lineHeight: 38,
    color: colors.foreground,
    letterSpacing: -1,
  },
  h2: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 24,
    lineHeight: 32,
    color: colors.foreground,
  },
  h3: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 18,
    color: colors.foreground,
  },
  body: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedForeground,
  },
  kicker: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  mono: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: colors.foreground,
  },
});
