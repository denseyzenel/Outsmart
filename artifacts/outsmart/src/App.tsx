import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Crosshair,
  Database,
  Eye,
  EyeOff,
  Gauge,
  LockKeyhole,
  Play as PlayIcon,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Tent,
  Trash2,
  Trophy,
  Crown,
  Infinity as InfinityIcon,
  X,
  Zap,
} from "lucide-react";
import {
  createBillingCheckout,
  createBillingPortal,
  getBillingStatus,
  type BillingStatus,
} from "@workspace/api-client-react";
import { Link, Route, Switch, useLocation } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  CHALLENGES,
  buildResult,
  challengeById,
  createSession,
  dailyChallengeFor,
  defaultProgress,
  formatDuration,
  levelFor,
  loadProgress,
  mergeCompletedSession,
  predict,
  predictAdvanced,
  recordDailyCompletion,
  resetProgress,
  saveProgress,
  updateModel,
  type Answer,
  type BehaviorModel,
  type Challenge,
  type DailyState,
  type Mode,
  type Prediction,
  type PredictionRead,
  type Progress,
  type Session,
  type SessionResult,
} from "./game";
import { CATEGORY_DEFINITIONS, type CategoryKey } from "./categoryChallenges";

type Screen = "landing" | "home" | "play" | "daily" | "data" | "results" | "categories";
type PlayPhase = "challenge" | "prediction-result";

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
  deviceId: string;
  refreshBilling: () => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);
const FREE_GAMES_PER_DAY = 3;

function getDeviceId(): string {
  const key = "outsmart-device-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error("Game context is unavailable");
  return value;
}

