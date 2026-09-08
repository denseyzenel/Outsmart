import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";
import { GameProvider } from "@/lib/game-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useFonts as useSpaceFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { useFonts as useMonoFonts, DMMono_400Regular, DMMono_500Medium } from "@expo-google-fonts/dm-mono";
import { useFonts as useManropeFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import { colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [spaceLoaded, spaceError] = useSpaceFonts({ SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold });
  const [monoLoaded, monoError] = useMonoFonts({ DMMono_400Regular, DMMono_500Medium });
  const [manropeLoaded, manropeError] = useManropeFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold });

  const [revCatInit, setRevCatInit] = useState(false);

  useEffect(() => {
    try {
      initializeRevenueCat();
    } catch (e) {
      console.warn("Failed to init revenue cat", e);
    }
    setRevCatInit(true);
  }, []);

  useEffect(() => {
    const fontsLoaded = spaceLoaded && monoLoaded && manropeLoaded;
    const fontsError = spaceError || monoError || manropeError;
    if ((Platform.OS === "web" || fontsLoaded || fontsError) && revCatInit) {
      SplashScreen.hideAsync();
    }
  }, [spaceLoaded, monoLoaded, manropeLoaded, spaceError, monoError, manropeError, revCatInit]);

  const fontsLoaded = spaceLoaded && monoLoaded && manropeLoaded;
  const fontsError = spaceError || monoError || manropeError;

  if (Platform.OS !== "web" && !fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
          <QueryClientProvider client={queryClient}>
            <SubscriptionProvider>
              <GameProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ 
                  headerShown: false, 
                  contentStyle: { backgroundColor: colors.background }
                }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="game" options={{ headerShown: false }} />
                  <Stack.Screen name="pro" options={{ presentation: 'modal' }} />
                </Stack>
              </GameProvider>
            </SubscriptionProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
