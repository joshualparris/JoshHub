import business from "../../data/dubbo-business-field-guide.json";
import tiers from "../../data/field-guide-adaptive-challenges.json";
import { z } from "zod";

export const gradingRequest = z.object({
  course: z.enum(["business","outreach"]),
  lessonId: z.string().regex(/^[a-z-]{2,35}$/),
  level: z.union([z.literal(1),z.literal(2),z.literal(3)]),
  selected: z.number().int().min(0).max(3),
  response: z.string().max(2400),
}).strict();
export type GradingRequest = z.infer<typeof gradingRequest>;
type Question = {question:string;options:string[];answer:number;explanation:string};
const appliedOutreach:Record<string,Question>={
 locate: {
  question:"Two potential sources reply: a computer repair shop has six uncollected client laptops; an employer has three owned PCs with approved release records but no stated erasure method. Which lead should you advance first?",
  options:["Arrange collection of the six laptops after the shop's manager agrees verbally.","Collect only the laptops without chargers because they have little resale value.","Explore a strictly conditional pilot with the employer, verifying data sanitisation/custody before any collection.","Contact both organisations with the same agreement and adjust the forms after the first collection."],
  answer:2,
  explanation:"The employer has a clearer potential ownership path, but data responsibility is unresolved. No stock should move before authorisation and safe handoff."
 },
 authority:{
  question:"A business manager offers five retired laptops. Two are leased, one has a swollen battery, and the remaining two have unidentified drives. Which pilot scope is most justified?",
  options:["Accept the two non-leased units straightaway because unidentified storage can be wiped later.","Include all five after receiving one generic donation form signed by the manager.","Remove drives from the five units at collection, treating the battery risk as separate from the device donation.","Exclude leased units pending title confirmation and isolate the damaged battery device; consider the two others only after release, sanitisation and downstream responsibilities are settled."],
  answer:3,
  explanation:"A transfer form does not cancel lease obligations or battery hazards, and data-bearing equipment needs an authorised plan."
 },
 capacity:{
  question:"You have three hours of project time this fortnight, two uncontacted independent shops, an unanswered existing email and no space for more than five devices. Which plan best balances learning, relationships and capacity?",
  options:["Send the same collection offer to both shops and the local schools, then prioritise whoever replies first.","Follow up once with the existing contact when reasonable, approach one genuinely uncontacted shop with a process question, and reserve time to prepare a five-unit acceptance checklist.","Use the full three hours building a stock-tracking database so outreach can begin once the software is complete.","Spend the three hours researching every local employer in case one has a large fleet."],
  answer:1,
  explanation:"A narrow, consent-aware enquiry and verified acceptance workflow fit a small pilot better than volume or premature tooling."
 }
};
const variations=tiers.variants as Record<string,{guided:Question;expert:Question}>;
export function resolveAssessment(input:Pick<GradingRequest,"course"|"lessonId"|"level">): Question|null {
  const key=(input.course==="business"?"business-":"outreach-")+input.lessonId;
  const variants=variations[key];
  if (!variants)return null;
  if(input.level===1)return variants.guided;
  if(input.level===3)return variants.expert;
  if(input.course==="business")return business.lessons.find(x=>x.id===input.lessonId)?.check??null;
  return appliedOutreach[input.lessonId]??null;
}
export type WritingQuality={ok:boolean;reason?:string;words:number};
export function writingQuality(raw:string):WritingQuality{
 const text=raw.normalize("NFKC").trim();
 const words=text.match(/\p{L}[\p{L}'-]{1,}/gu)??[];
 const distinct=new Set(words.map(w=>w.toLowerCase()));
 if(text.length>2400)return {ok:false,reason:"Please keep your reasoning under 2,400 characters.",words:words.length};
 if(words.length<24 || distinct.size<14) return {ok:false,reason:"Explain your decision in your own words (at least 24 meaningful words with some detail). Punctuation, repeated words and copied options do not count.",words:words.length};
 if(!/[.!?;:]|\n/.test(text))return {ok:false,reason:"Write at least one clear sentence connecting the scenario to your decision.",words:words.length};
 if(/\b(?:password|api[_ -]?key|access token)\s*[:=]\s*\S{8,}/i.test(text))return {ok:false,reason:"Please remove any passwords, access tokens or confidential details before submitting.",words:words.length};
 return {ok:true,words:words.length};
}
export function duplicateAnswer(student:string,option:string):boolean{
 const simple=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu," ").replace(/\s+/g," ").trim();
 const a=simple(student),b=simple(option);
 return a===b||a.startsWith(b+" ")&&a.length<b.length+55;
}
export const modelGradeSchema = z.object({
 understanding:z.number().int().min(0).max(4),
 evidence:z.number().int().min(0).max(4),
 alternatives:z.number().int().min(0).max(4),
 risk:z.number().int().min(0).max(4),
 substantive:z.boolean(),
 summary:z.string().min(15).max(650),
 improvement:z.string().min(15).max(650),
});
export function calculateMastery(g:z.infer<typeof modelGradeSchema>) {
 // AI cannot override the minimum explicit component standards.
 return g.substantive && g.understanding>=3 && g.evidence>=3 && g.alternatives>=2 && g.risk>=2 && (g.understanding+g.evidence+g.alternatives+g.risk)>=12;
}
