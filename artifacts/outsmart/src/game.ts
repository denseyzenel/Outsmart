import { CATEGORY_DEFINITIONS, type CategoryKey } from "./categoryChallenges";

export type Mode = "main" | "daily";

export type SignalKey =
  | "riskPreference"
  | "consistency"
  | "hesitation"
  | "reversals"
  | "patternFollowing"
  | "leftBias";

export type ChallengeCategory =
  | "RISK"
  | "TRUST"
  | "AMBIGUITY"
  | "VISUAL"
  | "PATTERN"
  | "TRADE-OFF"
  | "MYSTERY";

export type Option = {
  title: string;
  detail: string;
  signal: string;
  signals: Partial<Record<SignalKey, number>>;
};

export type Challenge = {
  id: string;
  category: ChallengeCategory;
  prompt: string;
  subtext: string;
  options: [Option, Option];
};

export type Answer = {
  challengeId: string;
  category: ChallengeCategory;
  choice: 0 | 1;
  responseMs: number;
  wasHesitant: boolean;
  wasRapid: boolean;
  reversed: boolean;
};

export type Prediction = {
  challengeId: string;
  predictedChoice: 0 | 1;
  confidence: number;
  secondOrder: boolean;
  correct: boolean;
};

export type BehaviorModel = {
  riskPreference: number;
  consistency: number;
  hesitation: number;
  reversals: number;
  patternFollowing: number;
  leftBias: number;
  observations: number;
};

export type Session = {
  mode: Mode;
  startedAt: number;
  currentIndex: number;
  answers: Answer[];
  predictions: Prediction[];
  model: BehaviorModel;
  fools: number;
  aiCorrect: number;
  secondOrderSeen: boolean;
  challengeIds: string[];
  mysteryDropIndex: number;
  categoryKey: CategoryKey | null;
  score: number;
  aiScore: number;
};

export type SessionResult = {
  completedAt: number;
  mode: Mode;
  durationMs: number;
  rounds: number;
  aiAccuracy: number;
  predictability: number;
  fools: number;
  predictionCount: number;
  level: number;
  levelName: string;
  observations: string[];
  score: number;
  aiScore: number;
  categoryKey: CategoryKey | null;
};

export type DailyState = {
  date: string;
  started: boolean;
  round: number;
  fooled: number;
  completed: boolean;
  streak: number;
  lastCompletedDate: string | null;
};

export type Progress = {
  version: number;
  hasPlayed: boolean;
  sessions: number;
  totalRounds: number;
  aiCorrect: number;
  aiPredictions: number;
  fools: number;
  bestFools: number;
  model: BehaviorModel;
  daily: DailyState;
  lastResult: SessionResult | null;
  history: SessionResult[];
  playsToday: { date: string; count: number };
  seenChallengeIds: string[];
};

export type PredictionRead = {
  predictedChoice: 0 | 1;
  confidence: number;
  secondOrder: boolean;
};

const STORAGE_KEY = "outsmart-progress-v1";
const VERSION = 2;
const LEGACY_STORAGE_KEY = "outsmart-progress-v1";

export const INITIAL_MODEL: BehaviorModel = {
  riskPreference: 0.5,
  consistency: 0.5,
  hesitation: 0.5,
  reversals: 0.5,
  patternFollowing: 0.5,
  leftBias: 0.5,
  observations: 0,
};

