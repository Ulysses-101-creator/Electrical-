import { NavLink } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/quotes", label: "Quotes", icon: "📄" },
  { to: "/customers", label: "Customers", icon: "👥" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white sm:flex">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-brand-600">ElectricQuote AI</span>
      </div>
      <nav aria-label="Primary" className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-100",
                  ].join(" ")
                }
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-ink-200 p-4">
        <p className="truncate text-sm font-medium text-ink-900">{user?.business_name}</p>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-1 text-sm text-ink-500 hover:text-ink-700"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
