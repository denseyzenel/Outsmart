import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { ViewStyle, StyleProp } from 'react-native';

export function XaviPixelCat({ size = 64, style }: { size?: number, style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" style={style}>
      <G fill="none" stroke="#59e1c3" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
        <Path d="M18 22V10l8 8h12l8-8v18"/>
        <Path d="M18 22h28v18H18z"/>
        <Path d="M24 40v12h18V40"/>
        <Path d="M24 52h-8v6h14"/>
        <Path d="M42 44h8v8h-4v6H34"/>
        <Path d="M50 48h6V34h-6"/>
      </G>
      <G fill="#59e1c3">
        <Rect x="24" y="26" width="4" height="4"/>
        <Rect x="36" y="26" width="4" height="4"/>
        <Rect x="30" y="32" width="4" height="4"/>
        <Rect x="22" y="34" width="8" height="2"/>
        <Rect x="34" y="34" width="8" height="2"/>
        <Rect x="18" y="16" width="4" height="4"/>
        <Rect x="42" y="16" width="4" height="4"/>
      </G>
    </Svg>
  );
}
