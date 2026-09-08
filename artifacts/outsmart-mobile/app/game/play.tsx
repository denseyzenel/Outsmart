import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Animated as RNAnimated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LockKeyhole, ArrowRight, Check, X } from 'lucide-react-native';
import { useGame } from '@/lib/game-context';
import { CATEGORY_DEFINITIONS } from '@/lib/categoryChallenges';
import { 
  challengeById, 
  predict, 
  predictAdvanced, 
  updateModel, 
  type PredictionRead,
  type Challenge
} from '@/lib/game';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card } from '@/components/ui/Card';
import { XaviPixelCat } from '@/components/XaviPixelCat';
import { colors } from '@/constants/colors';

const XAVI_WIN_REMARKS = [
  "Xavi says the machine predicted you perfectly, except for the part where it did not.",
  "Xavi recommends updating that confidence from impressive to adorable.",
  "You changed the pattern. Xavi says the AI can keep the spreadsheet.",
  "Another flawless prediction from the machine that chose the wrong answer. Xavi is delighted.",
  "The algorithm had a theory. You had other plans. Xavi brought snacks.",
  "Xavi says to put that in the model and overfit it.",
  "Xavi would explain your strategy, but confusion is currently winning.",
  "The AI's confidence was inspiring. Its prediction was less so. Xavi approves.",
  "One hundred points for you. One existential recalculation for the AI.",
  "Xavi has reviewed the prediction and diagnosed it with being wrong.",
];

function makeAnswer(challenge: Challenge, choice: 0 | 1, startedAt: number, previous?: 0 | 1) {
  const responseMs = Math.max(120, Math.round(performance.now() - startedAt));
  return {
    challengeId: challenge.id,
    category: challenge.category,
    choice,
    responseMs,
    wasHesitant: responseMs > 1800,
    wasRapid: responseMs < 700,
    reversed: previous !== undefined && previous !== choice,
  };
}

