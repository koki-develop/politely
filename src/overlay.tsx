import "./types/electron.d.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RecordingOverlay } from "./components/RecordingOverlay";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RecordingOverlay />
  </StrictMode>,
);
