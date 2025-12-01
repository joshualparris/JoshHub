import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./dexie";
import type { FamilyRhythm } from "./schema";

export async function saveFamilyRhythm(input: {
  bedtime: string;
  dinner: string;
  responsibilities: string[];
  sylvieChecklist: string[];
  eliasChecklist: string[];
}) {
  const record: FamilyRhythm = {
    id: "rhythm",
    bedtime: input.bedtime,
    dinner: input.dinner,
    responsibilities: input.responsibilities,
    sylvieChecklist: input.sylvieChecklist,
    eliasChecklist: input.eliasChecklist,
    updatedAt: Date.now(),
  };
  await db.family.put(record);
  return record;
}

export function useFamilyRhythm() {
  return useLiveQuery(async () => db.family.get("rhythm"), []);
}
