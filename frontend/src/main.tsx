import { createRoot } from "react-dom/client";
import { CustomerCreatePage } from "@/features/customers/CustomerCreatePage";
import { CustomerDetailPage } from "@/features/customers/CustomerDetailPage";
import { QuoteCreatePage } from "@/features/quotes/pages/QuoteCreatePage";

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = "<h1 style='color:lime;background:black;padding:20px'>BISECT 5 OK</h1>";
}
