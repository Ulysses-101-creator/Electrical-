import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          className={[
            "rounded-lg border px-3.5 py-2.5 text-base text-ink-900 placeholder:text-ink-400",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            error ? "border-red-400 focus-visible:ring-red-400" : "border-ink-300",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && hint && <p className="text-sm text-ink-500">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