export default function PlayScreen() {
  const { session, startSession, setSession, updateStoredModel, finishSession, billing } = useGame();
  const insets = useSafeAreaInsets();
  
  const [phase, setPhase] = useState<"challenge" | "prediction-result">("challenge");
  const [pending, setPending] = useState<PredictionRead | null>(null);
  const [predictionOutcome, setPredictionOutcome] = useState<boolean | null>(null);
  const questionStartedAt = useRef(performance.now());

  useEffect(() => {
    if (!session || session.mode !== "main") startSession("main");
  }, [session, startSession]);

  useEffect(() => {
    questionStartedAt.current = performance.now();
  }, [session?.currentIndex, phase]);

  if (!session || session.mode !== "main") {
    return <View style={styles.container} />;
  }

  const displayIndex = phase === "challenge" ? session.currentIndex : session.currentIndex - 1;
  const challenge = challengeById(session.challengeIds[displayIndex]);
  
  if (!challenge) {
    router.replace('/game/results');
    return null;
  }

  const chooseChallenge = (choice: 0 | 1) => {
    if (phase !== "challenge") return;
    const answer = makeAnswer(challenge, choice, questionStartedAt.current, session.answers.at(-1)?.choice);
    const read = billing?.isPro
      ? predictAdvanced(challenge, session.model, session.answers, session.currentIndex === 7)
      : predict(challenge, session.model, session.answers, session.currentIndex === 7);
    
    const nextAnswers = [...session.answers, answer];
    const nextModel = updateModel(session.model, answer, session.answers.at(-1)?.choice);
    const nextIndex = session.currentIndex + 1;
    const correct = choice === read.predictedChoice;
    const userWon = !correct;
    const aiWon = correct;
    
    const prediction = {
      challengeId: challenge.id,
      predictedChoice: read.predictedChoice,
      confidence: read.confidence,
      secondOrder: read.secondOrder,
      correct,
    };
    
    const nextSession = {
      ...session,
      currentIndex: nextIndex,
      answers: nextAnswers,
      predictions: [...session.predictions, prediction],
      model: nextModel,
      fools: session.fools + (!correct ? 1 : 0),
      aiCorrect: session.aiCorrect + (correct ? 1 : 0),
      secondOrderSeen: session.secondOrderSeen || read.secondOrder,
      score: session.score + (userWon ? 100 : 0),
      aiScore: (session.aiScore ?? 0) + (aiWon ? 100 : 0),
    };
    
    updateStoredModel(nextModel);
    setSession(nextSession);
    setPending(read);
    setPredictionOutcome(correct);
    setPhase("prediction-result");
  };

  const continueAfterPrediction = () => {
    if (!session) return;
    if (session.currentIndex >= session.challengeIds.length) {
      finishSession(session);
      router.replace('/game/results');
      return;
    }
    setPending(null);
    setPredictionOutcome(null);
    setPhase("challenge");
  };

  const categoryDef = session.categoryKey ? CATEGORY_DEFINITIONS.find(c => c.key === session.categoryKey) : null;
  const worldTitle = categoryDef ? categoryDef.title : "MIXED WORLD";
  const chosenTitle = challenge.options[session.answers.at(-1)?.choice ?? 0].title;
  const predictedTitle = pending ? challenge.options[pending.predictedChoice].title : "";
  
  const isMystery = challenge.category === "MYSTERY";
  const catDisplay = challenge.category.replace(/-/g, " ");

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 16 }]}>
        <Typography variant="kicker">
          {phase === "challenge" 
            ? (session.currentIndex === session.mysteryDropIndex ? "SIGNAL INTERRUPTED" : `ROUND ${session.currentIndex + 1} / ${worldTitle.toUpperCase()}`) 
            : `ROUND ${session.currentIndex} RESULT`}
        </Typography>
        <View style={styles.scoreRow}>
          <Typography variant="mono" style={{ fontSize: 10, color: colors.primary }}>YOU {session.score}</Typography>
          <Typography variant="mono" style={{ fontSize: 10, color: colors.accent }}>AI {session.aiScore ?? 0}</Typography>
          <ProgressBar current={Math.min(session.currentIndex + (phase === "challenge" ? 1 : 0), session.challengeIds.length)} total={session.challengeIds.length} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {phase === "challenge" ? (
          <View style={[styles.challengeContainer, isMystery && styles.mysteryContainer]}>
            <View style={styles.categoryWrap}>
              <Typography variant="mono" style={{ fontSize: 11, color: isMystery ? colors.accent : colors.mutedForeground }}>
                {isMystery ? "UNSCHEDULED EVENT / RULES INTACT" : `${worldTitle} / ${catDisplay} / NO WRONG ANSWER`}
              </Typography>
            </View>

            <View style={styles.lockedBadge}>
              <LockKeyhole size={12} color={colors.primary} />
              <Typography variant="mono" style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>
                PREDICTION LOCKED. AWAITING YOUR CHOICE.
              </Typography>
            </View>

            <Typography variant="display" style={{ fontSize: 36, lineHeight: 40, marginTop: 32 }}>
              {challenge.prompt}{'\n'}
              <Typography variant="display" style={{ fontSize: 36, lineHeight: 40, color: colors.primary }}>{challenge.subtext}</Typography>
            </Typography>

            <Typography style={{ marginTop: 24, fontSize: 14 }}>
              Choose quickly. The timing is part of the signal. The machine has already locked its prediction for this round.
            </Typography>

            <View style={styles.optionsWrap}>
              {challenge.options.map((option, index) => (
                <Card 
                  key={option.title}
                  interactive
                  onPress={() => chooseChallenge(index as 0 | 1)}
                  style={styles.optionCard}
                >
                  <Typography variant="kicker">{option.signal}</Typography>
                  <Typography variant="h3" style={{ marginTop: 12 }}>{option.title}</Typography>
                  <Typography style={{ fontSize: 13, marginTop: 8 }}>{option.detail}</Typography>
                </Card>
              ))}
            </View>
          </View>
        ) : pending && predictionOutcome !== null ? (
          <View style={styles.resultContainer}>
            <Card style={styles.resultCard}>
              <View style={[styles.resultIcon, predictionOutcome ? styles.confirmedIcon : styles.brokenIcon]}>
                {predictionOutcome
                  ? <Check size={30} color={colors.primary} />
                  : <X size={30} color={colors.accent} />}
              </View>

              <Typography variant="kicker" style={styles.resultKicker}>
                {predictionOutcome ? "PREDICTION CONFIRMED" : "PREDICTION BROKEN"}
              </Typography>
              <Typography variant="display" style={styles.resultTitle}>
                {predictionOutcome ? "I knew it." : pending.secondOrder ? "You got me." : "You fooled me."}
              </Typography>
              <Typography variant="mono" style={[styles.pointsAward, { color: predictionOutcome ? colors.accent : colors.primary }]}>
                {predictionOutcome ? "AI +100" : "YOU +100"}
              </Typography>

              <View style={styles.scoreboard}>
                <View style={[styles.scoreCard, styles.userScoreCard]}>
                  <Typography variant="mono" style={{ fontSize: 10, color: colors.primary }}>YOUR SCORE</Typography>
                  <Typography variant="mono" style={styles.scoreValue}>{session.score}</Typography>
                </View>
                <View style={[styles.scoreCard, styles.aiScoreCard]}>
                  <Typography variant="mono" style={{ fontSize: 10, color: colors.accent }}>AI SCORE</Typography>
                  <Typography variant="mono" style={styles.scoreValue}>{session.aiScore ?? 0}</Typography>
                </View>
              </View>

              <View style={styles.choiceGrid}>
                <View style={styles.choiceSummary}>
                  <Typography variant="mono" style={styles.choiceLabel}>YOU CHOSE</Typography>
                  <Typography variant="h3" style={styles.choiceValue}>{chosenTitle}</Typography>
                </View>
                <View style={[styles.choiceSummary, styles.predictionSummary]}>
                  <Typography variant="mono" style={[styles.choiceLabel, { color: colors.accent }]}>AI HAD PREDICTED</Typography>
                  <Typography variant="h3" style={styles.choiceValue}>{predictedTitle}</Typography>
                </View>
              </View>

              <Typography style={styles.resultExplanation}>
                {predictionOutcome
                  ? `The engine called it at ${pending.confidence}% confidence. Your next choice can still break the pattern.`
                  : "You broke the pattern. The machine did not see that choice coming."}
              </Typography>

              {!predictionOutcome ? (
                <View style={styles.xaviWrap}>
                  <XaviPixelCat size={88} />
                  <View style={styles.xaviCopy}>
                    <Typography variant="mono" style={styles.xaviLabel}>XAVI</Typography>
                    <Typography style={styles.xaviRemark}>{XAVI_WIN_REMARKS[(session.currentIndex - 1) % XAVI_WIN_REMARKS.length]}</Typography>
                  </View>
                </View>
              ) : null}

              <View style={styles.confidenceRow}>
                <Typography variant="mono" style={styles.confidenceLabel}>AI CONFIDENCE</Typography>
                <Typography variant="mono" style={styles.confidenceValue}>{pending.confidence}%</Typography>
              </View>
            </Card>

            <Button onPress={continueAfterPrediction} size="lg" style={{ marginTop: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.background }}>
                  {pending.secondOrder ? "CONTINUE THE FIGHT" : "NEXT READ"}
                </Typography>
                <ArrowRight size={18} color={colors.background} />
              </View>
            </Button>
          </View>
        ) : null}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    padding: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  challengeContainer: {
    paddingVertical: 16,
  },
  mysteryContainer: {
    backgroundColor: 'rgba(255, 136, 0, 0.05)',
    marginHorizontal: -24,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 136, 0, 0.2)',
  },
  categoryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 170, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 170, 0.3)',
    alignSelf: 'flex-start',
  },
  optionsWrap: {
    marginTop: 48,
    gap: 12,
  },
  optionCard: {
    minHeight: 128,
  },
  resultContainer: {
    paddingVertical: 16,
  },
  resultCard: {
    alignItems: 'stretch',
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  confirmedIcon: {
    backgroundColor: 'rgba(0,255,170,0.15)',
  },
  brokenIcon: {
    backgroundColor: 'rgba(255,136,0,0.15)',
  },
  resultKicker: {
    textAlign: 'center',
    marginTop: 28,
  },
  resultTitle: {
    textAlign: 'center',
    fontSize: 40,
    lineHeight: 44,
    marginTop: 12,
  },
  pointsAward: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 12,
  },
  scoreboard: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  scoreCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  userScoreCard: {
    borderColor: 'rgba(0,255,170,0.4)',
    backgroundColor: 'rgba(0,255,170,0.05)',
  },
  aiScoreCard: {
    borderColor: 'rgba(255,136,0,0.4)',
    backgroundColor: 'rgba(255,136,0,0.05)',
  },
  scoreValue: {
    fontSize: 24,
    marginTop: 4,
  },
  choiceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  choiceSummary: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  predictionSummary: {
    borderColor: 'rgba(255,136,0,0.4)',
    backgroundColor: 'rgba(255,136,0,0.05)',
  },
  choiceLabel: {
    fontSize: 9,
    color: colors.mutedForeground,
  },
  choiceValue: {
    fontSize: 14,
    marginTop: 8,
  },
  resultExplanation: {
    textAlign: 'center',
    marginTop: 20,
  },
  xaviWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  xaviCopy: {
    flex: 1,
    minWidth: 0,
  },
  xaviLabel: {
    fontSize: 10,
    color: colors.primary,
    marginBottom: 4,
  },
  xaviRemark: {
    fontSize: 13,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confidenceLabel: {
    fontSize: 11,
    color: colors.mutedForeground,
  },
  confidenceValue: {
    fontSize: 18,
    color: colors.primary,
  },
});
