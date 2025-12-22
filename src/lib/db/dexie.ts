import Dexie, { Table } from "dexie";
import type {
  Activity,
  Bookmark,
  CalendarEvent,
  DailyMetrics,
  FamilyRhythm,
  HealthImport,
  DigitalEvent,
  MetricLog,
  MovementLog,
  Note,
  NutritionLog,
  Pin,
  Routine,
  RoutineRun,
  SleepLog,
  Task,
  TelemetryPoint,
  // Platform (new)
  PlatformMoveOp,
  PlatformDecisionCard,
  PlatformOpportunity,
  PlatformWeeklyReview,
  // Learn
  LearnNote,
  LearnResource,
  LearnSession,
  LearnSetting,
  LearnTopic,
} from "./schema";
import { uuid } from "./id";

class JoshHubDB extends Dexie {
  notes!: Table<Note>;
  tasks!: Table<Task>;
  bookmarks!: Table<Bookmark>;
  routines!: Table<Routine>;
  routineRuns!: Table<RoutineRun>;
  pins!: Table<Pin>;
  events!: Table<CalendarEvent>;
  sleep!: Table<SleepLog>;
  movement!: Table<MovementLog>;
  nutrition!: Table<NutritionLog>;
  metrics!: Table<MetricLog>;
  family!: Table<FamilyRhythm>;
  activities!: Table<Activity>;
  dailyMetrics!: Table<DailyMetrics>;
  healthImports!: Table<HealthImport>;
  telemetry!: Table<TelemetryPoint>;
  digitalEvents!: Table<DigitalEvent>;
  // Platform
  platformMoveOps!: Table<PlatformMoveOp>;
  platformDecisionCards!: Table<PlatformDecisionCard>;
  platformOpportunities!: Table<PlatformOpportunity>;
  platformWeeklyReviews!: Table<PlatformWeeklyReview>;
  // Learn
  learnTopics!: Table<LearnTopic>;
  learnResources!: Table<LearnResource>;
  learnNotes!: Table<LearnNote>;
  learnSessions!: Table<LearnSession>;
  learnSettings!: Table<LearnSetting>;

  constructor() {
    super("joshhub-db");
    this.version(1).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
    });
    this.version(2).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
    });
    this.version(3).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
    });
    this.version(4).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
      platformMoveOps: "id, status, dueDate, sortOrder, createdAt",
      platformDecisionCards: "id, status, dueBy, createdAt",
      platformOpportunities: "id, stage, expectedValuePerMonth, createdAt",
      platformWeeklyReviews: "id, weekStart, createdAt",
    });
    this.version(5).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
      platformMoveOps: "id, status, dueDate, sortOrder, createdAt",
      platformDecisionCards: "id, status, dueBy, createdAt",
      platformOpportunities: "id, stage, expectedValuePerMonth, createdAt",
      platformWeeklyReviews: "id, weekStart, createdAt",
      // Learn stores
      learnTopics: "id, name, category, status, tags, updatedAt, createdAt",
      learnResources: "id, title, type, status, createdAt, updatedAt",
      learnNotes: "id, topicId, resourceId, createdAt, updatedAt",
      learnSessions: "id, topicId, resourceId, minutes, createdAt",
      learnSettings: "key, updatedAt",
    });
    this.version(6).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
      platformMoveOps: "id, status, dueDate, sortOrder, createdAt",
      platformDecisionCards: "id, status, dueBy, createdAt",
      platformOpportunities: "id, stage, expectedValuePerMonth, createdAt",
      platformWeeklyReviews: "id, weekStart, createdAt",
      learnTopics: "id, name, category, status, tags, updatedAt, createdAt",
      learnResources: "id, title, type, status, createdAt, updatedAt",
      learnNotes: "id, topicId, resourceId, createdAt, updatedAt",
      learnSessions: "id, topicId, resourceId, minutes, createdAt",
      learnSettings: "key, updatedAt",
      activities: "id, startTimeIso, sport, createdAt",
      dailyMetrics: "date, updatedAt",
      healthImports: "id, fileName, status, createdAt",
      telemetry: "id, timestampIso, type, source",
    });
    this.version(7).stores({
      notes: "id, nodeId, lifeAreaSlug, updatedAt, createdAt",
      tasks: "id, status, dueDate, projectId, updatedAt, createdAt",
      bookmarks: "id, url, createdAt",
      routines: "id, name, createdAt",
      routineRuns: "id, routineId, startedAt",
      pins: "id, createdAt",
      events: "id, startIso, endIso, updatedAt, createdAt",
      sleep: "id, date",
      movement: "id, date",
      nutrition: "id, date",
      metrics: "id, dateTimeIso",
      family: "id",
      platformMoveOps: "id, status, dueDate, sortOrder, createdAt",
      platformDecisionCards: "id, status, dueBy, createdAt",
      platformOpportunities: "id, stage, expectedValuePerMonth, createdAt",
      platformWeeklyReviews: "id, weekStart, createdAt",
      learnTopics: "id, name, category, status, tags, updatedAt, createdAt",
      learnResources: "id, title, type, status, createdAt, updatedAt",
      learnNotes: "id, topicId, resourceId, createdAt, updatedAt",
      learnSessions: "id, topicId, resourceId, minutes, createdAt",
      learnSettings: "key, updatedAt",
      activities: "id, startTimeIso, sport, createdAt",
      dailyMetrics: "date, updatedAt",
      healthImports: "id, fileName, status, createdAt",
      telemetry: "id, timestampIso, type, source",
      digitalEvents: "id, timestampIso, type, source, createdAt",
    });
  }
}

