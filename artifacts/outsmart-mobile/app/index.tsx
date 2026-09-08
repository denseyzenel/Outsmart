import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, LockKeyhole } from 'lucide-react-native';
import { useGame } from '@/lib/game-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingScreen() {
  const { startSession, isLoaded, progress } = useGame();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isLoaded && progress.hasPlayed) {
      router.replace('/(tabs)/home');
    }
  }, [isLoaded, progress.hasPlayed]);

  if (!isLoaded || progress.hasPlayed) return null;

  const handleStart = () => {
    startSession('main');
    router.replace('/game/play');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 255, 170, 0.05)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.2, y: 0.5 }}
      />
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 24, paddingBottom: insets.bottom + 24 }
        ]}
      >
        <View style={styles.header}>
          <Typography style={styles.brand}>OUTSMART</Typography>
          <Typography variant="mono" style={styles.headerLabel}>V1.0.2 / BUILD 3</Typography>
        </View>

        <View style={styles.content}>
          <View style={styles.kickerWrap}>
            <View style={styles.signal} />
            <Typography variant="kicker">A GAME OF READS</Typography>
          </View>

          <Typography variant="display" style={styles.title}>
            Give me <Typography variant="display" style={{color: colors.primary}}>90 seconds.</Typography>{'\n'}
            I'll try to{'\n'}
            <Typography variant="display" style={{color: colors.mutedForeground}}>figure you out.</Typography>
          </Typography>

          <Typography style={styles.subtitle}>
            A rapid strategy game. Make the choice you would actually make, then try to become the choice the machine cannot expect.
          </Typography>

          <Button 
            onPress={handleStart} 
            size="lg" 
            style={styles.button}
            testID="button-start-game"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Typography style={{ fontFamily: 'SpaceGrotesk_700Bold', color: colors.background }}>START</Typography>
              <ArrowRight size={18} color={colors.background} />
            </View>
          </Button>

          <View style={styles.privacyWrap}>
            <LockKeyhole size={12} color={colors.mutedForeground} />
            <Typography variant="mono" style={styles.privacyText}>
              No account. No cloud. Just your patterns.
            </Typography>
          </View>
        </View>

        <View style={styles.orbitContainer}>
          <View style={styles.orbit}>
            <View style={styles.orbitInner} />
            <View style={styles.orbitDot} />
            <View style={styles.orbitContent}>
              <Typography variant="mono" style={{ fontSize: 10, letterSpacing: 2, color: colors.mutedForeground }}>MODEL STATE</Typography>
              <Typography variant="display" style={{ fontSize: 48, color: colors.primary, marginVertical: 8 }}>?</Typography>
              <Typography style={{ fontSize: 12, textAlign: 'center' }}>learning you{'\n'}in real time</Typography>
            </View>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    letterSpacing: 2,
    color: colors.foreground,
  },
  headerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.mutedForeground,
  },
  content: {
    marginTop: 64,
  },
  kickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  signal: {
    width: 60,
    height: 2,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 48,
    lineHeight: 52,
  },
  subtitle: {
    marginTop: 24,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  button: {
    marginTop: 40,
    alignSelf: 'flex-start',
  },
  privacyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  privacyText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.mutedForeground,
  },
  orbitContainer: {
    marginTop: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  orbit: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,255,170,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitInner: {
    position: 'absolute',
    top: 20, left: 20, right: 20, bottom: 20,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(0,255,170,0.12)',
  },
  orbitDot: {
    position: 'absolute',
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  orbitContent: {
    alignItems: 'center',
  }
});
