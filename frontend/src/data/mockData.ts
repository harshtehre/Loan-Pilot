import type { Application, LoanProduct, EmiResult, ApplicationStatus } from '../types';

// ============================================================
// Synthetic demo data only — clearly labeled as sample data in the UI.
// Swap this module for real API calls (see README) when the backend
// described in backend/schema.sql is connected.
// ============================================================

export const OFFICERS = ['Priya Sharma', 'Rahul Mehta', 'Ananya Rao', 'Karan Joshi'];
const NAMES = [
  'Ramesh Kulkarni', 'Sneha Patil', 'Vikram Deshmukh', 'Anjali Joshi', 'Suresh Naik',
  'Pooja Gaikwad', 'Amit Shinde', 'Kavita Pawar', 'Rohan Bhosale', 'Meera Kale',
  'Sandeep Pandit', 'Nikita Jadhav',
];
export const STATUSES: ApplicationStatus[] = [
  'Draft', 'Submitted', 'Under Review', 'AI Analysis', 'Approved', 'Rejected', 'Needs Documents',
];
export const STATUS_COLOR: Record<ApplicationStatus, string> = {
  Draft: 'b-slate', Submitted: 'b-indigo', 'Under Review': 'b-amber', 'AI Analysis': 'b-indigo',
  Approved: 'b-green', Rejected: 'b-red', 'Needs Documents': 'b-amber',
};

function seededApplications(n: number): Application[] {
  const apps: Application[] = [];
  for (let i = 0; i < n; i++) {
    const amount = 80000 + Math.floor(Math.random() * 900000);
    const credit = 480 + Math.floor(Math.random() * 370);
    const risk = credit > 700 ? 'Low' : credit > 590 ? 'Medium' : 'High';
    apps.push({
      id: 'LP-' + (2200 + i),
      name: NAMES[i % NAMES.length],
      amount,
      credit,
      risk,
      eligibility: Math.max(20, Math.min(96, Math.round((credit - 400) / 6))),
      status: STATUSES[i % STATUSES.length],
      officer: OFFICERS[i % OFFICERS.length],
      date: new Date(Date.now() - i * 86400000 * 1.7).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      income: 22000 + Math.floor(Math.random() * 60000),
      expenses: 8000 + Math.floor(Math.random() * 15000),
      emi: Math.floor(Math.random() * 8000),
      dependents: Math.floor(Math.random() * 4),
      savings: Math.floor(Math.random() * 300000),
      tenure: [12, 24, 36, 48, 60][i % 5],
      employment: ['Salaried', 'Self-Employed', 'Business Owner'][i % 3],
      years: 1 + Math.floor(Math.random() * 10),
    });
  }
  return apps;
}

export const APPLICATIONS: Application[] = seededApplications(24);

export const PRODUCTS: LoanProduct[] = [
  { name: 'Personal Loan Standard', rate: 11.5, minCredit: 650, minIncome: 25000, maxAmount: 1000000, maxTenure: 60, active: 34 },
  { name: 'MSME Business Loan', rate: 13.2, minCredit: 600, minIncome: 40000, maxAmount: 2500000, maxTenure: 84, active: 19 },
  { name: 'Quick Cash Advance', rate: 16.0, minCredit: 550, minIncome: 18000, maxAmount: 300000, maxTenure: 24, active: 41 },
];

export function calcEmi(P: number, annualRate: number, n: number): EmiResult {
  const r = annualRate / 12 / 100;
  const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    r, n, P,
  };
}

export function inr(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
