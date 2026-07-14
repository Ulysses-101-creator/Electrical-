import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={["rounded-xl border border-ink-200 bg-white p-4 shadow-sm", className].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
