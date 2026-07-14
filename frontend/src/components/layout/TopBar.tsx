import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  action?: ReactNode;
}

export function TopBar({ title, showBack = false, action }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-200 bg-white px-4 sm:hidden">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
          >
            ←
          </button>
        )}
        <h1 className="text-base font-semibold text-ink-900">{title}</h1>
      </div>
      {action}
    </header>
  );
}
