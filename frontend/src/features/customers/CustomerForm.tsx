import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { customerSchema, type CustomerFormValues } from "@/lib/validation";
import type { Customer } from "@/types";

interface CustomerFormProps {
  defaultValues?: Partial<Customer>;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  submitLabel?: string;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  submitLabel = "Save customer",
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      address: defaultValues?.address ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
      <Input label="Name" error={errors.name?.message} {...register("name")} />
      <Input
        label="Phone"
        type="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <Input
        label="Email (optional)"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input label="Address (optional)" error={errors.address?.message} {...register("address")} />
      <Textarea
        label="Notes (optional)"
        rows={3}
        error={errors.notes?.message}
        {...register("notes")}
      />
      <Button type="submit" isLoading={isSubmitting} fullWidth>
        {submitLabel}
      </Button>
    </form>
  );
}
