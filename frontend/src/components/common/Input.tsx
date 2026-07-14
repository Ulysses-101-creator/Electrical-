import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = "", ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={[
            "min-h-touch rounded-lg border px-3.5 py-2.5 text-base text-ink-900 placeholder:text-ink-400",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
            error ? "border-red-400 focus-visible:ring-red-400" : "border-ink-300",
            "disabled:bg-ink-100 disabled:text-ink-400",
            className,
          ].join(" ")}
          {...rest}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={hintId} className="text-sm text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
