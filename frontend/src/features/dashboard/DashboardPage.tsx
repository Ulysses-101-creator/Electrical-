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
  const recentQuotes = quotes.filter((q) => isWithinLast7Days(q.createdAt));
  const totalQuotedValue = recentQuotes.reduce((sum, q) => sum + q.total, 0);

  const respondedQuotes = quotes.filter(
    (q) => q.status === "accepted" || q.status === "rejected"
  );

  const acceptanceRate =
    respondedQuotes.length > 0
      ? Math.round(
          (respondedQuotes.filter((q) => q.status === "accepted").length /
            respondedQuotes.length) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <TopBar title="Dashboard" />

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
              ElectricQuote AI
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Good evening, {user?.business_name ?? "Contractor"}
            </h1>
            <p className="mt-3 text-slate-400">
              Here’s what’s happening in your business today.
            </p>
          </div>

          <Link to="/quotes/new">
            <Button className="bg-white text-black hover:bg-slate-200">
              New quote
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Quotes this week</p>
            <p className="mt-3 text-4xl font-semibold">
              {recentQuotes.length}
            </p>
          </Card>

          <Card className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Revenue quoted</p>
            <p className="mt-3 text-4xl font-semibold">
              {formatCurrency(totalQuotedValue)}
            </p>
          </Card>

          <Card className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Acceptance rate</p>
            <p className="mt-3 text-4xl font-semibold">
              {acceptanceRate}%
            </p>
          </Card>
        </div>

        <Card className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent quotes</h2>
              <p className="text-sm text-slate-400">
                Your latest quotations and client activity.
              </p>
            </div>
            <Link to="/quotes" className="text-sm text-blue-400">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No quotes yet"
                description="Create your first professional quotation."
                action={
                  <Link to="/quotes/new">
                    <Button>Create quote</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-6 divide-y divide-white/10">
              {quotes.slice(0, 5).map((quote: Quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium">{quote.clientName}</p>
                    <p className="text-sm text-slate-400">
                      {formatDate(quote.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(quote.total)}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <StatusBadge status={quote.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
