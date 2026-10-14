export const inr=(n:number)=>'₹'+Math.round(Number(n)||0).toLocaleString('en-IN');
export const calcEmi=(P:number,annualRate:number,n:number)=>{const r=annualRate/12/100;const emi=r===0?P/n:(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);return {emi:Math.round(emi),totalInterest:Math.round(emi*n-P),totalPayment:Math.round(emi*n),r,n,P};};
export const statusLabel=(s:string)=>({draft:'Draft',submitted:'Submitted',under_review:'Under Review',ai_analysis:'AI Analysis',approved:'Approved',rejected:'Rejected',needs_documents:'Needs Documents'} as Record<string,string>)[s]||s;
export const statusClass=(s:string)=>({draft:'b-slate',submitted:'b-indigo',under_review:'b-amber',ai_analysis:'b-indigo',approved:'b-green',rejected:'b-red',needs_documents:'b-amber'} as Record<string,string>)[s]||'b-slate';
