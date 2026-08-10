import { createRoot } from "react-dom/client";
import { App } from "@/app/App";

const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = "<h1 style='color:lime;background:black;padding:20px'>BISECT 2 - App imported but not rendered. Type of App: " + typeof App + "</h1>";
}
