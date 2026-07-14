import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";

import { customersApi } from "@/api/customers";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/common/Input";
import { Spinner } from "@/components/common/Spinner";
import { TopBar } from "@/components/layout/TopBar";
import { formatPhoneDisplay } from "@/lib/format";

export function CustomerListPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customers", { search }],
    queryFn: () => customersApi.list({ search: search || undefined }),
  });

  const customers = data?.items ?? [];

  return (
    <>
      <TopBar
        title="Customers"
        action={
          <Link to="/customers/new" aria-label="Add customer" className="text-2xl text-brand-600">
            +
          </Link>
        }
      />
      <div className="flex flex-col gap-4">
        <div className="hidden items-center justify-between sm:flex">
          <h1 className="text-2xl font-bold text-ink-900">Customers</h1>
          <Link to="/customers/new">
            <Button>Add customer</Button>
          </Link>
        </div>

        <Input
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search customers"
        />

        {isLoading ? (
          <div className="py-12">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            title={search ? "No matching customers" : "No customers yet"}
            description={
              search
                ? "Try a different search term."
                : "Add your first customer to start creating quotes."
            }
            action={
              !search && (
                <Link to="/customers/new">
                  <Button>Add customer</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {customers.map((customer) => (
              <Link key={customer.id} to={`/customers/${customer.id}`}>
                <Card className="hover:border-brand-300">
                  <p className="font-medium text-ink-900">{customer.name}</p>
                  <p className="text-sm text-ink-500">{formatPhoneDisplay(customer.phone)}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
