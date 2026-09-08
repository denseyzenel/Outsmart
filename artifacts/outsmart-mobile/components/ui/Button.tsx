import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  children, 
  style, 
  disabled,
  onPress,
  ...props 
}: ButtonProps) {
  
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress(e);
  };
  
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    const base: StyleProp<ViewStyle>[] = [styles.container, styles[size]];
    if (disabled || loading) base.push(styles.disabled);
    switch(variant) {
      case 'primary': base.push(styles.primary); break;
      case 'secondary': base.push(styles.secondary); break;
      case 'outline': base.push(styles.outline); break;
      case 'ghost': base.push(styles.ghost); break;
      case 'amber': base.push(styles.amber); break;
    }
    return base;
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const base: StyleProp<TextStyle>[] = [styles.text];
    switch(variant) {
      case 'primary': base.push(styles.textPrimary); break;
      case 'secondary': base.push(styles.textSecondary); break;
      case 'outline': base.push(styles.textOutline); break;
      case 'ghost': base.push(styles.textGhost); break;
      case 'amber': base.push(styles.textAmber); break;
    }
    return base;
  };

  return (
    <TouchableOpacity 
      style={[getContainerStyle(), style]} 
      disabled={disabled || loading} 
      activeOpacity={0.8}
      onPress={handlePress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.background : colors.primary} />
      ) : (
        <View style={styles.content}>
          {typeof children === 'string' ? (
            <Text style={getTextStyle()}>{children}</Text>
          ) : children}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { height: 36, paddingHorizontal: 16 },
  md: { height: 48, paddingHorizontal: 24 },
  lg: { height: 56, paddingHorizontal: 32 },
  
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  amber: { backgroundColor: colors.accent },
  
  text: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  textPrimary: { color: colors.primaryForeground },
  textSecondary: { color: colors.secondaryForeground },
  textOutline: { color: colors.foreground },
  textGhost: { color: colors.foreground },
  textAmber: { color: colors.accentForeground },
  
  disabled: { opacity: 0.6 },
});
