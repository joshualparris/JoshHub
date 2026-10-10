export type FaultCase = {
  id: string;
  family: string;
  required: string[];
};

export type CaseGrade = { passed: boolean; message: string; missing: string[] };

export function gradeCase(
  caseInfo: FaultCase,
  observations: string[],
  evidence: string[],
  diagnosis: string
): CaseGrade {
  const observed = new Set(observations);
  const cited = new Set(evidence.filter((id) => observed.has(id)));
  const missing = caseInfo.required.filter((id) => !observed.has(id));
  if (missing.length) {
    return { passed: false, message: "Investigate the decisive clues before submitting a verdict. Try another virtual test.", missing };
  }
  if (evidence.length < 2 || cited.size < 2 || caseInfo.required.some((id) => !cited.has(id))) {
    return { passed: false, message: "Choose both decisive observations from your actual lab notes, not just the diagnosis.", missing: [] };
  }
  if (diagnosis !== caseInfo.family) {
    return { passed: false, message: "The diagnosis does not fit all the evidence. Compare your two strongest clues and try again.", missing: [] };
  }
  return { passed: true, message: "Case solved. Your verdict identifies the best-supported fault family, not an exact replacement part.", missing: [] };
}

export function canCompleteMission(missionId: string, answers: Record<string, { activity?: number; check?: number }>, activityCorrect: number, checkCorrect: number, casesSolved: Record<string, boolean>, caseIds: string[]) {
  const record = answers[missionId];
  if (!record || record.activity !== activityCorrect || record.check !== checkCorrect) return false;
  if (missionId === "final") return caseIds.every((id) => casesSolved[id]);
  return true;
}

export function progressPercentage(completed: string[], missionIds: string[]) {
  if (!missionIds.length) return 0;
  return Math.round((missionIds.filter((id) => completed.includes(id)).length / missionIds.length) * 100);
}

export const STORAGE_VERSION = "dead-laptop-detective-v2";
