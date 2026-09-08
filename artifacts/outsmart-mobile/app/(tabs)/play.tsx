import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gauge, Activity, Search, Target, Tent, EyeOff, BrainCircuit, Scale, RotateCcw, Database, Crosshair, Compass, Sparkles, LockKeyhole } from 'lucide-react-native';
import { useGame } from '@/lib/game-context';
import { CATEGORY_DEFINITIONS, type CategoryKey } from '@/lib/categoryChallenges';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

function CategoryIcon({ categoryKey }: { categoryKey: string }) {
  switch (categoryKey) {
    case "pressure": return <Gauge size={24} color={colors.primary} />;
    case "would-you-rather": return <Activity size={24} color={colors.primary} />;
    case "detective": return <Search size={24} color={colors.primary} />;
    case "scifi": return <Target size={24} color={colors.primary} />;
    case "survival": return <Tent size={24} color={colors.primary} />;
    case "deception": return <EyeOff size={24} color={colors.primary} />;
    case "psychology": return <BrainCircuit size={24} color={colors.primary} />;
    case "moral-dilemmas": return <Scale size={24} color={colors.primary} />;
    case "time-travel": return <RotateCcw size={24} color={colors.primary} />;
    case "ai-consciousness": return <Database size={24} color={colors.primary} />;
    case "social-strategy": return <Crosshair size={24} color={colors.primary} />;
    case "alternate-reality": return <Compass size={24} color={colors.primary} />;
    case "cosmic-mystery": return <Sparkles size={24} color={colors.primary} />;
    default: return <Sparkles size={24} color={colors.primary} />;
  }
}

export default function CategoriesScreen() {
  const { startSession, billing, progress } = useGame();
  const insets = useSafeAreaInsets();

  const begin = (key: CategoryKey, access: "free" | "pro") => {
    if (access === "pro" && billing?.access !== "pro") {
      router.push("/pro");
      return;
    }
    if (startSession("main", key)) {
      router.push("/game/play");
    } else {
      router.push("/pro");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { 
        paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 24,
        paddingBottom: insets.bottom + 100 
      }]}>
        <Typography variant="kicker">CATEGORY LIBRARY / {String(CATEGORY_DEFINITIONS.length).padStart(2, "0")} WORLDS</Typography>
        <Typography variant="display" style={styles.title}>Choose your battleground.</Typography>
        <Typography style={styles.subtitle}>
          Every category contains ten shuffled rounds. Pressure Test, Would You Rather, and Detective are always free. PRO unlocks the remaining worlds.
        </Typography>

        <View style={styles.grid}>
          {CATEGORY_DEFINITIONS.map((category) => {
            const locked = category.access === "pro" && billing?.access !== "pro";
            const stateText = category.access === "free"
              ? "FREE FOREVER"
              : billing?.access === "pro"
                ? "PRO ACTIVE"
                : "PAID PRO ONLY";
            const categoryHistory = progress.history.filter((h) => h.categoryKey === category.key);
            const plays = categoryHistory.length;
            const bestFools = plays > 0 ? Math.max(...categoryHistory.map((h) => h.fools)) : 0;
            
            return (
              <Card 
                key={category.key} 
                interactive 
                onPress={() => begin(category.key, category.access)}
                style={[styles.card, locked && styles.cardLocked]}
              >
                <View style={styles.cardHeader}>
                  <CategoryIcon categoryKey={category.key} />
                  {locked && (
                    <View style={styles.proBadge}>
                      <LockKeyhole size={10} color={colors.primary} />
                      <Typography variant="mono" style={{ fontSize: 9, color: colors.primary }}>PRO</Typography>
                    </View>
                  )}
                </View>
                
                <Typography variant="h3" style={{ marginTop: 24 }}>{category.title}</Typography>
                <Typography style={{ fontSize: 13, marginTop: 8, flex: 1 }}>{category.description}</Typography>
                
                <View style={styles.cardFooter}>
                  <Typography variant="mono" style={{ fontSize: 9, color: colors.primary }}>{stateText}</Typography>
                  {plays > 0 && (
                    <Typography variant="mono" style={{ fontSize: 9, color: colors.mutedForeground }}>{plays} PLAYS / BEST {bestFools}</Typography>
                  )}
                </View>
              </Card>
            );
          })}
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
  title: {
    fontSize: 40,
    lineHeight: 44,
    marginTop: 16,
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 32,
  },
  grid: {
    gap: 16,
  },
  card: {
    minHeight: 200,
    flexDirection: 'column',
  },
  cardLocked: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(0,255,170,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,170,0.4)',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  }
});
