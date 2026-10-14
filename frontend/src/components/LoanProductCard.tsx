import type { LoanProduct } from '../types';
import { inr } from '../lib/format';
import { useToast } from '../context/ToastContext';

export default function LoanProductCard({ product }: { product: LoanProduct }) {
  const toast = useToast();
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold">{product.name}</h3>
        <span className="badge b-indigo">{product.active} active</span>
      </div>
      <div className="text-2xl font-semibold mono mb-3">
        {product.rate}<span className="text-sm font-normal" style={{ color: 'var(--text-dim)' }}>% p.a.</span>
      </div>
      <div className="text-sm space-y-1.5" style={{ color: 'var(--text-dim)' }}>
        <div className="flex justify-between"><span>Min. credit score</span><span>{product.minCredit}</span></div>
        <div className="flex justify-between"><span>Min. monthly income</span><span>{inr(product.minIncome)}</span></div>
        <div className="flex justify-between"><span>Max. amount</span><span>{inr(product.maxAmount)}</span></div>
        <div className="flex justify-between"><span>Max. tenure</span><span>{product.maxTenure} mo</span></div>
      </div>
      <button className="btn btn-ghost btn-sm w-full mt-4" onClick={() => toast(`Product editing is available from the product configuration workflow.`)}>
        Edit product
      </button>
    </div>
  );
}
