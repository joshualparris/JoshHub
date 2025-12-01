export type EventSource = "manual";

export type CalendarEvent = {
  id: string;
  title: string;
  startIso: string;
  endIso: string;
  location?: string;
  notes?: string;
  tags?: string[];
  source: EventSource;
  createdAt: number;
  updatedAt: number;
};
