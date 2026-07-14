import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { quotesApi } from "@/api/quotes";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Select } from "@/components/common/Select";
import { Spinner } from "@/components/common/Spinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TopBar } from "@/components/layout/TopBar";
import { formatCurrency, formatDate } from "@/lib/format";
import type { QuoteStatus } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "expired", label: "Expired" },
];

export function QuoteListPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["quotes", { status: statusFilter }],
    queryFn: () => quotesApi.list({ status: statusFilter || undefined }),
  });

  const quotes = data?.items ?? [];

  return (
    <>
      <TopBar
        title="Quotes"
        action={
          <Link to="/quotes/new" aria-label="New quote" className="text-2xl text-brand-600">
            +
          </Link>
        }
      />
      <div className="flex flex-col gap-4">
        <div className="hidden items-center justify-between sm:flex">
          <h1 className="text-2xl font-bold text-ink-900">Quotes</h1>
          <Link to="/quotes/new">
            <Button>New Quote</Button>
          </Link>
        </div>

        <Select
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | "")}
          className="max-w-xs"
        />

        {isLoading ? (
          <div className="py-12">
            <Spinner size="lg" />
          </div>
        ) : quotes.length === 0 ? (
          <EmptyState
            title="No quotes found"
            description="Try a different filter, or create a new quote."
            action={
              <Link to="/quotes/new">
                <Button>New Quote</Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {quotes.map((quote) => (
              <Link key={quote.id} to={`/quotes/${quote.id}`}>
                <Card className="flex items-center justify-between hover:border-brand-300">
                  <div>
                    <p className="font-medium text-ink-900">{formatCurrency(quote.total)}</p>
                    <p className="text-sm text-ink-500">{formatDate(quote.created_at)}</p>
                  </div>
                  <StatusBadge status={quote.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
