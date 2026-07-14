import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { quotesApi } from "@/api/quotes";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/features/auth/useAuth";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Quote } from "@/types";

function isWithinLast7Days(isoDate: string): boolean {
  const date = new Date(isoDate);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return date >= sevenDaysAgo;
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["quotes", "dashboard"],
    queryFn: () => quotesApi.list({}),
  });

  const quotes = data?.items ?? [];
  const recentQuotes = quotes.filter((q) => isWithinLast7Days(q.created_at));
  const totalQuotedValue = recentQuotes.reduce((sum, q) => sum + Number.parseFloat(q.total), 0);
  const respondedQuotes = quotes.filter((q) => q.status === "accepted" || q.status === "declined");
  const acceptanceRate =
    respondedQuotes.length > 0
      ? Math.round(
          (respondedQuotes.filter((q) => q.status === "accepted").length /
            respondedQuotes.length) *
            100,
        )
      : null;

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="flex flex-col gap-6">
        <div className="hidden items-center justify-between sm:flex">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">
              Welcome back, {user?.business_name}
            </h1>
            <p className="text-sm text-ink-500">Here's how your quoting is going.</p>
          </div>
          <Link to="/quotes/new">
            <Button>New Quote</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-ink-500">Quotes this week</p>
                <p className="mt-1 text-2xl font-bold text-ink-900">{recentQuotes.length}</p>
              </Card>
              <Card>
                <p className="text-sm text-ink-500">Quoted value (7 days)</p>
                <p className="mt-1 text-2xl font-bold text-ink-900">
                  {formatCurrency(totalQuotedValue)}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-ink-500">Acceptance rate</p>
                <p className="mt-1 text-2xl font-bold text-ink-900">
                  {acceptanceRate !== null ? `${acceptanceRate}%` : "—"}
                </p>
              </Card>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-ink-900">Recent quotes</h2>
              {quotes.length === 0 ? (
                <EmptyState
                  title="No quotes yet"
                  description="Create your first quote and send it in under a minute."
                  action={
                    <Link to="/quotes/new">
                      <Button>Create your first quote</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {quotes.slice(0, 5).map((quote: Quote) => (
                    <Link key={quote.id} to={`/quotes/${quote.id}`}>
                      <Card className="flex items-center justify-between hover:border-brand-300">
                        <div>
                          <p className="font-medium text-ink-900">
                            {formatCurrency(quote.total)}
                          </p>
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
        )}
      </div>

      <Link
        to="/quotes/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-lg sm:hidden"
        aria-label="New quote"
      >
        +
      </Link>
    </>
  );
}
