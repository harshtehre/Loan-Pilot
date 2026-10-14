import { env } from '../config.js';
export type MLPayload={monthly_income:number;monthly_expenses:number;existing_emi:number;savings:number;credit_score:number;requested_amount:number;employment_years:number;dependents:number};
export type MLResult={eligibility_score:number;risk_level:'low'|'medium'|'high';feature_explanations:Record<string,string>;positive_factors:string[];risk_factors:string[];recommended_action:string;model_version:string;prediction_timestamp:string};
export async function analyzeFinancials(input:MLPayload):Promise<MLResult>{
 if(env.ML_SERVICE_URL){const r=await fetch(`${env.ML_SERVICE_URL.replace(/\/$/,'')}/predict`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});if(!r.ok)throw new Error('ML_SERVICE_ERROR');return await r.json() as MLResult;}
 const income=Math.max(input.monthly_income,1), burden=(input.monthly_expenses+input.existing_emi)/income, savingsMonths=input.savings/income;
 const score=Math.max(0,Math.min(100,Math.round(45+(input.credit_score-600)*0.16+(1-Math.min(burden,1))*25+Math.min(savingsMonths,12)*1.2+Math.min(input.employment_years,10)*0.6-input.dependents*0.8-(input.requested_amount/income>18?5:0))));
 const risk=score>=75?'low':score>=55?'medium':'high'; const positive:string[]=[];const risks:string[]=[];
 if(input.credit_score>=700)positive.push('Strong credit score');else if(input.credit_score<600)risks.push('Credit score is below 600');
 if(burden<=0.4)positive.push('Debt burden is within 40% of income');else risks.push(`Debt burden is ${(burden*100).toFixed(1)}% of income`);
 if(savingsMonths>=3)positive.push('Savings cover at least 3 months of income');else risks.push('Limited savings buffer');
 if(input.requested_amount/income>18)risks.push('Requested amount is high relative to monthly income');
 return {eligibility_score:score,risk_level:risk,feature_explanations:{credit_score:`Credit score: ${input.credit_score}`,debt_burden:`Expense + EMI burden: ${(burden*100).toFixed(1)}%`,savings:`Savings cover ${savingsMonths.toFixed(1)} months of income`,requested_to_income:`Requested amount is ${(input.requested_amount/income).toFixed(1)}× monthly income`},positive_factors:positive,risk_factors:risks,recommended_action:risk==='low'?'Proceed to human review and configured policy checks.':risk==='medium'?'Request additional verification and review configured policy thresholds.':'Escalate for enhanced human review and verify documents before any lending decision.',model_version:'baseline-rules-v2',prediction_timestamp:new Date().toISOString()};
}
