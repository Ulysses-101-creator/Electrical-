import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/client";
import { publicQuoteApi } from "@/api/public";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { formatCurrency, formatDate } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  labor: "Labor",
  material: "Materials",
  callout: "Callout / Travel",
  other: "Other",
};

export function PublicQuoteViewPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [responded, setResponded] = useState<"accepted" | "declined" | null>(null);
  const [isResponding, setIsResponding] = useState<"accepted" | "declined" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: quote, isLoading } = useQuery({
    queryKey: ["public-quote", shareToken],
    queryFn: () => publicQuoteApi.get(shareToken as string),
    enabled: Boolean(shareToken),
  });

  async function handleRespond(response: "accepted" | "declined") {
    if (!shareToken) return;
    setError(null);
    setIsResponding(response);
    try {
      await publicQuoteApi.respond(shareToken, response);
      setResponded(response);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit your response. Please try again."));
    } finally {
      setIsResponding(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-ink-900">Quote not available</h1>
          <p className="mt-1 text-sm text-ink-500">
            This link may be invalid or the quote may have been removed.
          </p>
        </div>
      </div>
    );
  }

  const canRespond = quote.status === "sent" && !quote.expired && !responded;

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        {quote.business.logo_url && (
          <img
            src={quote.business.logo_url}
            alt={quote.business.business_name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        )}
        <div>
          <h1 className="text-lg font-bold text-ink-900">{quote.business.business_name}</h1>
          <p className="text-sm text-ink-500">Quote for {quote.customer_name}</p>
        </div>
      </div>

      {quote.expired && (
        <div className="mb-4">
          <Alert variant="warning">This quote has expired. Please contact the business directly.</Alert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {responded && (
        <div className="mb-4">
          <Alert variant="success">
            Thanks! You've {responded === "accepted" ? "accepted" : "declined"} this quote.
          </Alert>
        </div>
      )}

      <div className="rounded-xl border border-ink-200 bg-white p-4">
        <div className="flex flex-col gap-2">
          {quote.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="text-ink-900">{item.description}</p>
                <p className="text-ink-500">
                  {CATEGORY_LABELS[item.category]} · {item.quantity} ×{" "}
                  {formatCurrency(item.unit_price)}
                </p>
              </div>
              <p className="shrink-0 font-medium text-ink-900">
                {formatCurrency(Number.parseFloat(item.quantity) * Number.parseFloat(item.unit_price))}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-ink-200 pt-3 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink-600">
            <span>Tax</span>
            <span>{formatCurrency(quote.tax_amount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatCurrency(quote.total)}</span>
          </div>
        </div>

        {quote.valid_until && (
          <p className="mt-3 text-xs text-ink-500">Valid until {formatDate(quote.valid_until)}</p>
        )}

        {quote.notes && (
          <div className="mt-4 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">{quote.notes}</div>
        )}
      </div>

      {canRespond && (
        <div className="mt-6 flex gap-3">
          <Button
            fullWidth
            onClick={() => void handleRespond("accepted")}
            isLoading={isResponding === "accepted"}
          >
            Accept quote
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onClick={() => void handleRespond("declined")}
            isLoading={isResponding === "declined"}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
