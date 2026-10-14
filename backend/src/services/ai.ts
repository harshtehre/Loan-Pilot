import { env } from '../config.js';

export type ChatMessage={role:'system'|'user'|'assistant';content:string};
export async function aiChat(messages:ChatMessage[], options?:{temperature?:number}):Promise<string>{
  if(!env.AI_API_KEY) throw new Error('AI_PROVIDER_NOT_CONFIGURED');
  const r=await fetch(`${env.AI_BASE_URL.replace(/\/$/,'')}/chat/completions`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${env.AI_API_KEY}`},body:JSON.stringify({model:env.AI_MODEL,messages,temperature:options?.temperature??0.2})});
  if(!r.ok) throw new Error(`AI_PROVIDER_ERROR_${r.status}`);
  const j=await r.json() as any;
  return j.choices?.[0]?.message?.content ?? '';
}

export function buildLoanSystemPrompt(context:string, detail:'concise'|'standard'|'detailed'='standard'){
 const detailRule=detail==='concise'?'Keep answers brief and action-oriented.':detail==='detailed'?'Provide a structured, detailed explanation and distinguish facts, assumptions, and missing information.':'Use a clear, balanced explanation with practical next steps.';
 return `You are LoanPilot AI, a lending-operations decision-support assistant.\nResponse detail: ${detailRule}\nRules: never guarantee approval, never make a final underwriting decision, never invent lender policies, and only use the supplied business context. Minimize exposure of personal information. Clearly distinguish configured policy from model suggestions.\n\nBUSINESS CONTEXT:\n${context}`;
}
