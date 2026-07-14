import { useState } from "react";

import { getApiErrorMessage } from "@/api/client";
import { quotesApi } from "@/api/quotes";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import type { Customer, Quote } from "@/types";

interface SendQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  customer: Customer;
  onSent: (updatedQuote: Quote) => void;
}

export function SendQuoteModal({ isOpen, onClose, quote, customer, onSent }: SendQuoteModalProps) {
  const [isSending, setIsSending] = useState<"email" | "whatsapp" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  async function handleSend(channel: "email" | "whatsapp") {
    setError(null);
    setIsSending(channel);
    try {
      const result = await quotesApi.send(quote.id, channel);
      onSent(result.quote);
      if (channel === "whatsapp" && result.whatsapp_link) {
        setWhatsappLink(result.whatsapp_link);
        window.open(result.whatsapp_link, "_blank", "noopener,noreferrer");
      } else {
        onClose();
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send the quote."));
    } finally {
      setIsSending(null);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send quote">
      <div className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}
        {whatsappLink && (
          <Alert variant="success">
            WhatsApp opened in a new tab. If it didn't open, use the button below.
          </Alert>
        )}

        <Button
          fullWidth
          onClick={() => void handleSend("whatsapp")}
          isLoading={isSending === "whatsapp"}
          disabled={!customer.phone}
        >
          Send via WhatsApp
        </Button>
        {!customer.phone && (
          <p className="-mt-2 text-sm text-ink-500">Add a phone number for this customer first.</p>
        )}

        <Button
          fullWidth
          variant="secondary"
          onClick={() => void handleSend("email")}
          isLoading={isSending === "email"}
          disabled={!customer.email}
        >
          Send via Email
        </Button>
        {!customer.email && (
          <p className="-mt-2 text-sm text-ink-500">Add an email address for this customer first.</p>
        )}
      </div>
    </Modal>
  );
}
