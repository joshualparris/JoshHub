import { isUpcomingEvent, sortEventsByStart } from "@/lib/calendar/time";
import type { Bookmark, CalendarEvent, Note, Task } from "@/lib/db/schema";

export type CareLane = {
  key: string;
  title: string;
  tags: string[];
  description: string;
};

export const CARE_LANES: CareLane[] = [
  {
    key: "care1",
    title: "Care Support 1",
    tags: ["care1"],
    description: "Providers, therapy blocks, and supports.",
  },
  {
    key: "care2",
    title: "Care Support 2",
    tags: ["care2"],
    description: "Care coordination, treatment, and rest rhythms.",
  },
];

export function intersectsTags(source: string[] = [], targets: string[] = []) {
  return source.some((tag) => targets.includes(tag));
}

export function selectNextCareEvent(
  events: CalendarEvent[],
  tags: string[],
  nowMillis = Date.now()
): CalendarEvent | undefined {
  return sortEventsByStart(
    events.filter((event) => intersectsTags(event.tags, tags) && isUpcomingEvent(event, nowMillis))
  )[0];
}

export function selectNextCareTask(tasks: Task[], tags: string[]): Task | undefined {
  return tasks
    .filter((task) => task.status === "open" && intersectsTags(task.tags, tags))
    .sort((left, right) => {
      if (left.dueDate && right.dueDate) return left.dueDate.localeCompare(right.dueDate);
      if (left.dueDate) return -1;
      if (right.dueDate) return 1;
      return right.updatedAt - left.updatedAt;
    })[0];
}

export function selectLatestCareNote(notes: Note[], tags: string[]): Note | undefined {
  return notes
    .filter(
      (note) =>
        intersectsTags(note.tags, tags) ||
        note.lifeAreaSlug === "family" ||
        note.lifeAreaSlug === "health"
    )
    .sort((left, right) => right.updatedAt - left.updatedAt)[0];
}

export function countCareProviders(bookmarks: Bookmark[], tags: string[]): number {
  return bookmarks.filter((bookmark) => intersectsTags(bookmark.tags, tags)).length;
}
