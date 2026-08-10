import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app/App";
import "@/app/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

window.addEventListener("error", (e) => {
  rootElement.innerHTML =
    "<pre style='white-space:pre-wrap;padding:16px;font-size:12px;color:red;background:white'>" +
    "ERROR: " + (e.error?.stack || e.message) +
    "</pre>";
});
window.addEventListener("unhandledrejection", (e) => {
  rootElement.innerHTML =
    "<pre style='white-space:pre-wrap;padding:16px;font-size:12px;color:red;background:white'>" +
    "UNHANDLED REJECTION: " + (e.reason?.stack || e.reason) +
    "</pre>";
});

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  rootElement.innerHTML =
    "<pre style='white-space:pre-wrap;padding:16px;font-size:12px;color:red;background:white'>" +
    "SYNC RENDER ERROR: " + (err instanceof Error ? err.stack : String(err)) +
    "</pre>";
}
