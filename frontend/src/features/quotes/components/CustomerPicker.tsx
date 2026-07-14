import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { customersApi } from "@/api/customers";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { CustomerForm } from "@/features/customers/CustomerForm";
import { formatPhoneDisplay } from "@/lib/format";
import type { CustomerFormValues } from "@/lib/validation";
import type { Customer } from "@/types";

interface CustomerPickerProps {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
}

export function CustomerPicker({ selectedCustomer, onSelect }: CustomerPickerProps) {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["customers", { search }],
    queryFn: () => customersApi.list({ search: search || undefined }),
    enabled: search.length > 0,
  });

  async function handleCreate(values: CustomerFormValues) {
    const result = await customersApi.create({
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      address: values.address || undefined,
      notes: values.notes || undefined,
    });
    onSelect(result.customer);
    setIsCreateOpen(false);
  }

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-ink-300 p-3.5">
        <div>
          <p className="font-medium text-ink-900">{selectedCustomer.name}</p>
          <p className="text-sm text-ink-500">{formatPhoneDisplay(selectedCustomer.phone)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onSelect(null as unknown as Customer)}>
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Customer"
        placeholder="Search by name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {data && data.items.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-ink-200">
          {data.items.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelect(customer)}
              className="flex min-h-touch flex-col items-start px-3.5 py-2.5 text-left hover:bg-ink-50"
            >
              <span className="font-medium text-ink-900">{customer.name}</span>
              <span className="text-sm text-ink-500">{formatPhoneDisplay(customer.phone)}</span>
            </button>
          ))}
        </div>
      )}

      <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(true)}>
        + Add new customer
      </Button>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New customer">
        <CustomerForm onSubmit={handleCreate} submitLabel="Add and continue" />
      </Modal>
    </div>
  );
}
