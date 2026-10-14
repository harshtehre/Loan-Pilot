export type RiskLevel='Low'|'Medium'|'High';
export type ApplicationStatus='Draft'|'Submitted'|'Under Review'|'AI Analysis'|'Approved'|'Rejected'|'Needs Documents';
export interface Application{id:string;name:string;amount:number;credit:number;risk:RiskLevel;eligibility:number;status:ApplicationStatus;officer:string;date:string;income:number;expenses:number;emi:number;dependents:number;savings:number;tenure:number;employment:string;years:number;}
export interface LoanProduct{name:string;rate:number;minCredit:number;minIncome:number;maxAmount:number;maxTenure:number;active:number;id?:string;minTenure?:number;interestRate?:number;}
export interface EmiResult{emi:number;totalInterest:number;totalPayment:number;r:number;n:number;P:number;}
export interface AiMessage{role:'user'|'assistant';text:string;}