function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [session, setSession] = useState<Session | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [deviceId] = useState(getDeviceId);

  const persist = (next: Progress) => {
    setProgress(next);
    saveProgress(next);
  };

  const refreshBilling = async () => {
    try {
      setBilling(await getBillingStatus({ deviceId, onboardingComplete: progress.hasPlayed }));
    } catch {
      // The game remains available in conservative free mode if billing is offline.
    }
  };

  useEffect(() => { void refreshBilling(); }, [progress.hasPlayed]);

  const startSession = (mode: Mode = "main", categoryKey?: CategoryKey): boolean => {
    const today = new Date().toISOString().slice(0, 10);
    const used = progress.playsToday.date === today ? progress.playsToday.count : 0;
    const requestedCategory = categoryKey ? CATEGORY_DEFINITIONS.find((category) => category.key === categoryKey) : null;
    if (requestedCategory?.access === "pro" && billing?.access !== "pro") return false;
    if (mode === "main" && progress.hasPlayed && !billing?.isPro && used >= FREE_GAMES_PER_DAY) return false;
    setSession(createSession(mode, billing?.isPro ? progress.model : undefined, progress.seenChallengeIds, categoryKey ?? null));
    return true;
  };

  const updateStoredModel = (model: BehaviorModel) => {
    persist({ ...progress, model });
  };

  const finishSession = (completed: Session) => {
    const result = buildResult(completed);
    persist(mergeCompletedSession(progress, completed, result));
    setSession(null);
  };

  const updateDaily = (daily: DailyState) => {
    persist({ ...progress, daily });
  };

  const resetApp = () => {
    resetProgress();
    setProgress(defaultProgress());
    setSession(null);
  };

  return (
    <GameContext.Provider
      value={{
        progress,
        session,
        startSession,
        setSession,
        updateStoredModel,
        finishSession,
        updateDaily,
        resetApp,
        billing,
        deviceId,
        refreshBilling,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

function AppHeader({
  screen,
  back,
}: {
  screen: Screen;
  back?: boolean;
}) {
  const [, setLocation] = useLocation();
  const { progress, billing } = useGame();
  return (
    <header className="mb-10 flex items-center justify-between" data-screen={screen}>
      <div className="flex items-center gap-3">
        {progress.hasPlayed ? (
          <Link href="/pro" className={`os-tier ${billing?.isPro ? "is-pro" : ""}`} data-testid="link-pro-header">
            <Crown size={12} /> {billing?.access === "trial" ? `PRO TRIAL / ${billing.trialDaysRemaining}D` : billing?.access === "pro" ? "PRO" : "FREE"}
          </Link>
        ) : null}
        {back ? (
          <button
            className="os-button os-button-quiet h-10 min-h-10 w-10 rounded-full p-0"
            onClick={() => setLocation("/home")}
            aria-label="Go back"
            data-testid="button-go-back"
          >
            <ArrowLeft size={16} className="mx-auto" />
          </button>
        ) : null}
        <Link href={progress.hasPlayed ? "/home" : "/"} className="os-brand text-sm font-bold" data-testid="link-home-brand">
          OUTSMART
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="os-mono hidden text-[10px] uppercase tracking-[.18em] text-muted-foreground sm:inline">
          LOCAL // {progress.sessions.toString().padStart(2, "0")}
        </span>
        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(90,225,195,.7)]" aria-label="System online" />
      </div>
    </header>
  );
}

function BottomNav({ active }: { active: "home" | "play" | "data" }) {
  return (
    <nav className="os-nav mt-12" aria-label="Main navigation">
      <Link href="/home" className={`os-nav-item flex items-center justify-center gap-2 ${active === "home" ? "active" : ""}`} data-testid="link-nav-home">
        <Gauge size={14} /> HOME
      </Link>
      <Link href="/play" className={`os-nav-item flex items-center justify-center gap-2 ${active === "play" ? "active" : ""}`} data-testid="link-nav-play">
        <Crosshair size={14} /> PLAY
      </Link>
      <Link href="/data" className={`os-nav-item flex items-center justify-center gap-2 ${active === "data" ? "active" : ""}`} data-testid="link-nav-data">
        <Database size={14} /> DATA
      </Link>
    </nav>
  );
}

function Layout({
  children,
  screen,
  back,
  active,
}: {
  children: ReactNode;
  screen: Screen;
  back?: boolean;
  active?: "home" | "play" | "data";
}) {
  return (
    <main className="os-app os-grain">
      <div className="os-shell">
        <AppHeader screen={screen} back={back} />
        {children}
        {active ? <BottomNav active={active} /> : null}
        <footer className="mt-10 border-t border-border pt-5 text-center text-[10px] uppercase tracking-[.13em] text-muted-foreground">
          Created by <span className="text-foreground">Densey Zenel Maben</span> / © {new Date().getFullYear()} OUTSMART
        </footer>
      </div>
    </main>
  );
}

function Landing() {
  const [, setLocation] = useLocation();
  const { startSession } = useGame();
  const start = () => {
    startSession("main");
    setLocation("/play");
  };
  return (
    <main className="os-app os-grain min-h-[100dvh]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1080px] flex-col px-5 py-7 sm:px-10 sm:py-10">
        <header className="flex items-center justify-between">
          <div className="os-brand text-sm font-bold">OUTSMART</div>
          <span className="os-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">BEHAVIORAL LAB / 001</span>
        </header>
        <section className="grid flex-1 items-center gap-10 py-16 md:grid-cols-[1.05fr_.95fr] md:gap-16">
          <div className="os-page">
            <div className="os-kicker mb-8 flex items-center gap-3"><span className="os-signal" /> A GAME OF READS</div>
            <h1 className="os-display max-w-[640px] text-[clamp(3.2rem,11vw,7.8rem)] font-semibold leading-[.89] tracking-[-.065em]">
              Give me <span className="text-primary">90 seconds.</span><br />I’ll try to<br /><span className="text-muted-foreground">figure you out.</span>
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground">
              A rapid strategy game. Make the choice you would actually make, then try to become the choice the machine cannot expect.
            </p>
            <button className="os-button os-button-primary mt-10 inline-flex w-full items-center justify-center gap-3 px-8 text-sm sm:w-auto" onClick={start} data-testid="button-start-game">
              START <ArrowRight size={17} />
            </button>
            <div className="os-mono mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[.12em] text-muted-foreground"><LockKeyhole size={12} /> No account. No cloud. Just your patterns.</div>
          </div>
          <div className="flex items-center justify-center">
            <div className="os-orbit flex items-center justify-center">
              <div className="os-orbit-dot" />
              <div className="text-center">
                <div className="os-mono text-[10px] tracking-[.2em] text-muted-foreground">MODEL STATE</div>
                <div className="os-display mt-3 text-5xl font-semibold text-primary">?</div>
                <div className="mt-3 text-xs text-muted-foreground">learning you<br />in real time</div>
              </div>
            </div>
          </div>
        </section>
        <footer className="flex items-center justify-between border-t border-border pt-5 text-[10px] uppercase tracking-[.13em] text-muted-foreground">
          <span>Created by Densey Zenel Maben / © {new Date().getFullYear()}</span><span>v.1.0 / offline ready</span>
        </footer>
      </div>
    </main>
  );
}

function Home() {
  const [, setLocation] = useLocation();
  const { progress, startSession, billing } = useGame();
  const accuracy = progress.aiPredictions ? Math.round((progress.aiCorrect / progress.aiPredictions) * 100) : 0;
  const predictability = progress.lastResult?.predictability ?? 0;
  const level = levelFor(progress.fools);
  const currentRead =
    progress.sessions === 0
      ? "The model is waiting for its first signal."
      : progress.model.reversals > 0.58
        ? "You resist the obvious, especially when watched."
        : progress.model.riskPreference > 0.58
          ? "You reach for the uncertain edge."
          : "You build a pattern before you break it.";
  const play = () => {
    if (startSession("main")) setLocation("/play");
    else setLocation("/pro");
  };
  return (
    <Layout screen="home" active="home">
      <div className="os-page">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="os-kicker mb-3">{progress.sessions ? `SESSION ${progress.sessions.toString().padStart(2, "0")} / PROFILE IN PROGRESS` : "PROFILE NOT YET OBSERVED"}</div>
            <h1 className="os-display text-4xl font-semibold tracking-[-.045em]">Your mind,<br /><span className="text-muted-foreground">under observation.</span></h1>
          </div>
          <div className="hidden text-right sm:block">
            <div className="os-mono text-3xl text-accent">LVL {level.level.toString().padStart(2, "0")}</div>
            <div className="text-[10px] uppercase tracking-[.13em] text-muted-foreground">{level.name.toLowerCase()}</div>
          </div>
        </div>
        
        <div className="os-panel os-grid-bg mb-5 overflow-hidden rounded-[1.25rem] p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div><div className="os-kicker">CURRENT READ</div><h2 className="os-display mt-4 max-w-md text-2xl font-semibold">{currentRead}</h2></div>
            <Sparkles className="text-accent" size={22} />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <div className="os-mono text-2xl text-primary">{accuracy}%</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-foreground font-bold">AI Accuracy</div>
              <div className="mt-1 text-xs text-muted-foreground leading-tight hidden sm:block">How often the model correctly guesses your choice.</div>
            </div>
            <div>
              <div className="os-mono text-2xl text-foreground">{predictability}%</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-foreground font-bold">Predictability</div>
              <div className="mt-1 text-xs text-muted-foreground leading-tight hidden sm:block">How easily your patterns can be mathematically mapped.</div>
            </div>
            <div>
              <div className="os-mono text-2xl text-accent">{level.level.toString().padStart(2, "0")}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wider text-foreground font-bold">Profile Level</div>
              <div className="mt-1 text-xs text-muted-foreground leading-tight hidden sm:block">Based on your ability to break expectations.</div>
            </div>
          </div>
        </div>
        
        {billing?.access === "trial" && billing.trialDaysRemaining <= 2 ? (
          <Link href="/pro" className="mb-5 flex items-center justify-between gap-4 border border-accent/30 bg-accent/8 p-4 text-sm" data-testid="link-trial-ending">
            <span><strong>{billing.trialDaysRemaining} {billing.trialDaysRemaining === 1 ? "day" : "days"} of PRO left.</strong> See exactly what changes when the trial ends.</span><ChevronRight size={18} className="shrink-0 text-accent" />
          </Link>
        ) : null}
        
        <div className="grid gap-3 sm:grid-cols-2">
          <button className="os-button os-button-primary group flex items-center justify-between px-6 text-sm" onClick={play} data-testid="button-play"><span className="flex items-center gap-3"><PlayIcon size={16} fill="currentColor" /> PLAY</span><ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
          <Link href="/daily" className="os-button os-button-amber group flex items-center justify-between px-6 text-sm" data-testid="link-daily"><span className="flex items-center gap-3"><Zap size={16} /> DAILY CHALLENGE</span><span className="text-xs">{progress.daily.completed ? "DONE" : `${progress.daily.fooled} / 5`}</span></Link>
        </div>
        
        <Link href="/categories" className="os-panel os-panel-hover mt-3 flex items-center justify-between rounded-[1.1rem] p-5" data-testid="link-categories">
          <div><div className="os-kicker">CHOOSE A CATEGORY</div><h3 className="mt-3 font-semibold">Train a particular kind of thinking</h3><p className="mt-1 text-sm text-muted-foreground">Three free worlds. Ten rounds each.</p></div><ChevronRight size={19} className="text-primary" />
        </Link>
        
        <div className="mt-6 mb-8 border border-primary/20 bg-primary/5 p-4 rounded-xl text-sm text-muted-foreground">
          <span className="text-primary font-semibold">THE AI LEARNS AS YOU PLAY.</span> Each game helps it predict you more accurately. Come back to see whether you can still surprise it.
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
          <Link href="/data" className="os-panel os-panel-hover rounded-[1.1rem] p-5" data-testid="link-your-data">
            <div className="flex items-center justify-between"><BarChart3 size={19} className="text-primary" /><ChevronRight size={17} className="text-muted-foreground" /></div>
            <h3 className="mt-10 font-semibold">YOUR DATA</h3><p className="mt-1 text-sm text-muted-foreground">See what the model thinks it knows.</p>
          </Link>
          <button className="os-panel os-panel-hover rounded-[1.1rem] p-5 text-left" onClick={play} data-testid="button-replay">
            <div className="flex items-center justify-between"><RotateCcw size={19} className="text-accent" /><ChevronRight size={17} className="text-muted-foreground" /></div>
            <h3 className="mt-10 font-semibold">REPLAY</h3><p className="mt-1 text-sm text-muted-foreground">Try to break your last read.</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}

function CategoryIcon({ categoryKey }: { categoryKey: string }) {
  switch (categoryKey) {
    case "pressure": return <Gauge size={24} className="text-primary" />;
    case "would-you-rather": return <Activity size={24} className="text-primary" />;
    case "detective": return <Search size={24} className="text-primary" />;
    case "scifi": return <Target size={24} className="text-primary" />;
    case "survival": return <Tent size={24} className="text-primary" />;
    case "deception": return <EyeOff size={24} className="text-primary" />;
    case "psychology": return <BrainCircuit size={24} className="text-primary" />;
    case "moral-dilemmas": return <Scale size={24} className="text-primary" />;
    case "time-travel": return <RotateCcw size={24} className="text-primary" />;
    case "ai-consciousness": return <Database size={24} className="text-primary" />;
    case "social-strategy": return <Crosshair size={24} className="text-primary" />;
    case "alternate-reality": return <Compass size={24} className="text-primary" />;
    case "cosmic-mystery": return <Sparkles size={24} className="text-primary" />;
    default: return <Sparkles size={24} className="text-primary" />;
  }
}

function Categories() {
  const [, setLocation] = useLocation();
  const { startSession, billing, progress } = useGame();
  const begin = (key: CategoryKey, access: "free" | "pro") => {
    if (access === "pro" && billing?.access !== "pro") {
      setLocation("/pro");
      return;
    }
    if (startSession("main", key)) setLocation("/play");
    else setLocation("/pro");
  };
  return (
    <Layout screen="categories" back active="play">
      <div className="os-page">
        <div className="os-kicker">CATEGORY LIBRARY / {String(CATEGORY_DEFINITIONS.length).padStart(2, "0")} WORLDS</div>
        <h1 className="os-display mt-5 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Choose your battleground.</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">Every category contains ten shuffled rounds. Pressure Test, Would You Rather, and Detective are always free. PRO unlocks the remaining worlds.</p>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
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
              <button key={category.key} className={`os-panel os-panel-hover rounded-[1.1rem] p-5 text-left flex flex-col h-full ${locked ? "opacity-75" : ""}`} onClick={() => begin(category.key, category.access)} data-testid={`button-category-${category.key}`}>
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl" aria-hidden="true">
                    <CategoryIcon categoryKey={category.key} />
                  </span>
                  {locked && <span className="os-tier"><LockKeyhole size={11} /> PRO</span>}
                </div>
                <h2 className="mt-8 text-lg font-semibold">{category.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{category.description}</p>
                <div className="os-mono mt-5 text-[10px] text-primary flex items-center justify-between border-t border-border/50 pt-4 w-full uppercase">
                  <span>{stateText}</span>
                  {plays > 0 && (
                    <span className="text-muted-foreground">{plays} PLAYS / BEST {bestFools}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex min-w-[130px] items-center gap-3" aria-label={`Round ${current} of ${total}`}>
      <div className="os-progress flex-1"><span style={{ width: `${(current / total) * 100}%` }} /></div>
      <span className="os-mono text-[10px] text-muted-foreground">{current.toString().padStart(2, "0")} / {total}</span>
    </div>
  );
}

function makeAnswer(challenge: Challenge, choice: 0 | 1, startedAt: number, previous?: 0 | 1): Answer {
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

function Play() {
  const [, setLocation] = useLocation();
  const { session, startSession, setSession, updateStoredModel, finishSession, billing } = useGame();
  const [phase, setPhase] = useState<PlayPhase>("challenge");
  const [pending, setPending] = useState<PredictionRead | null>(null);
  const [predictionOutcome, setPredictionOutcome] = useState<boolean | null>(null);
  const questionStartedAt = useRef(performance.now());
  const sessionId = session?.startedAt ?? 0;

  useEffect(() => {
    if (!session || session.mode !== "main") startSession("main");
  }, [session, startSession]);

  useEffect(() => {
    questionStartedAt.current = performance.now();
  }, [session?.currentIndex, phase]);

  if (!session || session.mode !== "main") {
    return <Layout screen="play" back active="play"><div className="os-page py-24 text-center"><div className="os-kicker">INITIALIZING MODEL</div></div></Layout>;
  }

  const displayIndex = phase === "challenge" ? session.currentIndex : session.currentIndex - 1;
  const challenge = challengeById(session.challengeIds[displayIndex]);
  if (!challenge) {
    setLocation("/results");
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
    const prediction: Prediction = {
      challengeId: challenge.id,
      predictedChoice: read.predictedChoice,
      confidence: read.confidence,
      secondOrder: read.secondOrder,
      correct,
    };
    const nextSession: Session = {
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
      setLocation("/results");
      return;
    }
    setPending(null);
    setPredictionOutcome(null);
    setPhase("challenge");
  };

  const categoryDef = session.categoryKey ? CATEGORY_DEFINITIONS.find(c => c.key === session.categoryKey) : null;
  const worldTitle = categoryDef ? categoryDef.title : "MIXED WORLD";

  return (
    <Layout screen="play" back active="play">
      <div className="os-page mx-auto max-w-3xl" key={`${sessionId}-${session.currentIndex}-${phase}`}>
        <div className="flex items-center justify-between gap-4">
          <span className="os-kicker">
            {phase === "challenge" 
              ? (session.currentIndex === session.mysteryDropIndex ? "SIGNAL INTERRUPTED" : `ROUND ${session.currentIndex + 1} / ${worldTitle.toUpperCase()}`) 
              : `ROUND ${session.currentIndex} RESULT`}
          </span>
          <div className="flex items-center gap-3">
            <span className="os-mono text-[10px] text-primary">YOU {session.score}</span>
            <span className="os-mono text-[10px] text-accent">AI {session.aiScore ?? 0}</span>
            <ProgressBar current={Math.min(session.currentIndex + (phase === "challenge" ? 1 : 0), session.challengeIds.length)} total={session.challengeIds.length} />
          </div>
        </div>
        {phase === "challenge" ? (
          <ChallengeCard challenge={challenge} onChoose={chooseChallenge} worldTitle={worldTitle} />
        ) : pending && predictionOutcome !== null ? (
          <PredictionResult round={session.currentIndex} read={pending} correct={predictionOutcome} userScore={session.score} aiScore={session.aiScore ?? 0} chosenTitle={challengeById(session.challengeIds[session.currentIndex - 1])?.options[session.answers.at(-1)?.choice ?? 0].title ?? "Unknown"} predictedTitle={challengeById(session.challengeIds[session.currentIndex - 1])?.options[pending.predictedChoice].title ?? "Unknown"} onContinue={continueAfterPrediction} />
        ) : null}
      </div>
    </Layout>
  );
}

function ChallengeCard({ challenge, onChoose, worldTitle }: { challenge: Challenge; onChoose: (choice: 0 | 1) => void; worldTitle: string }) {
  const isMystery = challenge.category === "MYSTERY";
  const catDisplay = challenge.category.replace(/-/g, " ");
  return (
    <section className={`py-14 sm:py-20 ${isMystery ? "os-grid-bg -mx-5 border-y border-accent/30 px-5 sm:-mx-8 sm:px-8" : ""}`}>
      <div className={`os-mono text-xs ${isMystery ? "text-accent" : "text-muted-foreground"} uppercase flex items-center gap-2`}>
        {isMystery ? "UNSCHEDULED EVENT / RULES INTACT" : `${worldTitle} / ${catDisplay} / NO WRONG ANSWER`}
      </div>
      
      <div className="os-mono text-[10px] text-primary mt-6 flex items-center gap-2 border border-primary/30 bg-primary/10 px-3 py-2 rounded-lg w-max uppercase font-bold">
        <LockKeyhole size={12} />
        <span>PREDICTION LOCKED. AWAITING YOUR CHOICE.</span>
      </div>

      <h1 className="os-display mt-6 max-w-2xl text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">{challenge.prompt}<br /><span className="text-primary">{challenge.subtext}</span></h1>
      <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
        Choose quickly. The timing is part of the signal. The machine has already locked its prediction for this round.
      </p>
      
      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {challenge.options.map((option, index) => (
          <button key={option.title} className="os-choice group rounded-[1.2rem] p-5" onClick={() => onChoose(index as 0 | 1)} data-testid={`button-choice-${challenge.id}-${index}`}>
            <div className="flex items-center justify-between"><span className="os-mono text-[10px] text-muted-foreground uppercase">0{index + 1} / {option.signal.replace(/-/g, " ")}</span><ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" /></div>
            <div className="mt-10 text-left text-lg font-semibold">{option.title}</div><div className="mt-2 text-left text-sm text-muted-foreground">{option.detail}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function PixelCat({ message }: { message: string }) {
  return (
    <div className="os-cat-wrap cheer">
      <img className="os-pixel-cat" src={`${import.meta.env.BASE_URL}xavi-pixel-cat.svg`} alt="Xavi, the tiny green 16-bit pixel art cat commentator, cheering" />
      <div>
        <div className="os-mono mb-1 text-[10px] text-primary">XAVI</div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

function Scoreboard({ userScore, aiScore }: { userScore: number; aiScore: number }) {
  return (
    <div className="mx-auto mt-6 flex max-w-sm justify-center gap-3">
      <div className="flex-1 rounded-xl border border-primary/40 bg-primary/5 p-3">
        <div className="os-mono text-[10px] text-primary">YOUR SCORE</div>
        <div className="os-mono mt-1 text-2xl">{userScore}</div>
      </div>
      <div className="flex-1 rounded-xl border border-accent/40 bg-accent/5 p-3">
        <div className="os-mono text-[10px] text-accent">AI SCORE</div>
        <div className="os-mono mt-1 text-2xl">{aiScore}</div>
      </div>
    </div>
  );
}

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

function PredictionResult({ round, read, correct, userScore, aiScore, chosenTitle, predictedTitle, onContinue }: { round: number; read: PredictionRead; correct: boolean; userScore: number; aiScore: number; chosenTitle: string; predictedTitle: string; onContinue: () => void }) {
  return (
    <section className="py-12 sm:py-20">
      <div className="os-panel rounded-[1.4rem] p-6 sm:p-10">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${correct ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>{correct ? <Check size={30} /> : <X size={30} />}</div>
        <div className="text-center">
          <div className="os-kicker mt-8">{correct ? "PREDICTION CONFIRMED" : "PREDICTION BROKEN"}</div>
          <h1 className="os-display mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">{correct ? "I knew it." : read.secondOrder ? "You got me." : "You fooled me."}</h1>
          <div className={`os-mono mt-4 text-xl ${correct ? "text-accent" : "text-primary"}`}>{correct ? "AI +100" : "YOU +100"}</div>
          
          <Scoreboard userScore={userScore} aiScore={aiScore} />
          
          <div className="mx-auto mt-6 grid grid-cols-2 gap-3 max-w-lg text-left">
            <div className="rounded-xl border border-border p-4">
              <div className="os-mono text-[10px] text-muted-foreground">YOU CHOSE</div>
              <div className="mt-2 text-sm font-semibold">{chosenTitle}</div>
            </div>
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
              <div className="os-mono text-[10px] text-accent">AI HAD PREDICTED</div>
              <div className="mt-2 text-sm font-semibold">{predictedTitle}</div>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground">{correct ? `The engine called it at ${read.confidence}% confidence. Your next choice can still break the pattern.` : "You broke the pattern. The machine did not see that choice coming."}</p>
          {!correct ? <PixelCat message={XAVI_WIN_REMARKS[(round - 1) % XAVI_WIN_REMARKS.length]} /> : null}
          <div className="mt-10 border-t border-border pt-6"><span className="os-mono text-xs uppercase tracking-[.12em] text-muted-foreground">AI CONFIDENCE</span><span className="os-mono ml-3 text-lg text-primary">{read.confidence}%</span></div>
          <button className="os-button os-button-primary mt-8 inline-flex items-center justify-center gap-3 px-7 text-xs" onClick={onContinue} data-testid="button-continue-round">
            {read.secondOrder ? "CONTINUE THE FIGHT" : "NEXT READ"} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Results() {
  const [, setLocation] = useLocation();
  const { progress, startSession, billing } = useGame();
  
  const result = progress.lastResult;
  if (!result) {
    setLocation("/home");
    return null;
  }

  const resultAiScore = result.aiScore ?? 0;
  const userWon = result.score > resultAiScore;
  const tied = result.score === resultAiScore;
  const isDaily = result.mode === "daily";
  const categoryDef = result.categoryKey ? CATEGORY_DEFINITIONS.find(c => c.key === result.categoryKey) : null;
  const worldTitle = categoryDef ? categoryDef.title : "MIXED WORLD";

  return (
    <Layout screen="results" active="home">
      <div className="os-page mx-auto max-w-3xl">
        <div className="text-center">
          <div className="os-kicker">{isDaily ? "DAILY CHALLENGE COMPLETE" : `${worldTitle.toUpperCase()} COMPLETE`}</div>
          <h1 className="os-display mt-4 text-5xl font-semibold sm:text-7xl">
            {tied ? "Nobody blinked." : userWon ? "You broke the model." : "The machine read you."}
          </h1>
          <Scoreboard userScore={result.score} aiScore={resultAiScore} />
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="os-panel rounded-2xl p-5 text-center">
            <div className="os-mono text-3xl text-primary">{result.aiAccuracy}%</div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">AI Accuracy</div>
          </div>
          <div className="os-panel rounded-2xl p-5 text-center">
            <div className="os-mono text-3xl text-foreground">{result.predictability}%</div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Predictability</div>
          </div>
          <div className="os-panel rounded-2xl p-5 text-center">
            <div className="os-mono text-3xl text-accent">{result.fools}</div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">Times Fooled</div>
          </div>
        </div>

        <div className="os-panel mt-4 rounded-2xl p-6 sm:p-8">
          <div className="os-kicker mb-6">MODEL OBSERVATIONS</div>
          <ul className="space-y-4">
            {result.observations.slice(0, billing?.isPro ? undefined : 1).map((obs, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary">
                  {i + 1}
                </span>
                <span className="text-sm leading-6 text-foreground">{obs}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row justify-center">
          <button className="os-button os-button-primary px-8" onClick={() => { if (startSession("main", result.categoryKey ?? undefined)) setLocation("/play"); else setLocation("/pro"); }}>PLAY AGAIN</button>
          <button className="os-button os-button-quiet px-8" onClick={() => setLocation("/home")}>RETURN HOME</button>
        </div>
      </div>
    </Layout>
  );
}

function Daily() {
  const [, setLocation] = useLocation();
  const { progress, updateDaily, billing } = useGame();
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const daily = progress.daily;
  const challenge = dailyChallengeFor(daily.round);
  const dailyRead = useMemo(
    () => billing?.isPro ? predictAdvanced(challenge, progress.model, [], daily.round >= 2) : predict(challenge, progress.model, [], daily.round >= 2),
    [challenge, progress.model, daily.round, billing?.isPro],
  );
  const begin = () => updateDaily({ ...daily, started: true });
  const choose = (choice: 0 | 1) => {
    if (!daily.started || feedback !== null || daily.completed) return;
    const fooled = choice !== dailyRead.predictedChoice;
    const nextFooled = fooled ? daily.fooled + 1 : 0;
    const nextRound = fooled ? daily.round + 1 : 0;
    const nextDaily = nextFooled >= 5 ? recordDailyCompletion({ ...daily, fooled: nextFooled, round: nextRound }) : { ...daily, fooled: nextFooled, round: nextRound };
    updateDaily(nextDaily);
    setFeedback(fooled);
  };
  const next = () => setFeedback(null);
  return (
    <Layout screen="daily" back active="play">
      <div className="os-page mx-auto max-w-3xl">
        {daily.completed ? (
          <section className="py-10 text-center sm:py-20"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary"><Check size={29} /></div><div className="os-kicker mt-8">DAILY COMPLETE / {daily.streak} DAY STREAK</div><h1 className="os-display mt-4 text-5xl font-semibold tracking-[-.06em]">You broke<br /><span className="text-primary">the model.</span></h1><p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-muted-foreground">Five consecutive prediction breaks completed. Your daily streak is safe until tomorrow.</p><button className="os-button os-button-primary mt-10 inline-flex items-center justify-center gap-2 px-7 text-xs" onClick={() => setLocation("/home")}>RETURN HOME <ArrowRight size={15} /></button></section>
        ) : !daily.started ? (
          <section className="py-8 sm:py-16"><div className="os-kicker flex items-center gap-3"><Zap size={14} /> TODAY / FIVE CONSECUTIVE BREAKS</div><h1 className="os-display mt-6 text-5xl font-semibold leading-[.92] tracking-[-.06em] sm:text-7xl">Five reads.<br /><span className="text-accent">One streak.</span></h1><p className="mt-7 max-w-md text-sm leading-6 text-muted-foreground">The AI locks a prediction before every choice. Fool it five times in a row to complete today’s challenge. One correct AI prediction resets today’s progress to zero. Completion adds one day to your overall streak.</p><div className="mt-12 grid grid-cols-2 gap-3"><div className="os-panel rounded-xl p-5"><Target size={17} className="text-primary" /><div className="os-mono mt-7 text-2xl">{daily.fooled} / 5</div><div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">consecutive breaks</div></div><div className="os-panel rounded-xl p-5"><Zap size={17} className="text-accent" /><div className="os-mono mt-7 text-2xl">{daily.streak}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">completed days</div></div></div><button className="os-button os-button-amber mt-8 flex w-full items-center justify-center gap-3 px-7 text-sm" onClick={begin} data-testid="button-start-daily">START DAILY <ArrowRight size={17} /></button></section>
        ) : feedback !== null ? (
          <section className="py-14 text-center sm:py-24"><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${feedback ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>{feedback ? <Check size={30} /> : <X size={30} />}</div><div className="os-kicker mt-8">{feedback ? "PREDICTION BROKEN" : "PREDICTION CONFIRMED"}</div><h1 className="os-display mt-4 text-5xl font-semibold tracking-[-.06em]">{feedback ? "Keep the streak alive." : "Back to zero."}</h1><p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-muted-foreground">{feedback ? `TODAY: ${daily.fooled} / 5 consecutive breaks.` : "The AI read held. Today’s sequence resets, but you can immediately try again."}</p>{feedback ? <PixelCat message="Xavi has checked the numbers. The machine is officially one mistake less confident." /> : null}<button className="os-button os-button-primary mt-10 inline-flex items-center justify-center gap-2 px-7 text-xs" onClick={next}>{daily.round >= 5 ? "SEE STREAK" : feedback ? "NEXT READ" : "TRY AGAIN"} <ArrowRight size={15} /></button></section>
        ) : (
          <section className="py-8 sm:py-16"><div className="flex items-center justify-between"><div className="os-kicker">DAILY / BREAK {daily.round + 1} OF 05</div><span className="os-mono text-accent">{daily.fooled} CONSECUTIVE</span></div><div className="os-mono mt-6 flex w-max items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-[10px] font-bold text-primary"><LockKeyhole size={12} /> PREDICTION LOCKED</div><h1 className="os-display mt-8 text-4xl font-semibold leading-[.98] tracking-[-.05em] sm:text-6xl">{challenge.prompt}</h1><p className="mt-6 text-sm text-muted-foreground">{challenge.subtext} Choose what the model will not expect.</p><div className="mt-10 grid gap-3 sm:grid-cols-2">{challenge.options.map((option, index) => <button key={option.title} className="os-choice rounded-xl p-6 text-left" onClick={() => choose(index as 0 | 1)} data-testid={`button-daily-choice-${index}`}><div className="os-mono text-[10px] text-muted-foreground">0{index + 1} / {option.signal}</div><div className="mt-10 text-lg font-semibold">{option.title}</div></button>)}</div><div className="mt-6 flex items-center gap-3"><div className="os-progress flex-1"><span style={{ width: `${(daily.round / 5) * 100}%` }} /></div><span className="os-mono text-[10px] text-muted-foreground">MODEL CONFIDENCE {dailyRead.confidence}%</span></div></section>
        )}
      </div>
    </Layout>
  );
}

function Data() {
  const { progress, resetApp, billing } = useGame();
  const [resetNotice, setResetNotice] = useState(false);
  
  const width = (val: number) => `${Math.max(4, val * 100)}%`;
  const categoryKeys = Array.from(new Set(progress.history.map((h) => h.categoryKey).filter(Boolean))) as string[];
  
  return (
    <Layout screen="data" back active="data">
      <div className="os-page pb-10">
        <div className="os-kicker">BEHAVIORAL MODEL / LOCAL STORAGE</div>
        <h1 className="os-display mt-5 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">What it knows.</h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">The algorithm updates these parameters locally after every choice. It uses them to predict your next move.</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="os-panel rounded-[1.2rem] p-5">
            <div className="os-kicker">RISK PREFERENCE</div>
            <div className="mt-4 flex items-end justify-between"><span className="os-mono text-3xl text-primary">{Math.round(progress.model.riskPreference * 100)}%</span><span className="text-xs text-muted-foreground">{progress.model.riskPreference > 0.5 ? "BOLD" : "SAFE"}</span></div>
            <div className="os-progress mt-4"><span style={{ width: width(progress.model.riskPreference) }} /></div>
          </div>
          <div className="os-panel rounded-[1.2rem] p-5">
            <div className="os-kicker">CONSISTENCY</div>
            <div className="mt-4 flex items-end justify-between"><span className="os-mono text-3xl text-primary">{Math.round(progress.model.consistency * 100)}%</span><span className="text-xs text-muted-foreground">{progress.model.consistency > 0.5 ? "STEADY" : "ERRATIC"}</span></div>
            <div className="os-progress mt-4"><span style={{ width: width(progress.model.consistency) }} /></div>
          </div>
          {billing?.isPro ? <div className="os-panel rounded-[1.2rem] p-5">
            <div className="os-kicker">HESITATION</div>
            <div className="mt-4 flex items-end justify-between"><span className="os-mono text-3xl text-primary">{Math.round(progress.model.hesitation * 100)}%</span><span className="text-xs text-muted-foreground">{progress.model.hesitation > 0.5 ? "CAREFUL" : "INSTINCTIVE"}</span></div>
            <div className="os-progress mt-4"><span style={{ width: width(progress.model.hesitation) }} /></div>
          </div> : null}
          {billing?.isPro ? <div className="os-panel rounded-[1.2rem] p-5">
            <div className="os-kicker">PATTERN BREAKING</div>
            <div className="mt-4 flex items-end justify-between"><span className="os-mono text-3xl text-primary">{Math.round(progress.model.reversals * 100)}%</span><span className="text-xs text-muted-foreground">{progress.model.reversals > 0.5 ? "REBELLIOUS" : "COMPLIANT"}</span></div>
            <div className="os-progress mt-4"><span style={{ width: width(progress.model.reversals) }} /></div>
          </div> : null}
        </div>
        {!billing?.isPro ? <Link href="/pro" className="mt-3 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm"><span><strong className="text-primary">PRO reveals deeper signals.</strong><span className="mt-1 block text-muted-foreground">Hesitation, pattern breaking, and full session history remain locked.</span></span><LockKeyhole size={16} className="text-primary" /></Link> : null}

        <div className="mt-12">
          <div className="os-kicker mb-6">CATEGORY PLAY HISTORY</div>
          {categoryKeys.length === 0 ? (
            <div className="p-6 border border-border rounded-2xl text-center text-sm text-muted-foreground">
              Play some categories to build a specific history.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {categoryKeys.map((key) => {
                const def = CATEGORY_DEFINITIONS.find((c) => c.key === key);
                if (!def) return null;
                const history = progress.history.filter((h) => h.categoryKey === key);
                const totalFools = history.reduce((sum, h) => sum + h.fools, 0);
                return (
                  <div key={key} className="os-panel rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-foreground uppercase">{def.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{history.length} PLAYS</div>
                    </div>
                    <div className="text-right">
                      <div className="os-mono text-xl text-primary">{totalFools}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">FOOLS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {billing?.isPro ? <div className="mt-12">
          <div className="os-kicker">SESSION LOG</div>
          <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-border">
            <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem] border-b border-border bg-card/50 p-4 text-[10px] uppercase tracking-wider text-muted-foreground">
              <div>No.</div><div>Date</div><div className="text-right">Rounds</div><div className="text-right">AI</div><div className="text-right">Fools</div>
            </div>
            {progress.history.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No sessions recorded yet.</div>
            ) : (
              progress.history.map((result, i) => (
                <div key={result.completedAt} className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem] border-b border-border/50 p-4 text-sm last:border-0">
                  <div className="os-mono text-muted-foreground">{(progress.history.length - i).toString().padStart(2, "0")}</div>
                  <div className="text-foreground">{new Date(result.completedAt).toLocaleDateString()}</div>
                  <div className="os-mono text-right text-muted-foreground">{result.rounds}</div>
                  <div className="os-mono text-right text-primary">{result.aiAccuracy}%</div>
                  <div className="os-mono text-right text-accent">{result.fools}</div>
                </div>
              ))
            )}
          </div>
        </div> : null}

        <div className="mt-12 text-center">
          <button className="text-[10px] uppercase tracking-[.15em] text-muted-foreground transition-colors hover:text-red-400" onClick={() => setResetNotice(true)} data-testid="button-reset-model">
            <Trash2 size={14} className="mx-auto mb-2" /> WIPE LOCAL DATA
          </button>
        </div>
        {resetNotice ? <ConfirmReset onClose={() => setResetNotice(false)} onConfirm={resetApp} /> : null}
      </div>
    </Layout>
  );
}

const PRO_FEATURES = [
  { icon: BrainCircuit, title: "AI MEMORY", text: "The model carries your patterns across sessions instead of starting cold." },
  { icon: Eye, title: "DEEP ANALYSIS", text: "See hesitation, reversals, and the signals behind your predictability." },
  { icon: Sparkles, title: "ADVANCED AI", text: "Face stronger prediction and counter prediction logic." },
  { icon: InfinityIcon, title: "UNLIMITED PLAY", text: "Play beyond the three free games available each day." },
  { icon: Crosshair, title: "TEN PRO WORLDS", text: "Unlock every premium category while keeping three worlds free forever." },
  { icon: BarChart3, title: "FULL HISTORY", text: "Review scores and model performance across up to 50 sessions." },
];

function Pro() {
  const { billing, deviceId, refreshBilling } = useGame();
  const [loading, setLoading] = useState<"monthly" | "annual" | "portal" | null>(null);
  const [error, setError] = useState("");

  const checkout = async (plan: "monthly" | "annual") => {
    setLoading(plan); setError("");
    try {
      const res = await createBillingCheckout({ deviceId, plan });
      window.location.href = res.url;
    } catch {
      setError("Checkout could not be opened. Please try again.");
      setLoading(null);
    }
  };

  const portal = async () => {
    setLoading("portal"); setError("");
    try {
      const res = await createBillingPortal({ deviceId });
      window.location.href = res.url;
    } catch {
      setError("Billing settings could not be opened. Please try again.");
      setLoading(null);
    }
  };

  return (
    <Layout screen="home" back>
      <div className="os-page mx-auto max-w-4xl py-10">
        <div className="os-kicker flex items-center gap-2"><Crown size={14} /> OUTSMART PRO</div>
        <h1 className="os-display mt-5 text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Do not just beat it.<br /><span className="text-primary">Master it.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-foreground/80">Free asks whether you can beat the AI. PRO gives you the worlds, history, and deeper model signals to understand how you beat it repeatedly.</p>

        {billing?.access === "trial" ? <div className="mt-8 rounded-xl border border-primary/40 bg-primary/10 p-5"><div className="flex items-center gap-3 font-semibold text-primary"><ShieldCheck size={20} /> PRO TRIAL · {billing.trialDaysRemaining} {billing.trialDaysRemaining === 1 ? "DAY" : "DAYS"} LEFT</div><div className="mt-5 grid gap-3 text-sm leading-6"><div className="rounded-lg border border-border/70 bg-background/30 p-4"><strong className="text-foreground">FREE FOREVER</strong><p className="mt-1 text-foreground/75">Pressure Test · Would You Rather · Detective<br />3 games/day · Daily Challenge · Basic progression</p></div><div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><strong className="text-primary">FREE DURING YOUR TRIAL</strong><p className="mt-1 text-foreground/75">Unlimited play · Advanced Prediction · Smarter AI · Deep analysis · Full session history</p><p className="mt-2 text-xs text-muted-foreground">These trial features lock when the trial ends unless you subscribe.</p></div><div className="rounded-lg border border-accent/30 bg-accent/5 p-4"><strong className="text-accent">PAID PRO ONLY</strong><p className="mt-1 text-foreground/75">10 premium worlds</p><p className="mt-2 text-xs text-muted-foreground">Premium worlds require an active paid subscription and are not included in the trial.</p></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">No card required. The trial ends automatically. You will not be charged.</p></div> : billing?.access === "pro" ? <div className="mt-8 rounded-xl border border-primary/40 bg-primary/10 p-5"><div className="font-semibold text-primary">OUTSMART PRO IS ACTIVE</div><p className="mt-2 text-sm text-foreground/75">Every world, unlimited play, deeper signals, and full history are unlocked.</p></div> : <div className="mt-8 rounded-xl border border-border bg-white/[.035] p-5"><div className="font-semibold">FREE STAYS USEFUL</div><p className="mt-2 text-sm leading-6 text-foreground/75">Keep three games each day, the Daily Challenge, three free worlds, basic scoring, and core progression. Upgrade only when you want mastery tools and every premium world.</p></div>}

        {!billing?.canManage ? <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button className="os-price-card featured relative" onClick={() => void checkout("annual")} disabled={loading !== null}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl tracking-wider">BEST VALUE</div>
            <div className="os-kicker text-primary">ANNUAL ACCESS</div>
            <strong>{billing?.annualPrice ?? "£39.99"}<small> / YEAR</small></strong>
            <span>Billed annually. Cancel anytime.</span>
            <b>{loading === "annual" ? "OPENING" : `SAVE ${billing?.annualSavingPercent ?? 33}%`}</b>
          </button>
          <button className="os-price-card" onClick={() => void checkout("monthly")} disabled={loading !== null}>
            <div className="os-kicker">MONTHLY ACCESS</div>
            <strong>{billing?.monthlyPrice ?? "£4.99"}<small> / MONTH</small></strong>
            <span>Billed monthly. Cancel anytime.</span>
            <b>{loading === "monthly" ? "OPENING" : "FLEXIBLE"}</b>
          </button>
        </div> : <div className="mt-8"><button className="os-button os-button-quiet w-full px-8" onClick={() => void portal()} disabled={loading !== null}>
              {loading === "portal" ? "OPENING" : "MANAGE SUBSCRIPTION"}
            </button>
          </div>}
        {error ? <p className="mt-4 text-center text-sm text-accent" role="alert">{error}</p> : null}
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">Secure checkout by Stripe. Prices and renewal terms are shown before payment. No countdowns, scarcity, or hidden upgrade.</p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{PRO_FEATURES.map(({ icon: Icon, title, text }) => <div key={title} className="os-panel rounded-[1.1rem] p-5"><Icon size={19} className="text-primary" /><h2 className="mt-7 text-sm font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-foreground/70">{text}</p></div>)}</div>
      </div>
    </Layout>
  );
}

function ConfirmReset({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [, setLocation] = useLocation();
  const confirm = () => { onConfirm(); onClose(); setLocation("/"); };
  return <div className="os-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div className="os-panel w-full max-w-md rounded-[1.3rem] p-6 sm:p-8"><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent"><Trash2 size={18} /></div><button className="os-button os-button-quiet h-9 min-h-9 w-9 rounded-full p-0" onClick={onClose} aria-label="Close reset dialog" data-testid="button-close-reset"><X size={15} className="mx-auto" /></button></div><h2 id="reset-title" className="os-display mt-7 text-2xl font-semibold">Erase your model?</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">This clears every local observation, progress score, and daily streak. There is no undo.</p><div className="mt-8 flex gap-3"><button className="os-button os-button-quiet flex-1 px-4 text-xs" onClick={onClose} data-testid="button-cancel-reset">KEEP IT</button><button className="os-button os-button-amber flex-1 px-4 text-xs" onClick={confirm} data-testid="button-confirm-reset">ERASE MODEL</button></div></div></div>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/home" component={Home} />
            <Route path="/play" component={Play} />
            <Route path="/daily" component={Daily} />
            <Route path="/data" component={Data} />
            <Route path="/results" component={Results} />
            <Route path="/categories" component={Categories} />
            <Route path="/pro" component={Pro} />
            <Route>
              <Layout screen="landing" back><div className="os-page py-24 text-center"><div className="os-kicker">404 NOT FOUND</div></div></Layout>
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </GameProvider>
    </ErrorBoundary>
  );
}