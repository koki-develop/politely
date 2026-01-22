import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SettingsApp } from "./components/SettingsApp";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SettingsApp />
  </StrictMode>,
);
