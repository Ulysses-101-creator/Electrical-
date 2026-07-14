import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CustomerCreatePage } from "@/features/customers/CustomerCreatePage";
import { CustomerDetailPage } from "@/features/customers/CustomerDetailPage";
import { CustomerListPage } from "@/features/customers/CustomerListPage";
import { PublicQuoteViewPage } from "@/features/public-quote-view/PublicQuoteViewPage";
import { QuoteCreatePage } from "@/features/quotes/pages/QuoteCreatePage";
import { QuoteDetailPage } from "@/features/quotes/pages/QuoteDetailPage";
import { QuoteListPage } from "@/features/quotes/pages/QuoteListPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/q/:shareToken", element: <PublicQuoteViewPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/quotes", element: <QuoteListPage /> },
          { path: "/quotes/new", element: <QuoteCreatePage /> },
          { path: "/quotes/:quoteId", element: <QuoteDetailPage /> },
          { path: "/customers", element: <CustomerListPage /> },
          { path: "/customers/new", element: <CustomerCreatePage /> },
          { path: "/customers/:customerId", element: <CustomerDetailPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
