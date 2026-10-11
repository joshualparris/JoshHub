import {describe,expect,it} from "vitest";
import {
  canMarkCapstonePractised,correctChoice,decisions,firstPassRate,gradeTransfers,
  hasFinishedDecisions,longestAnswerBias,sources,tierFromHistory,transferCases,
  type DecisionHistory
} from "./power-fault-capstone";

function solvedHistory():DecisionHistory {
  return Object.fromEntries(decisions.map(d=>[d.id,{selection:correctChoice(d).id,tries:1,firstCorrect:true,explanation:"Independent test and supported inference."}]));
}
function solvedTransfer():Record<string,string>{
  return Object.fromEntries(transferCases.map(t=>[t.id,correctChoice(t).id]));
}
describe("Laptop power-fault capstone curriculum gates",()=>{
  it("uses eight complete evidence-focused decisions and three unseen transfer cases",()=>{
    expect(decisions).toHaveLength(8);
    expect(transferCases).toHaveLength(3);
    expect(new Set(decisions.map(d=>d.id)).size).toBe(8);
    for(const d of [...decisions,...transferCases]){
      expect(d.choices).toHaveLength(4);
      expect(new Set(d.choices.map(c=>c.id)).size).toBe(4);
      expect(d.choices.every(c=>c.text.length>=32)).toBe(true);
      expect(d.choices.every(c=>c.feedback.length>=26)).toBe(true);
      expect(correctChoice(d).correct).toBe(true);
    }
    for(const d of decisions){
      expect(d.observation.length).toBeGreaterThan(110);
      expect(d.principle.length).toBeGreaterThan(85);
      expect(d.expertPrompt.length).toBeGreaterThan(35);
      expect(d.hint.length).toBeGreaterThan(35);
    }
  });
  it("does not reward selecting the longest option or always the same position",()=>{
    const all=[...decisions,...transferCases];
    expect(new Set(all.map(d=>d.choices.findIndex(c=>c.correct))).size).toBe(4);
    expect(longestAnswerBias(all)).toBeLessThan(65);
  });
  it("preserves the distinction between investigation completion and human-reviewed competence",()=>{
    const history=solvedHistory(), transfer=solvedTransfer();
    expect(hasFinishedDecisions(history)).toBe(true);
    expect(gradeTransfers(transfer)).toEqual({correct:3,total:3,missed:[]});
    expect(canMarkCapstonePractised(history,transfer,"Short")).toBe(false);
    expect(canMarkCapstonePractised(history,transfer,"Reported: brief white LED flash without POST. Isolated battery, SSD, SO-DIMM and Wi-Fi with no change. Suspect power-sequencing/board path, not a proven component. Data retained; arrange appropriate qualified diagnosis.")).toBe(true);
    delete history["meter"];
    expect(hasFinishedDecisions(history)).toBe(false);
  });
  it("adjusts support level to performance without erasing incorrect first attempts",()=>{
    const h=solvedHistory();
    expect(tierFromHistory(h)).toBe("expert");
    const poor:DecisionHistory={};
    for(const d of decisions.slice(0,3)) poor[d.id]={selection:correctChoice(d).id,tries:2,firstCorrect:false,explanation:"Misconception corrected."};
    expect(tierFromHistory(poor)).toBe("guided");
    expect(firstPassRate(poor)).toBe(0);
    expect(firstPassRate(solvedHistory())).toBe(100);
  });
  it("teaches customer data protection, test uncertainty and stop-work boundaries",()=>{
    const text=decisions.map(d=>JSON.stringify(d)).join(" ").toLowerCase();
    expect(text).toContain("ohms");
    expect(text).toContain("unpowered");
    expect(text).toContain("repaste");
    expect(text).toContain("bitlocker");
    expect(text).toContain("consent");
    expect(text).toContain("under load");
    expect(text).not.toContain("peter tosh");
    expect(sources).toHaveLength(4);
    expect(sources.every(s=>s.url.startsWith("https://")&&s.task.length>40)).toBe(true);
  });
  it("requires every transfer decision and excludes false mastery with incomplete observations",()=>{
    const t=solvedTransfer();t.screen="os";
    expect(gradeTransfers(t)).toEqual({correct:2,total:3,missed:["screen"]});
    expect(canMarkCapstonePractised(solvedHistory(),t,"x".repeat(200))).toBe(false);
  });
});
