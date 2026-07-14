interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function Spinner({ size = "md", label = "Loading" }: SpinnerProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-2">
      <span
        className={[
          "animate-spin rounded-full border-brand-600 border-t-transparent",
          SIZE_CLASSES[size],
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
