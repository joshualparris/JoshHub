import { db } from "../../../db/dexie";
import { uuid } from "../../../db/id";
import {
  PlatformMoveOp,
  PlatformDecisionCard,
  PlatformOpportunity,
  PlatformWeeklyReview,
} from "../../../db/schema";

export async function seedPlatformData() {
  const now = new Date().toISOString();

  // Guard: Check if MoveOps data exists (assuming if MoveOps exist, others might too or we just skip)
  const count = await db.platformMoveOps.count();
  if (count > 0) {
    console.log("Platform data already seeded, skipping.");
    return;
  }

  console.log("Seeding Platform data...");

  // --- MoveOps (Jan 2026 Context) ---
  const moveOps: PlatformMoveOp[] = [
    {
      id: uuid(),
      title: "Final Pack - Jan Juc",
      status: "done",
      dueDate: "2026-01-05",
      notes: "Ensure all boxes are labeled and garage is clear.",
      tags: ["moving", "house"],
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "NDIS Handover Docs",
      status: "todo",
      dueDate: "2026-01-08",
      notes: "Prepare summary for new coordinator in NSW.",
      tags: ["admin", "health"],
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Dad Arrives",
      status: "todo",
      dueDate: "2026-01-12",
      notes: "Airport pickup? Or meeting at house?",
      tags: ["family", "logistics"],
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Car Rego Transfer Prep",
      status: "todo",
      dueDate: "2026-01-13",
      notes: "Check Service NSW requirements for interstate transfer.",
      tags: ["admin", "car"],
      sortOrder: 4,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Convoy to New Home",
      status: "doing",
      dueDate: "2026-01-14",
      notes: "The big drive. Stops planned at Gundagai.",
      tags: ["moving", "travel"],
      sortOrder: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Mazda Service",
      status: "todo",
      dueDate: "2026-01-15",
      notes: "Booked at local mechanic in new area.",
      tags: ["car", "maintenance"],
      sortOrder: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Unpack Essentials",
      status: "todo",
      dueDate: "2026-01-16",
      notes: "Kitchen, Beds, Bathroom.",
      tags: ["moving", "house"],
      sortOrder: 7,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "DCS Start Day",
      status: "todo",
      dueDate: "2026-01-19",
      notes: "First day at new job/contract. Laptop ready?",
      tags: ["work"],
      sortOrder: 8,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Kids School Prep",
      status: "todo",
      dueDate: "2026-01-20",
      notes: "Uniforms, bags, lunch boxes.",
      tags: ["family", "school"],
      sortOrder: 9,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Kristy Infusion Day 1",
      status: "todo",
      dueDate: "2026-01-28",
      notes: "Hospital bag packed. Transport arranged.",
      tags: ["health", "family"],
      sortOrder: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Kristy Infusion Day 2",
      status: "todo",
      dueDate: "2026-01-29",
      notes: "Recovery mode at home.",
      tags: ["health", "family"],
      sortOrder: 11,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      title: "Family Drive / Explore",
      status: "todo",
      dueDate: "2026-01-30",
      notes: "Check out the local beaches and parks.",
      tags: ["family", "leisure"],
      sortOrder: 12,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // --- Decision Cards ---
  const decisions: PlatformDecisionCard[] = [
    {
      id: uuid(),
      question: "Preschool days confirmation",
      status: "open",
      dueBy: "2026-01-10",
      context: "Need to lock in Mon/Wed or Tue/Thu for Elias.",
      tags: ["family", "school"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      question: "Kristy work arrangement",
      status: "open",
      dueBy: "2026-01-15",
      context: "Part-time vs Casual start date?",
      tags: ["work", "family"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      question: "Service NSW appointment timing",
      status: "open",
      dueBy: "2026-01-16",
      context: "Do we go together or separate?",
      tags: ["admin"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      question: "Internet at Boundary",
      status: "decided",
      decision: "Starlink",
      context: "NBN FTTN is too slow/unreliable for remote work.",
      tags: ["tech", "house"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      question: "Removalist vs Self-move",
      status: "decided",
      decision: "Self-move with Trailer",
      context: "Save costs, we have the towing capacity.",
      tags: ["moving"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      question: "Gym Membership",
      status: "parked",
      context: "Wait until settled to see which gym is closest.",
      tags: ["health"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // --- Opportunities ---
  const opportunities: PlatformOpportunity[] = [
    {
      id: uuid(),
      name: "JoshPlatform Build",
      stage: "committed",
      expectedValuePerMonth: 0,
      probability: 1.0,
      notes: "Internal tool for life management. High non-monetary value.",
      tags: ["dev", "personal"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: "Parris Tech Services",
      stage: "validated",
      expectedValuePerMonth: 2500,
      probability: 0.7,
      notes: "Consulting side-hustle for local businesses.",
      tags: ["business"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: "Remote Contract A",
      stage: "seed",
      expectedValuePerMonth: 8000,
      probability: 0.2,
      notes: "Potential React/Next.js contract role.",
      tags: ["work"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      name: "Micro-SaaS Idea",
      stage: "parked",
      expectedValuePerMonth: 500,
      probability: 0.1,
      notes: "Niche tool for NDIS plan management.",
      tags: ["startup"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // --- Weekly Reviews ---
  const reviews: PlatformWeeklyReview[] = [
    {
      id: uuid(),
      weekStart: "2026-01-12",
      wins: "Dad arrived safely. Convoy preparation complete.",
      drains: "Packing stress. Last minute cleaning.",
      top3: ["Drive safely", "Unpack essentials", "Relax"],
      experiment: "No screens after 9pm during the move.",
      createdAt: now,
      updatedAt: now,
    },
  ];

  // --- Transaction ---
  await db.transaction(
    "rw",
    [
      db.platformMoveOps,
      db.platformDecisionCards,
      db.platformOpportunities,
      db.platformWeeklyReviews,
    ],
    async () => {
      await db.platformMoveOps.bulkAdd(moveOps);
      await db.platformDecisionCards.bulkAdd(decisions);
      await db.platformOpportunities.bulkAdd(opportunities);
      await db.platformWeeklyReviews.bulkAdd(reviews);
    }
  );

  console.log("JoshPlatform seeded with Jan 2026 context!");
}
