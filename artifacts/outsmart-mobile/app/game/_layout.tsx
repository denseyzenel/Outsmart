import { Stack } from 'expo-router';
import { colors } from '@/constants/colors';

export default function GameLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="play" />
      <Stack.Screen name="results" />
      <Stack.Screen name="daily" />
    </Stack>
  );
}
