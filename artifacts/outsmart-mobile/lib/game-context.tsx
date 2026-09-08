import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSubscription } from "./revenuecat";
import { 
  type Progress, 
  type Session, 
  type Mode, 
  type BehaviorModel, 
  type DailyState,
  createSession,
  buildResult,
  mergeCompletedSession,
  defaultProgress,
} from "./game";
import { CATEGORY_DEFINITIONS, type CategoryKey } from "./categoryChallenges";
import { loadProgress, saveProgress, resetProgress as storageResetProgress } from "./storage";

export type BillingStatus = {
  isPro: boolean;
  access: "trial" | "pro" | "free";
  trialDaysRemaining: number;
};

type GameContextValue = {
  progress: Progress;
  session: Session | null;
  startSession: (mode?: Mode, categoryKey?: CategoryKey) => boolean;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  updateStoredModel: (model: BehaviorModel) => void;
  finishSession: (session: Session) => void;
  updateDaily: (daily: DailyState) => void;
  resetApp: () => void;
  billing: BillingStatus | null;
  refreshBilling: () => Promise<void>;
  isLoaded: boolean;
};

const GameContext = createContext<GameContextValue | null>(null);
const FREE_GAMES_PER_DAY = 3;

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();

  const billing: BillingStatus = {
    isPro: isSubscribed,
    access: isSubscribed ? "pro" : "free",
    trialDaysRemaining: 0,
  };

  useEffect(() => {
    async function init() {
      const p = await loadProgress();
      setProgress(p);
      setIsLoaded(true);
    }
    init();
  }, []);

  const persist = (next: Progress) => {
    setProgress(next);
    saveProgress(next);
  };

  const startSession = (mode: Mode = "main", categoryKey?: CategoryKey): boolean => {
    if (!progress) return false;
    const today = new Date().toISOString().slice(0, 10);
    const used = progress.playsToday.date === today ? progress.playsToday.count : 0;
    const requestedCategory = categoryKey ? CATEGORY_DEFINITIONS.find((category) => category.key === categoryKey) : null;
    if (requestedCategory?.access === "pro" && billing?.access !== "pro") return false;
    if (mode === "main" && progress.hasPlayed && !billing?.isPro && used >= FREE_GAMES_PER_DAY) return false;
    setSession(createSession(mode, billing?.isPro ? progress.model : undefined, progress.seenChallengeIds, categoryKey ?? null));
    return true;
  };

  const updateStoredModel = (model: BehaviorModel) => {
    if (!progress) return;
    persist({ ...progress, model });
  };

  const finishSession = (completed: Session) => {
    if (!progress) return;
    const result = buildResult(completed);
    persist(mergeCompletedSession(progress, completed, result));
    setSession(null);
  };

  const updateDaily = (daily: DailyState) => {
    if (!progress) return;
    persist({ ...progress, daily });
  };

  const resetApp = async () => {
    await storageResetProgress();
    setProgress(defaultProgress());
    setSession(null);
  };

  const refreshBilling = async () => {
    // Handled automatically by RevenueCat, but we provide empty for compat
  };

  return (
    <GameContext.Provider
      value={{
        progress: progress || defaultProgress(),
        session,
        startSession,
        setSession,
        updateStoredModel,
        finishSession,
        updateDaily,
        resetApp,
        billing,
        refreshBilling,
        isLoaded: isLoaded && !isSubscriptionLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("Game context is unavailable");
  return value;
}
