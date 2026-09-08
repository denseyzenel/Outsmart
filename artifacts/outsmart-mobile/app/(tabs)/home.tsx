import React from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, ChevronRight, Play, Zap, BarChart3, RotateCcw, Crown, ArrowRight } from 'lucide-react-native';
import { useGame } from '@/lib/game-context';
import { levelFor } from '@/lib/game';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

function AppHeader() {
  const { progress, billing } = useGame();
  const isPro = billing?.isPro;
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 16 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity style={[styles.tierBadge, isPro && styles.tierBadgePro]} onPress={() => router.push('/pro')}>
          <Crown size={12} color={isPro ? colors.primary : colors.mutedForeground} />
          <Typography variant="mono" style={{ fontSize: 10, color: isPro ? colors.primary : colors.mutedForeground }}>
            {billing?.access === 'trial' ? `PRO TRIAL / ${billing.trialDaysRemaining}D` : isPro ? 'PRO' : 'FREE'}
          </Typography>
        </TouchableOpacity>
        <Typography style={styles.brand}>OUTSMART</Typography>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Typography variant="mono" style={{ fontSize: 10, color: colors.mutedForeground }}>
          LOCAL // {progress.sessions.toString().padStart(2, "0")}
        </Typography>
        <View style={styles.statusDot} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { progress, startSession, billing } = useGame();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 390;

  const accuracy = progress.aiPredictions ? Math.round((progress.aiCorrect / progress.aiPredictions) * 100) : 0;
  const predictability = progress.lastResult?.predictability ?? 0;
  const level = levelFor(progress.fools);
  
  const currentRead = progress.sessions === 0
    ? "The model is waiting for its first signal."
    : progress.model.reversals > 0.58
      ? "You resist the obvious, especially when watched."
      : progress.model.riskPreference > 0.58
        ? "You reach for the uncertain edge."
        : "You build a pattern before you break it.";

  const play = () => {
    if (startSession("main")) router.push('/game/play');
    else router.push('/pro');
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.titleSection}>
          <View style={styles.titleCopy}>
            <Typography variant="kicker" style={{ marginBottom: 8 }}>
              {progress.sessions ? `SESSION ${progress.sessions.toString().padStart(2, "0")} / PROFILE IN PROGRESS` : "PROFILE NOT YET OBSERVED"}
            </Typography>
            <Typography variant="h1">Your mind,</Typography>
            <Typography variant="h1" style={{color: colors.mutedForeground}}>under observation.</Typography>
          </View>
          {!compact ? <View style={styles.levelCopy}>
            <Typography variant="mono" style={{ fontSize: 24, color: colors.accent }}>LVL {level.level.toString().padStart(2, "0")}</Typography>
            <Typography variant="mono" style={{ fontSize: 10, color: colors.mutedForeground }}>{level.name}</Typography>
          </View> : null}
        </View>

        <Card style={styles.readCard}>
          <View style={styles.readHeader}>
            <View style={styles.readCopy}>
              <Typography variant="kicker">CURRENT READ</Typography>
              <Typography variant="h2" style={[styles.currentRead, compact && styles.currentReadCompact]}>{currentRead}</Typography>
            </View>
            <Sparkles size={24} color={colors.accent} style={styles.readIcon} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Typography variant="mono" style={{ fontSize: 24, color: colors.primary }}>{accuracy}%</Typography>
              <Typography variant="mono" style={styles.statLabel}>AI Accuracy</Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="mono" style={{ fontSize: 24, color: colors.foreground }}>{predictability}%</Typography>
              <Typography variant="mono" style={styles.statLabel}>Predictability</Typography>
            </View>
            <View style={styles.statItem}>
              <Typography variant="mono" style={{ fontSize: 24, color: colors.accent }}>{level.level.toString().padStart(2, "0")}</Typography>
              <Typography variant="mono" style={styles.statLabel}>Profile Level</Typography>
            </View>
          </View>
        </Card>

        <View style={styles.actionRow}>
          <Button onPress={play} style={{ flex: 1 }}>
            <View style={styles.btnContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Play size={16} fill={colors.background} color={colors.background} />
                <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.background }}>PLAY</Typography>
              </View>
              <ArrowRight size={16} color={colors.background} />
            </View>
          </Button>
          <Button variant="amber" onPress={() => router.push('/game/daily')} style={{ flex: 1 }}>
             <View style={styles.btnContent}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color={colors.background} />
                <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.background }}>DAILY</Typography>
              </View>
              <Typography variant="mono" style={{ fontSize: 10, color: colors.background }}>
                {progress.daily.completed ? "DONE" : `${progress.daily.fooled} / 5`}
              </Typography>
            </View>
          </Button>
        </View>

        <Card interactive onPress={() => router.navigate('/(tabs)/play')} style={styles.navCard}>
          <View style={{ flex: 1 }}>
            <Typography variant="kicker">CHOOSE A CATEGORY</Typography>
            <Typography variant="h3" style={{ marginTop: 8 }}>Train a particular kind of thinking</Typography>
            <Typography style={{ fontSize: 13, marginTop: 4 }}>Three free worlds. Ten rounds each.</Typography>
          </View>
          <ChevronRight size={20} color={colors.primary} />
        </Card>

        <View style={styles.gridRow}>
          <Card interactive onPress={() => router.navigate('/(tabs)/data')} style={[styles.navCard, { flex: 1, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <BarChart3 size={24} color={colors.primary} />
              <ChevronRight size={16} color={colors.mutedForeground} />
            </View>
            <View style={{ marginTop: 24 }}>
              <Typography variant="h3">YOUR DATA</Typography>
              <Typography style={{ fontSize: 12, marginTop: 4 }}>See what the model thinks it knows.</Typography>
            </View>
          </Card>
          
          <Card interactive onPress={play} style={[styles.navCard, { flex: 1, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <RotateCcw size={24} color={colors.accent} />
              <ChevronRight size={16} color={colors.mutedForeground} />
            </View>
            <View style={{ marginTop: 24 }}>
              <Typography variant="h3">REPLAY</Typography>
              <Typography style={{ fontSize: 12, marginTop: 4 }}>Try to break your last read.</Typography>
            </View>
          </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    letterSpacing: 2,
    color: colors.foreground,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tierBadgePro: {
    borderColor: 'rgba(0,255,170,0.4)',
    backgroundColor: 'rgba(0,255,170,0.08)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  content: {
    padding: 20,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  levelCopy: {
    flexShrink: 0,
    alignItems: 'flex-end',
    paddingTop: 28,
  },
  readCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(18, 19, 30, 0.9)',
  },
  readHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  readCopy: {
    flex: 1,
    minWidth: 0,
  },
  currentRead: {
    marginTop: 12,
    flexShrink: 1,
  },
  currentReadCompact: {
    fontSize: 21,
    lineHeight: 28,
  },
  readIcon: {
    flexShrink: 0,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 24,
    paddingTop: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    marginTop: 4,
    color: colors.mutedForeground,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  }
});
