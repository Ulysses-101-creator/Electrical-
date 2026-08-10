import { createRoot } from "react-dom/client";
import { router } from "@/app/router";

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = "<h1 style='color:lime;background:black;padding:20px'>BISECT 3 - router imported. Type: " + typeof router + "</h1>";
}
