import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: "🏠" },
  { to: "/quotes", label: "Quotes", icon: "📄" },
  { to: "/quotes/new", label: "New", icon: "➕" },
  { to: "/customers", label: "Customers", icon: "👥" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="flex items-stretch justify-between">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                [
                  "flex min-h-touch flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium",
                  isActive ? "text-brand-600" : "text-ink-500",
                ].join(" ")
              }
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
