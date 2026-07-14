import { formatCurrency } from "@/lib/format";

interface QuoteTotalsSummaryProps {
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
}

export function QuoteTotalsSummary({ subtotal, taxRate, taxAmount, total }: QuoteTotalsSummaryProps) {
  const taxPercentDisplay = (Number.parseFloat(taxRate) * 100).toFixed(2);

  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-ink-50 p-4">
      <div className="flex justify-between text-sm text-ink-600">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-ink-600">
        <span>Tax ({taxPercentDisplay}%)</span>
        <span>{formatCurrency(taxAmount)}</span>
      </div>
      <div className="mt-1 flex justify-between border-t border-ink-200 pt-1.5 text-base font-semibold text-ink-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
