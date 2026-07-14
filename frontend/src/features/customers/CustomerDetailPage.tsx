import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { customersApi } from "@/api/customers";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Spinner } from "@/components/common/Spinner";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TopBar } from "@/components/layout/TopBar";
import { formatCurrency, formatDate, formatPhoneDisplay } from "@/lib/format";

export function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => customersApi.get(customerId as string),
    enabled: Boolean(customerId),
  });

  if (isLoading) {
    return (
      <div className="py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  const { customer, quotes } = data;

  return (
    <>
      <TopBar title={customer.name} showBack />
      <div className="flex flex-col gap-6">
        <Card>
          <h1 className="hidden text-xl font-bold text-ink-900 sm:block">{customer.name}</h1>
          <div className="mt-2 flex flex-col gap-1 text-sm text-ink-600">
            <p>{formatPhoneDisplay(customer.phone)}</p>
            {customer.email && <p>{customer.email}</p>}
            {customer.address && <p>{customer.address}</p>}
          </div>
          {customer.notes && (
            <p className="mt-3 rounded-lg bg-ink-50 p-3 text-sm text-ink-600">{customer.notes}</p>
          )}
          <div className="mt-4">
            <Link to={`/quotes/new?customerId=${customer.id}`}>
              <Button size="sm">New quote for this customer</Button>
            </Link>
          </div>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Quote history</h2>
          {quotes.length === 0 ? (
            <EmptyState title="No quotes yet for this customer" />
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
      </div>
    </>
  );
}
