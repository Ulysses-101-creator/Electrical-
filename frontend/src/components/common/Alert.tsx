import type { ReactNode } from "react";

type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: "bg-red-50 text-red-800 border-red-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  success: "bg-green-50 text-green-800 border-green-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Alert({ variant = "info", children }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={["rounded-lg border px-4 py-3 text-sm", VARIANT_CLASSES[variant]].join(" ")}
    >
      {children}
    </div>
  );
}
