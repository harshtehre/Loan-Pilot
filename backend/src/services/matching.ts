type Applicant={credit:number;income:number;amount:number;tenure:number;employment:string};
type Product={id:string;name:string;interest_rate:number;min_credit_score:number|null;min_monthly_income:number|null;max_loan_amount:number;min_tenure_months:number;max_tenure_months:number;employment_requirements:any;eligibility_rules:any;required_documents:string[];active:boolean};
export function matchProducts(a:Applicant,products:Product[]){
 return products.filter(p=>p.active).map(p=>{
  const reasons:string[]=[]; const missing:string[]=[];
  if(p.min_credit_score && a.credit<p.min_credit_score) missing.push(`Credit score below ${p.min_credit_score}`); else if(p.min_credit_score) reasons.push(`Credit score ≥ ${p.min_credit_score}`);
  if(p.min_monthly_income && a.income<p.min_monthly_income) missing.push(`Income below ₹${p.min_monthly_income}`); else if(p.min_monthly_income) reasons.push(`Income ≥ ₹${p.min_monthly_income}`);
  if(a.amount>p.max_loan_amount) missing.push(`Requested amount exceeds ₹${p.max_loan_amount}`); else reasons.push('Requested amount within product limit');
  if(a.tenure<p.min_tenure_months||a.tenure>p.max_tenure_months) missing.push(`Tenure outside ${p.min_tenure_months}-${p.max_tenure_months} months`); else reasons.push('Requested tenure is supported');
  const reqType=String(p.employment_requirements?.type||'').toLowerCase();
  if(reqType && reqType!==a.employment.toLowerCase()) missing.push(`Employment type must be ${p.employment_requirements.type}`); else if(reqType) reasons.push('Employment requirement met');
  return {...p,match:missing.length===0,reasons,missing};
 });
}
