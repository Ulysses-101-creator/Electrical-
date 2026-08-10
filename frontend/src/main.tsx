import { createRoot } from "react-dom/client";
import LandingPage from "@/features/landing/LandingPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { PublicQuoteViewPage } from "@/features/public-quote-view/PublicQuoteViewPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { CustomerListPage } from "@/features/customers/CustomerListPage";

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = "<h1 style='color:lime;background:black;padding:20px'>BISECT 4 - first half OK</h1>";
}