export const db = new JoshHubDB();

// Seed routines if empty (morning/evening)
export async function seedRoutines() {
  const count = await db.routines.count();
  if (count === 0) {
    const now = Date.now();
    await db.routines.bulkAdd([
      {
        id: uuid(),
        name: "Morning start",
        tags: ["routine"],
        createdAt: now,
        items: [
          { id: uuid(), label: "Water + light", type: "check" },
          { id: uuid(), label: "Plan the day", type: "check" },
          { id: uuid(), label: "Movement 10m", type: "timer", seconds: 600 },
        ],
      },
      {
        id: uuid(),
        name: "Evening wind-down",
        tags: ["routine"],
        createdAt: now,
        items: [
          { id: uuid(), label: "Screens off", type: "check" },
          { id: uuid(), label: "Tidy reset", type: "check" },
          { id: uuid(), label: "Stretch", type: "timer", seconds: 300 },
        ],
      },
    ]);
  }
}

// Seed Learn topics + prompt templates if empty
export async function seedLearnData() {
  const count = await db.learnTopics.count();
  if (count > 0) return;
  const now = Date.now();
  const topics: LearnTopic[] = [
    // Faith
    { id: uuid(), name: "Jesus’ life and teachings", category: "Faith", tags: ["faith"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Holy Spirit’s role in daily life", category: "Faith", tags: ["faith"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Fruits of the Spirit", category: "Faith", tags: ["faith"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Spiritual disciplines (prayer, fasting, Scripture)", category: "Faith", tags: ["faith", "spiritual disciplines"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    // Marriage & Family
    { id: uuid(), name: "Strengthening connection with Kristy", category: "Marriage & Family", tags: ["marriage"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Parenting neurodiverse kids", category: "Marriage & Family", tags: ["parenting", "neurodiversity"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Building family rhythms", category: "Marriage & Family", tags: ["family"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    // Health & Longevity
    { id: uuid(), name: "HRV optimisation", category: "Health & Longevity", tags: ["health"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Sleep optimisation", category: "Health & Longevity", tags: ["health", "sleep"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Anti-inflammatory eating (dairy-free)", category: "Health & Longevity", tags: ["health", "nutrition"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    // Technology & AI
    { id: uuid(), name: "Building a personalised AI assistant", category: "Technology & AI", tags: ["ai", "tools"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Home server rack + power setup", category: "Technology & AI", tags: ["home lab"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    // Work & Career
    { id: uuid(), name: "Customer care leadership scripts/process", category: "Work & Career", tags: ["work"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    // Finance & Planning
    { id: uuid(), name: "Paying off mortgage plan", category: "Finance & Planning", tags: ["finance"], status: "curious", summary: "", createdAt: now, updatedAt: now },
    { id: uuid(), name: "Budgeting that works for ADHD", category: "Finance & Planning", tags: ["finance", "adhd"], status: "curious", summary: "", createdAt: now, updatedAt: now },
  ];

  await db.learnTopics.bulkAdd(topics);

  const templates = [
    { name: "Explain & Apply", template: "Explain {{topic}} and provide practical steps to apply it in daily life for {{context}}." },
    { name: "Deep Dive", template: "Deep dive into {{topic}}: key concepts, historical context, and advanced resources relevant to {{context}}." },
    { name: "Practice Plan (7 days)", template: "Create a 7-day practice plan for {{topic}} with daily actionable tasks, focusing on {{context}}." },
  ];

  await db.learnSettings.put({ key: "promptTemplates", value: JSON.stringify(templates), updatedAt: now });
}
