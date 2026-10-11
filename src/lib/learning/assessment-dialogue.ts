export type AssessmentStatus = "pass"|"clarify"|"revise";
export type DialogueResult = {
 status:AssessmentStatus;
 passed:boolean;
 summary:string;
 improvement:string;
 followUpQuestion?:string|null;
 creativeAlternative?:boolean;
 dimensions?:Record<string,number>;
};
export function combineReasoning(original:string,clarification:string):string {
 return original.trim()+"\nFurther explanation: "+clarification.trim();
}
export function assessmentOutcome(result:DialogueResult,usedHelp:boolean) {
 if(result.status==="pass" && result.passed) {
  return {finished:true,independent:!usedHelp,awaitingClarification:false};
 }
 return {finished:false,independent:false,awaitingClarification:result.status==="clarify"};
}
