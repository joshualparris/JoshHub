// Core types
export type Note = {
  id: string;
  nodeId?: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  archivedAt?: number | null;
  lifeAreaSlug?: string | null;
};

export type TaskStatus = "open" | "done";
export type TaskPriority = "low" | "med" | "high";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  tags: string[];
  projectId?: string | null;
  createdAt: number;
  updatedAt: number;
};

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  createdAt: number;
};

export type RoutineItem = {
  id: string;
  label: string;
  type: "check" | "timer";
  seconds?: number;
};

export type Routine = {
  id: string;
  name: string;
  items: RoutineItem[];
  tags: string[];
  createdAt: number;
};

export type RoutineRun = {
  id: string;
  routineId: string;
  startedAt: number;
  finishedAt?: number;
  completedCount: number;
};

export type Pin = {
  id: string; // life area slug
  createdAt: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  startIso: string;
  endIso: string;
  location?: string;
  notes?: string;
  tags: string[];
  source: "manual";
  createdAt: number;
  updatedAt: number;
};

export type SleepLog = {
  id: string;
  date: string; // YYYY-MM-DD
  bedtimeIso?: string | null;
  wakeIso?: string | null;
  durationMinutes?: number | null;
  quality?: number | null;
  notes?: string;
  tags: string[];
  createdAt: number;
};

export type MovementLog = {
  id: string;
  date: string;
  type: "walk" | "ride" | "strength" | "mobility" | "other";
  minutes: number;
  intensity: "low" | "med" | "high";
  notes?: string;
  createdAt: number;
};

export type NutritionLog = {
  id: string;
  date: string;
  summary: string;
  proteinGrams?: number | null;
  vegServes?: number | null;
  satFatGrams?: number | null;
  notes?: string;
  createdAt: number;
};

export type MetricLog = {
  id: string;
  dateTimeIso: string;
  metricType: "weight" | "hrv" | "restingHR" | "bp" | "other";
  value: number;
  unit: string;
  notes?: string;
  createdAt: number;
};

export type FamilyRhythm = {
  id: string;
  bedtime: string;
  dinner: string;
  responsibilities: string[];
  sylvieChecklist: string[];
  eliasChecklist: string[];
  updatedAt: number;
};

// Health
export type ActivitySport = "run" | "walk" | "ride" | "other";

export type Activity = {
  id: string;
  source: "tcx" | "fit_json";
  fileName?: string;
  sport: ActivitySport;
  startTimeIso?: string | null;
  endTimeIso?: string | null;
  distanceM?: number | null;
  durationSec?: number | null;
  elevationGainM?: number | null;
  calories?: number | null;
  avgSpeedMps?: number | null;
  createdAt: number;
};

export type DailyMetrics = {
  date: string; // YYYY-MM-DD
  runsCount: number;
  runDistanceM: number;
  distanceM: number;
  steps?: number | null;
  updatedAt: number;
};

export type HealthImport = {
  id: string;
  fileName: string;
  status: "success" | "error";
  message?: string | null;
  sourceType?: "tcx" | "fit_json" | "my_activity_html" | "unknown";
  sizeBytes?: number | null;
  rawPreview?: string | null;
  createdAt: number;
};

export type TelemetryPoint = {
  id: string;
  timestampIso: string;
  type: "hr" | "hrv" | "step" | "speed" | "other";
  value: number;
  unit?: string | null;
  source?: string | null;
  createdAt: number;
};

export type DigitalEvent = {
  id: string;
  source: "my_activity_html" | "fit_json" | "manual" | "unknown";
  timestampIso: string | null;
  type: "search" | "gemini" | "youtube" | "visit" | "unknown";
  text: string;
  url?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: number;
};

// Platform (new upstream schema)
export type PlatformMoveOp = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  dueDate?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  sortOrder?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformDecisionCard = {
  id: string;
  question: string;
  status: "open" | "decided" | "parked";
  dueBy?: string | null;
  decision?: string | null;
  context?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformOpportunity = {
  id: string;
  name: string;
  stage: "seed" | "shaped" | "experiment" | "validated" | "committed" | "parked";
  expectedValuePerMonth?: number | null;
  probability?: number | null;
  stressScore?: number | null;
  notes?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type PlatformWeeklyReview = {
  id: string;
  weekStart: string;
  wins?: string | null;
  drains?: string | null;
  givesLife?: string | null;
  top3?: string[] | null;
  experiment?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Learn feature types
export type LearnStatus = "curious" | "studying" | "practising" | "on-hold";

export type LearnTopic = {
  id: string;
  name: string;
  category?: string | null;
  tags: string[];
  status: LearnStatus;
  summary?: string;
  createdAt: number;
  updatedAt: number;
};

export type LearnResource = {
  id: string;
  title: string;
  type: string; // book | article | video | course | other
  url?: string;
  author?: string;
  status: "queue" | "in-progress" | "done";
  topicIds: string[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export type LearnNote = {
  id: string;
  topicId?: string | null;
  resourceId?: string | null;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type LearnSession = {
  id: string;
  topicId?: string | null;
  resourceId?: string | null;
  minutes: number;
  reflection?: string;
  nextStep?: string;
  createdAt: number;
};

export type LearnSetting = {
  key: string;
  value: string; // JSON stringified
  updatedAt: number;
};
