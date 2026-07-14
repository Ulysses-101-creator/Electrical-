import type { QuoteStatus } from "@/types";

const STATUS_STYLES: Record<QuoteStatus, string> = {
  draft: "bg-ink-100 text-ink-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
  expired: "bg-amber-100 text-amber-800",
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  expired: "Expired",
};

interface StatusBadgeProps {
  status: QuoteStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status],
      ].join(" ")}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
