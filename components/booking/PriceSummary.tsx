import type { PriceBreakdown } from "@/types";
import { formatCents } from "@/lib/pricing";

interface PriceSummaryProps {
  breakdown: PriceBreakdown;
  taxRate: number;
}

export function PriceSummary({ breakdown, taxRate }: PriceSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      {/* Line items */}
      <div className="divide-y divide-gray-100">
        {breakdown.lineItems.map((item, i) => (
          <div key={i} className="flex justify-between items-center px-4 py-3">
            <span className="text-gray-700 text-sm">{item.label}</span>
            <span className="text-gray-900 font-medium text-sm">
              {formatCents(item.priceCents)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 divide-y divide-gray-100">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500 text-sm">Subtotal</span>
          <span className="text-gray-700 text-sm">
            {formatCents(breakdown.subtotalCents)}
          </span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-gray-500 text-sm">
            Tax ({(taxRate * 100).toFixed(2)}%)
          </span>
          <span className="text-gray-700 text-sm">
            {formatCents(breakdown.taxCents)}
          </span>
        </div>
        <div className="flex justify-between items-center px-4 py-3.5">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-gray-900 text-lg">
            {formatCents(breakdown.totalCents)}
          </span>
        </div>
      </div>
    </div>
  );
}
