import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Typography } from './Typography';

export function ProgressBar({ current, total }: { current: number, total: number }) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
      <Typography variant="mono" style={styles.text}>
        {current.toString().padStart(2, "0")} / {total}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 100,
  },
  track: {
    flex: 1,
    height: 5,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  text: {
    fontSize: 10,
    color: colors.mutedForeground,
  }
});
