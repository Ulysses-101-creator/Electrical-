import { useState } from "react";

import { aiApi } from "@/api/quotes";
import { getApiErrorMessage } from "@/api/client";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Textarea } from "@/components/common/Textarea";
import type { AISuggestedItem } from "@/types";

interface JobDescriptionInputProps {
  onSuggestionsReady: (suggestions: AISuggestedItem[], description: string) => void;
  onSkip: () => void;
}

/**
 * Per the PRD (7.5) and architecture doc, AI suggestions are strictly
 * additive: if the AI call fails or times out, the user must always be able
 * to fall back to manual entry without being blocked.
 */
export function JobDescriptionInput({ onSuggestionsReady, onSkip }: JobDescriptionInputProps) {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (description.trim().length < 3) {
      setError("Describe the job in a few words first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const suggestions = await aiApi.suggestItems(description);
      onSuggestionsReady(suggestions, description);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "AI suggestions are temporarily unavailable. You can add line items manually below.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        label="Describe the job"
        placeholder="e.g. Rewire kitchen, add 4 outlets, install new panel"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <Alert variant="warning">{error}</Alert>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={() => void handleGenerate()} isLoading={isLoading} fullWidth>
          Generate line items with AI
        </Button>
        <Button type="button" variant="secondary" onClick={onSkip} fullWidth>
          Skip, I'll add items manually
        </Button>
      </div>
    </div>
  );
}
