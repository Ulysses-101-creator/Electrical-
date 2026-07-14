import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { formatCurrency } from "@/lib/format";
import type { QuoteItem, QuoteItemCategory } from "@/types";

const CATEGORY_OPTIONS: { value: QuoteItemCategory; label: string }[] = [
  { value: "labor", label: "Labor" },
  { value: "material", label: "Materials" },
  { value: "callout", label: "Callout / Travel" },
  { value: "other", label: "Other" },
];

interface LineItemRowProps {
  item: QuoteItem;
  onUpdate: (updates: {
    description?: string;
    category?: QuoteItemCategory;
    quantity?: number;
    unit_price?: number;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function LineItemRow({ item, onUpdate, onDelete }: LineItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unit_price,
  });
  const [isSaving, setIsSaving] = useState(false);

  const lineTotal = Number.parseFloat(item.quantity) * Number.parseFloat(item.unit_price);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onUpdate({
        description: draft.description,
        category: draft.category,
        quantity: Number.parseFloat(draft.quantity),
        unit_price: Number.parseFloat(draft.unit_price),
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-brand-300 bg-brand-50/40 p-3">
        <Input
          aria-label="Description"
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        />
        <div className="grid grid-cols-3 gap-2">
          <Select
            aria-label="Category"
            options={CATEGORY_OPTIONS}
            value={draft.category}
            onChange={(e) =>
              setDraft((d) => ({ ...d, category: e.target.value as QuoteItemCategory }))
            }
          />
          <Input
            aria-label="Quantity"
            type="number"
            step="0.01"
            min="0.01"
            value={draft.quantity}
            onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
          />
          <Input
            aria-label="Unit price"
            type="number"
            step="0.01"
            min="0"
            value={draft.unit_price}
            onChange={(e) => setDraft((d) => ({ ...d, unit_price: e.target.value }))}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-ink-200 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-900">{item.description}</p>
        <p className="text-sm text-ink-500">
          {item.quantity} × {formatCurrency(item.unit_price)}
          {item.is_ai_generated && <span className="ml-2 text-brand-600">✨ AI suggested</span>}
        </p>
      </div>
      <p className="shrink-0 font-medium text-ink-900">{formatCurrency(lineTotal)}</p>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Edit item"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-ink-500 hover:bg-ink-100"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => void onDelete()}
          aria-label="Delete item"
          className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-red-500 hover:bg-red-50"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
