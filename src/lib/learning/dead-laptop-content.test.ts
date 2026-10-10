import { describe, expect, it } from "vitest";
import course from "../../data/dead-laptop-detective.json";

const testIds = new Set(course.tests.map(t => t.id));
const sourceIds = new Set(course.sources.map(s => s.id));
describe("Dead Laptop Detective content quality gates", () => {
  it("contains eight complete unique missions", () => {
    expect(course.missions).toHaveLength(8);
    expect(new Set(course.missions.map(m => m.id)).size).toBe(8);
    for (const mission of course.missions) {
      expect(mission.reading.length).toBeGreaterThanOrEqual(3);
      expect(mission.reading.join(" ").length).toBeGreaterThan(300);
      expect(mission.objective.length).toBeGreaterThan(24);
      for(const q of [mission.check,mission.activity]) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
      for(const id of mission.sourceIds) expect(sourceIds.has(id)).toBe(true);
    }
  });
  it("offers three distinct cases with actionable decisive clues", () => {
    expect(course.cases).toHaveLength(3);
    expect(new Set(course.cases.map(c => c.family)).size).toBe(3);
    for(const c of course.cases) {
      expect(c.required.length).toBeGreaterThanOrEqual(2);
      for(const id of c.required) expect(testIds.has(id)).toBe(true);
      for(const t of course.tests) expect((c.readings as Record<string,string>)[t.id]?.length).toBeGreaterThan(12);
      expect(c.reason.length).toBeGreaterThan(100);
    }
  });
  it("media links are explicit, identifiable resources, not search endpoints", () => {
    expect(course.media.videoUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+$/);
    expect(course.media.imageUrl).toContain("thumb.wikimedia.org");
    expect(course.media.podcastUrl).toContain("podcasts.apple.com");
    expect(course.sources.every(s => s.url.startsWith("https://"))).toBe(true);
  });
  it("the course clearly distinguishes a fictional circuit diagram and readings from real repair", () => {
    expect(course.designedFor.toLowerCase()).toContain("not a certificate");
    expect(course.missions[0].reading.join(" ").toLowerCase()).toContain("swollen");
    expect(course.missions[3].reading.join(" ").toLowerCase()).toContain("simulat");
    expect(course.missions[7].reading.join(" ").toLowerCase()).toContain("fictional");
  });
});
