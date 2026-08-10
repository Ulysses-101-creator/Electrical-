import { createRoot } from "react-dom/client";
import { QuoteDetailPage } from "@/features/quotes/pages/QuoteDetailPage";
import { QuoteListPage } from "@/features/quotes/pages/QuoteListPage";

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = "<h1 style='color:lime;background:black;padding:20px'>BISECT 6 OK</h1>";
}
