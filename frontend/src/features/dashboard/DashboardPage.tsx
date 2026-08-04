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
  const respondedQuotes = quotes.filter((q) => q.status === "accepted" || q.status === "rejected");
  const acceptanceRate =
    respondedQuotes.length > 0
      ? Math.round(
          (respondedQuotes.filter((q) => q.status === "accepted").length /
            respondedQuotes.length) *
            100,
        )
      : null;

  const outstandingQuotes = quotes.filter(
    (q) => q.status === "sent" || q.status === "viewed"
  ).length;

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <TopBar title="Dashboard" />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header Section */}
        <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              ElectricQuote AI
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Good afternoon, {user?.business_name ?? "Contractor"}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Track quotes, customers, and revenue from one professional dashboard.
            </p>
          </div>

          <Link to="/quotes/new">
            <Button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <span>+</span>
              <span>New quote</span>
            </Button>
          </Link>
        </section>

        {/* KPI Grid */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-2xl border border-white/10 bg-white shadow-sm">
            <p className="text-sm text-slate-400">Quotes this week</p>
            <p className="mt-3 text-4xl font-semibold">{recentQuotes.length}</p>
          </Card>

          <Card className="rounded-2xl border border-white/10 bg-white shadow-sm">
            <p className="text-sm text-slate-400">Revenue quoted</p>
            <p className="mt-3 text-4xl font-semibold">{formatCurrency(totalQuotedValue)}</p>
          </Card>

          <Card className="rounded-2xl border border-white/10 bg-white shadow-sm">
            <p className="text-sm text-slate-400">Acceptance rate</p>
            <p className="mt-3 text-4xl font-semibold">
              {acceptanceRate !== null ? `${acceptanceRate}%` : "—"}
            </p>
          </Card>

          <Card className="rounded-2xl border border-white/10 bg-white shadow-sm">
            <p className="text-sm text-slate-400">Outstanding quotes</p>
            <p className="mt-3 text-4xl font-semibold">{outstandingQuotes}</p>
          </Card>
        </section>

        {/* Recent Quotes */}
        <section className="mt-10">
          <Card className="rounded-3xl border border-white/10 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-semibold">Recent quotes</h2>
                <p className="text-sm text-slate-400">
                  Your latest quotations and client activity
                </p>
              </div>
              <Link to="/quotes" className="text-sm text-blue-400 hover:text-blue-600">
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : quotes.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No quotes yet"
                  description="Create your first professional quote in under a minute."
                  action={
                    <Link to="/quotes/new">
                      <Button>Create quote</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quotes.slice(0, 5).map((quote: Quote) => (
                  <Link
                    key={quote.id}
                    to={`/quotes/${quote.id}`}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4 hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-medium">{formatCurrency(quote.total)}</p>
                      <p className="text-sm text-slate-400">{formatDate(quote.created_at)}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(quote.total)}</p>
                    <StatusBadge status={quote.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
      }
