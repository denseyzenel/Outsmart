import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  type Progress, 
  STORAGE_KEY, 
  LEGACY_STORAGE_KEY, 
  VERSION, 
  INITIAL_MODEL, 
  normalizeDaily, 
  defaultProgress,
  todayKey
} from './game';

export async function loadProgress(): Promise<Progress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY) ?? await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (parsed.version !== VERSION && parsed.version !== 1) return defaultProgress();
    return {
      ...defaultProgress(),
      ...parsed,
      model: { ...INITIAL_MODEL, ...(parsed.model ?? {}) },
      daily: normalizeDaily(parsed.daily),
      version: VERSION,
      history: parsed.history ?? (parsed.lastResult ? [parsed.lastResult] : []),
      playsToday: parsed.playsToday?.date === todayKey() ? parsed.playsToday : { date: todayKey(), count: 0 },
      seenChallengeIds: parsed.seenChallengeIds ?? [],
    };
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(progress: Progress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to reset progress", e);
  }
}