export const CHALLENGES: Challenge[] = [
  {
    id: "risk-01",
    category: "RISK",
    prompt: "At 2:17 AM, an elevator opens on a floor that does not exist.",
    subtext: "The button panel is blank. The doors close in ten seconds.",
    options: [
      { title: "Step out", detail: "Impossible floors deserve witnesses.", signal: "CROSS", signals: { riskPreference: 1 } },
      { title: "Hit close", detail: "Curiosity is not a survival plan.", signal: "RETREAT", signals: { riskPreference: 0 } },
    ],
  },
  {
    id: "trust-01",
    category: "TRUST",
    prompt: "You receive a voice note from yourself, dated tomorrow.",
    subtext: "It says only: do not wear blue.",
    options: [
      { title: "Avoid blue", detail: "Future-you sounded genuinely afraid.", signal: "OBEY", signals: { leftBias: 1 } },
      { title: "Wear blue", detail: "A warning can also be a trap.", signal: "DEFY", signals: { leftBias: 0, hesitation: 1 } },
    ],
  },
  {
    id: "ambiguity-01",
    category: "AMBIGUITY",
    prompt: "One memory from your childhood is completely invented.",
    subtext: "You may learn which one, or keep every memory feeling real.",
    options: [
      { title: "Reveal the fake", detail: "Truth is worth the missing piece.", signal: "REVEAL", signals: { hesitation: 1 } },
      { title: "Keep them all", detail: "A memory can matter without being factual.", signal: "PRESERVE", signals: { consistency: 1 } },
    ],
  },
  {
    id: "visual-01",
    category: "VISUAL",
    prompt: "Two identical keys sit on a table.",
    subtext: "One opens your dream home. The other erases the last year.",
    options: [
      { title: "Take the left key", detail: "Commit before fear invents a pattern.", signal: "INSTINCT", signals: { patternFollowing: 1 } },
      { title: "Take the right key", detail: "The obvious choice feels planted.", signal: "SUSPICION", signals: { patternFollowing: 0 } },
    ],
  },
  {
    id: "tradeoff-01",
    category: "TRADE-OFF",
    prompt: "Delete every embarrassing moment, or keep the lesson from each one.",
    subtext: "Removing the memory also removes what it taught you.",
    options: [
      { title: "Delete them", detail: "A lighter mind can build new lessons.", signal: "ERASE", signals: { riskPreference: 0 } },
      { title: "Keep the cringe", detail: "Growth leaves evidence.", signal: "KEEP", signals: { riskPreference: 1 } },
    ],
  },
  {
    id: "pattern-01",
    category: "PATTERN",
    prompt: "A machine prints: 1, 11, 21, 1211, 111221…",
    subtext: "It offers two cards for the next line.",
    options: [
      { title: "312211", detail: "Read aloud what came before.", signal: "DECODE", signals: { patternFollowing: 1 } },
      { title: "11112221", detail: "The clean rule may be deliberate bait.", signal: "REJECT", signals: { patternFollowing: 0, reversals: 1 } },
    ],
  },
  {
    id: "risk-02",
    category: "RISK",
    prompt: "You can hear every lie, or tell one lie nobody can detect.",
    subtext: "The ability lasts forever.",
    options: [
      { title: "Hear every lie", detail: "Truth becomes impossible to ignore.", signal: "DETECT", signals: { riskPreference: 0 } },
      { title: "Own one perfect lie", detail: "One sentence could change everything.", signal: "DECEIVE", signals: { riskPreference: 1 } },
    ],
  },
  {
    id: "trust-02",
    category: "TRUST",
    prompt: "A stranger knows the nickname nobody has used since you were six.",
    subtext: "They ask you to follow them for exactly one minute.",
    options: [
      { title: "Follow them", detail: "Some answers only appear once.", signal: "FOLLOW", signals: { leftBias: 1 } },
      { title: "Walk away", detail: "Knowing you is not earning your trust.", signal: "REFUSE", signals: { leftBias: 0 } },
    ],
  },
  {
    id: "visual-02",
    category: "VISUAL",
    prompt: "A red button says: PRESS TO KNOW WHO MISSES YOU.",
    subtext: "The answer may be someone you cannot contact.",
    options: [
      { title: "Press it", detail: "Uncertainty already has a cost.", signal: "KNOW", signals: { consistency: 1 } },
      { title: "Leave it", detail: "Not every truth improves a life.", signal: "DECLINE", signals: { reversals: 1 } },
    ],
  },
  {
    id: "reversal-01",
    category: "AMBIGUITY",
    prompt: "The AI says your next choice will contradict your last one.",
    subtext: "Now even agreement looks like rebellion.",
    options: [
      { title: "Stay consistent", detail: "Refuse to let the prediction steer you.", signal: "HOLD", signals: { consistency: 1 } },
      { title: "Switch sides", detail: "Maybe contradiction was already the plan.", signal: "FLIP", signals: { reversals: 1 } },
    ],
  },
  {
    id: "tradeoff-02",
    category: "TRADE-OFF",
    prompt: "You may pause time for ten seconds, but age one day each time.",
    subtext: "Nobody else will ever know you used it.",
    options: [
      { title: "Use it freely", detail: "A day is cheap when the moment matters.", signal: "SPEND", signals: { hesitation: 0 } },
      { title: "Save it for once", detail: "Power is strongest while unused.", signal: "RESERVE", signals: { hesitation: 1 } },
    ],
  },
  {
    id: "pattern-02",
    category: "PATTERN",
    prompt: "Four doors read: SAFE, HOME, TRUTH, and AGAIN.",
    subtext: "Only the label you distrust opens.",
    options: [
      { title: "Open TRUTH", detail: "At least the danger is honest.", signal: "LITERAL", signals: { patternFollowing: 1 } },
      { title: "Open AGAIN", detail: "The strangest label may hide the exit.", signal: "DISRUPT", signals: { patternFollowing: 0, reversals: 1 } },
    ],
  },
  {
    id: "risk-03",
    category: "RISK",
    prompt: "A pill makes you brilliant for one hour and ordinary forever after.",
    subtext: "Without it, you may slowly become brilliant on your own.",
    options: [
      { title: "Take the hour", detail: "One extraordinary hour could be enough.", signal: "BURN", signals: { riskPreference: 1 } },
      { title: "Keep the chance", detail: "Potential is worth protecting.", signal: "WAIT", signals: { riskPreference: 0 } },
    ],
  },
  {
    id: "trust-03",
    category: "TRUST",
    prompt: "A museum guard whispers: one painting changes when nobody watches.",
    subtext: "He offers to turn off every camera.",
    options: [
      { title: "Keep the cameras on", detail: "Evidence matters more than wonder.", signal: "VERIFY", signals: { consistency: 1 } },
      { title: "Turn them off", detail: "Some things only exist without proof.", signal: "WITNESS", signals: { riskPreference: 1 } },
    ],
  },
  {
    id: "ambiguity-02",
    category: "AMBIGUITY",
    prompt: "An oracle allows one question, but answers with a single name.",
    subtext: "You cannot ask a follow-up.",
    options: [
      { title: "Who should I trust?", detail: "One reliable person can change a life.", signal: "TRUST", signals: { hesitation: 1 } },
      { title: "Who will I become?", detail: "A destination can become a compass.", signal: "IDENTITY", signals: { consistency: 1 } },
    ],
  },
  {
    id: "visual-03",
    category: "VISUAL",
    prompt: "Every mirror shows you five seconds in the future.",
    subtext: "Your reflection suddenly stops copying you.",
    options: [
      { title: "Keep watching", detail: "The next five seconds may explain everything.", signal: "OBSERVE", signals: { patternFollowing: 1 } },
      { title: "Break the mirror", detail: "Some predictions should lose their window.", signal: "SHATTER", signals: { patternFollowing: 0, reversals: 1 } },
    ],
  },
  {
    id: "tradeoff-03",
    category: "TRADE-OFF",
    prompt: "The AI offers to reveal its entire model of you.",
    subtext: "Reading it will permanently change how it predicts you.",
    options: [
      { title: "Read the file", detail: "Self-knowledge is worth contaminating the test.", signal: "INSPECT", signals: { consistency: 1 } },
      { title: "Stay unread", detail: "The clean experiment matters more.", signal: "DENY", signals: { reversals: 1, riskPreference: 1 } },
    ],
  },
  {
    id: "pattern-03",
    category: "PATTERN",
    prompt: "A song exists that everyone loves except you.",
    subtext: "One listen will make you love it too, and erase why you resisted.",
    options: [
      { title: "Play the song", detail: "Shared joy may be worth surrendering a reason.", signal: "JOIN", signals: { patternFollowing: 1 } },
      { title: "Keep your silence", detail: "Your resistance belongs to you.", signal: "RESIST", signals: { patternFollowing: 0, reversals: 1 } },
    ],
  },
  {
    id: "risk-04",
    category: "RISK",
    prompt: "Final move: the AI will forget you, or remember you perfectly.",
    subtext: "There is no undo button.",
    options: [
      { title: "Make it forget", detail: "Freedom begins where the profile ends.", signal: "ERASE", signals: { riskPreference: 0 } },
      { title: "Let it remember", detail: "A worthy opponent should know your history.", signal: "REMEMBER", signals: { riskPreference: 1 } },
    ],
  },
];

