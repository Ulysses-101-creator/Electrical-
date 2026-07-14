import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { customersApi } from "@/api/customers";
import { getApiErrorMessage } from "@/api/client";
import { quotesApi } from "@/api/quotes";
import { Alert } from "@/components/common/Alert";
import { Spinner } from "@/components/common/Spinner";
import { TopBar } from "@/components/layout/TopBar";
import { CustomerPicker } from "@/features/quotes/components/CustomerPicker";
import { JobDescriptionInput } from "@/features/quotes/components/JobDescriptionInput";
import type { AISuggestedItem, Customer } from "@/types";

type Step = "customer" | "job-description";

export function QuoteCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("customer");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefilledCustomerId = searchParams.get("customerId");

  useEffect(() => {
    if (prefilledCustomerId && !selectedCustomer) {
      customersApi
        .get(prefilledCustomerId)
        .then((result) => {
          setSelectedCustomer(result.customer);
          setStep("job-description");
        })
        .catch(() => {
          // If the customer can't be loaded, fall back silently to manual selection.
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledCustomerId]);

  function handleCustomerSelect(customer: Customer) {
    setSelectedCustomer(customer);
    if (customer) setStep("job-description");
  }

  async function createQuoteAndNavigate(
    jobDescription: string | undefined,
    suggestions: AISuggestedItem[],
  ) {
    if (!selectedCustomer) return;
    setIsCreating(true);
    setError(null);
    try {
      const quote = await quotesApi.create({
        customer_id: selectedCustomer.id,
        job_description_input: jobDescription,
      });

      // Add AI-suggested items sequentially so ordering is preserved.
      for (const suggestion of suggestions) {
        await quotesApi.addItem(quote.id, {
          description: suggestion.description,
          category: suggestion.category,
          quantity: Number.parseFloat(suggestion.quantity),
          unit_price: Number.parseFloat(suggestion.unit_price),
        });
      }

      navigate(`/quotes/${quote.id}`, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create the quote. Please try again."));
      setIsCreating(false);
    }
  }

  function handleSuggestionsReady(suggestions: AISuggestedItem[], description: string) {
    void createQuoteAndNavigate(description, suggestions);
  }

  function handleSkip() {
    void createQuoteAndNavigate(undefined, []);
  }

  if (isCreating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" label="Creating your quote" />
      </div>
    );
  }

  return (
    <>
      <TopBar title="New Quote" showBack />
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <h1 className="hidden text-2xl font-bold text-ink-900 sm:block">New Quote</h1>

        {error && <Alert variant="error">{error}</Alert>}

        {step === "customer" && (
          <CustomerPicker selectedCustomer={selectedCustomer} onSelect={handleCustomerSelect} />
        )}

        {step === "job-description" && selectedCustomer && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-ink-200 p-3">
              <p className="text-sm text-ink-500">Quoting for</p>
              <p className="font-medium text-ink-900">{selectedCustomer.name}</p>
            </div>
            <JobDescriptionInput
              onSuggestionsReady={handleSuggestionsReady}
              onSkip={handleSkip}
            />
          </div>
        )}
      </div>
    </>
  );
}
