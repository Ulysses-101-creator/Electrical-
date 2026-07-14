import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { customersApi } from "@/api/customers";
import { getApiErrorMessage } from "@/api/client";
import { Alert } from "@/components/common/Alert";
import { TopBar } from "@/components/layout/TopBar";
import { CustomerForm } from "@/features/customers/CustomerForm";
import type { CustomerFormValues } from "@/lib/validation";

export function CustomerCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (values: CustomerFormValues) =>
      customersApi.create({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        address: values.address || undefined,
        notes: values.notes || undefined,
      }),
  });

  async function handleSubmit(values: CustomerFormValues) {
    setServerError(null);
    try {
      const result = await mutation.mutateAsync(values);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate(`/customers/${result.customer.id}`, { replace: true });
    } catch (error) {
      setServerError(getApiErrorMessage(error, "Could not save this customer."));
    }
  }

  return (
    <>
      <TopBar title="Add customer" showBack />
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 hidden text-2xl font-bold text-ink-900 sm:block">Add customer</h1>
        {serverError && (
          <div className="mb-4">
            <Alert variant="error">{serverError}</Alert>
          </div>
        )}
        <CustomerForm onSubmit={handleSubmit} submitLabel="Add customer" />
      </div>
    </>
  );
}
