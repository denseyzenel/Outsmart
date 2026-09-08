import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '@/lib/game-context';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

export default function DataScreen() {
  const { progress } = useGame();
  const insets = useSafeAreaInsets();

  const model = progress.model;
  
  const metrics = [
    { label: "Risk Preference", value: model.riskPreference, desc: "Preference for bold over safe moves" },
    { label: "Consistency", value: model.consistency, desc: "Likelihood to stick with past patterns" },
    { label: "Hesitation", value: model.hesitation, desc: "Reaction to ambiguity and delay" },
    { label: "Reversals", value: model.reversals, desc: "Intentional contradiction of patterns" },
    { label: "Pattern Following", value: model.patternFollowing, desc: "Adherence to suggested sequences" },
    { label: "Left Bias", value: model.leftBias, desc: "Baseline positional preference" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { 
        paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 24,
        paddingBottom: insets.bottom + 100 
      }]}>
        <Typography variant="kicker">BEHAVIORAL MODEL</Typography>
        <Typography variant="display" style={styles.title}>The Data.</Typography>
        
        <Typography style={{ marginTop: 16, marginBottom: 32 }}>
          Observations: {model.observations.toString().padStart(3, "0")}
        </Typography>

        {metrics.map((metric, index) => {
          const val = Math.round(metric.value * 100);
          return (
            <Card key={index} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Typography variant="h3">{metric.label}</Typography>
                <Typography variant="mono" style={{ color: colors.primary }}>{val}%</Typography>
              </View>
              <Typography style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>{metric.desc}</Typography>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${val}%` }]} />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 40,
    lineHeight: 44,
    marginTop: 16,
  },
  metricCard: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  }
});
