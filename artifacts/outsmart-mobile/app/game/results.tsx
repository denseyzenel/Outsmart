import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, ArrowRight, RotateCcw, LayoutGrid } from 'lucide-react-native';
import { useGame } from '@/lib/game-context';
import { formatDuration } from '@/lib/game';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

export default function ResultsScreen() {
  const { progress, startSession } = useGame();
  const insets = useSafeAreaInsets();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const result = progress.lastResult;
  if (!result && mounted) {
    router.replace('/(tabs)/home');
    return null;
  }
  if (!result) return <View style={styles.container} />;

  const isWin = result.fools >= (result.rounds / 2);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { 
        paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 24,
        paddingBottom: insets.bottom + 100 
      }]}>
        <Typography variant="kicker">SESSION COMPLETE</Typography>
        <Typography variant="display" style={{ fontSize: 48, lineHeight: 52, marginTop: 16 }}>
          {isWin ? "You broke the model." : "The model read you."}
        </Typography>

        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View>
              <Typography variant="kicker">YOU</Typography>
              <Typography variant="mono" style={{ fontSize: 48, color: colors.primary }}>{result.score}</Typography>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Typography variant="kicker">AI</Typography>
              <Typography variant="mono" style={{ fontSize: 48, color: colors.accent }}>{result.aiScore}</Typography>
            </View>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Typography variant="mono" style={{ fontSize: 24, color: colors.foreground }}>{result.aiAccuracy}%</Typography>
            <Typography variant="mono" style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>AI ACCURACY</Typography>
          </Card>
          <Card style={styles.statBox}>
            <Typography variant="mono" style={{ fontSize: 24, color: colors.foreground }}>{result.fools}</Typography>
            <Typography variant="mono" style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>FOOLS</Typography>
          </Card>
          <Card style={styles.statBox}>
            <Typography variant="mono" style={{ fontSize: 24, color: colors.foreground }}>{formatDuration(result.durationMs)}</Typography>
            <Typography variant="mono" style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>DURATION</Typography>
          </Card>
          <Card style={styles.statBox}>
            <Typography variant="mono" style={{ fontSize: 24, color: colors.accent }}>LVL {result.level}</Typography>
            <Typography variant="mono" style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 4 }}>PROFILE</Typography>
          </Card>
        </View>

        <View style={styles.observationsWrap}>
          <Typography variant="kicker" style={{ marginBottom: 16 }}>MODEL OBSERVATIONS</Typography>
          {result.observations.map((obs, i) => (
            <View key={i} style={styles.obsItem}>
              <Sparkles size={16} color={colors.primary} />
              <Typography style={{ flex: 1 }}>{obs}</Typography>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button 
            onPress={() => {
              if (startSession("main")) router.replace('/game/play');
              else router.replace('/pro');
            }}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <RotateCcw size={18} color={colors.background} />
              <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.background }}>PLAY AGAIN</Typography>
            </View>
          </Button>
          <Button variant="secondary" onPress={() => router.replace('/(tabs)/home')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LayoutGrid size={18} color={colors.foreground} />
              <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.foreground }}>RETURN HOME</Typography>
            </View>
          </Button>
        </View>
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
  scoreCard: {
    marginTop: 32,
    backgroundColor: 'rgba(18,19,30,0.9)',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    alignItems: 'center',
  },
  observationsWrap: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'rgba(0,255,170,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,170,0.2)',
  },
  obsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  actions: {
    marginTop: 48,
  }
});
