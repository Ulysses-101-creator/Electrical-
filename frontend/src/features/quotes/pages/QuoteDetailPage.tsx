import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/client";
import { customersApi } from "@/api/customers";
import { quotesApi } from "@/api/quotes";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TopBar } from "@/components/layout/TopBar";
import { AddLineItemForm } from "@/features/quotes/components/AddLineItemForm";
import { LineItemRow } from "@/features/quotes/components/LineItemRow";
import { QuoteTotalsSummary } from "@/features/quotes/components/QuoteTotalsSummary";
import { SendQuoteModal } from "@/features/quotes/components/SendQuoteModal";
import { formatDate } from "@/lib/format";
import type { QuoteItemFormValues } from "@/lib/validation";

export function QuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const quoteQuery = useQuery({
    queryKey: ["quotes", quoteId],
    queryFn: () => quotesApi.get(quoteId as string),
    enabled: Boolean(quoteId),
  });

  const customerId = quoteQuery.data?.quote.customer_id;
  const customerQuery = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => customersApi.get(customerId as string),
    enabled: Boolean(customerId),
  });

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["quotes", quoteId] });
  }

  async function handleAddItem(values: QuoteItemFormValues) {
    if (!quoteId) return;
    setError(null);
    try {
      await quotesApi.addItem(quoteId, values);
      invalidate();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not add this line item."));
    }
  }

  async function handleUpdateItem(
    itemId: string,
    updates: Parameters<typeof quotesApi.updateItem>[2],
  ) {
    if (!quoteId) return;
    setError(null);
    try {
      await quotesApi.updateItem(quoteId, itemId, updates);
      invalidate();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update this line item."));
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!quoteId) return;
    setError(null);
    try {
      await quotesApi.deleteItem(quoteId, itemId);
      invalidate();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not remove this line item."));
    }
  }

  async function handleGeneratePdf() {
    if (!quoteId) return;
    setError(null);
    setIsGeneratingPdf(true);
    try {
      const result = await quotesApi.generatePdf(quoteId);
      window.open(result.pdf_url, "_blank", "noopener,noreferrer");
      invalidate();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not generate the PDF."));
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  async function handleSetStatus(status: "accepted" | "declined") {
    if (!quoteId) return;
    setError(null);
    try {
      await quotesApi.setStatus(quoteId, status);
      invalidate();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not update the quote status."));
    }
  }

  if (quoteQuery.isLoading || !quoteQuery.data) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const { quote, items } = quoteQuery.data;
  const customer = customerQuery.data?.customer;
  const isEditable = quote.status !== "accepted";

  return (
    <>
      <TopBar title="Quote" showBack />
      <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink-900">
              {customer?.name ?? "Loading customer…"}
            </h1>
            <p className="text-sm text-ink-500">Created {formatDate(quote.created_at)}</p>
          </div>
          <StatusBadge status={quote.status} />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {quote.status === "accepted" && (
          <Alert variant="success">
            This quote has been accepted. Editing requires confirmation.
          </Alert>
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Line items</h2>
          <div className="flex flex-col gap-2">
            {items.length === 0 && (
              <p className="text-sm text-ink-500">No line items yet. Add one below.</p>
            )}
            {items.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                onUpdate={(updates) => handleUpdateItem(item.id, updates)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
            {isEditable && <AddLineItemForm onAdd={handleAddItem} />}
          </div>
        </div>

        <QuoteTotalsSummary
          subtotal={quote.subtotal}
          taxRate={quote.tax_rate}
          taxAmount={quote.tax_amount}
          total={quote.total}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => void handleGeneratePdf()}
            isLoading={isGeneratingPdf}
            fullWidth
          >
            {quote.pdf_url ? "View PDF" : "Generate PDF"}
          </Button>
          <Button onClick={() => setIsSendModalOpen(true)} fullWidth disabled={items.length === 0}>
            Send quote
          </Button>
        </div>

        {quote.status === "sent" && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void handleSetStatus("accepted")}
              fullWidth
            >
              Mark as accepted
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void handleSetStatus("declined")}
              fullWidth
            >
              Mark as declined
            </Button>
          </div>
        )}
      </div>

      {customer && (
        <SendQuoteModal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          quote={quote}
          customer={customer}
          onSent={() => invalidate()}
        />
      )}
    </>
  );
}
