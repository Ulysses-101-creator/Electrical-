import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { quoteItemSchema, type QuoteItemFormValues } from "@/lib/validation";
import type { QuoteItemCategory } from "@/types";

const CATEGORY_OPTIONS: { value: QuoteItemCategory; label: string }[] = [
  { value: "labor", label: "Labor" },
  { value: "material", label: "Materials" },
  { value: "callout", label: "Callout / Travel" },
  { value: "other", label: "Other" },
];

interface AddLineItemFormProps {
  onAdd: (values: QuoteItemFormValues) => Promise<void>;
}

export function AddLineItemForm({ onAdd }: AddLineItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteItemFormValues>({
    resolver: zodResolver(quoteItemSchema),
    defaultValues: { category: "labor", quantity: 1, unit_price: 0 },
  });

  async function onSubmit(values: QuoteItemFormValues) {
    await onAdd(values);
    reset({ description: "", category: "labor", quantity: 1, unit_price: 0 });
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-2 rounded-lg border border-dashed border-ink-300 p-3"
    >
      <Input
        aria-label="Description"
        placeholder="Description (e.g. 20A breaker)"
        error={errors.description?.message}
        {...register("description")}
      />
      <div className="grid grid-cols-3 gap-2">
        <Select aria-label="Category" options={CATEGORY_OPTIONS} {...register("category")} />
        <Input
          aria-label="Quantity"
          type="number"
          step="0.01"
          placeholder="Qty"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <Input
          aria-label="Unit price"
          type="number"
          step="0.01"
          placeholder="Unit price"
          error={errors.unit_price?.message}
          {...register("unit_price")}
        />
      </div>
      <Button type="submit" size="sm" variant="secondary" isLoading={isSubmitting}>
        + Add line item
      </Button>
    </form>
  );
}