export const MYSTERY_DROPS: Challenge[] = [
  {
    id: "mystery-echo",
    category: "MYSTERY",
    prompt: "MYSTERY DROP: Your last choice has appeared again.",
    subtext: "This time, the AI claims the option you avoid reveals more than the one you choose.",
    options: [
      { title: "Repeat yourself", detail: "Make consistency impossible to dismiss.", signal: "ECHO", signals: { consistency: 1, patternFollowing: 1 } },
      { title: "Break character", detail: "Refuse to become the pattern it named.", signal: "MUTATE", signals: { reversals: 1, patternFollowing: 0 } },
    ],
  },
  {
    id: "mystery-redaction",
    category: "MYSTERY",
    prompt: "MYSTERY DROP: One option has been redacted.",
    subtext: "You can choose the known action, or trust the action the system refuses to describe.",
    options: [
      { title: "Choose what is visible", detail: "Information is leverage.", signal: "KNOWN", signals: { riskPreference: 0 } },
      { title: "Choose [REDACTED]", detail: "The hidden move may be the only honest one.", signal: "UNKNOWN", signals: { riskPreference: 1, reversals: 1 } },
    ],
  },
  {
    id: "mystery-control",
    category: "MYSTERY",
    prompt: "MYSTERY DROP: The AI offers you control of the next prediction.",
    subtext: "It may be a gift. It may be measuring what you do with power.",
    options: [
      { title: "Take control", detail: "Use the system before it uses you.", signal: "SEIZE", signals: { riskPreference: 1, consistency: 1 } },
      { title: "Refuse control", detail: "The cleanest trap is the one you decline.", signal: "DENY", signals: { riskPreference: 0, reversals: 1 } },
    ],
  },
];

