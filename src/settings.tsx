import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SettingsApp } from "./components/SettingsApp";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
createRoot(rootElement).render(
  <StrictMode>
    <SettingsApp />
  </StrictMode>,
);
