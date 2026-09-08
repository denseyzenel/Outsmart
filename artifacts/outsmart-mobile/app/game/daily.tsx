import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Infinity as InfinityIcon, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useGame } from '@/lib/game-context';
import { dailyChallengeFor, predictAdvanced, predict, updateModel, recordDailyCompletion } from '@/lib/game';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

export default function DailyScreen() {
  const { progress, updateStoredModel, updateDaily, billing } = useGame();
  const insets = useSafeAreaInsets();
  
  const daily = progress.daily;
  const challenge = dailyChallengeFor(daily.round);
  const [outcome, setOutcome] = useState<'won' | 'lost' | null>(null);

  const handleChoice = (choice: 0 | 1) => {
    if (outcome) return;

    const answer = {
      challengeId: challenge.id,
      category: challenge.category,
      choice,
      responseMs: 1000,
      wasHesitant: false,
      wasRapid: false,
      reversed: false,
    };

    const read = billing?.isPro
      ? predictAdvanced(challenge, progress.model, [], false)
      : predict(challenge, progress.model, [], false);

    const nextModel = updateModel(progress.model, answer);
    updateStoredModel(nextModel);

    const correct = choice === read.predictedChoice;
    
    if (correct) {
      setOutcome('lost');
      updateDaily({ ...daily, started: true, completed: true, round: 5 }); // End game
    } else {
      const nextFooled = daily.fooled + 1;
      const nextRound = daily.round + 1;
      if (nextFooled >= 5) {
        setOutcome('won');
        updateDaily(recordDailyCompletion(daily));
      } else {
        updateDaily({ ...daily, started: true, fooled: nextFooled, round: nextRound });
      }
    }
  };

  if (daily.completed && outcome === null) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 16 }]}>
          <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={20} color={colors.foreground} />
          </Button>
        </View>
        <View style={styles.centerContent}>
          <Typography variant="display" style={{ fontSize: 32, textAlign: 'center' }}>
            Daily sequence{'\n'}complete.
          </Typography>
          <Typography style={{ marginTop: 16, textAlign: 'center' }}>
            Current streak: {daily.streak} {daily.streak === 1 ? 'day' : 'days'}
          </Typography>
          <Button onPress={() => router.back()} style={{ marginTop: 32 }}>RETURN</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 16 }]}>
        <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Button>
        <Typography variant="mono" style={{ fontSize: 10, color: colors.accent }}>
          STREAK {daily.streak}
        </Typography>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Typography variant="kicker">DAILY CHALLENGE</Typography>
        <Typography variant="display" style={{ fontSize: 40, lineHeight: 44, marginTop: 16 }}>
          Break the read{'\n'}five times.
        </Typography>
        <Typography style={{ marginTop: 16 }}>
          One mistake ends the daily run. {5 - daily.fooled} to go.
        </Typography>

        <View style={styles.dots}>
          {[0,1,2,3,4].map(i => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                i < daily.fooled ? styles.dotFilled : {},
                outcome === 'lost' && i === daily.fooled ? styles.dotLost : {}
              ]} 
            />
          ))}
        </View>

        {outcome === null ? (
          <View style={styles.challengeArea}>
            <Typography variant="display" style={{ fontSize: 32, lineHeight: 36 }}>
              {challenge.prompt}{'\n'}
              <Typography variant="display" style={{ fontSize: 32, lineHeight: 36, color: colors.primary }}>{challenge.subtext}</Typography>
            </Typography>

            <View style={styles.optionsWrap}>
              {challenge.options.map((option, index) => (
                <Card 
                  key={option.title}
                  interactive
                  onPress={() => handleChoice(index as 0 | 1)}
                  style={styles.optionCard}
                >
                  <Typography variant="h3">{option.title}</Typography>
                  <Typography style={{ fontSize: 13, marginTop: 8 }}>{option.detail}</Typography>
                </Card>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.resultArea}>
            <Typography variant="display" style={{ fontSize: 32, color: outcome === 'won' ? colors.primary : colors.accent }}>
              {outcome === 'won' ? 'Sequence complete.' : 'The model read you.'}
            </Typography>
            <Button onPress={() => router.back()} size="lg" style={{ marginTop: 40 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.background }}>CONTINUE</Typography>
                <ArrowRight size={18} color={colors.background} />
              </View>
            </Button>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    padding: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    marginBottom: 40,
  },
  dot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotLost: {
    backgroundColor: colors.accent,
  },
  challengeArea: {
    marginTop: 16,
  },
  optionsWrap: {
    marginTop: 48,
    gap: 12,
  },
  optionCard: {
    minHeight: 100,
  },
  resultArea: {
    marginTop: 48,
  }
});