const ALL_CHALLENGES = [...CHALLENGES, ...MYSTERY_DROPS, ...CATEGORY_DEFINITIONS.flatMap((category) => category.challenges)];

export function challengeById(id: string): Challenge | undefined {
  return ALL_CHALLENGES.find((challenge) => challenge.id === id);
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function buildSessionChallengeIds(seenChallengeIds: string[]): { challengeIds: string[]; mysteryDropIndex: number } {
  const unseen = CHALLENGES.filter((challenge) => !seenChallengeIds.includes(challenge.id));
  const source = unseen.length >= 9 ? unseen : CHALLENGES;
  const candidates = shuffled(source);
  const selected: Challenge[] = [];
  for (const candidate of candidates) {
    if (selected.at(-1)?.category === candidate.category) continue;
    selected.push(candidate);
    if (selected.length === 9) break;
  }
  for (const candidate of candidates) {
    if (selected.length === 9) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }
  const mystery = shuffled(MYSTERY_DROPS)[0];
  const mysteryDropIndex = 2 + Math.floor(Math.random() * 6);
  selected.splice(mysteryDropIndex, 0, mystery);
  return { challengeIds: selected.map((challenge) => challenge.id), mysteryDropIndex };
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultDaily(): DailyState {
  return {
    date: todayKey(),
    started: false,
    round: 0,
    fooled: 0,
    completed: false,
    streak: 0,
    lastCompletedDate: null,
  };
}

export function defaultProgress(): Progress {
  return {
    version: VERSION,
    hasPlayed: false,
    sessions: 0,
    totalRounds: 0,
    aiCorrect: 0,
    aiPredictions: 0,
    fools: 0,
    bestFools: 0,
    model: { ...INITIAL_MODEL },
    daily: defaultDaily(),
    lastResult: null,
    history: [],
    playsToday: { date: todayKey(), count: 0 },
    seenChallengeIds: [],
  };
}

function normalizeDaily(daily: Partial<DailyState> | undefined): DailyState {
  const fallback = defaultDaily();
  if (!daily || daily.date !== fallback.date) {
    return {
      ...fallback,
      streak: daily?.streak ?? 0,
      lastCompletedDate: daily?.lastCompletedDate ?? null,
    };
  }
  return {
    ...fallback,
    ...daily,
    fooled: Math.min(5, Math.max(0, daily.fooled ?? 0)),
    round: Math.min(5, Math.max(0, daily.round ?? 0)),
  };
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
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

export function saveProgress(progress: Progress): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}

export function resetProgress(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

export function createSession(mode: Mode = "main", model: BehaviorModel = INITIAL_MODEL, seenChallengeIds: string[] = [], categoryKey: CategoryKey | null = null): Session {
  const category = categoryKey ? CATEGORY_DEFINITIONS.find((item) => item.key === categoryKey) : null;
  const sequence = category
    ? { challengeIds: shuffled(category.challenges).map((challenge) => challenge.id), mysteryDropIndex: -1 }
    : buildSessionChallengeIds(seenChallengeIds);
  return {
    mode,
    startedAt: Date.now(),
    currentIndex: 0,
    answers: [],
    predictions: [],
    model: { ...model },
    fools: 0,
    aiCorrect: 0,
    secondOrderSeen: false,
    ...sequence,
    categoryKey,
    score: 0,
    aiScore: 0,
  };
}

export function updateModel(model: BehaviorModel, answer: Answer, previousChoice?: 0 | 1): BehaviorModel {
  const weight = model.observations < 3 ? 0.28 : 0.18;
  const signal = (key: SignalKey, fallback: number): number =>
    answer.choice === 0
      ? answer.wasHesitant && key === "hesitation"
        ? 1
        : answer.wasRapid && key === "hesitation"
          ? 0
          : fallback
      : fallback;
  const optionSignals = challengeById(answer.challengeId)?.options[answer.choice].signals ?? {};
  const blend = (key: SignalKey, fallback: number): number =>
    model[key] * (1 - weight) + (optionSignals[key] ?? signal(key, fallback)) * weight;
  return {
    riskPreference: blend("riskPreference", 0.5),
    consistency: blend("consistency", previousChoice !== undefined && previousChoice === answer.choice ? 1 : 0),
    hesitation: blend("hesitation", answer.wasHesitant ? 1 : answer.wasRapid ? 0 : 0.5),
    reversals: blend("reversals", answer.reversed ? 1 : 0),
    patternFollowing: blend("patternFollowing", 0.5),
    leftBias: model.leftBias * (1 - weight) + (answer.choice === 0 ? 1 : 0) * weight,
    observations: model.observations + 1,
  };
}

export function predict(
  challenge: Challenge,
  model: BehaviorModel,
  answers: Answer[],
  secondOrder = false,
): PredictionRead {
  let leftProbability = model.leftBias * 0.48 + model.consistency * 0.12;
  const previous = answers.at(-1);
  const option = challenge.options[0].signals;
  leftProbability += ((option.riskPreference ?? 0.5) - 0.5) * (model.riskPreference - 0.5) * 0.32;
  leftProbability += ((option.patternFollowing ?? 0.5) - 0.5) * (model.patternFollowing - 0.5) * 0.2;
  if (previous && previous.choice === 0) leftProbability += (model.consistency - 0.5) * 0.18;
  if (secondOrder) {
    leftProbability = 0.5 + (0.5 - leftProbability) * (0.55 + model.reversals * 0.2);
  }
  const probability = Math.min(0.9, Math.max(0.1, leftProbability));
  const predictedChoice: 0 | 1 = probability >= 0.5 ? 0 : 1;
  const confidence = Math.round(
    Math.min(93, Math.max(56, 53 + Math.abs(probability - 0.5) * 92 + Math.min(8, answers.length * 0.55))),
  );
  return { predictedChoice, confidence, secondOrder };
}

export function predictAdvanced(
  challenge: Challenge,
  model: BehaviorModel,
  answers: Answer[],
  secondOrder = false,
): PredictionRead {
  const basic = predict(challenge, model, answers, secondOrder);
  const recent = answers.slice(-4);
  const recentLeft = recent.length ? recent.filter((answer) => answer.choice === 0).length / recent.length : model.leftBias;
  const reversalPressure = secondOrder ? model.reversals - 0.5 : 0;
  const probability = Math.min(0.94, Math.max(0.06, recentLeft * 0.34 + model.leftBias * 0.42 + model.consistency * 0.24 - reversalPressure * 0.22));
  return {
    predictedChoice: probability >= 0.5 ? 0 : 1,
    confidence: Math.min(96, Math.max(basic.confidence, Math.round(58 + Math.abs(probability - 0.5) * 78 + recent.length))),
    secondOrder,
  };
}

export function levelFor(fools: number): { level: number; name: string } {
  if (fools >= 12) return { level: 7, name: "AI BREAKER" };
  if (fools >= 9) return { level: 6, name: "CHAOTIC" };
  if (fools >= 7) return { level: 5, name: "UNREADABLE" };
  if (fools >= 5) return { level: 4, name: "UNSTABLE" };
  if (fools >= 3) return { level: 3, name: "PREDICTABLE" };
  if (fools >= 1) return { level: 2, name: "OBSERVED" };
  return { level: 1, name: "UNKNOWN" };
}

export function buildResult(session: Session): SessionResult {
  const predictionCount = session.predictions.length;
  const aiAccuracy = predictionCount ? Math.round((session.aiCorrect / predictionCount) * 100) : 0;
  const predictability = Math.round(
    Math.min(96, Math.max(8, aiAccuracy * 0.72 + session.model.consistency * 18 + session.model.hesitation * 10)),
  );
  const level = levelFor(session.fools);
  const observations: string[] = [];
  if (session.model.riskPreference > 0.58) observations.push("You reach for possibility when the stakes rise.");
  else if (session.model.riskPreference < 0.42) observations.push("You favor a known outcome when the stakes rise.");
  else observations.push("Ambiguity kept your choices close to the middle.");
  if (session.model.reversals > 0.58) observations.push("You were harder to predict when you changed direction on purpose.");
  else observations.push("You were easier to predict after establishing a rhythm.");
  if (session.model.hesitation > 0.58) observations.push("You were harder to predict when ambiguity gave you time to think.");
  else observations.push("Your first instinct arrived before the model could settle.");
  return {
    completedAt: Date.now(),
    mode: session.mode,
    durationMs: Date.now() - session.startedAt,
    rounds: session.answers.length,
    aiAccuracy,
    predictability,
    fools: session.fools,
    predictionCount,
    level: level.level,
    levelName: level.name,
    observations,
    score: session.score,
    aiScore: session.aiScore,
    categoryKey: session.categoryKey,
  };
}

export function mergeCompletedSession(progress: Progress, session: Session, result: SessionResult): Progress {
  return {
    ...progress,
    hasPlayed: true,
    sessions: progress.sessions + 1,
    totalRounds: progress.totalRounds + session.answers.length,
    aiCorrect: progress.aiCorrect + session.aiCorrect,
    aiPredictions: progress.aiPredictions + session.predictions.length,
    fools: progress.fools + session.fools,
    bestFools: Math.max(progress.bestFools, session.fools),
    model: session.model,
    lastResult: result,
    history: [result, ...progress.history].slice(0, 50),
    playsToday: {
      date: todayKey(),
      count: (progress.playsToday.date === todayKey() ? progress.playsToday.count : 0) + 1,
    },
    seenChallengeIds: [...new Set([...progress.seenChallengeIds, ...session.answers.map((answer) => answer.challengeId)])].slice(-60),
  };
}

export function dailyChallengeFor(round: number): Challenge {
  return CHALLENGES[(round * 3 + 2) % CHALLENGES.length];
}

export function recordDailyCompletion(daily: DailyState): DailyState {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  return {
    ...daily,
    completed: true,
    started: true,
    round: 5,
    streak: daily.lastCompletedDate === yesterdayKey ? daily.streak + 1 : 1,
    lastCompletedDate: daily.date,
  };
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}