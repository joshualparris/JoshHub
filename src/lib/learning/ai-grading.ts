import business from "../../data/dubbo-business-field-guide.json";
import outreach from "../../data/outreach-quiz.json";
import tiers from "../../data/field-guide-adaptive-challenges.json";
import { z } from "zod";
import { simChallenges } from "./simChallenges";
import repairCafeCases from "../../data/repair-cafe-simulator.json";

const writtenResponse = z.string().min(0).max(2400);
export const gradingRequest = z.discriminatedUnion("kind",[
  z.object({kind:z.literal("research"),course:z.enum(["business","outreach"]),lessonId:z.string().regex(/^[a-z-]{2,35}$/),level:z.union([z.literal(1),z.literal(2),z.literal(3)]),selected:z.number().int().min(0).max(3).nullable().optional(),response:writtenResponse}).strict(),
  z.object({kind:z.literal("simulation"),simulator:z.enum(["laptop","cafe"]),challengeId:z.string().regex(/^(laptop|cafe):[0-9]{1,2}$/),selected:z.number().int().min(0).max(2).nullable().optional(),response:writtenResponse}).strict(),
  z.object({kind:z.literal("reflection"),course:z.literal("cafe"),response:writtenResponse}).strict()
]);
export type GradingRequest = z.infer<typeof gradingRequest>;
type Question = {question:string;options:string[];answer:number;explanation:string};
const appliedOutreach:Record<string,Question>=Object.fromEntries(outreach.map(x=>[x.id,x]));
const variations=tiers.variants as Record<string,{guided:Question;expert:Question}>;
export function resolveAssessment(input:GradingRequest): Question|null {
  if(input.kind==="reflection")return {question:"After running a fictional Repair Café event, identify ONE feasible improvement for next month. Base it on a concrete incident from the Saturday, name a trade-off or alternative, specify the action within limited volunteer capacity and say how you will check that it worked. Known simulated incidents: "+repairCafeCases.incidents.map(x=>x.title+" — "+x.story).join(" | "),options:[],answer:-1,explanation:"The submitted plan must refer to a genuine simulated incident, explain a specific intervention, compare a plausible alternative, name an accountable role, acknowledge risk and propose a measurable check. The reported decisions remain learner-supplied, not independently observed. Do not award mastery for vague praise or an unfunded commitment."};
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
/** Reject non-answers cheaply, not concise but genuinely reasoned alternatives. */
export function writingQuality(raw:string):WritingQuality{
 const text=raw.normalize("NFKC").trim();
 const words=text.match(/\p{L}[\p{L}'’-]*/gu)??[];
 const distinct=new Set(words.map(w=>w.toLocaleLowerCase("en")));
 const letters=(text.match(/\p{L}/gu)??[]).length;
 if(text.length>2400)return {ok:false,reason:"Please keep your answer under 2,400 characters.",words:words.length};
 if(letters<7 || distinct.size<2)return {ok:false,reason:"Tell me what you would do and why, even briefly. Punctuation or repeated filler isn't an answer.",words:words.length};
 if(/\b(?:password|api[_ -]?key|access token)\s*[:=]\s*\S{8,}/i.test(text))return {ok:false,reason:"Remove passwords, tokens or confidential details before submitting.",words:words.length};
 // No arbitrary word minimum, sentence punctuation rule or boilerplate alternatives requirement.
 return {ok:true,words:words.length};
}
export function duplicateAnswer(student:string,option:string):boolean{
 const simple=(s:string)=>s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu," ").replace(/\s+/g," ").trim();
 const a=simple(student),b=simple(option);
 return a===b||a.startsWith(b+" ")&&a.length<b.length+55;
}
export const modelGradeSchema = z.object({
 status:z.enum(["pass","clarify","revise"]),
 understanding:z.number().int().min(0).max(4),
 evidence:z.number().int().min(0).max(4),
 alternatives:z.number().int().min(0).max(4),
 risk:z.number().int().min(0).max(4),
 substantive:z.boolean(),
 creativeAlternative:z.boolean(),
 summary:z.string().min(12).max(650),
 improvement:z.string().min(10).max(650),
 followUpQuestion:z.string().max(320).nullable(),
});
/** AI suggests a disposition but cannot award completion if underlying rubric fails. */
export function gradingDecision(g:{
 status?:"pass"|"clarify"|"revise";
 understanding:number;evidence:number;alternatives:number;risk:number;substantive:boolean
}):"pass"|"clarify"|"revise" {
 const total=g.understanding+g.evidence+g.alternatives+g.risk;
 const strong=g.substantive && g.understanding>=3 && g.evidence>=2 && g.alternatives>=2 && g.risk>=2 && total>=10;
 if(g.status==="revise")return "revise";
 if(g.status==="pass" && strong)return "pass";
 return g.substantive && g.understanding>=2?"clarify":"revise";
}
export function calculateMastery(g:{understanding:number;evidence:number;alternatives:number;risk:number;substantive:boolean;status?:"pass"|"clarify"|"revise"}) {
 return gradingDecision({...g,status:g.status??"pass"})==="pass";
}
