import business from "../../data/dubbo-business-field-guide.json";
import outreach from "../../data/outreach-quiz.json";
import tiers from "../../data/field-guide-adaptive-challenges.json";
import { z } from "zod";
import { simChallenges } from "./simChallenges";

const writtenResponse = z.string().min(0).max(2400);
export const gradingRequest = z.discriminatedUnion("kind",[
  z.object({kind:z.literal("research"),course:z.enum(["business","outreach"]),lessonId:z.string().regex(/^[a-z-]{2,35}$/),level:z.union([z.literal(1),z.literal(2),z.literal(3)]),selected:z.number().int().min(0).max(3),response:writtenResponse}).strict(),
  z.object({kind:z.literal("simulation"),simulator:z.enum(["laptop","cafe"]),challengeId:z.string().regex(/^(laptop|cafe):[0-9]{1,2}$/),selected:z.number().int().min(0).max(2),response:writtenResponse}).strict(),
  z.object({kind:z.literal("reflection"),course:z.literal("cafe"),response:writtenResponse}).strict()
]);
export type GradingRequest = z.infer<typeof gradingRequest>;
type Question = {question:string;options:string[];answer:number;explanation:string};
const appliedOutreach:Record<string,Question>=Object.fromEntries(outreach.map(x=>[x.id,x]));
const variations=tiers.variants as Record<string,{guided:Question;expert:Question}>;
export function resolveAssessment(input:GradingRequest): Question|null {
  if(input.kind==="reflection")return {question:"After running a fictional Repair Café event, identify ONE feasible improvement for next month. Base it on a concrete incident from the Saturday, name a trade-off or alternative, specify the action within limited volunteer capacity and say how you will check that it worked.",options:[],answer:-1,explanation:"Look for operational ownership, a specific and proportionate process improvement, evidence from the event, realistic capacity/safety constraints, and a measurable or observable follow-up. Vague praise, merely repeating that safety matters, or a large unfunded commitment are insufficient."};
  if(input.kind==="simulation"){
    const item=simChallenges[input.simulator].find(x=>x.id===input.challengeId);
    return item?{question:item.question,options:item.options,answer:item.answer,explanation:item.explanation}:null;
  }
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
