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
