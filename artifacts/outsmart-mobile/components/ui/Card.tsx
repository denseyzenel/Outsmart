import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

interface CardProps extends TouchableOpacityProps {
  interactive?: boolean;
}

export function Card({ style, interactive, ...props }: CardProps) {
  const containerStyle = [styles.card, style];
  
  if (interactive) {
    const handlePress = (e: any) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if ((props as TouchableOpacityProps).onPress) {
        (props as TouchableOpacityProps).onPress!(e);
      }
    };

    return (
      <TouchableOpacity activeOpacity={0.8} style={containerStyle} {...(props as TouchableOpacityProps)} onPress={handlePress}>
        {props.children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(18, 19, 30, 0.76)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  }
});
